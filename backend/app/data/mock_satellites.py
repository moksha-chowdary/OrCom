import math
from datetime import datetime
from app.core.constants import EARTH_RADIUS_KM, MU_EARTH

def compute_orbital_period_min(altitude_km: float) -> float:
    """Keplerian orbital period T = 2*pi * sqrt(a^3 / mu) converted to minutes."""
    a = EARTH_RADIUS_KM + altitude_km
    period_seconds = 2.0 * math.pi * math.sqrt((a ** 3) / MU_EARTH)
    return round(period_seconds / 60.0, 2)

# Single source of truth for mock satellite fleet specs and orbital elements
FLEET_DATA = [
    {
        "id": "sat-oc-01",
        "code": "OC-01",
        "status": "available",
        "orbit_altitude_km": 550.0,
        "orbit_type": "Sun-synchronous",
        "inclination_deg": 97.6,
        "raan_deg": 45.0,
        "orbital_period_min": compute_orbital_period_min(550.0),
        "cpu_cores": 4,
        "cpu_ghz": 1.2,
        "cpu_capacity_seconds_per_pass": 360.0,
        "ram_mb": 1024,
        "storage_mb": 4096,
        "power_budget_wh": 15.0,
        "sensors": ["multispectral", "thermal_ir"],
        "downlink_mbps": 50.0,
    },
    {
        "id": "sat-oc-02",
        "code": "OC-02",
        "status": "available",
        "orbit_altitude_km": 500.0,
        "orbit_type": "Sun-synchronous",
        "inclination_deg": 97.4,
        "raan_deg": 130.0,
        "orbital_period_min": compute_orbital_period_min(500.0),
        "cpu_cores": 8,
        "cpu_ghz": 1.5,
        "cpu_capacity_seconds_per_pass": 480.0,
        "ram_mb": 2048,
        "storage_mb": 8192,
        "power_budget_wh": 22.0,
        "sensors": ["rgb", "multispectral", "sar"],
        "downlink_mbps": 100.0,
    },
    {
        "id": "sat-oc-03",
        "code": "OC-03",
        "status": "offline",
        "orbit_altitude_km": 600.0,
        "orbit_type": "Mid-inclination",
        "inclination_deg": 51.6,
        "raan_deg": 260.0,
        "orbital_period_min": compute_orbital_period_min(600.0),
        "cpu_cores": 2,
        "cpu_ghz": 1.0,
        "cpu_capacity_seconds_per_pass": 180.0,
        "ram_mb": 512,
        "storage_mb": 2048,
        "power_budget_wh": 9.0,
        "sensors": ["rgb"],
        "downlink_mbps": 25.0,
    },
]
