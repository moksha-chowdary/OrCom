import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.providers.base import SatelliteProvider
from app.providers.mock_provider import MockProvider
from app.providers.dhruva_provider import DhruvaProvider
from app.services.validator import run_static_security_analysis, analyze_workload
from app.services.orbit_tracker import get_satellite_ground_track, get_current_satellite_position
from app.services.simulator import run_deterministic_simulation
from app.data.mock_satellites import FLEET_DATA
from app.schemas.schemas import ApplicationRequirementsResponse
from pathlib import Path

from app.core.database import engine, Base, SessionLocal
from app.data.seed_data import seed_initial_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_database(db)
    finally:
        db.close()

client = TestClient(app)

def test_health_check_and_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "OrCom Satellite Edge Platform"
    assert data["status"] == "operational"

def test_satellites_list_and_positions():
    response = client.get("/api/satellites")
    assert response.status_code == 200
    satellites = response.json()
    assert len(satellites) == 3
    codes = [s["code"] for s in satellites]
    assert "OC-01" in codes
    assert "OC-02" in codes
    assert "OC-03" in codes

    # Check current position endpoint
    pos_resp = client.get("/api/satellites/sat-oc-01/position")
    assert pos_resp.status_code == 200
    pos = pos_resp.json()
    assert -90.0 <= pos["lat"] <= 90.0
    assert -180.0 <= pos["lon"] <= 180.0
    assert pos["alt_km"] == 550.0

def test_ground_track_and_antimeridian_split():
    track_resp = client.get("/api/satellites/sat-oc-01/ground-track?past=45&future=45")
    assert track_resp.status_code == 200
    track = track_resp.json()
    assert "past_segments" in track
    assert "upcoming_segments" in track
    assert len(track["upcoming_segments"]) > 0

    # Ensure no coordinate in any segment jumps > 180 deg
    for seg in track["upcoming_segments"]:
        for i in range(1, len(seg)):
            assert abs(seg[i]["lon"] - seg[i - 1]["lon"]) <= 180.0

def test_preseeded_wildfire_demo_mission():
    # Verify pre-seeded completed mission OC-28491 is present on startup
    missions_resp = client.get("/api/missions")
    assert missions_resp.status_code == 200
    missions = missions_resp.json()
    assert len(missions) >= 1

    wildfire_mission = next((m for m in missions if m["mission_code"] == "OC-28491"), None)
    assert wildfire_mission is not None
    assert wildfire_mission["status"] == "complete"
    assert wildfire_mission["result"] is not None
    assert wildfire_mission["result"]["confidence"] == 96.4
    assert wildfire_mission["result"]["downlink_reduction_pct"] == 99.99

def test_security_validator():
    bad_code = "import os\nos.system('curl http://malicious.com')\nimport subprocess"
    flags = run_static_security_analysis(bad_code)
    assert len(flags) >= 2
    assert any("os.system" in f for f in flags)
    assert any("subprocess" in f for f in flags)

    good_code = "import numpy as np\ndef predict(x): return np.mean(x)"
    clean_flags = run_static_security_analysis(good_code)
    assert len(clean_flags) == 0

def test_deterministic_simulation_math():
    req = ApplicationRequirementsResponse(
        id="test-req",
        application_id="app-test",
        cpu_seconds=120.0,
        ram_mb=512,
        storage_mb=1024,
        estimated_power_wh=4.5,
        input_type="multispectral",
        input_size_mb=1000.0,
        output_size_mb=1.0,
        dependencies=[],
        security_flags=[]
    )
    sat = FLEET_DATA[0]  # OC-01: 1024 MB RAM, 4096 MB storage, 15 Wh power, 360s cap
    sim = run_deterministic_simulation(req, sat, target_region="Andhra Pradesh")
    
    # 512 / 1024 = 50.0%
    assert sim.ram_pct == 50.0
    # 1024 / 4096 = 25.0%
    assert sim.storage_pct == 25.0
    # 4.5 / 15.0 = 30.0%
    assert sim.power_pct == 30.0
    # (1 - 1 / 1000) * 100 = 99.9%
    assert sim.downlink_reduction_pct == 99.9
    assert sim.status == "completed"

def test_provider_architectural_seam_swapping():
    # 1. Default is MockProvider
    mock_prov = MockProvider()
    sats = mock_prov.list_satellites()
    assert len(sats) == 3

    # 2. DhruvaProvider stub raises NotImplementedError on all methods
    dhruva_prov = DhruvaProvider()
    with pytest.raises(NotImplementedError) as exc_info:
        dhruva_prov.list_satellites()
    assert "Dhruva integration pending" in str(exc_info.value)

    with pytest.raises(NotImplementedError):
        dhruva_prov.get_current_position("sat-oc-01")
