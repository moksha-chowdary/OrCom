from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_provider
from app.providers.base import SatelliteProvider
from app.models.models import Application, SimulationRun, Satellite
from app.schemas.schemas import SimulationRequest, SimulationResponse, ApplicationRequirementsResponse

router = APIRouter(tags=["simulation"])

@router.post("/applications/{application_id}/simulate", response_model=SimulationResponse)
def run_simulation(
    application_id: str,
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    provider: SatelliteProvider = Depends(get_provider)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app or not app.requirements:
        raise HTTPException(status_code=404, detail="Application or requirements not found")

    req_resp = ApplicationRequirementsResponse.from_orm(app.requirements)
    target_reg = payload.target_region or "Andhra Pradesh"
    
    try:
        sim_result = provider.run_simulation(req_resp, payload.satellite_id, target_reg)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Persist as SimulationRun in DB
    sim_row = SimulationRun(
        id=sim_result.id,
        application_id=application_id,
        satellite_id=payload.satellite_id,
        target_region=target_reg,
        cpu_pct=sim_result.cpu_pct,
        ram_pct=sim_result.ram_pct,
        storage_pct=sim_result.storage_pct,
        power_pct=sim_result.power_pct,
        input_data_mb=sim_result.input_data_mb,
        processed_data_mb=sim_result.processed_data_mb,
        output_data_mb=sim_result.output_data_mb,
        execution_seconds=sim_result.execution_seconds,
        status=sim_result.status,
        failure_reason=sim_result.failure_reason,
        created_at=sim_result.created_at
    )
    db.add(sim_row)
    db.commit()

    return sim_result

@router.get("/simulations/{simulation_id}", response_model=SimulationResponse)
def get_simulation(simulation_id: str, db: Session = Depends(get_db)):
    sim = db.query(SimulationRun).filter(SimulationRun.id == simulation_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation run not found")
        
    sat = db.query(Satellite).filter(Satellite.id == sim.satellite_id).first()
    sat_code = sat.code if sat else "OC-??"
    
    reduction_pct = round((1.0 - (sim.output_data_mb / (sim.input_data_mb or 1.0))) * 100.0, 2)

    return SimulationResponse(
        id=sim.id,
        application_id=sim.application_id,
        satellite_id=sim.satellite_id,
        satellite_code=sat_code,
        target_region=sim.target_region,
        cpu_pct=sim.cpu_pct,
        ram_pct=sim.ram_pct,
        storage_pct=sim.storage_pct,
        power_pct=sim.power_pct,
        input_data_mb=sim.input_data_mb,
        processed_data_mb=sim.processed_data_mb,
        output_data_mb=sim.output_data_mb,
        execution_seconds=sim.execution_seconds,
        downlink_reduction_pct=reduction_pct,
        status=sim.status,
        failure_reason=sim.failure_reason,
        created_at=sim.created_at
    )
