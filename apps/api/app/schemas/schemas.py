from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

RiskLevel = Literal["low", "medium", "high"]
AssumptionStatus = Literal["UNKNOWN", "TESTING", "SUPPORTED", "CONTRADICTED"]
ProjectStage = Literal["discovery", "validation", "pivot", "mvp", "build"]
ExperimentType = Literal["interview", "survey", "landing_page", "prototype_test", "manual_test"]
DecisionAction = Literal["PROCEED_TO_MVP", "VALIDATE_FIRST", "CHANGE_DIRECTION", "DONT_BUILD_YET"]

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    idea_description: str = Field(..., min_length=10)

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    idea_description: Optional[str] = None
    stage: Optional[ProjectStage] = None
    problem: Optional[str] = None
    target_users: Optional[List[str]] = None
    proposed_solution: Optional[str] = None
    unknowns: Optional[List[str]] = None
    recommended_next_action: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    idea_description: str
    stage: ProjectStage
    problem: Optional[str] = None
    target_users: List[str] = []
    proposed_solution: Optional[str] = None
    unknowns: List[str] = []
    recommended_next_action: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Assumption Schemas ---
class AssumptionCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: str
    risk: RiskLevel = "medium"
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    status: AssumptionStatus = "UNKNOWN"
    why_it_matters: Optional[str] = None

class AssumptionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    risk: Optional[RiskLevel] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    status: Optional[AssumptionStatus] = None
    evidence_count: Optional[int] = None
    why_it_matters: Optional[str] = None

class AssumptionResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    risk: RiskLevel
    confidence: float
    status: AssumptionStatus
    evidence_count: int
    why_it_matters: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Experiment Schemas ---
class ExperimentCreate(BaseModel):
    assumption_id: Optional[str] = None
    type: ExperimentType = "interview"
    title: str
    objective: str
    questions: List[str] = []
    success_criteria: str
    status: Literal["draft", "active", "completed"] = "active"

class ExperimentResponse(BaseModel):
    id: str
    project_id: str
    assumption_id: Optional[str] = None
    type: ExperimentType
    title: str
    objective: str
    questions: List[str]
    success_criteria: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Evidence Schemas ---
class EvidenceCreate(BaseModel):
    experiment_id: Optional[str] = None
    source_name: str
    content: str
    tags: List[str] = []
    supports_assumptions: List[str] = []
    contradicts_assumptions: List[str] = []

class EvidenceBatchCreate(BaseModel):
    records: List[EvidenceCreate]

class EvidenceResponse(BaseModel):
    id: str
    project_id: str
    experiment_id: Optional[str] = None
    source_name: str
    content: str
    tags: List[str] = []
    supports_assumptions: List[str] = []
    contradicts_assumptions: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Theme Schemas ---
class ThemeResponse(BaseModel):
    id: str
    project_id: str
    theme: str
    count: int
    percentage: float
    sample_quotes: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Decision Schemas ---
class DecisionCreate(BaseModel):
    action: DecisionAction
    original_assumption: Optional[str] = None
    evidence_summary: str
    key_finding: str
    decision_text: str
    next_step: str

class DecisionResponse(BaseModel):
    id: str
    project_id: str
    decision_number: int
    action: DecisionAction
    original_assumption: Optional[str] = None
    evidence_summary: str
    key_finding: str
    decision_text: str
    next_step: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- AI Workflows & Output Schemas ---
class ExtractedAssumption(BaseModel):
    title: str
    description: str
    risk: RiskLevel
    confidence: float = Field(..., ge=0.0, le=1.0)
    why_it_matters: Optional[str] = None

class RecommendedExperiment(BaseModel):
    type: ExperimentType = "interview"
    title: str
    objective: str
    questions: List[str]
    success_criteria: str

class IdeaAnalysisResponse(BaseModel):
    problem: str
    target_users: List[str]
    proposed_solution: str
    assumptions: List[ExtractedAssumption]
    unknowns: List[str]
    recommended_next_action: str
    project_stage: ProjectStage = "validation"
    recommended_experiment: Optional[RecommendedExperiment] = None

class ThemeResult(BaseModel):
    theme: str
    count: int
    percentage: float
    sample_quotes: List[str] = []

class AssumptionUpdateResult(BaseModel):
    assumption_id: str
    title: Optional[str] = None
    previous_confidence: float
    new_confidence: float
    status: AssumptionStatus
    reason: str

class RecommendationResult(BaseModel):
    action: DecisionAction
    reason: str
    suggested_next_step: str

class EvidenceAnalysisResponse(BaseModel):
    themes: List[ThemeResult]
    assumption_updates: List[AssumptionUpdateResult]
    recommendation: RecommendationResult
    summary_findings: str

class ProjectDashboardResponse(BaseModel):
    project: ProjectResponse
    assumptions: List[AssumptionResponse]
    experiments: List[ExperimentResponse]
    latest_evidence: List[EvidenceResponse]
    themes: List[ThemeResult]
    latest_decision: Optional[DecisionResponse] = None
    top_uncertainty: Optional[AssumptionResponse] = None
    total_evidence_count: int = 0
