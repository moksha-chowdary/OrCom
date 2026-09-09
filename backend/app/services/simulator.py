import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.schemas.schemas import ApplicationRequirementsResponse, SimulationResponse

def run_deterministic_simulation(
    req: ApplicationRequirementsResponse,
    sat: Dict[str, Any],
    target_region: str = "Andhra Pradesh",
    simulation_id: Optional[str] = None
) -> SimulationResponse:
    """
    Deterministically computes resource utilization, speed-adjusted execution time,
    power consumption, and downlink reduction.
    """
    sim_id = simulation_id or f"sim-{uuid.uuid4().hex[:8]}"
    
    # 1. Resource percentages
    cpu_cap = sat.get("cpu_capacity_seconds_per_pass", 360.0)
    cpu_pct = round((req.cpu_seconds / cpu_cap) * 100.0, 2)
    ram_pct = round((req.ram_mb / sat["ram_mb"]) * 100.0, 2)
    storage_pct = round((req.storage_mb / sat["storage_mb"]) * 100.0, 2)
    power_pct = round((req.estimated_power_wh / sat["power_budget_wh"]) * 100.0, 2)
    
    # Speed factor: baseline is 1.2 GHz, 4 cores
    speed_factor = (1.2 / sat.get("cpu_ghz", 1.2)) * (4.0 / sat.get("cpu_cores", 4))
    execution_seconds = round(req.cpu_seconds * speed_factor, 2)
    
    # Processed data amounts
    input_mb = float(req.input_size_mb)
    output_mb = float(req.output_size_mb)
    processed_mb = input_mb
    
    downlink_reduction_pct = round((1.0 - (output_mb / input_mb)) * 100.0, 2)
    
    # Check if bounds exceeded
    failure_reason = None
    status = "completed"
    if ram_pct > 100.0:
        status = "failed"
        failure_reason = f"RAM required ({req.ram_mb} MB) exceeds physical satellite capacity ({sat['ram_mb']} MB)."
    elif storage_pct > 100.0:
        status = "failed"
        failure_reason = f"Storage required ({req.storage_mb} MB) exceeds available flash partition ({sat['storage_mb']} MB)."
    elif power_pct > 100.0:
        status = "failed"
        failure_reason = f"Power draw ({req.estimated_power_wh:.1f} Wh) exceeds pass power budget ({sat['power_budget_wh']:.1f} Wh)."
    elif cpu_pct > 100.0:
        status = "failed"
        failure_reason = f"Compute time ({req.cpu_seconds:.1f}s) exceeds available pass window ({cpu_cap:.1f}s)."
    elif sat.get("status") == "offline":
        status = "failed"
        failure_reason = f"Satellite {sat['code']} is currently offline for system diagnostics."

    return SimulationResponse(
        id=sim_id,
        application_id=req.application_id,
        satellite_id=sat["id"],
        satellite_code=sat["code"],
        target_region=target_region,
        cpu_pct=cpu_pct,
        ram_pct=ram_pct,
        storage_pct=storage_pct,
        power_pct=power_pct,
        input_data_mb=input_mb,
        processed_data_mb=processed_mb,
        output_data_mb=output_mb,
        execution_seconds=execution_seconds,
        downlink_reduction_pct=downlink_reduction_pct,
        status=status,
        failure_reason=failure_reason,
        created_at=datetime.now(timezone.utc)
    )
