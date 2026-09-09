from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_provider
from app.providers.base import SatelliteProvider
from app.models.models import Application, ApplicationRequirements
from app.schemas.schemas import CompatibilityResultResponse, ApplicationRequirementsResponse

router = APIRouter(tags=["compatibility"])

@router.get("/applications/{application_id}/compatibility", response_model=CompatibilityResultResponse)
def check_application_compatibility(
    application_id: str,
    db: Session = Depends(get_db),
    provider: SatelliteProvider = Depends(get_provider)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app or not app.requirements:
        raise HTTPException(status_code=404, detail="Application or requirements not found")

    req_resp = ApplicationRequirementsResponse.from_orm(app.requirements)
    try:
        return provider.check_compatibility(req_resp, satellite_id="all")
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
