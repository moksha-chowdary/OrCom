from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_provider
from app.providers.base import SatelliteProvider
from app.models.models import Mission, Application, Satellite, MissionResult
from app.schemas.schemas import (
    DeployRequest,
    MissionResponse,
    MissionStatusResponse,
    MissionResultResponse,
    PassWindow,
    TelemetryLog
)

router = APIRouter(tags=["missions"])

@router.get("/missions", response_model=List[MissionResponse])
def list_missions(db: Session = Depends(get_db)):
    missions = db.query(Mission).order_by(Mission.created_at.desc()).all()
    results = []
    for m in missions:
        app = db.query(Application).filter(Application.id == m.application_id).first()
        sat = db.query(Satellite).filter(Satellite.id == m.satellite_id).first()
        res = db.query(MissionResult).filter(MissionResult.mission_id == m.id).first()
        
        logs = [TelemetryLog(**l) for l in m.telemetry_logs]
        res_resp = MissionResultResponse.model_validate(res) if res else None

        results.append(MissionResponse(
            id=m.id,
            mission_code=m.mission_code,
            application_id=m.application_id,
            application_name=app.name if app else "Unknown Workload",
            satellite_id=m.satellite_id,
            satellite_code=sat.code if sat else "OC-??",
            target_region=m.target_region,
            target_lat=m.target_lat,
            target_lon=m.target_lon,
            scheduled_pass_start=m.scheduled_pass_start,
            scheduled_pass_end=m.scheduled_pass_end,
            status=m.status,
            telemetry_logs=logs,
            created_at=m.created_at,
            updated_at=m.updated_at,
            result=res_resp
        ))
    return results

@router.post("/applications/{application_id}/deploy", response_model=MissionResponse)
def deploy_application_mission(
    application_id: str,
    payload: DeployRequest,
    db: Session = Depends(get_db),
    provider: SatelliteProvider = Depends(get_provider)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    target_reg = payload.target_region or "Andhra Pradesh"
    try:
        pass_win = provider.get_next_pass(payload.satellite_id, target_reg)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        mission_resp = provider.deploy_mission(application_id, payload.satellite_id, pass_win)
        return mission_resp
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/missions/{mission_id}", response_model=MissionStatusResponse)
def get_mission_status(
    mission_id: str,
    provider: SatelliteProvider = Depends(get_provider)
):
    try:
        return provider.get_mission_status(mission_id)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/missions/{mission_id}/result", response_model=MissionResultResponse)
def get_mission_result(
    mission_id: str,
    db: Session = Depends(get_db)
):
    result = db.query(MissionResult).filter(MissionResult.mission_id == mission_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Mission result not available or mission still executing")
    return MissionResultResponse.model_validate(result)
