import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "OrCom Satellite Application Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./orcom.db"
    
    # Active provider selection: 'mock' or 'dhruva'
    SATELLITE_PROVIDER: str = os.getenv("SATELLITE_PROVIDER", "mock")
    
    # Storage path for uploaded artifacts
    STORAGE_DIR: Path = Path(__file__).resolve().parent.parent.parent / "storage"

settings = Settings()

# Ensure storage directory exists
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
