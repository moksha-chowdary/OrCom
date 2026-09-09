import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Project, Application
from app.schemas.schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        count = db.query(Application).filter(Application.project_id == p.id).count()
        results.append(ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            created_at=p.created_at,
            application_count=count
        ))
    return results

@router.post("", response_model=ProjectResponse)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    proj_id = f"proj-{uuid.uuid4().hex[:8]}"
    project = Project(
        id=proj_id,
        name=project_in.name,
        description=project_in.description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        application_count=0
    )

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    count = db.query(Application).filter(Application.project_id == project.id).count()
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        application_count=count
    )
