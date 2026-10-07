import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH: Path = BASE_DIR / "orcom.db"
DEFAULT_DB_URL: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "OrCom Satellite Application Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = DEFAULT_DB_URL
    
    # Active provider selection: 'mock' or 'dhruva'
    SATELLITE_PROVIDER: str = "mock"
    
    # Storage path for uploaded artifacts
    STORAGE_DIR: Path = BASE_DIR / "storage"

    # CORS configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    CORS_ORIGIN_REGEX: str = r"^https:\/\/.*\.vercel\.app$"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Ensure storage directory exists
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
