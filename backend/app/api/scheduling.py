from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_provider
from app.providers.base import SatelliteProvider
from app.schemas.schemas import PassWindow, RecommendRequest, RecommendationResponse
from app.services.scheduler import recommend_best_satellite

router = APIRouter(tags=["scheduling"])

@router.get("/satellites/{satellite_id}/next-pass", response_model=PassWindow)
def get_satellite_next_pass(
    satellite_id: str,
    target_region: str = Query("Andhra Pradesh", description="Target geographical area"),
    window_start: Optional[datetime] = None,
    window_end: Optional[datetime] = None,
    provider: SatelliteProvider = Depends(get_provider)
):
    try:
        return provider.get_next_pass(satellite_id, target_region, window_start, window_end)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/applications/{application_id}/recommend", response_model=RecommendationResponse)
def recommend_satellite_for_application(
    application_id: str,
    payload: RecommendRequest
):
    try:
        return recommend_best_satellite(
            target_region=payload.target,
            required_sensor=payload.sensor,
            max_latency_hours=payload.max_latency_hours or 24.0
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
