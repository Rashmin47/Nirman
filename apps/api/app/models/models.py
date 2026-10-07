import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    idea_description = Column(Text, nullable=False)
    stage = Column(String, default="validation") # discovery, validation, pivot, mvp, build
    problem = Column(Text, nullable=True)
    target_users = Column(JSON, default=list)
    proposed_solution = Column(Text, nullable=True)
    unknowns = Column(JSON, default=list)
    recommended_next_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assumptions = relationship("AssumptionModel", back_populates="project", cascade="all, delete-orphan")
    experiments = relationship("ExperimentModel", back_populates="project", cascade="all, delete-orphan")
    evidence = relationship("EvidenceModel", back_populates="project", cascade="all, delete-orphan")
    themes = relationship("ThemeModel", back_populates="project", cascade="all, delete-orphan")
    decisions = relationship("DecisionModel", back_populates="project", cascade="all, delete-orphan")

class AssumptionModel(Base):
    __tablename__ = "assumptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    risk = Column(String, default="medium") # low, medium, high
    confidence = Column(Float, default=0.5) # 0.0 to 1.0
    status = Column(String, default="UNKNOWN") # UNKNOWN, TESTING, SUPPORTED, CONTRADICTED
    evidence_count = Column(Integer, default=0)
    why_it_matters = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("ProjectModel", back_populates="assumptions")
    experiments = relationship("ExperimentModel", back_populates="assumption")

class ExperimentModel(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    assumption_id = Column(String, ForeignKey("assumptions.id", ondelete="SET NULL"), nullable=True)
    type = Column(String, default="interview") # interview, survey, landing_page, prototype_test, manual_test
    title = Column(String, nullable=False)
    objective = Column(Text, nullable=False)
    questions = Column(JSON, default=list)
    success_criteria = Column(Text, nullable=False)
    status = Column(String, default="active") # draft, active, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("ProjectModel", back_populates="experiments")
    assumption = relationship("AssumptionModel", back_populates="experiments")

class EvidenceModel(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    experiment_id = Column(String, ForeignKey("experiments.id", ondelete="SET NULL"), nullable=True)
    source_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    supports_assumptions = Column(JSON, default=list) # List of assumption titles/IDs
    contradicts_assumptions = Column(JSON, default=list) # List of assumption titles/IDs
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectModel", back_populates="evidence")

class ThemeModel(Base):
    __tablename__ = "themes"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    theme = Column(String, nullable=False)
    count = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    sample_quotes = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectModel", back_populates="themes")

class DecisionModel(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    decision_number = Column(Integer, nullable=False)
    action = Column(String, nullable=False) # PROCEED_TO_MVP, VALIDATE_FIRST, CHANGE_DIRECTION, DONT_BUILD_YET
    original_assumption = Column(Text, nullable=True)
    evidence_summary = Column(Text, nullable=False)
    key_finding = Column(Text, nullable=False)
    decision_text = Column(Text, nullable=False)
    next_step = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectModel", back_populates="decisions")
