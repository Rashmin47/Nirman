# Nirman

> **From idea to something real.**  
> *Nirman helps people figure out what is worth building before they waste time building it.*

Nirman is an AI-powered evidence-to-execution platform that takes a rough idea, extracts its hidden assumptions and uncertainties, helps test those assumptions with real evidence, synthesizes the results, and recommends the next strategic step.

---

## The Core Product Philosophy

> **"Don't optimize the plan. Optimize the direction."**

```text
IDEA  →  UNDERSTAND  →  CHALLENGE  →  VALIDATE  →  EVIDENCE  →  DECISION  →  BUILD  →  LEARN  →  ADAPT
```

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript (Strict), Tailwind CSS, Lucide Icons, React Hook Form, Zod
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy (Async), LangGraph
- **Database**: PostgreSQL / Supabase, pgvector support (with zero-config SQLite for instant local dev)
- **AI Orchestration**: Provider abstraction supporting Google Gemini 2.5 Flash with zero-failure local fallback

---

## Monorepo Structure

```text
nirman/
├── apps/
│   ├── web/                     # Next.js 16 Web Application
│   │   ├── app/                 # App Router (/, /dashboard, /projects, /settings, etc.)
│   │   ├── components/          # Reusable design system (Card, Button, Badge, AppShell)
│   │   └── lib/                 # Typed API client & Supabase helpers
│   └── api/                     # FastAPI Backend
│       ├── app/
│       │   ├── api/             # REST Routers
│       │   ├── models/          # SQLAlchemy async domain models
│       │   ├── schemas/         # Pydantic v2 validation models
│       │   ├── ai/              # GeminiProvider & MockProvider
│       │   ├── tools/           # 8 Agent Tools in ToolRegistry
│       │   ├── workflows/       # LangGraph 8-Node StateGraph
│       │   └── core/            # Database engine, config, and seed data
│       └── tests/               # Pytest suite
├── packages/
│   ├── types/                   # Shared TypeScript models
│   └── ui/                      # Shared UI primitives
├── supabase/
│   └── migrations/              # Supabase PostgreSQL DDL with pgvector
├── .env.example                 # Environment variable template
├── ARCHITECTURE.md              # Deep-dive system architecture specification
└── README.md
```

---

## Getting Started Locally

### 1. Clone & Setup Workspace

```bash
git clone https://github.com/Rashmin47/Nirman.git
cd Nirman

# Copy environment variables
cp .env.example .env
```

### 2. Run the Frontend (Next.js)

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Backend (FastAPI + LangGraph)

```bash
cd apps/api

# Create and activate Python virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload --port 8000
```
API Documentation (Swagger UI) is available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Seeded Realistic Demo Project

On first startup, the database automatically seeds a complete, realistic demo project:
- **Project**: *Student Freelance Platform*
- **6 Assumptions** (including contradicted discovery assumption and supported credibility assumption)
- **1 Experiment**: *Discovery vs. Credibility Validation Interview*
- **35 Evidence Records**: Realistic quotes from students and small business clients
- **Synthesized Themes**: Portfolio credibility (45%), Escrow trust (22.5%), Discovery (17.5%), Pricing (15%)
- **Strategic Decision #01**: Direction pivot from marketplace job board to *Proof-of-Skill Profile & Escrow Escort*

---

## Running Backend Tests

```bash
PYTHONPATH=apps/api apps/api/.venv/bin/pytest apps/api/tests/test_api.py -v
```

All 5 core pipeline tests run and pass out-of-the-box.
