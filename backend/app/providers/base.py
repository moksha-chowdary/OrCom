from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
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

class SatelliteProvider(ABC):
    """
    Abstract interface for satellite operations.
    All API routers and application layers interact exclusively through this interface.
    MockProvider implements this for the local/demo simulation.
    DhruvaProvider serves as the architectural drop-in stub for real hardware.
    """

    @abstractmethod
    def list_satellites(self) -> List[SatelliteSpec]:
        """List all spacecraft in the fleet with their hardware specs and status."""
        pass

    @abstractmethod
    def get_satellite(self, satellite_id: str) -> SatelliteSpec:
        """Fetch specification details for a specific spacecraft."""
        pass

    @abstractmethod
    def get_current_position(self, satellite_id: str) -> GeoPosition:
        """Compute the current latitude, longitude, and altitude of the spacecraft."""
        pass

    @abstractmethod
    def get_ground_track(
        self, satellite_id: str, minutes_past: int = 45, minutes_future: int = 45
    ) -> GroundTrackResponse:
        """Calculate past and upcoming orbital ground track paths split by antimeridian."""
        pass

    @abstractmethod
    def check_compatibility(
        self, requirements: ApplicationRequirementsResponse, satellite_id: str
    ) -> CompatibilityResultResponse:
        """Evaluate resource, power, sensor, and thermal compatibility for a workload."""
        pass

    @abstractmethod
    def run_simulation(
        self, requirements: ApplicationRequirementsResponse, satellite_id: str, target_region: str
    ) -> SimulationResponse:
        """Run deterministic orbital execution simulation."""
        pass

    @abstractmethod
    def get_next_pass(
        self,
        satellite_id: str,
        target_region: str,
        window_start: Optional[datetime] = None,
        window_end: Optional[datetime] = None,
    ) -> PassWindow:
        """Compute the next deterministic orbital pass window over target coordinates."""
        pass

    @abstractmethod
    def deploy_mission(
        self,
        application_id: str,
        satellite_id: str,
        pass_window: PassWindow,
    ) -> MissionResponse:
        """Schedule and deploy workload to satellite flight queue."""
        pass

    @abstractmethod
    def get_mission_status(self, mission_id: str) -> MissionStatusResponse:
        """Poll the real-time execution status and telemetry logs of a deployed mission."""
        pass
