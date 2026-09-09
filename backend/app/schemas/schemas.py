from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

# --- Projects ---
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    application_count: Optional[int] = 0

# --- Applications ---
class ApplicationCreate(BaseModel):
    name: str
    version: Optional[str] = "1.0.0"
    upload_method: Optional[str] = "zip"
    language: Optional[str] = "python"

class IDEPublishRequest(BaseModel):
    project_id: str
    name: str
    version: Optional[str] = "1.0.0"
    language: Optional[str] = "python"
    files: Dict[str, str]  # filename -> code content
    input_type: Optional[str] = "multispectral_imagery"
    ram_mb: Optional[int] = 512
    cpu_seconds: Optional[float] = 120.0
    storage_mb: Optional[int] = 1024
    input_size_mb: Optional[float] = 1500.0
    output_size_mb: Optional[float] = 0.15

class ApplicationRequirementsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    application_id: str
    cpu_seconds: float
    ram_mb: int
    storage_mb: int
    estimated_power_wh: float
    input_type: str
    input_size_mb: float
    output_size_mb: float
    dependencies: List[str]
    security_flags: List[str]

class ValidationCheckItem(BaseModel):
    category: str
    title: str
    status: str  # pass | warn | fail
    message: str
    suggested_action: Optional[str] = None

class ValidationReportResponse(BaseModel):
    application_id: str
    status: str  # ready | analysis_failed
    checks: List[ValidationCheckItem]
    requirements: ApplicationRequirementsResponse
    created_at: datetime

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    name: str
    version: str
    upload_method: str
    language: str
    status: str
    created_at: datetime
    requirements: Optional[ApplicationRequirementsResponse] = None

# --- Satellites & Orbital Specs ---
class GeoPosition(BaseModel):
    lat: float
    lon: float
    alt_km: float
    timestamp: datetime
    satellite_code: Optional[str] = None

class GroundTrackPoint(BaseModel):
    lat: float
    lon: float
    t_offset_minutes: float

class GroundTrackResponse(BaseModel):
    satellite_id: str
    satellite_code: str
    past_segments: List[List[GroundTrackPoint]]
    upcoming_segments: List[List[GroundTrackPoint]]

class SatelliteSpec(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    status: str
    orbit_altitude_km: float
    orbit_type: str
    inclination_deg: float
    raan_deg: float
    orbital_period_min: float
    cpu_cores: int
    cpu_ghz: float
    cpu_capacity_seconds_per_pass: float
    ram_mb: int
    storage_mb: int
    power_budget_wh: float
    sensors: List[str]
    downlink_mbps: float

class SatelliteResponse(SatelliteSpec):
    current_position: Optional[GeoPosition] = None

# --- Compatibility ---
class SatelliteCompatibility(BaseModel):
    satellite_id: str
    satellite_code: str
    compatible: bool
    status: str
    reasons: List[str]

class CompatibilityResultResponse(BaseModel):
    application_id: str
    satellites: List[SatelliteCompatibility]
    recommended_satellite_id: Optional[str] = None

# --- Simulation ---
class SimulationRequest(BaseModel):
    satellite_id: str
    target_region: Optional[str] = "Andhra Pradesh"

class SimulationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    application_id: str
    satellite_id: str
    satellite_code: str
    target_region: str
    cpu_pct: float
    ram_pct: float
    storage_pct: float
    power_pct: float
    input_data_mb: float
    processed_data_mb: float
    output_data_mb: float
    execution_seconds: float
    downlink_reduction_pct: float
    status: str
    failure_reason: Optional[str] = None
    created_at: datetime

# --- Scheduling & Recommendation ---
class PassWindow(BaseModel):
    pass_window_id: str
    satellite_id: str
    satellite_code: str
    target_region: str
    target_lat: float
    target_lon: float
    window_start: datetime
    window_end: datetime
    duration_seconds: float
    max_elevation_deg: float

class RecommendRequest(BaseModel):
    target: str
    sensor: str
    task: Optional[str] = None
    max_latency_hours: Optional[float] = 24.0

class RecommendationItem(BaseModel):
    satellite: SatelliteSpec
    pass_window: PassWindow
    score: float
    notes: List[str]

class RecommendationResponse(BaseModel):
    recommended: RecommendationItem
    alternatives: List[RecommendationItem]

# --- Deployment & Missions ---
class DeployRequest(BaseModel):
    satellite_id: str
    pass_window_id: Optional[str] = None
    target_region: Optional[str] = "Andhra Pradesh"
    target_lat: Optional[float] = 15.8281
    target_lon: Optional[float] = 78.0373

class TelemetryLog(BaseModel):
    timestamp: datetime
    phase: str
    level: str  # INFO | WARN | CRIT
    message: str

class MissionResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    mission_id: str
    result_type: str
    detection_label: str
    confidence: float
    target_lat: float
    target_lon: float
    processing_seconds: float
    input_mb: float
    output_mb: float
    downlink_reduction_pct: float
    raw_output_path: Optional[str] = None
    created_at: datetime

class MissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    mission_code: str
    application_id: str
    application_name: Optional[str] = None
    satellite_id: str
    satellite_code: Optional[str] = None
    target_region: str
    target_lat: float
    target_lon: float
    scheduled_pass_start: datetime
    scheduled_pass_end: datetime
    status: str
    telemetry_logs: List[TelemetryLog]
    created_at: datetime
    updated_at: datetime
    result: Optional[MissionResultResponse] = None

class MissionStatusResponse(BaseModel):
    mission_id: str
    status: str
    current_phase: str
    progress_pct: float
    satellite_position: Optional[GeoPosition] = None
    latest_logs: List[TelemetryLog]
    result: Optional[MissionResultResponse] = None
