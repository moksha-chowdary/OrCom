from typing import List, Dict, Any, Optional
from app.data.mock_satellites import FLEET_DATA
from app.schemas.schemas import (
    ApplicationRequirementsResponse,
    SatelliteCompatibility,
    CompatibilityResultResponse
)

def evaluate_satellite_compatibility(
    req: ApplicationRequirementsResponse,
    sat: Dict[str, Any]
) -> SatelliteCompatibility:
    reasons: List[str] = []
    is_compatible = True

    # 1. Operational status
    if sat.get("status") != "available":
        is_compatible = False
        reasons.append(f"✗ Satellite {sat['code']} status is '{sat.get('status', 'offline')}'")
    else:
        reasons.append(f"✓ Operational status: Available on orbit")

    # 2. RAM check
    if req.ram_mb <= sat["ram_mb"]:
        reasons.append(f"✓ RAM: {req.ram_mb} MB / {sat['ram_mb']} MB available")
    else:
        is_compatible = False
        reasons.append(f"✗ Insufficient RAM: requires {req.ram_mb} MB, satellite has {sat['ram_mb']} MB")

    # 3. Storage check
    if req.storage_mb <= sat["storage_mb"]:
        reasons.append(f"✓ Storage: {req.storage_mb} MB / {sat['storage_mb']} MB available")
    else:
        is_compatible = False
        reasons.append(f"✗ Insufficient Storage: requires {req.storage_mb} MB, satellite has {sat['storage_mb']} MB")

    # 4. Power budget check
    if req.estimated_power_wh <= sat["power_budget_wh"]:
        reasons.append(f"✓ Power: {req.estimated_power_wh:.1f} Wh / {sat['power_budget_wh']:.1f} Wh per-pass budget")
    else:
        is_compatible = False
        reasons.append(f"✗ Power budget exceeded: requires {req.estimated_power_wh:.1f} Wh, budget is {sat['power_budget_wh']:.1f} Wh")

    # 5. Sensor compatibility
    req_input = (req.input_type or "").lower()
    available_sensors = [s.lower() for s in sat.get("sensors", [])]
    
    sensor_match = False
    if "multi" in req_input and "multispectral" in available_sensors:
        sensor_match = True
    elif "sar" in req_input and "sar" in available_sensors:
        sensor_match = True
    elif "thermal" in req_input and ("thermal_ir" in available_sensors or "multispectral" in available_sensors):
        sensor_match = True
    elif "rgb" in req_input and ("rgb" in available_sensors or "multispectral" in available_sensors):
        sensor_match = True
    elif not req_input or req_input in ["generic", "any"]:
        sensor_match = True
    else:
        # Check if sensor tag exists in available
        for s in available_sensors:
            if s in req_input or req_input in s:
                sensor_match = True
                break

    if sensor_match:
        reasons.append(f"✓ Sensor complement matched: {', '.join(sat.get('sensors', []))}")
    else:
        is_compatible = False
        reasons.append(f"✗ Sensor mismatch: requires '{req.input_type}', satellite mounted with {sat.get('sensors', [])}")

    # 6. Compute pass window check
    if req.cpu_seconds <= sat.get("cpu_capacity_seconds_per_pass", 360.0):
        reasons.append(f"✓ Compute window: {req.cpu_seconds:.0f}s execution fits {sat.get('cpu_capacity_seconds_per_pass', 360.0):.0f}s pass")
    else:
        is_compatible = False
        reasons.append(f"✗ Compute window exceeded: requires {req.cpu_seconds:.0f}s, pass window cap is {sat.get('cpu_capacity_seconds_per_pass', 360.0):.0f}s")

    status_str = "Compatible" if is_compatible else "Incompatible"
    return SatelliteCompatibility(
        satellite_id=sat["id"],
        satellite_code=sat["code"],
        compatible=is_compatible,
        status=status_str,
        reasons=reasons
    )

def check_fleet_compatibility(
    req: ApplicationRequirementsResponse,
    fleet: Optional[List[Dict[str, Any]]] = None
) -> CompatibilityResultResponse:
    satellites_data = fleet or FLEET_DATA
    results: List[SatelliteCompatibility] = []
    
    recommended_id = None
    for sat in satellites_data:
        comp = evaluate_satellite_compatibility(req, sat)
        results.append(comp)
        if comp.compatible and recommended_id is None:
            recommended_id = sat["id"]

    return CompatibilityResultResponse(
        application_id=req.application_id,
        satellites=results,
        recommended_satellite_id=recommended_id
    )
