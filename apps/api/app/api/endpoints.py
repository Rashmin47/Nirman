from typing import List, Optional
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import (
    ProjectModel,
    AssumptionModel,
    ExperimentModel,
    EvidenceModel,
    ThemeModel,
    DecisionModel,
)
from app.schemas.schemas import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ProjectDashboardResponse,
    AssumptionCreate,
    AssumptionResponse,
    AssumptionUpdate,
    ExperimentCreate,
    ExperimentResponse,
    EvidenceCreate,
    EvidenceBatchCreate,
    EvidenceResponse,
    DecisionResponse,
    DecisionCreate,
    IdeaAnalysisResponse,
    EvidenceAnalysisResponse,
    RecommendedExperiment,
    ThemeResult,
    ExtractedAssumption,
)
from app.ai.provider import get_ai_provider
from app.tools.registry import ToolRegistry
from app.workflows.orchestrator import run_nirman_pipeline

router = APIRouter()

# -------------------------------------------------------------
# Projects
# -------------------------------------------------------------

@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    """List all Nirman projects."""
    stmt = select(ProjectModel).order_by(desc(ProjectModel.updated_at))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Create a new project from an initial name and idea description."""
    project = ProjectModel(
        name=payload.name,
        idea_description=payload.idea_description,
        stage="validation"
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Get project by ID."""
    stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/projects/{project_id}/dashboard", response_model=ProjectDashboardResponse)
async def get_project_dashboard(project_id: str, db: AsyncSession = Depends(get_db)):
    """Decision workspace dashboard state."""
    # 1. Project
    p_stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    p_res = await db.execute(p_stmt)
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Assumptions
    a_stmt = select(AssumptionModel).where(AssumptionModel.project_id == project_id).order_by(desc(AssumptionModel.created_at))
    a_res = await db.execute(a_stmt)
    assumptions = a_res.scalars().all()

    # 3. Experiments
    e_stmt = select(ExperimentModel).where(ExperimentModel.project_id == project_id).order_by(desc(ExperimentModel.created_at))
    e_res = await db.execute(e_stmt)
    experiments = e_res.scalars().all()

    # 4. Evidence
    ev_stmt = select(EvidenceModel).where(EvidenceModel.project_id == project_id).order_by(desc(EvidenceModel.created_at))
    ev_res = await db.execute(ev_stmt)
    evidence_records = ev_res.scalars().all()

    # 5. Themes
    th_stmt = select(ThemeModel).where(ThemeModel.project_id == project_id).order_by(desc(ThemeModel.count))
    th_res = await db.execute(th_stmt)
    themes = th_res.scalars().all()

    # 6. Latest Decision
    d_stmt = select(DecisionModel).where(DecisionModel.project_id == project_id).order_by(desc(DecisionModel.decision_number)).limit(1)
    d_res = await db.execute(d_stmt)
    latest_decision = d_res.scalar_one_or_none()

    # Top uncertainty: high risk with lowest confidence
    high_risks = [a for a in assumptions if a.risk == "high"]
    sorted_uncertain = sorted(high_risks or assumptions, key=lambda a: a.confidence)
    top_uncertainty = sorted_uncertain[0] if sorted_uncertain else None

    return ProjectDashboardResponse(
        project=ProjectResponse.model_validate(project),
        assumptions=[AssumptionResponse.model_validate(a) for a in assumptions],
        experiments=[ExperimentResponse.model_validate(e) for e in experiments],
        latest_evidence=[EvidenceResponse.model_validate(ev) for ev in evidence_records[:10]],
        themes=[ThemeResult(
            theme=t.theme,
            count=t.count,
            percentage=t.percentage,
            sample_quotes=t.sample_quotes or []
        ) for t in themes],
        latest_decision=DecisionResponse.model_validate(latest_decision) if latest_decision else None,
        top_uncertainty=AssumptionResponse.model_validate(top_uncertainty) if top_uncertainty else None,
        total_evidence_count=len(evidence_records)
    )


# -------------------------------------------------------------
# AI Idea Analysis (Step 2 & 3)
# -------------------------------------------------------------

@router.post("/projects/{project_id}/analyze", response_model=IdeaAnalysisResponse)
async def analyze_project_idea(project_id: str, db: AsyncSession = Depends(get_db)):
    """Run structured AI extraction and challenge on the project idea."""
    stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ai = get_ai_provider()
    analysis: IdeaAnalysisResponse = await ai.analyze_idea(
        name=project.name,
        description=project.idea_description
    )

    # Persist extracted structure onto project
    project.problem = analysis.problem
    project.target_users = analysis.target_users
    project.proposed_solution = analysis.proposed_solution
    project.unknowns = analysis.unknowns
    project.recommended_next_action = analysis.recommended_next_action
    project.stage = analysis.project_stage

    # Check if assumptions already exist, if not, create them
    existing_assumptions_stmt = select(AssumptionModel).where(AssumptionModel.project_id == project_id)
    existing_res = await db.execute(existing_assumptions_stmt)
    existing_count = len(existing_res.scalars().all())

    if existing_count == 0:
        for a in analysis.assumptions:
            assumption_row = AssumptionModel(
                project_id=project_id,
                title=a.title,
                description=a.description,
                risk=a.risk,
                confidence=a.confidence,
                status="UNKNOWN",
                why_it_matters=a.why_it_matters
            )
            db.add(assumption_row)

    # Create recommended experiment if returned and none exists
    if analysis.recommended_experiment:
        exp_stmt = select(ExperimentModel).where(ExperimentModel.project_id == project_id)
        exp_res = await db.execute(exp_stmt)
        if len(exp_res.scalars().all()) == 0:
            rec_exp = analysis.recommended_experiment
            experiment_row = ExperimentModel(
                project_id=project_id,
                type=rec_exp.type,
                title=rec_exp.title,
                objective=rec_exp.objective,
                questions=rec_exp.questions,
                success_criteria=rec_exp.success_criteria,
                status="active"
            )
            db.add(experiment_row)

    await db.commit()
    await db.refresh(project)
    return analysis


# -------------------------------------------------------------
# Assumptions
# -------------------------------------------------------------

@router.get("/projects/{project_id}/assumptions", response_model=List[AssumptionResponse])
async def list_assumptions(project_id: str, db: AsyncSession = Depends(get_db)):
    """List all assumptions for a project."""
    stmt = select(AssumptionModel).where(AssumptionModel.project_id == project_id).order_by(desc(AssumptionModel.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/projects/{project_id}/assumptions", response_model=AssumptionResponse, status_code=status.HTTP_201_CREATED)
async def create_assumption(project_id: str, payload: AssumptionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new assumption."""
    assumption = AssumptionModel(
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        risk=payload.risk,
        confidence=payload.confidence,
        status=payload.status,
        why_it_matters=payload.why_it_matters
    )
    db.add(assumption)
    await db.commit()
    await db.refresh(assumption)
    return assumption


@router.patch("/assumptions/{assumption_id}", response_model=AssumptionResponse)
async def update_assumption(assumption_id: str, payload: AssumptionUpdate, db: AsyncSession = Depends(get_db)):
    """Update an existing assumption."""
    stmt = select(AssumptionModel).where(AssumptionModel.id == assumption_id)
    res = await db.execute(stmt)
    assumption = res.scalar_one_or_none()
    if not assumption:
        raise HTTPException(status_code=404, detail="Assumption not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assumption, field, value)

    await db.commit()
    await db.refresh(assumption)
    return assumption


# -------------------------------------------------------------
# Experiments
# -------------------------------------------------------------

@router.get("/projects/{project_id}/experiments", response_model=List[ExperimentResponse])
async def list_experiments(project_id: str, db: AsyncSession = Depends(get_db)):
    """List all validation experiments for a project."""
    stmt = select(ExperimentModel).where(ExperimentModel.project_id == project_id).order_by(desc(ExperimentModel.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/projects/{project_id}/experiments", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED)
async def create_experiment(project_id: str, payload: ExperimentCreate, db: AsyncSession = Depends(get_db)):
    """Create a new experiment."""
    experiment = ExperimentModel(
        project_id=project_id,
        assumption_id=payload.assumption_id,
        type=payload.type,
        title=payload.title,
        objective=payload.objective,
        questions=payload.questions,
        success_criteria=payload.success_criteria,
        status=payload.status
    )
    db.add(experiment)
    await db.commit()
    await db.refresh(experiment)
    return experiment


@router.post("/projects/{project_id}/experiments/generate", response_model=RecommendedExperiment)
async def generate_experiment_ai(project_id: str, assumption_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """AI generates a validation experiment for an assumption."""
    ai = get_ai_provider()
    assumption_data = {}
    if assumption_id:
        stmt = select(AssumptionModel).where(AssumptionModel.id == assumption_id)
        res = await db.execute(stmt)
        a = res.scalar_one_or_none()
        if a:
            assumption_data = {"title": a.title, "description": a.description, "risk": a.risk}
    
    if not assumption_data:
        # Default top uncertainty
        stmt = select(AssumptionModel).where(AssumptionModel.project_id == project_id).order_by(AssumptionModel.confidence)
        res = await db.execute(stmt)
        top = res.scalars().first()
        if top:
            assumption_data = {"title": top.title, "description": top.description, "risk": top.risk}
        else:
            assumption_data = {"title": "Core problem hypothesis", "description": "Users need this tool", "risk": "high"}

    return await ai.generate_experiment(assumption_data)


# -------------------------------------------------------------
# Evidence
# -------------------------------------------------------------

@router.get("/projects/{project_id}/evidence", response_model=List[EvidenceResponse])
async def list_evidence(project_id: str, db: AsyncSession = Depends(get_db)):
    """List all evidence records for a project."""
    stmt = select(EvidenceModel).where(EvidenceModel.project_id == project_id).order_by(desc(EvidenceModel.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/projects/{project_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def create_evidence(project_id: str, payload: EvidenceCreate, db: AsyncSession = Depends(get_db)):
    """Record an individual piece of evidence."""
    evidence = EvidenceModel(
        project_id=project_id,
        experiment_id=payload.experiment_id,
        source_name=payload.source_name,
        content=payload.content,
        tags=payload.tags,
        supports_assumptions=payload.supports_assumptions,
        contradicts_assumptions=payload.contradicts_assumptions
    )
    db.add(evidence)
    
    # Increment evidence count on linked assumptions if any
    if payload.supports_assumptions or payload.contradicts_assumptions:
        all_ids = set(payload.supports_assumptions + payload.contradicts_assumptions)
        for aid in all_ids:
            a_stmt = select(AssumptionModel).where(AssumptionModel.id == aid)
            a_res = await db.execute(a_stmt)
            assump = a_res.scalar_one_or_none()
            if assump:
                assump.evidence_count += 1

    await db.commit()
    await db.refresh(evidence)
    return evidence


@router.post("/projects/{project_id}/evidence/batch", response_model=List[EvidenceResponse], status_code=status.HTTP_201_CREATED)
async def create_batch_evidence(project_id: str, payload: EvidenceBatchCreate, db: AsyncSession = Depends(get_db)):
    """Batch upload evidence records."""
    created = []
    for item in payload.records:
        evidence = EvidenceModel(
            project_id=project_id,
            experiment_id=item.experiment_id,
            source_name=item.source_name,
            content=item.content,
            tags=item.tags,
            supports_assumptions=item.supports_assumptions,
            contradicts_assumptions=item.contradicts_assumptions
        )
        db.add(evidence)
        created.append(evidence)

    await db.commit()
    for e in created:
        await db.refresh(e)
    return created


@router.post("/projects/{project_id}/evidence/upload-csv")
async def upload_csv_evidence(project_id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload CSV containing evidence (name, response / content)."""
    content_bytes = await file.read()
    decoded = content_bytes.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))
    
    records = []
    for row in reader:
        name = row.get("name") or row.get("source") or row.get("user") or "Participant"
        content = row.get("response") or row.get("content") or row.get("feedback") or ""
        if content.strip():
            ev = EvidenceModel(
                project_id=project_id,
                source_name=name.strip(),
                content=content.strip(),
                tags=["csv_upload"]
            )
            db.add(ev)
            records.append(ev)

    await db.commit()
    return {"message": f"Successfully ingested {len(records)} evidence records from CSV."}


# -------------------------------------------------------------
# Evidence AI Analysis (Step 7)
# -------------------------------------------------------------

@router.post("/projects/{project_id}/evidence/analyze", response_model=EvidenceAnalysisResponse)
async def analyze_evidence(project_id: str, db: AsyncSession = Depends(get_db)):
    """
    POST /projects/{project_id}/evidence/analyze
    Analyzes evidence against assumptions:
    1. Read evidence
    2. Identify themes & pain points
    3. Aggregate frequencies
    4. Compare against existing assumptions
    5. Update confidence & status
    6. Formulate strategic action & persist decision
    """
    # 1. Project context
    registry = ToolRegistry(db)
    project_context = await registry.get_project_context(project_id)
    if not project_context:
        raise HTTPException(status_code=404, detail="Project not found")

    assumptions = await registry.get_assumptions(project_id)
    evidence = await registry.search_evidence(project_id=project_id, limit=100)

    if not evidence:
        raise HTTPException(status_code=400, detail="Cannot analyze evidence: No evidence records found for this project.")

    ai = get_ai_provider()
    analysis_res: EvidenceAnalysisResponse = await ai.analyze_evidence(
        project_context=project_context,
        assumptions=assumptions,
        evidence=evidence
    )

    # Persist / update Themes
    # Clear old themes for fresh synthesis
    old_themes_stmt = select(ThemeModel).where(ThemeModel.project_id == project_id)
    old_themes_res = await db.execute(old_themes_stmt)
    for old_t in old_themes_res.scalars().all():
        await db.delete(old_t)

    for t in analysis_res.themes:
        th_model = ThemeModel(
            project_id=project_id,
            theme=t.theme,
            count=t.count,
            percentage=t.percentage,
            sample_quotes=t.sample_quotes
        )
        db.add(th_model)

    # Apply assumption confidence and status updates
    for update in analysis_res.assumption_updates:
        await registry.update_assumption(
            assumption_id=update.assumption_id,
            confidence=update.new_confidence,
            status=update.status
        )

    # Persist decision log
    top_uncertainty_title = assumptions[0]["title"] if assumptions else "Primary Hypothesis"
    await registry.create_decision(
        project_id=project_id,
        action=analysis_res.recommendation.action,
        original_assumption=top_uncertainty_title,
        evidence_summary=f"{len(evidence)} responses analyzed across {len(analysis_res.themes)} recurring themes.",
        key_finding=analysis_res.summary_findings,
        decision_text=f"Strategic recommendation: {analysis_res.recommendation.action}. {analysis_res.recommendation.reason}",
        next_step=analysis_res.recommendation.suggested_next_step
    )

    await db.commit()
    return analysis_res


# -------------------------------------------------------------
# Decisions
# -------------------------------------------------------------

@router.get("/projects/{project_id}/decisions", response_model=List[DecisionResponse])
async def list_decisions(project_id: str, db: AsyncSession = Depends(get_db)):
    """List historical strategic decisions for a project."""
    stmt = select(DecisionModel).where(DecisionModel.project_id == project_id).order_by(desc(DecisionModel.decision_number))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/projects/{project_id}/decisions", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
async def create_decision(project_id: str, payload: DecisionCreate, db: AsyncSession = Depends(get_db)):
    """Manually log a strategic decision."""
    registry = ToolRegistry(db)
    res = await registry.create_decision(
        project_id=project_id,
        action=payload.action,
        evidence_summary=payload.evidence_summary,
        key_finding=payload.key_finding,
        decision_text=payload.decision_text,
        next_step=payload.next_step,
        original_assumption=payload.original_assumption
    )
    stmt = select(DecisionModel).where(DecisionModel.id == res["id"])
    d_res = await db.execute(stmt)
    return d_res.scalar_one()


# -------------------------------------------------------------
# LangGraph Pipeline Runner
# -------------------------------------------------------------

@router.post("/projects/{project_id}/pipeline/run")
async def run_pipeline(project_id: str, db: AsyncSession = Depends(get_db)):
    """Trigger the 8-node LangGraph autonomous reasoning workflow."""
    final_state = await run_nirman_pipeline(project_id=project_id, db=db)
    return {
        "status": "success",
        "action": final_state.get("action"),
        "logs": final_state.get("logs", []),
        "decision": final_state.get("decision"),
        "recommendation": final_state.get("recommendation")
    }
