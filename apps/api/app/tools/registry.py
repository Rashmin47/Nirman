from typing import List, Dict, Any, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import (
    ProjectModel,
    AssumptionModel,
    ExperimentModel,
    EvidenceModel,
    ThemeModel,
    DecisionModel,
)
from app.schemas.schemas import RiskLevel, AssumptionStatus, DecisionAction

class ToolRegistry:
    """Backend Tool Registry for Nirman AI Agent System."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_project_context(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full context of a project including stage, problem, and solution."""
        stmt = select(ProjectModel).where(ProjectModel.id == project_id)
        result = await self.db.execute(stmt)
        project = result.scalar_one_or_none()
        if not project:
            return None
        return {
            "id": project.id,
            "name": project.name,
            "idea_description": project.idea_description,
            "stage": project.stage,
            "problem": project.problem,
            "target_users": project.target_users or [],
            "proposed_solution": project.proposed_solution,
            "unknowns": project.unknowns or [],
            "recommended_next_action": project.recommended_next_action,
        }

    async def get_assumptions(self, project_id: str) -> List[Dict[str, Any]]:
        """Retrieve all assumptions tracked for the given project."""
        stmt = select(AssumptionModel).where(AssumptionModel.project_id == project_id).order_by(desc(AssumptionModel.confidence))
        result = await self.db.execute(stmt)
        assumptions = result.scalars().all()
        return [
            {
                "id": a.id,
                "project_id": a.project_id,
                "title": a.title,
                "description": a.description,
                "risk": a.risk,
                "confidence": a.confidence,
                "status": a.status,
                "evidence_count": a.evidence_count,
                "why_it_matters": a.why_it_matters,
            }
            for a in assumptions
        ]

    async def get_recent_decisions(self, project_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve historical decisions made for the project."""
        stmt = select(DecisionModel).where(DecisionModel.project_id == project_id).order_by(desc(DecisionModel.decision_number)).limit(limit)
        result = await self.db.execute(stmt)
        decisions = result.scalars().all()
        return [
            {
                "id": d.id,
                "project_id": d.project_id,
                "decision_number": d.decision_number,
                "action": d.action,
                "original_assumption": d.original_assumption,
                "evidence_summary": d.evidence_summary,
                "key_finding": d.key_finding,
                "decision_text": d.decision_text,
                "next_step": d.next_step,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in decisions
        ]

    async def search_evidence(self, project_id: str, query: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Search and retrieve evidence items for the project."""
        stmt = select(EvidenceModel).where(EvidenceModel.project_id == project_id).order_by(desc(EvidenceModel.created_at)).limit(limit)
        result = await self.db.execute(stmt)
        evidence = result.scalars().all()
        
        filtered = []
        for e in evidence:
            if query and query.lower() not in e.content.lower() and query.lower() not in e.source_name.lower():
                continue
            filtered.append({
                "id": e.id,
                "project_id": e.project_id,
                "source_name": e.source_name,
                "content": e.content,
                "tags": e.tags or [],
                "supports_assumptions": e.supports_assumptions or [],
                "contradicts_assumptions": e.contradicts_assumptions or [],
            })
        return filtered

    async def create_experiment(
        self,
        project_id: str,
        title: str,
        objective: str,
        success_criteria: str,
        questions: List[str],
        assumption_id: Optional[str] = None,
        exp_type: str = "interview"
    ) -> Dict[str, Any]:
        """Create a new validation experiment linked to an assumption."""
        experiment = ExperimentModel(
            project_id=project_id,
            assumption_id=assumption_id,
            type=exp_type,
            title=title,
            objective=objective,
            questions=questions,
            success_criteria=success_criteria,
            status="active"
        )
        self.db.add(experiment)
        await self.db.commit()
        await self.db.refresh(experiment)
        return {
            "id": experiment.id,
            "project_id": experiment.project_id,
            "title": experiment.title,
            "objective": experiment.objective,
            "type": experiment.type,
            "status": experiment.status,
        }

    async def update_assumption(
        self,
        assumption_id: str,
        confidence: Optional[float] = None,
        status: Optional[str] = None,
        evidence_count_delta: int = 0
    ) -> Optional[Dict[str, Any]]:
        """Update confidence, status, or evidence count of an assumption."""
        stmt = select(AssumptionModel).where(AssumptionModel.id == assumption_id)
        result = await self.db.execute(stmt)
        assumption = result.scalar_one_or_none()
        if not assumption:
            return None
        
        if confidence is not None:
            assumption.confidence = confidence
        if status is not None:
            assumption.status = status
        if evidence_count_delta != 0:
            assumption.evidence_count = max(0, assumption.evidence_count + evidence_count_delta)
            
        await self.db.commit()
        await self.db.refresh(assumption)
        return {
            "id": assumption.id,
            "title": assumption.title,
            "confidence": assumption.confidence,
            "status": assumption.status,
            "evidence_count": assumption.evidence_count,
        }

    async def create_decision(
        self,
        project_id: str,
        action: str,
        evidence_summary: str,
        key_finding: str,
        decision_text: str,
        next_step: str,
        original_assumption: Optional[str] = None
    ) -> Dict[str, Any]:
        """Record an explicit strategic decision with justification in the audit log."""
        # Find next decision number
        stmt = select(DecisionModel).where(DecisionModel.project_id == project_id).order_by(desc(DecisionModel.decision_number)).limit(1)
        res = await self.db.execute(stmt)
        last_decision = res.scalar_one_or_none()
        decision_number = (last_decision.decision_number + 1) if last_decision else 1

        decision = DecisionModel(
            project_id=project_id,
            decision_number=decision_number,
            action=action,
            original_assumption=original_assumption,
            evidence_summary=evidence_summary,
            key_finding=key_finding,
            decision_text=decision_text,
            next_step=next_step
        )
        self.db.add(decision)
        
        # Also update project stage if decision warrants
        proj_stmt = select(ProjectModel).where(ProjectModel.id == project_id)
        proj_res = await self.db.execute(proj_stmt)
        proj = proj_res.scalar_one_or_none()
        if proj:
            if action == "CHANGE_DIRECTION":
                proj.stage = "pivot"
            elif action == "PROCEED_TO_MVP":
                proj.stage = "mvp"
            elif action == "VALIDATE_FIRST":
                proj.stage = "validation"
            proj.recommended_next_action = next_step

        await self.db.commit()
        await self.db.refresh(decision)
        return {
            "id": decision.id,
            "decision_number": decision.decision_number,
            "action": decision.action,
            "key_finding": decision.key_finding,
            "decision_text": decision.decision_text,
            "next_step": decision.next_step,
        }
