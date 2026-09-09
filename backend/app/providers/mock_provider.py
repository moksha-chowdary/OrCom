from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.providers.base import SatelliteProvider
from app.data.mock_satellites import FLEET_DATA
from app.services.orbit_tracker import (
    get_current_satellite_position,
    get_satellite_ground_track,
    get_satellite_fleet_map,
)
from app.services.compatibility_engine import (
    evaluate_satellite_compatibility,
    check_fleet_compatibility,
)
from app.services.simulator import run_deterministic_simulation
from app.services.scheduler import find_next_orbital_pass, recommend_best_satellite
from app.services.deployment import create_mission_deployment
from app.services.mission_state_machine import MISSION_STAGES
from app.models.models import Mission, MissionResult, Satellite
from app.schemas.schemas import (
    SatelliteSpec,
    GeoPosition,
    GroundTrackResponse,
    CompatibilityResultResponse,
    SimulationResponse,
    PassWindow,
    MissionResponse,
    MissionStatusResponse,
    ApplicationRequirementsResponse,
    TelemetryLog,
    MissionResultResponse
)

class MockProvider(SatelliteProvider):
    """
    Deterministic simulated implementation of SatelliteProvider.
    Calculates realistic orbital mechanics, hardware compatibility, and resource metrics.
    No real spacecraft hardware is touched.
    """

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def list_satellites(self) -> List[SatelliteSpec]:
        return [SatelliteSpec(**sat) for sat in FLEET_DATA]

    def get_satellite(self, satellite_id: str) -> SatelliteSpec:
        fleet = get_satellite_fleet_map()
        if satellite_id not in fleet:
            raise ValueError(f"Satellite '{satellite_id}' not found in fleet.")
        return SatelliteSpec(**fleet[satellite_id])

    def get_current_position(self, satellite_id: str) -> GeoPosition:
        return get_current_satellite_position(satellite_id)

    def get_ground_track(
        self, satellite_id: str, minutes_past: int = 45, minutes_future: int = 45
    ) -> GroundTrackResponse:
        return get_satellite_ground_track(satellite_id, minutes_past, minutes_future)

    def check_compatibility(
        self, requirements: ApplicationRequirementsResponse, satellite_id: str
    ) -> CompatibilityResultResponse:
        fleet = get_satellite_fleet_map()
        if satellite_id in fleet:
            sat = fleet[satellite_id]
            res = evaluate_satellite_compatibility(requirements, sat)
            return CompatibilityResultResponse(
                application_id=requirements.application_id,
                satellites=[res],
                recommended_satellite_id=sat["id"] if res.compatible else None
            )
        return check_fleet_compatibility(requirements, FLEET_DATA)

    def run_simulation(
        self, requirements: ApplicationRequirementsResponse, satellite_id: str, target_region: str
    ) -> SimulationResponse:
        fleet = get_satellite_fleet_map()
        if satellite_id not in fleet:
            raise ValueError(f"Satellite '{satellite_id}' not found for simulation.")
        return run_deterministic_simulation(requirements, fleet[satellite_id], target_region)

    def get_next_pass(
        self,
        satellite_id: str,
        target_region: str,
        window_start: Optional[datetime] = None,
        window_end: Optional[datetime] = None,
    ) -> PassWindow:
        fleet = get_satellite_fleet_map()
        if satellite_id not in fleet:
            raise ValueError(f"Satellite '{satellite_id}' not found.")
        return find_next_orbital_pass(fleet[satellite_id], target_region, window_start, window_end)

    def deploy_mission(
        self,
        application_id: str,
        satellite_id: str,
        pass_window: PassWindow,
    ) -> MissionResponse:
        if not self.db:
            raise RuntimeError("Database session required for mission deployment.")
        mission = create_mission_deployment(self.db, application_id, satellite_id, pass_window)
        return MissionResponse.model_validate(mission)

    def get_mission_status(self, mission_id: str) -> MissionStatusResponse:
        if not self.db:
            raise RuntimeError("Database session required to inspect mission status.")
        mission = self.db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            raise ValueError(f"Mission '{mission_id}' not found.")
            
        # Calculate progress percentage through the stages
        try:
            stage_idx = MISSION_STAGES.index(mission.status)
            progress_pct = round(((stage_idx + 1) / len(MISSION_STAGES)) * 100.0, 1)
        except ValueError:
            progress_pct = 0.0

        # Current position of the assigned spacecraft
        sat_pos = None
        try:
            sat_pos = self.get_current_position(mission.satellite_id)
        except Exception:
            pass

        logs = [TelemetryLog(**log) for log in mission.telemetry_logs]

        result_resp = None
        if mission.result:
            result_resp = MissionResultResponse.model_validate(mission.result)

        return MissionStatusResponse(
            mission_id=mission.id,
            status=mission.status,
            current_phase=mission.status.upper(),
            progress_pct=progress_pct,
            satellite_position=sat_pos,
            latest_logs=logs,
            result=result_resp
        )
