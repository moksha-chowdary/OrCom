import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="project", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    version = Column(String, default="1.0.0")
    upload_method = Column(String, default="zip")  # zip | onnx | tflite | github | ide
    source_path = Column(String, nullable=True)
    language = Column(String, default="python")  # python | onnx | tflite
    status = Column(String, default="uploaded")  # uploaded | analyzing | analysis_failed | ready
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="applications")
    requirements = relationship("ApplicationRequirements", back_populates="application", uselist=False, cascade="all, delete-orphan")
    compatibility_checks = relationship("CompatibilityCheck", back_populates="application", cascade="all, delete-orphan")
    simulations = relationship("SimulationRun", back_populates="application", cascade="all, delete-orphan")
    missions = relationship("Mission", back_populates="application", cascade="all, delete-orphan")


class ApplicationRequirements(Base):
    __tablename__ = "application_requirements"

    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"), unique=True, nullable=False)
    cpu_seconds = Column(Float, default=120.0)
    ram_mb = Column(Integer, default=512)
    storage_mb = Column(Integer, default=1024)
    estimated_power_wh = Column(Float, default=4.5)
    input_type = Column(String, default="multispectral_imagery")
    input_size_mb = Column(Float, default=1500.0)
    output_size_mb = Column(Float, default=0.15)
    _dependencies = Column("dependencies", Text, default="[]")
    _security_flags = Column("security_flags", Text, default="[]")

    application = relationship("Application", back_populates="requirements")

    @property
    def dependencies(self):
        try:
            return json.loads(self._dependencies or "[]")
        except Exception:
            return []

    @dependencies.setter
    def dependencies(self, value):
        self._dependencies = json.dumps(value if isinstance(value, list) else [])

    @property
    def security_flags(self):
        try:
            return json.loads(self._security_flags or "[]")
        except Exception:
            return []

    @security_flags.setter
    def security_flags(self, value):
        self._security_flags = json.dumps(value if isinstance(value, list) else [])


class Satellite(Base):
    __tablename__ = "satellites"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)  # e.g. OC-01
    status = Column(String, default="available")  # available | executing | offline
    orbit_altitude_km = Column(Float, nullable=False)
    orbit_type = Column(String, default="Sun-synchronous")
    inclination_deg = Column(Float, nullable=False)
    raan_deg = Column(Float, nullable=False)  # Right Ascension of Ascending Node
    orbital_period_min = Column(Float, nullable=False)
    epoch = Column(DateTime, default=datetime.utcnow)
    cpu_cores = Column(Integer, default=4)
    cpu_ghz = Column(Float, default=1.2)
    cpu_capacity_seconds_per_pass = Column(Float, default=300.0)
    ram_mb = Column(Integer, default=1024)
    storage_mb = Column(Integer, default=4096)
    power_budget_wh = Column(Float, default=15.0)
    _sensors = Column("sensors", Text, default="[]")
    downlink_mbps = Column(Float, default=50.0)

    compatibility_checks = relationship("CompatibilityCheck", back_populates="satellite", cascade="all, delete-orphan")
    simulations = relationship("SimulationRun", back_populates="satellite", cascade="all, delete-orphan")
    missions = relationship("Mission", back_populates="satellite", cascade="all, delete-orphan")

    @property
    def sensors(self):
        try:
            return json.loads(self._sensors or "[]")
        except Exception:
            return []

    @sensors.setter
    def sensors(self, value):
        self._sensors = json.dumps(value if isinstance(value, list) else [])


class CompatibilityCheck(Base):
    __tablename__ = "compatibility_checks"

    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    satellite_id = Column(String, ForeignKey("satellites.id"), nullable=False)
    compatible = Column(Boolean, default=False)
    _reasons = Column("reasons", Text, default="[]")
    checked_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="compatibility_checks")
    satellite = relationship("Satellite", back_populates="compatibility_checks")

    @property
    def reasons(self):
        try:
            return json.loads(self._reasons or "[]")
        except Exception:
            return []

    @reasons.setter
    def reasons(self, value):
        self._reasons = json.dumps(value if isinstance(value, list) else [])


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    satellite_id = Column(String, ForeignKey("satellites.id"), nullable=False)
    target_region = Column(String, default="Andhra Pradesh")
    cpu_pct = Column(Float, default=0.0)
    ram_pct = Column(Float, default=0.0)
    storage_pct = Column(Float, default=0.0)
    power_pct = Column(Float, default=0.0)
    input_data_mb = Column(Float, default=0.0)
    processed_data_mb = Column(Float, default=0.0)
    output_data_mb = Column(Float, default=0.0)
    execution_seconds = Column(Float, default=0.0)
    status = Column(String, default="completed")  # running | completed | failed
    failure_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="simulations")
    satellite = relationship("Satellite", back_populates="simulations")


class Mission(Base):
    __tablename__ = "missions"

    id = Column(String, primary_key=True, index=True)
    mission_code = Column(String, unique=True, index=True, nullable=False)  # e.g. OC-28491
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    satellite_id = Column(String, ForeignKey("satellites.id"), nullable=False)
    target_region = Column(String, default="Andhra Pradesh")
    target_lat = Column(Float, default=15.8281)
    target_lon = Column(Float, default=78.0373)
    scheduled_pass_start = Column(DateTime, default=datetime.utcnow)
    scheduled_pass_end = Column(DateTime, default=datetime.utcnow)
    # scheduled | awaiting_pass | sensor_active | capturing | processing | downlinking | complete | failed
    status = Column(String, default="scheduled")
    _telemetry_logs = Column("telemetry_logs", Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    application = relationship("Application", back_populates="missions")
    satellite = relationship("Satellite", back_populates="missions")
    result = relationship("MissionResult", back_populates="mission", uselist=False, cascade="all, delete-orphan")

    @property
    def telemetry_logs(self):
        try:
            return json.loads(self._telemetry_logs or "[]")
        except Exception:
            return []

    @telemetry_logs.setter
    def telemetry_logs(self, value):
        self._telemetry_logs = json.dumps(value if isinstance(value, list) else [])


class MissionResult(Base):
    __tablename__ = "mission_results"

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey("missions.id"), unique=True, nullable=False)
    result_type = Column(String, default="detection")  # detection | classification | raw_output
    detection_label = Column(String, default="Thermal Anomaly (Wildfire Cluster)")
    confidence = Column(Float, default=96.4)
    target_lat = Column(Float, default=15.8281)
    target_lon = Column(Float, default=78.0373)
    processing_seconds = Column(Float, default=3.8)
    input_mb = Column(Float, default=1500.0)
    output_mb = Column(Float, default=0.15)
    downlink_reduction_pct = Column(Float, default=99.99)
    raw_output_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mission = relationship("Mission", back_populates="result")
