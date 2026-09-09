export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  application_count: number;
}

export interface ApplicationRequirements {
  id: string;
  application_id: string;
  cpu_seconds: number;
  ram_mb: number;
  storage_mb: number;
  estimated_power_wh: number;
  input_type: string;
  input_size_mb: number;
  output_size_mb: number;
  dependencies: string[];
  security_flags: string[];
}

export interface Application {
  id: string;
  project_id: string;
  name: string;
  version: string;
  upload_method: string;
  language: string;
  status: string;
  created_at: string;
  requirements?: ApplicationRequirements | null;
}

export interface ValidationCheckItem {
  category: string;
  title: string;
  status: "pass" | "warn" | "fail";
  message: string;
  suggested_action?: string | null;
}

export interface ValidationReport {
  application_id: string;
  status: "ready" | "analysis_failed";
  checks: ValidationCheckItem[];
  requirements: ApplicationRequirements;
  created_at: string;
}

export interface GeoPosition {
  lat: number;
  lon: number;
  alt_km: number;
  timestamp: string;
  satellite_code?: string | null;
}

export interface GroundTrackPoint {
  lat: number;
  lon: number;
  t_offset_minutes: number;
}

export interface GroundTrackResponse {
  satellite_id: string;
  satellite_code: string;
  past_segments: GroundTrackPoint[][];
  upcoming_segments: GroundTrackPoint[][];
}

export interface Satellite {
  id: string;
  code: string;
  status: "available" | "executing" | "offline";
  orbit_altitude_km: number;
  orbit_type: string;
  inclination_deg: number;
  raan_deg: number;
  orbital_period_min: number;
  cpu_cores: number;
  cpu_ghz: number;
  cpu_capacity_seconds_per_pass: number;
  ram_mb: number;
  storage_mb: number;
  power_budget_wh: number;
  sensors: string[];
  downlink_mbps: number;
  current_position?: GeoPosition | null;
}

export interface SatelliteCompatibility {
  satellite_id: string;
  satellite_code: string;
  compatible: boolean;
  status: string;
  reasons: string[];
}

export interface CompatibilityResult {
  application_id: string;
  satellites: SatelliteCompatibility[];
  recommended_satellite_id?: string | null;
}

export interface SimulationResult {
  id: string;
  application_id: string;
  satellite_id: string;
  satellite_code: string;
  target_region: string;
  cpu_pct: number;
  ram_pct: number;
  storage_pct: number;
  power_pct: number;
  input_data_mb: number;
  processed_data_mb: number;
  output_data_mb: number;
  execution_seconds: number;
  downlink_reduction_pct: number;
  status: "completed" | "failed" | "running";
  failure_reason?: string | null;
  created_at: string;
}

export interface PassWindow {
  pass_window_id: string;
  satellite_id: string;
  satellite_code: string;
  target_region: string;
  target_lat: number;
  target_lon: number;
  window_start: string;
  window_end: string;
  duration_seconds: number;
  max_elevation_deg: number;
}

export interface RecommendationItem {
  satellite: Satellite;
  pass_window: PassWindow;
  score: number;
  notes: string[];
}

export interface RecommendationResponse {
  recommended: RecommendationItem;
  alternatives: RecommendationItem[];
}

export interface TelemetryLog {
  timestamp: string;
  phase: string;
  level: "INFO" | "WARN" | "CRIT";
  message: string;
}

export interface MissionResult {
  id: string;
  mission_id: string;
  result_type: string;
  detection_label: string;
  confidence: number;
  target_lat: number;
  target_lon: number;
  processing_seconds: number;
  input_mb: number;
  output_mb: number;
  downlink_reduction_pct: number;
  raw_output_path?: string | null;
  created_at: string;
}

export interface Mission {
  id: string;
  mission_code: string;
  application_id: string;
  application_name?: string | null;
  satellite_id: string;
  satellite_code?: string | null;
  target_region: string;
  target_lat: number;
  target_lon: number;
  scheduled_pass_start: string;
  scheduled_pass_end: string;
  status: "scheduled" | "awaiting_pass" | "sensor_active" | "capturing" | "processing" | "downlinking" | "complete" | "failed";
  telemetry_logs: TelemetryLog[];
  created_at: string;
  updated_at: string;
  result?: MissionResult | null;
}

export interface MissionStatusResponse {
  mission_id: string;
  status: string;
  current_phase: string;
  progress_pct: number;
  satellite_position?: GeoPosition | null;
  latest_logs: TelemetryLog[];
  result?: MissionResult | null;
}

export interface IDEPublishPayload {
  project_id: string;
  name: string;
  version?: string;
  language?: string;
  files: Record<string, string>;
  input_type?: string;
  ram_mb?: number;
  cpu_seconds?: number;
  storage_mb?: number;
  input_size_mb?: number;
  output_size_mb?: number;
}

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorDetail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) errorDetail = data.detail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Projects
  getProjects: () => fetchJSON<Project[]>("/projects"),
  getProject: (id: string) => fetchJSON<Project>(`/projects/${id}`),
  createProject: (data: { name: string; description?: string }) =>
    fetchJSON<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),

  // Applications
  listApplications: () => fetchJSON<Application[]>("/applications"),
  getProjectApplications: (projectId: string) =>
    fetchJSON<Application[]>(`/projects/${projectId}/applications`),
  getApplication: (id: string) => fetchJSON<Application>(`/applications/${id}`),
  getApplicationRequirements: (id: string) =>
    fetchJSON<ApplicationRequirements>(`/applications/${id}/requirements`),
  getApplicationValidation: (id: string) =>
    fetchJSON<ValidationReport>(`/applications/${id}/validation`),

  publishIDEApplication: (projectId: string, payload: IDEPublishPayload) =>
    fetchJSON<Application>(`/projects/${projectId}/applications/ide`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadApplication: async (projectId: string, formData: FormData): Promise<Application> => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/applications`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },

  // Satellites & Tracking
  getSatellites: () => fetchJSON<Satellite[]>("/satellites"),
  getSatellite: (id: string) => fetchJSON<Satellite>(`/satellites/${id}`),
  getSatellitePosition: (id: string) => fetchJSON<GeoPosition>(`/satellites/${id}/position`),
  getSatelliteGroundTrack: (id: string, past = 45, future = 45) =>
    fetchJSON<GroundTrackResponse>(`/satellites/${id}/ground-track?past=${past}&future=${future}`),
  getAllPositions: () => fetchJSON<GeoPosition[]>("/tracking/positions"),

  // Compatibility & Simulation
  checkCompatibility: (appId: string) =>
    fetchJSON<CompatibilityResult>(`/applications/${appId}/compatibility`),
  runSimulation: (appId: string, data: { satellite_id: string; target_region?: string }) =>
    fetchJSON<SimulationResult>(`/applications/${appId}/simulate`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSimulation: (simId: string) => fetchJSON<SimulationResult>(`/simulations/${simId}`),

  // Scheduling & Recommendations
  getSatelliteNextPass: (satId: string, targetRegion = "Andhra Pradesh") =>
    fetchJSON<PassWindow>(
      `/satellites/${satId}/next-pass?target_region=${encodeURIComponent(targetRegion)}`
    ),
  recommendSatellite: (
    appId: string,
    data: { target: string; sensor: string; task?: string; max_latency_hours?: number }
  ) =>
    fetchJSON<RecommendationResponse>(`/applications/${appId}/recommend`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Deploy & Missions
  deployMission: (
    appId: string,
    data: {
      satellite_id: string;
      pass_window_id?: string;
      target_region?: string;
      target_lat?: number;
      target_lon?: number;
    }
  ) =>
    fetchJSON<Mission>(`/applications/${appId}/deploy`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listMissions: () => fetchJSON<Mission[]>("/missions"),
  getMissionStatus: (missionId: string) =>
    fetchJSON<MissionStatusResponse>(`/missions/${missionId}`),
  getMissionResult: (missionId: string) =>
    fetchJSON<MissionResult>(`/missions/${missionId}/result`),
};
