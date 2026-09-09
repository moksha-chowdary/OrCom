from datetime import datetime
from typing import List, Optional
from app.providers.base import SatelliteProvider
from app.schemas.schemas import (
    SatelliteSpec,
    GeoPosition,
    GroundTrackResponse,
    CompatibilityResultResponse,
    SimulationResponse,
    PassWindow,
    MissionResponse,
    MissionStatusResponse,
    ApplicationRequirementsResponse
)

class DhruvaProvider(SatelliteProvider):
    """
    Architectural seam stub for real spacecraft provider integration.
    This demonstrates that swapping from MockProvider to a real hardware provider
    only requires changing the provider factory in core/config.py or DI injection.
    No frontend or API routers need to change.
    """

    def list_satellites(self) -> List[SatelliteSpec]:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def get_satellite(self, satellite_id: str) -> SatelliteSpec:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def get_current_position(self, satellite_id: str) -> GeoPosition:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def get_ground_track(
        self, satellite_id: str, minutes_past: int = 45, minutes_future: int = 45
    ) -> GroundTrackResponse:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def check_compatibility(
        self, requirements: ApplicationRequirementsResponse, satellite_id: str
    ) -> CompatibilityResultResponse:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def run_simulation(
        self, requirements: ApplicationRequirementsResponse, satellite_id: str, target_region: str
    ) -> SimulationResponse:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def get_next_pass(
        self,
        satellite_id: str,
        target_region: str,
        window_start: Optional[datetime] = None,
        window_end: Optional[datetime] = None,
    ) -> PassWindow:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def deploy_mission(
        self,
        application_id: str,
        satellite_id: str,
        pass_window: PassWindow,
    ) -> MissionResponse:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")

    def get_mission_status(self, mission_id: str) -> MissionStatusResponse:
        raise NotImplementedError("Dhruva integration pending — see providers/dhruva_provider.py")
