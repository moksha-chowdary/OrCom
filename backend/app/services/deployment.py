import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Application, Satellite, Mission, SimulationRun
from app.schemas.schemas import PassWindow, MissionResponse, TelemetryLog

DEPLOYMENT_STEPS = [
    {"step": "packaging", "label": "Packaging application payload & container manifest", "status": "done"},
    {"step": "security", "label": "Verifying flight-critical isolation & signature verification", "status": "done"},
    {"step": "uplink_queue", "label": "Uploading workload bundle to ground station uplink queue", "status": "done"},
    {"step": "onboard_schedule", "label": "Mission scheduled with satellite flight task manager", "status": "done"},
]

def create_mission_deployment(
    db: Session,
    app_id: str,
    sat_id: str,
    pass_window: PassWindow
) -> Mission:
    # Generate mission code: OC- + 5 random digits
    mission_code = f"OC-{random.randint(10000, 99999)}"
    
    # Initial telemetry log
    now = datetime.now(timezone.utc)
    initial_logs = [
        {
            "timestamp": now.isoformat(),
            "phase": "SCHEDULED",
            "level": "INFO",
            "message": f"Mission {mission_code} registered for spacecraft {pass_window.satellite_code}."
        },
        {
            "timestamp": (now + timedelta(seconds=1)).isoformat(),
            "phase": "SCHEDULED",
            "level": "INFO",
            "message": f"Target coordinates locked: {pass_window.target_region} ({pass_window.target_lat:.4f}°, {pass_window.target_lon:.4f}°)."
        }
    ]

    mission = Mission(
        id=f"mis-{uuid.uuid4().hex[:8]}",
        mission_code=mission_code,
        application_id=app_id,
        satellite_id=sat_id,
        target_region=pass_window.target_region,
        target_lat=pass_window.target_lat,
        target_lon=pass_window.target_lon,
        scheduled_pass_start=pass_window.window_start,
        scheduled_pass_end=pass_window.window_end,
        status="scheduled",
        telemetry_logs=initial_logs,
        created_at=now,
        updated_at=now
    )

    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission
