import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.data.seed_data import seed_initial_database
from app.services.mission_state_machine import mission_progression_daemon

# Import all API routers
from app.api.projects import router as projects_router
from app.api.applications import router as applications_router
from app.api.satellites import router as satellites_router
from app.api.tracking import router as tracking_router
from app.api.compatibility import router as compatibility_router
from app.api.simulation import router as simulation_router
from app.api.scheduling import router as scheduling_router
from app.api.missions import router as missions_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed initial investor-ready data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_database(db)
    finally:
        db.close()

    # Launch background mission progression state machine
    daemon_task = asyncio.create_task(mission_progression_daemon())
    yield
    daemon_task.cancel()

app = FastAPI(
    title="OrCom Satellite Application Platform API",
    description="Developer platform proving orbital software lifecycle (Upload → Validate → Simulate → Schedule → Deploy → Result)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(projects_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(satellites_router, prefix="/api")
app.include_router(tracking_router, prefix="/api")
app.include_router(compatibility_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(scheduling_router, prefix="/api")
app.include_router(missions_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "OrCom Satellite Edge Platform",
        "status": "operational",
        "provider": settings.SATELLITE_PROVIDER,
        "mode": "Simulation (MockProvider)" if settings.SATELLITE_PROVIDER == "mock" else settings.SATELLITE_PROVIDER,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "satellite_provider": settings.SATELLITE_PROVIDER,
        "seam_verified": True
    }
