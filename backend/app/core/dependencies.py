from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.providers.base import SatelliteProvider
from app.providers.mock_provider import MockProvider
from app.providers.dhruva_provider import DhruvaProvider

def get_provider(db: Session = Depends(get_db)) -> SatelliteProvider:
    """
    FastAPI dependency injection factory for SatelliteProvider.
    Routers MUST only depend on SatelliteProvider through this injector.
    """
    provider_name = settings.SATELLITE_PROVIDER.lower().strip()
    if provider_name == "dhruva":
        return DhruvaProvider()
    return MockProvider(db=db)
