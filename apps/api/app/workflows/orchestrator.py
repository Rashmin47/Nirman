from typing import TypedDict, List, Dict, Any, Optional
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from langgraph.graph import StateGraph, START, END

from app.tools.registry import ToolRegistry
from app.ai.provider import get_ai_provider

logger = logging.getLogger("nirman.workflow")

class NirmanWorkflowState(TypedDict):
    project_id: str
    db: Any # AsyncSession
    project_context: Optional[Dict[str, Any]]
    assumptions: List[Dict[str, Any]]
    evidence: List[Dict[str, Any]]
    themes: List[Dict[str, Any]]
    top_uncertainty: Optional[Dict[str, Any]]
    action: Optional[str]
    recommendation: Optional[Dict[str, Any]]
    decision: Optional[Dict[str, Any]]
    logs: List[str]

# 1. Node: load_project_context
async def node_load_project_context(state: NirmanWorkflowState) -> Dict[str, Any]:
    db: AsyncSession = state["db"]
    registry = ToolRegistry(db)
    project_id = state["project_id"]
    
    context = await registry.get_project_context(project_id)
    assumptions = await registry.get_assumptions(project_id)
    
    logs = list(state.get("logs", []))
    logs.append(f"Loaded project '{context.get('name') if context else 'Unknown'}' with {len(assumptions)} assumptions.")
    
    return {
        "project_context": context,
        "assumptions": assumptions,
        "logs": logs
    }

# 2. Node: extract_or_update_understanding
async def node_extract_or_update_understanding(state: NirmanWorkflowState) -> Dict[str, Any]:
    context = state.get("project_context") or {}
    logs = list(state.get("logs", []))
    
    # If project lacks structured problem or target users, run analysis
    if not context.get("problem") or not context.get("target_users"):
        ai = get_ai_provider()
        analysis = await ai.analyze_idea(
            name=context.get("name", "Project"),
            description=context.get("idea_description", "")
        )
        context["problem"] = analysis.problem
        context["target_users"] = analysis.target_users
        context["proposed_solution"] = analysis.proposed_solution
        logs.append(f"Extracted understanding: Problem '{analysis.problem[:60]}...'")

    return {
        "project_context": context,
        "logs": logs
    }

# 3. Node: analyze_assumptions
async def node_analyze_assumptions(state: NirmanWorkflowState) -> Dict[str, Any]:
    assumptions = state.get("assumptions") or []
    logs = list(state.get("logs", []))
    
    # Identify top uncertainty: high risk with lowest confidence
    high_risk = [a for a in assumptions if a.get("risk") == "high"]
    sorted_risk = sorted(high_risk or assumptions, key=lambda x: x.get("confidence", 0.5))
    top_uncertainty = sorted_risk[0] if sorted_risk else None
    
    if top_uncertainty:
        logs.append(f"Identified top uncertainty: '{top_uncertainty.get('title')}' (Confidence: {int(top_uncertainty.get('confidence', 0)*100)}%)")
    
    return {
        "top_uncertainty": top_uncertainty,
        "logs": logs
    }

# 4. Node: retrieve_relevant_evidence
async def node_retrieve_relevant_evidence(state: NirmanWorkflowState) -> Dict[str, Any]:
    db: AsyncSession = state["db"]
    registry = ToolRegistry(db)
    project_id = state["project_id"]
    logs = list(state.get("logs", []))
    
    evidence = await registry.search_evidence(project_id=project_id, limit=100)
    logs.append(f"Retrieved {len(evidence)} evidence records for RAG reasoning.")
    
    return {
        "evidence": evidence,
        "logs": logs
    }

# 5. Node: evaluate_uncertainty
async def node_evaluate_uncertainty(state: NirmanWorkflowState) -> Dict[str, Any]:
    ai = get_ai_provider()
    project_context = state.get("project_context") or {}
    assumptions = state.get("assumptions") or []
    evidence = state.get("evidence") or []
    logs = list(state.get("logs", []))
    
    if evidence:
        analysis_res = await ai.analyze_evidence(
            project_context=project_context,
            assumptions=assumptions,
            evidence=evidence
        )
        themes = [t.model_dump() for t in analysis_res.themes]
        rec_data = analysis_res.recommendation.model_dump()
        action = rec_data.get("action", "VALIDATE_FIRST")
        
        # Apply assumption updates via ToolRegistry
        db: AsyncSession = state["db"]
        registry = ToolRegistry(db)
        for update in analysis_res.assumption_updates:
            await registry.update_assumption(
                assumption_id=update.assumption_id,
                confidence=update.new_confidence,
                status=update.status
            )
        
        logs.append(f"Evaluated evidence across {len(themes)} themes. Formed action: {action}.")
        return {
            "themes": themes,
            "action": action,
            "recommendation": rec_data,
            "logs": logs
        }
    else:
        # No evidence yet -> default route is VALIDATE_FIRST
        action = "VALIDATE_FIRST"
        rec_data = {
            "action": action,
            "reason": "No field evidence collected yet. High-risk assumptions remain untested.",
            "suggested_next_step": "Run discovery interviews to validate foundational problem hypotheses."
        }
        logs.append("No evidence present. Directed to validation first.")
        return {
            "action": action,
            "recommendation": rec_data,
            "logs": logs
        }

# 6. Node: decide_next_action
async def node_decide_next_action(state: NirmanWorkflowState) -> Dict[str, Any]:
    action = state.get("action") or "VALIDATE_FIRST"
    logs = list(state.get("logs", []))
    logs.append(f"Strategic routing decided: [{action}]")
    return {"action": action, "logs": logs}

# 7. Node: generate_recommendation
async def node_generate_recommendation(state: NirmanWorkflowState) -> Dict[str, Any]:
    rec = state.get("recommendation") or {}
    top_uncertainty = state.get("top_uncertainty") or {}
    logs = list(state.get("logs", []))
    
    logs.append(f"Generated recommendation: {rec.get('reason', '')[:80]}...")
    return {"recommendation": rec, "logs": logs}

# 8. Node: persist_decision
async def node_persist_decision(state: NirmanWorkflowState) -> Dict[str, Any]:
    db: AsyncSession = state["db"]
    registry = ToolRegistry(db)
    project_id = state["project_id"]
    action = state.get("action") or "VALIDATE_FIRST"
    rec = state.get("recommendation") or {}
    top_uncertainty = state.get("top_uncertainty") or {}
    evidence = state.get("evidence") or []
    logs = list(state.get("logs", []))
    
    # Check if a recent identical decision was already recorded today
    recent = await registry.get_recent_decisions(project_id, limit=1)
    if recent and recent[0].get("action") == action and not evidence:
        decision_record = recent[0]
        logs.append(f"Existing decision #{decision_record['decision_number']} matches current state.")
    else:
        orig_assumption = top_uncertainty.get("title") if top_uncertainty else "General product direction"
        finding = rec.get("reason", "Strategic evidence-backed evaluation completed.")
        decision_text = f"Action decided: {action}. Grounded in {len(evidence)} evidence data points."
        next_step = rec.get("suggested_next_step", "Proceed with lean validation.")
        
        decision_record = await registry.create_decision(
            project_id=project_id,
            action=action,
            original_assumption=orig_assumption,
            evidence_summary=f"{len(evidence)} evidence records analyzed.",
            key_finding=finding,
            decision_text=decision_text,
            next_step=next_step
        )
        logs.append(f"Persisted Decision #{decision_record['decision_number']}: {action}")

    return {
        "decision": decision_record,
        "logs": logs
    }


def create_nirman_graph():
    """Builds the 8-node LangGraph pipeline for Nirman."""
    workflow = StateGraph(NirmanWorkflowState)
    
    workflow.add_node("load_project_context", node_load_project_context)
    workflow.add_node("extract_or_update_understanding", node_extract_or_update_understanding)
    workflow.add_node("analyze_assumptions", node_analyze_assumptions)
    workflow.add_node("retrieve_relevant_evidence", node_retrieve_relevant_evidence)
    workflow.add_node("evaluate_uncertainty", node_evaluate_uncertainty)
    workflow.add_node("decide_next_action", node_decide_next_action)
    workflow.add_node("generate_recommendation", node_generate_recommendation)
    workflow.add_node("persist_decision", node_persist_decision)

    workflow.add_edge(START, "load_project_context")
    workflow.add_edge("load_project_context", "extract_or_update_understanding")
    workflow.add_edge("extract_or_update_understanding", "analyze_assumptions")
    workflow.add_edge("analyze_assumptions", "retrieve_relevant_evidence")
    workflow.add_edge("retrieve_relevant_evidence", "evaluate_uncertainty")
    workflow.add_edge("evaluate_uncertainty", "decide_next_action")
    workflow.add_edge("decide_next_action", "generate_recommendation")
    workflow.add_edge("generate_recommendation", "persist_decision")
    workflow.add_edge("persist_decision", END)

    return workflow.compile()


async def run_nirman_pipeline(project_id: str, db: AsyncSession) -> NirmanWorkflowState:
    """Execute the full Nirman AI reasoning workflow for a project."""
    graph = create_nirman_graph()
    initial_state: NirmanWorkflowState = {
        "project_id": project_id,
        "db": db,
        "project_context": None,
        "assumptions": [],
        "evidence": [],
        "themes": [],
        "top_uncertainty": None,
        "action": None,
        "recommendation": None,
        "decision": None,
        "logs": []
    }
    final_state = await graph.ainvoke(initial_state)
    return final_state
