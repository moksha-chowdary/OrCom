import math
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any
from app.core.constants import EARTH_RADIUS_KM, MU_EARTH, EARTH_ROTATION_DEG_PER_SEC
from app.data.mock_satellites import FLEET_DATA
from app.schemas.schemas import GeoPosition, GroundTrackPoint, GroundTrackResponse

# Reference epoch for simulation: static or server start time
# NOTE: This is a simplified circular-orbit Keplerian model for product demonstration.
# It is NOT a real SGP4/TLE propagator. It produces deterministic, visually distinct,
# internally consistent orbital ground tracks accounting for Earth's sidereal rotation.
EPOCH_TIMESTAMP = 1773000000.0  # Stable deterministic reference epoch

def get_satellite_fleet_map() -> Dict[str, Dict[str, Any]]:
    return {sat["id"]: sat for sat in FLEET_DATA} | {sat["code"]: sat for sat in FLEET_DATA}

def propagate_position_at_time(
    sat_spec: Dict[str, Any], timestamp_sec: float
) -> Tuple[float, float, float]:
    """
    Computes latitude, longitude (in [-180, 180] deg) and altitude for given satellite and epoch timestamp.
    Uses circular orbit approximation with inclination, RAAN, and Earth's rotation.
    """
    altitude_km = sat_spec["orbit_altitude_km"]
    a = EARTH_RADIUS_KM + altitude_km
    period_sec = 2.0 * math.pi * math.sqrt((a ** 3) / MU_EARTH)
    
    elapsed_sec = timestamp_sec - EPOCH_TIMESTAMP
    mean_anomaly = (2.0 * math.pi * (elapsed_sec / period_sec)) % (2.0 * math.pi)
    
    inc_rad = math.radians(sat_spec["inclination_deg"])
    raan_deg = sat_spec["raan_deg"]
    
    # Position in orbital plane
    sin_lat = math.sin(inc_rad) * math.sin(mean_anomaly)
    # Clip to valid domain for asin
    sin_lat = max(-1.0, min(1.0, sin_lat))
    lat_deg = math.degrees(math.asin(sin_lat))
    
    # Right ascension of satellite along orbit
    # tan(alpha) = cos(inc) * tan(mean_anomaly)
    y_node = math.cos(inc_rad) * math.sin(mean_anomaly)
    x_node = math.cos(mean_anomaly)
    alpha_deg = math.degrees(math.atan2(y_node, x_node))
    
    # Longitude accounting for RAAN and Earth's sidereal rotation under the orbit
    earth_rotation = (EARTH_ROTATION_DEG_PER_SEC * elapsed_sec) % 360.0
    lon_raw = (raan_deg + alpha_deg - earth_rotation) % 360.0
    
    # Normalize to [-180, 180]
    lon_deg = lon_raw if lon_raw <= 180.0 else lon_raw - 360.0
    
    return round(lat_deg, 4), round(lon_deg, 4), altitude_km

def get_current_satellite_position(satellite_id: str) -> GeoPosition:
    fleet = get_satellite_fleet_map()
    if satellite_id not in fleet:
        raise ValueError(f"Unknown satellite ID: {satellite_id}")
    sat = fleet[satellite_id]
    now_sec = datetime.now(timezone.utc).timestamp()
    lat, lon, alt = propagate_position_at_time(sat, now_sec)
    return GeoPosition(
        lat=lat,
        lon=lon,
        alt_km=alt,
        timestamp=datetime.now(timezone.utc),
        satellite_code=sat["code"]
    )

def split_segments_by_antimeridian(points: List[GroundTrackPoint]) -> List[List[GroundTrackPoint]]:
    """
    Splits ground track points into continuous sub-lists whenever longitude
    crosses the antimeridian (+/-180 deg) so maps do not draw spurious horizontal wrap lines.
    """
    if not points:
        return []
    
    segments: List[List[GroundTrackPoint]] = []
    current_segment: List[GroundTrackPoint] = [points[0]]
    
    for i in range(1, len(points)):
        prev_p = points[i - 1]
        curr_p = points[i]
        # If longitude jumps by more than 180 deg, it has crossed the antimeridian
        if abs(curr_p.lon - prev_p.lon) > 180.0:
            segments.append(current_segment)
            current_segment = [curr_p]
        else:
            current_segment.append(curr_p)
            
    if current_segment:
        segments.append(current_segment)
        
    return segments

def get_satellite_ground_track(
    satellite_id: str, minutes_past: int = 45, minutes_future: int = 45
) -> GroundTrackResponse:
    fleet = get_satellite_fleet_map()
    if satellite_id not in fleet:
        raise ValueError(f"Unknown satellite ID: {satellite_id}")
    sat = fleet[satellite_id]
    
    now_sec = datetime.now(timezone.utc).timestamp()
    step_sec = 20.0  # Sample every 20 seconds for smooth curves
    
    # 1. Past track: from -minutes_past to 0
    past_points: List[GroundTrackPoint] = []
    t_start_past = -minutes_past * 60.0
    num_past_steps = int((minutes_past * 60.0) / step_sec)
    for i in range(num_past_steps + 1):
        offset_sec = t_start_past + (i * step_sec)
        t_sec = now_sec + offset_sec
        lat, lon, _ = propagate_position_at_time(sat, t_sec)
        past_points.append(GroundTrackPoint(
            lat=lat,
            lon=lon,
            t_offset_minutes=round(offset_sec / 60.0, 2)
        ))
        
    # 2. Upcoming track: from 0 to +minutes_future
    upcoming_points: List[GroundTrackPoint] = []
    num_future_steps = int((minutes_future * 60.0) / step_sec)
    for i in range(num_future_steps + 1):
        offset_sec = i * step_sec
        t_sec = now_sec + offset_sec
        lat, lon, _ = propagate_position_at_time(sat, t_sec)
        upcoming_points.append(GroundTrackPoint(
            lat=lat,
            lon=lon,
            t_offset_minutes=round(offset_sec / 60.0, 2)
        ))
        
    past_segments = split_segments_by_antimeridian(past_points)
    upcoming_segments = split_segments_by_antimeridian(upcoming_points)
    
    return GroundTrackResponse(
        satellite_id=sat["id"],
        satellite_code=sat["code"],
        past_segments=past_segments,
        upcoming_segments=upcoming_segments
    )
