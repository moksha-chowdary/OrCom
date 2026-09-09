import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.data.mock_satellites import FLEET_DATA
from app.models.models import (
    Project,
    Application,
    ApplicationRequirements,
    Satellite,
    CompatibilityCheck,
    SimulationRun,
    Mission,
    MissionResult
)

def seed_initial_database(db: Session):
    """
    Populates initial database state with:
    1. The 3 mock fleet satellites (OC-01, OC-02, OC-03 offline)
    2. Projects: Wildfire Early Warning, Maritime Vessel Tracking, Agricultural Canopy Index
    3. Investor-ready pre-seeded 'Wildfire Detection' application with completed Mission OC-28491
    """
    # 1. Seed satellites
    for sat_data in FLEET_DATA:
        existing = db.query(Satellite).filter(Satellite.id == sat_data["id"]).first()
        if not existing:
            sat = Satellite(
                id=sat_data["id"],
                code=sat_data["code"],
                status=sat_data["status"],
                orbit_altitude_km=sat_data["orbit_altitude_km"],
                orbit_type=sat_data["orbit_type"],
                inclination_deg=sat_data["inclination_deg"],
                raan_deg=sat_data["raan_deg"],
                orbital_period_min=sat_data["orbital_period_min"],
                cpu_cores=sat_data["cpu_cores"],
                cpu_ghz=sat_data["cpu_ghz"],
                cpu_capacity_seconds_per_pass=sat_data["cpu_capacity_seconds_per_pass"],
                ram_mb=sat_data["ram_mb"],
                storage_mb=sat_data["storage_mb"],
                power_budget_wh=sat_data["power_budget_wh"],
                sensors=sat_data["sensors"],
                downlink_mbps=sat_data["downlink_mbps"],
                epoch=datetime.now(timezone.utc)
            )
            db.add(sat)
    db.commit()

    # 2. Check if primary demo project exists
    primary_project = db.query(Project).filter(Project.id == "proj-wildfire-alert").first()
    if not primary_project:
        primary_project = Project(
            id="proj-wildfire-alert",
            name="Wildfire Early Warning Network",
            description="Orbital thermal-infrared anomaly detection identifying forest wildfire ignitions within 15 minutes of breakout.",
            created_at=datetime.now(timezone.utc) - timedelta(days=5)
        )
        db.add(primary_project)

        # Additional visual richness projects
        db.add(Project(
            id="proj-maritime-sar",
            name="Maritime Vessel Surveillance",
            description="Synthetic Aperture Radar (SAR) vessel classification and AIS transponder cross-referencing over high seas choke points.",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        ))
        db.add(Project(
            id="proj-agri-ndvi",
            name="Agricultural Canopy Health Index",
            description="Hyper-spectral crop canopy nitrogen and soil moisture deficit mapping for automated irrigation telemetry.",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        ))
        db.commit()

    # 3. Seed demo Wildfire application
    demo_app = db.query(Application).filter(Application.id == "app-wildfire-onnx").first()
    if not demo_app:
        demo_app = Application(
            id="app-wildfire-onnx",
            project_id="proj-wildfire-alert",
            name="Wildfire Thermal Hotspot Classifier",
            version="1.2.0",
            upload_method="onnx",
            source_path="storage/models/wildfire_thermal_v1.2.onnx",
            language="onnx",
            status="ready",
            created_at=datetime.now(timezone.utc) - timedelta(hours=3)
        )
        db.add(demo_app)
        db.commit()

        # Requirements
        req = ApplicationRequirements(
            id="req-wildfire-onnx",
            application_id=demo_app.id,
            cpu_seconds=95.0,
            ram_mb=420,
            storage_mb=1024,
            estimated_power_wh=3.8,
            input_type="multispectral_thermal",
            input_size_mb=1500.0,
            output_size_mb=0.15,
            dependencies=["onnxruntime-radhard", "numpy"],
            security_flags=[]
        )
        db.add(req)

        # Pre-seed Simulation Run
        sim = SimulationRun(
            id="sim-wildfire-seed",
            application_id=demo_app.id,
            satellite_id="sat-oc-01",
            target_region="Andhra Pradesh",
            cpu_pct=26.4,
            ram_pct=41.0,
            storage_pct=25.0,
            power_pct=25.3,
            input_data_mb=1500.0,
            processed_data_mb=1500.0,
            output_data_mb=0.15,
            execution_seconds=95.0,
            status="completed",
            created_at=datetime.now(timezone.utc) - timedelta(hours=2)
        )
        db.add(sim)

        # Pre-seed completed Mission OC-28491
        now = datetime.now(timezone.utc)
        mission_start = now - timedelta(minutes=45)
        mission_end = now - timedelta(minutes=40)
        logs = [
            {"timestamp": (mission_start).isoformat(), "phase": "SCHEDULED", "level": "INFO", "message": "Mission OC-28491 registered for spacecraft OC-01."},
            {"timestamp": (mission_start + timedelta(seconds=15)).isoformat(), "phase": "AWAITING_PASS", "level": "INFO", "message": "Orbital position nominal. Approaching acquisition of signal horizon over Andhra Pradesh."},
            {"timestamp": (mission_start + timedelta(seconds=75)).isoformat(), "phase": "SENSOR_ACTIVE", "level": "INFO", "message": "Line-of-sight established. Multispectral thermal-IR camera payload energized."},
            {"timestamp": (mission_start + timedelta(seconds=120)).isoformat(), "phase": "CAPTURING", "level": "INFO", "message": "Swath acquisition active (Bands 4, 8, 12). 1,500 MB raw imagery buffered to RAM."},
            {"timestamp": (mission_start + timedelta(seconds=180)).isoformat(), "phase": "PROCESSING", "level": "INFO", "message": "Workload container executed in 3.8s. Thermal cluster isolated at 15.8281° N, 78.0373° E."},
            {"timestamp": (mission_start + timedelta(seconds=240)).isoformat(), "phase": "DOWNLINKING", "level": "INFO", "message": "Transmitted 0.15 MB vector anomaly alert. Bandwidth reduction: 99.99%."},
            {"timestamp": (mission_start + timedelta(seconds=290)).isoformat(), "phase": "COMPLETE", "level": "INFO", "message": "Ground telemetry validated. Mission executed with 100% mission payload success."}
        ]

        mission = Mission(
            id="mis-seed-28491",
            mission_code="OC-28491",
            application_id=demo_app.id,
            satellite_id="sat-oc-01",
            target_region="Andhra Pradesh",
            target_lat=15.8281,
            target_lon=78.0373,
            scheduled_pass_start=mission_start,
            scheduled_pass_end=mission_end,
            status="complete",
            telemetry_logs=logs,
            created_at=mission_start,
            updated_at=mission_end
        )
        db.add(mission)
        db.commit()

        # Seed Mission Result
        result = MissionResult(
            id="res-seed-28491",
            mission_id=mission.id,
            result_type="detection",
            detection_label="Active Thermal Hotspot (Cluster #4)",
            confidence=96.4,
            target_lat=15.8281,
            target_lon=78.0373,
            processing_seconds=3.8,
            input_mb=1500.0,
            output_mb=0.15,
            downlink_reduction_pct=99.99,
            raw_output_path="storage/results/OC-28491_telemetry.json",
            created_at=mission_end
        )
        db.add(result)
        db.commit()
