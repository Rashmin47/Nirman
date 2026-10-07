# NIRMAN — ARCHITECTURE SPECIFICATION

> **"Don't optimize the plan. Optimize the direction."**

Nirman is an AI-powered evidence-to-execution platform that helps founders, builders, and product teams figure out what is worth building before wasting time and capital building the wrong thing.

---

## 1. High-Level Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16 App Router)                │
│                                                                        │
│   Landing Page  →  Dashboard Console  →  Assumption Board              │
│   Validation Experiments  →  Field Evidence Repo  →  Decision Log      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI + Pydantic v2)                 │
│                                                                        │
│  ┌────────────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │  REST API Routers  │   │   AI Providers   │   │  Tool Registry   │  │
│  │  (/projects, etc.) │   │  Gemini / Local  │   │  (8 Agent Tools) │  │
│  └─────────┬──────────┘   └────────┬─────────┘   └────────┬─────────┘  │
│            │                       │                      │            │
│            └───────────────────────┼──────────────────────┘            │
│                                    ▼                                   │
│                     LangGraph 8-Node Orchestration                     │
│                                    │                                   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Async SQLAlchemy
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER (PostgreSQL / SQLite)              │
│                                                                        │
│  • projects        • assumptions        • experiments                  │
│  • evidence        • themes             • decisions                    │
│  • pgvector embeddings (768-dim)                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fulfillment of the 6 Required AI Patterns

| Pattern | Architectural Implementation | Code Symbol / Location |
| :--- | :--- | :--- |
| **1. Structured Extraction** | Converts raw unstructured ideas and feedback into typed, validated Pydantic models. | [IdeaAnalysisResponse](file:///Users/rashmin/Documents/Nirman/apps/api/app/schemas/schemas.py), [POST /api/projects/{id}/analyze](file:///Users/rashmin/Documents/Nirman/apps/api/app/api/endpoints.py) |
| **2. Decision / Routing Logic** | Deterministically branches project stage and next steps (`CHANGE_DIRECTION`, `VALIDATE_FIRST`, `PROCEED_TO_MVP`, `DONT_BUILD_YET`). | [node_decide_next_action](file:///Users/rashmin/Documents/Nirman/apps/api/app/workflows/orchestrator.py), [create_decision](file:///Users/rashmin/Documents/Nirman/apps/api/app/tools/registry.py) |
| **3. Tool / Function Calling** | 8 registered agent tools callable by workflows and agents to inspect and mutate database state. | [ToolRegistry](file:///Users/rashmin/Documents/Nirman/apps/api/app/tools/registry.py) |
| **4. Multi-Step Pipeline** | LangGraph compiled state graph executing 8 discrete, auditable nodes sequentially. | [create_nirman_graph](file:///Users/rashmin/Documents/Nirman/apps/api/app/workflows/orchestrator.py) |
| **5. RAG / Retrieval Grounding** | Vector embeddings + evidence similarity querying before decisions are formed. | [search_evidence](file:///Users/rashmin/Documents/Nirman/apps/api/app/tools/registry.py), `supabase/migrations/20250101_initial_schema.sql` |
| **6. Data Transformation at Scale**| Batches of raw customer quotes/CSVs transformed into frequency counts, percentages, and confidence delta updates. | [POST /api/projects/{id}/evidence/analyze](file:///Users/rashmin/Documents/Nirman/apps/api/app/api/endpoints.py), [analyze_evidence](file:///Users/rashmin/Documents/Nirman/apps/api/app/ai/provider.py) |

---

## 3. LangGraph Autonomous Orchestration Workflow

The AI workflow in `apps/api/app/workflows/orchestrator.py` connects 8 explicit nodes:

```text
[START]
   ↓
1. load_project_context
   ↓
2. extract_or_update_understanding
   ↓
3. analyze_assumptions
   ↓
4. retrieve_relevant_evidence
   ↓
5. evaluate_uncertainty
   ↓
6. decide_next_action
   ↓
7. generate_recommendation
   ↓
8. persist_decision
   ↓
[END]
```

Every execution maintains an auditable execution trace and appends step-by-step logs accessible to judges and teammates.

---

## 4. Backend Tool Registry

All 8 requested tools are implemented in [ToolRegistry](file:///Users/rashmin/Documents/Nirman/apps/api/app/tools/registry.py):
1. `get_project_context(project_id)`: Fetches project description, problem, solution, and stage.
2. `get_assumptions(project_id)`: Retrieves tracked assumptions sorted by risk and confidence.
3. `get_recent_decisions(project_id, limit)`: Returns historical strategic pivot logs.
4. `search_evidence(project_id, query, limit)`: Retrieves empirical field quotes and tags.
5. `analyze_evidence(project_id)`: Extracts themes, pain points, and aggregates.
6. `create_experiment(project_id, ...)`: Links structured interview questions to high-risk assumptions.
7. `update_assumption(assumption_id, ...)`: Updates confidence scores and status based on evidence.
8. `create_decision(project_id, ...)`: Records immutable strategic pivot in the decision ledger.

---

## 5. Design System & Tokens

Nirman does NOT use generic SaaS gradients, purple AI glow, floating blobs, or robot avatars. It uses an editorial builder palette:

- **Primary Background**: `#F7F5F0` (warm stone)
- **Surface / Card**: `#FFFFFF`
- **Primary Text**: `#191817` (charcoal black)
- **Secondary Text**: `#6F6B65` (muted gray)
- **Borders**: `#E5E0D8` (1px clean border)
- **Primary Accent**: `#B85C38` (warm terracotta/clay)
- **Dark Accent**: `#292522`
- **Success**: `#3F6B50` (forest green)
- **Warning**: `#A66A2C` (amber)
- **Danger**: `#A4483F` (terracotta red)
- **Radii**: 6–8px subtle rounded corners
