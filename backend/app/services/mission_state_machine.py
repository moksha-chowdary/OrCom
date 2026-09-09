import asyncio
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Mission, MissionResult, SimulationRun, Application, ApplicationRequirements

# State transitions pipeline
MISSION_STAGES = [
    "scheduled",
    "awaiting_pass",
    "sensor_active",
    "capturing",
    "processing",
    "downlinking",
    "complete"
]

PHASE_LOGS = {
    "scheduled": ("SCHEDULED", "INFO", "Payload uplink confirmed. Mission scheduled in spacecraft flight computer queue."),
    "awaiting_pass": ("AWAITING_PASS", "INFO", "Orbital position nominal. Approaching line-of-sight acquisition horizon with target region."),
    "sensor_active": ("SENSOR_ACTIVE", "INFO", "Spacecraft entered target cone horizon (<12° separation). Sensor payload power rail energized."),
    "capturing": ("CAPTURING", "INFO", "High-resolution swath imagery acquisition active over target coordinates."),
    "processing": ("PROCESSING", "INFO", "Workload runtime container launched on edge compute bus. Running inference pass."),
    "downlinking": ("DOWNLINKING", "INFO", "Inference pass complete. Transmitting vector anomaly telemetry over S-band downlink."),
    "complete": ("COMPLETE", "INFO", "Mission pass complete. Results verified by ground station network. Standby for next cycle.")
}

def advance_mission_stage(db: Session, mission_id: str) -> Optional[Mission]:
    """Advances a single mission to the next state, appending real-time telemetry logs."""
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission or mission.status in ["complete", "failed"]:
        return mission
        
    try:
        curr_idx = MISSION_STAGES.index(mission.status)
    except ValueError:
        curr_idx = 0
        
    if curr_idx < len(MISSION_STAGES) - 1:
        next_status = MISSION_STAGES[curr_idx + 1]
        mission.status = next_status
        now = datetime.now(timezone.utc)
        
        phase, level, msg = PHASE_LOGS.get(next_status, (next_status.upper(), "INFO", f"Entered stage {next_status}"))
        new_log = {
            "timestamp": now.isoformat(),
            "phase": phase,
            "level": level,
            "message": msg
        }
        
        # Append to existing logs
        logs = list(mission.telemetry_logs)
        logs.append(new_log)
        mission.telemetry_logs = logs
        mission.updated_at = now
        
        # If reached complete, create MissionResult using computed simulation numbers
        if next_status == "complete":
            create_or_ensure_mission_result(db, mission)
            
        db.commit()
        db.refresh(mission)
        
    return mission

def create_or_ensure_mission_result(db: Session, mission: Mission) -> MissionResult:
    existing = db.query(MissionResult).filter(MissionResult.mission_id == mission.id).first()
    if existing:
        return existing
        
    # Find matching simulation run or application requirements to guarantee consistency
    sim = db.query(SimulationRun).filter(
        SimulationRun.application_id == mission.application_id,
        SimulationRun.satellite_id == mission.satellite_id
    ).order_by(SimulationRun.created_at.desc()).first()

    req = db.query(ApplicationRequirements).filter(
        ApplicationRequirements.application_id == mission.application_id
    ).first()

    app = db.query(Application).filter(Application.id == mission.application_id).first()
    app_name = (app.name if app else "").lower()

    if "wildfire" in app_name:
        label = "Active Thermal Hotspot (Cluster #4)"
        conf = 96.4
    elif "maritime" in app_name or "vessel" in app_name:
        label = "Dark Vessel AIS Discrepancy (Cargo Bulk Carrier)"
        conf = 94.8
    elif "crop" in app_name or "ndvi" in app_name:
        label = "Severe Canopy Nitrogen Deficit (Sector B-12)"
        conf = 91.2
    else:
        label = "Target Anomaly Verified"
        conf = 95.0

    processing_sec = sim.execution_seconds if sim else (req.cpu_seconds * 0.8 if req else 3.8)
    input_mb = sim.input_data_mb if sim else (req.input_size_mb if req else 1500.0)
    output_mb = sim.output_data_mb if sim else (req.output_size_mb if req else 0.15)
    downlink_reduction = sim.downlink_reduction_pct if sim else round((1.0 - (output_mb / input_mb)) * 100.0, 2)

    result = MissionResult(
        id=f"res-{uuid.uuid4().hex[:8]}",
        mission_id=mission.id,
        result_type="detection",
        detection_label=label,
        confidence=conf,
        target_lat=mission.target_lat,
        target_lon=mission.target_lon,
        processing_seconds=round(processing_sec, 1),
        input_mb=input_mb,
        output_mb=output_mb,
        downlink_reduction_pct=downlink_reduction,
        raw_output_path=f"storage/results/{mission.mission_code}_telemetry.json",
        created_at=datetime.now(timezone.utc)
    )
    db.add(result)
    db.commit()
    return result

# Background async task to progress active missions (compressed demo timeline: ~3.5s per phase)
async def mission_progression_daemon():
    """
    Advances active missions in a background loop.
    # Compressed timeline for demo purposes — real pass timing would follow scheduled_pass_start/end.
    """
    while True:
        try:
            await asyncio.sleep(3.5)
            db = SessionLocal()
            try:
                active_missions = db.query(Mission).filter(
                    Mission.status.notin_(["complete", "failed"])
                ).all()
                for mis in active_missions:
                    advance_mission_stage(db, mis.id)
            finally:
                db.close()
        except Exception:
            await asyncio.sleep(5.0)
