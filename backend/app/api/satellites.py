from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_provider
from app.providers.base import SatelliteProvider
from app.schemas.schemas import SatelliteResponse, SatelliteSpec, GeoPosition, GroundTrackResponse

router = APIRouter(prefix="/satellites", tags=["satellites"])

@router.get("", response_model=List[SatelliteResponse])
def list_satellites(provider: SatelliteProvider = Depends(get_provider)):
    specs = provider.list_satellites()
    results = []
    for s in specs:
        pos = None
        try:
            pos = provider.get_current_position(s.id)
        except Exception:
            pass
        results.append(SatelliteResponse(
            **s.model_dump(),
            current_position=pos
        ))
    return results

@router.get("/{satellite_id}", response_model=SatelliteResponse)
def get_satellite(satellite_id: str, provider: SatelliteProvider = Depends(get_provider)):
    try:
        spec = provider.get_satellite(satellite_id)
        pos = provider.get_current_position(satellite_id)
        return SatelliteResponse(**spec.model_dump(), current_position=pos)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{satellite_id}/position", response_model=GeoPosition)
def get_satellite_position(satellite_id: str, provider: SatelliteProvider = Depends(get_provider)):
    try:
        return provider.get_current_position(satellite_id)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{satellite_id}/ground-track", response_model=GroundTrackResponse)
def get_ground_track(
    satellite_id: str,
    past: int = Query(45, description="Minutes in past to propagate"),
    future: int = Query(45, description="Minutes in future to propagate"),
    provider: SatelliteProvider = Depends(get_provider)
):
    try:
        return provider.get_ground_track(satellite_id, past, future)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
