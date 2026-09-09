import os
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Project, Application, ApplicationRequirements
from app.schemas.schemas import (
    ApplicationResponse,
    ApplicationRequirementsResponse,
    ValidationReportResponse,
    ValidationCheckItem,
    IDEPublishRequest
)
from app.services.validator import analyze_workload

router = APIRouter(tags=["applications"])

@router.get("/projects/{project_id}/applications", response_model=List[ApplicationResponse])
def list_project_applications(project_id: str, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.project_id == project_id).all()
    results = []
    for app in apps:
        req_resp = ApplicationRequirementsResponse.model_validate(app.requirements) if app.requirements else None
        app_resp = ApplicationResponse(
            id=app.id,
            project_id=app.project_id,
            name=app.name,
            version=app.version,
            upload_method=app.upload_method,
            language=app.language,
            status=app.status,
            created_at=app.created_at,
            requirements=req_resp
        )
        results.append(app_resp)
    return results

@router.get("/applications", response_model=List[ApplicationResponse])
def list_all_applications(db: Session = Depends(get_db)):
    apps = db.query(Application).order_by(Application.created_at.desc()).all()
    results = []
    for app in apps:
        req_resp = ApplicationRequirementsResponse.model_validate(app.requirements) if app.requirements else None
        results.append(ApplicationResponse(
            id=app.id,
            project_id=app.project_id,
            name=app.name,
            version=app.version,
            upload_method=app.upload_method,
            language=app.language,
            status=app.status,
            created_at=app.created_at,
            requirements=req_resp
        ))
    return results

@router.post("/projects/{project_id}/applications", response_model=ApplicationResponse)
async def upload_application(
    project_id: str,
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    version: Optional[str] = Form("1.0.0"),
    input_type: Optional[str] = Form("multispectral_imagery"),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    app_id = f"app-{uuid.uuid4().hex[:8]}"
    app_name = name or Path(file.filename).stem.replace("_", " ").title()
    
    # Save file to storage
    upload_dir = settings.STORAGE_DIR / app_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest_path = upload_dir / file.filename
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)

    # Analyze and validate workload
    analysis = analyze_workload(
        file_path=dest_path,
        filename=file.filename,
        declared_config={"input_type": input_type}
    )

    application = Application(
        id=app_id,
        project_id=project_id,
        name=app_name,
        version=version or "1.0.0",
        upload_method="zip" if file.filename.endswith(".zip") else Path(file.filename).suffix.lstrip("."),
        source_path=str(dest_path),
        language=analysis["language"],
        status=analysis["status"],
        created_at=datetime.now(timezone.utc)
    )
    db.add(application)

    requirements = ApplicationRequirements(
        id=f"req-{uuid.uuid4().hex[:8]}",
        application_id=app_id,
        cpu_seconds=analysis["cpu_seconds"],
        ram_mb=analysis["ram_mb"],
        storage_mb=analysis["storage_mb"],
        estimated_power_wh=analysis["estimated_power_wh"],
        input_type=analysis["input_type"],
        input_size_mb=analysis["input_size_mb"],
        output_size_mb=analysis["output_size_mb"],
        dependencies=analysis["dependencies"],
        security_flags=analysis["security_flags"]
    )
    db.add(requirements)
    db.commit()
    db.refresh(application)

    req_resp = ApplicationRequirementsResponse.model_validate(requirements)
    return ApplicationResponse(
        id=application.id,
        project_id=application.project_id,
        name=application.name,
        version=application.version,
        upload_method=application.upload_method,
        language=application.language,
        status=application.status,
        created_at=application.created_at,
        requirements=req_resp
    )

@router.post("/projects/{project_id}/applications/ide", response_model=ApplicationResponse)
def publish_ide_application(
    project_id: str,
    payload: IDEPublishRequest,
    db: Session = Depends(get_db)
):
    """Directly builds and packages an application authored inside the Floating IDE."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    app_id = f"app-{uuid.uuid4().hex[:8]}"
    upload_dir = settings.STORAGE_DIR / app_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Write authored files
    for filename, code in payload.files.items():
        file_path = upload_dir / filename
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)

    main_code = payload.files.get("main.py", "")
    declared = {
        "language": payload.language or "python",
        "code": main_code,
        "files": list(payload.files.keys()),
        "ram_mb": payload.ram_mb,
        "cpu_seconds": payload.cpu_seconds,
        "storage_mb": payload.storage_mb,
        "input_type": payload.input_type,
        "input_size_mb": payload.input_size_mb,
        "output_size_mb": payload.output_size_mb,
    }

    primary_file = upload_dir / "main.py"
    analysis = analyze_workload(
        file_path=primary_file,
        filename="main.py",
        declared_config=declared
    )

    application = Application(
        id=app_id,
        project_id=project_id,
        name=payload.name,
        version=payload.version or "1.0.0",
        upload_method="ide",
        source_path=str(upload_dir),
        language=payload.language or "python",
        status=analysis["status"],
        created_at=datetime.now(timezone.utc)
    )
    db.add(application)

    requirements = ApplicationRequirements(
        id=f"req-{uuid.uuid4().hex[:8]}",
        application_id=app_id,
        cpu_seconds=analysis["cpu_seconds"],
        ram_mb=analysis["ram_mb"],
        storage_mb=analysis["storage_mb"],
        estimated_power_wh=analysis["estimated_power_wh"],
        input_type=analysis["input_type"],
        input_size_mb=analysis["input_size_mb"],
        output_size_mb=analysis["output_size_mb"],
        dependencies=analysis["dependencies"],
        security_flags=analysis["security_flags"]
    )
    db.add(requirements)
    db.commit()
    db.refresh(application)

    req_resp = ApplicationRequirementsResponse.model_validate(requirements)
    return ApplicationResponse(
        id=application.id,
        project_id=application.project_id,
        name=application.name,
        version=application.version,
        upload_method=application.upload_method,
        language=application.language,
        status=application.status,
        created_at=application.created_at,
        requirements=req_resp
    )

@router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    req_resp = ApplicationRequirementsResponse.model_validate(app.requirements) if app.requirements else None
    return ApplicationResponse(
        id=app.id,
        project_id=app.project_id,
        name=app.name,
        version=app.version,
        upload_method=app.upload_method,
        language=app.language,
        status=app.status,
        created_at=app.created_at,
        requirements=req_resp
    )

@router.get("/applications/{application_id}/requirements", response_model=ApplicationRequirementsResponse)
def get_application_requirements(application_id: str, db: Session = Depends(get_db)):
    req = db.query(ApplicationRequirements).filter(ApplicationRequirements.application_id == application_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirements not found for application")
    return ApplicationRequirementsResponse.model_validate(req)

@router.get("/applications/{application_id}/validation", response_model=ValidationReportResponse)
def get_application_validation_report(application_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app or not app.requirements:
        raise HTTPException(status_code=404, detail="Application requirements not found")

    req = app.requirements
    declared = {
        "language": app.language,
        "ram_mb": req.ram_mb,
        "cpu_seconds": req.cpu_seconds,
        "storage_mb": req.storage_mb,
        "input_type": req.input_type,
        "input_size_mb": req.input_size_mb,
        "output_size_mb": req.output_size_mb,
    }
    
    file_path = Path(app.source_path or "")
    analysis = analyze_workload(file_path=file_path, filename=file_path.name, declared_config=declared)
    req_resp = ApplicationRequirementsResponse.model_validate(req)

    return ValidationReportResponse(
        application_id=app.id,
        status=analysis["status"],
        checks=analysis["checks"],
        requirements=req_resp,
        created_at=app.created_at
    )
