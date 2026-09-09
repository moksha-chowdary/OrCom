from typing import List
from fastapi import APIRouter, Depends
from app.core.dependencies import get_provider
from app.providers.base import SatelliteProvider
from app.schemas.schemas import GeoPosition

router = APIRouter(prefix="/tracking", tags=["tracking"])

@router.get("/positions", response_model=List[GeoPosition])
def get_all_satellite_positions(provider: SatelliteProvider = Depends(get_provider)):
    specs = provider.list_satellites()
    positions = []
    for s in specs:
        try:
            pos = provider.get_current_position(s.id)
            positions.append(pos)
        except Exception:
            pass
    return positions
