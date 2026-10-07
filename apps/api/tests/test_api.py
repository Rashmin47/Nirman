import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.seed import seed_demo_data

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_demo_data(session)
    yield

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_demo_project_seeded():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/projects")
        assert response.status_code == 200
        projects = response.json()
        assert len(projects) >= 1
        assert any("Student Freelance Platform" in p["name"] for p in projects)

@pytest.mark.asyncio
async def test_create_and_analyze_project():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create project
        create_res = await client.post("/api/projects", json={
            "name": "Local Artisan Marketplace",
            "idea_description": "An online platform for local woodworkers and ceramicists to sell handcrafted goods."
        })
        assert create_res.status_code == 201
        project_data = create_res.json()
        project_id = project_data["id"]
        assert project_data["name"] == "Local Artisan Marketplace"

        # 2. Analyze Idea
        analyze_res = await client.post(f"/api/projects/{project_id}/analyze")
        assert analyze_res.status_code == 200
        analysis = analyze_res.json()
        assert "problem" in analysis
        assert len(analysis["assumptions"]) > 0
        assert "recommended_next_action" in analysis

        # 3. Verify assumptions were saved
        assumptions_res = await client.get(f"/api/projects/{project_id}/assumptions")
        assert assumptions_res.status_code == 200
        assumptions = assumptions_res.json()
        assert len(assumptions) > 0

@pytest.mark.asyncio
async def test_evidence_ingestion_and_analysis():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project
        create_res = await client.post("/api/projects", json={
            "name": "Micro-SaaS Invoicing",
            "idea_description": "Instant invoice generation for solo software engineers."
        })
        project_id = create_res.json()["id"]
        
        # Analyze to get assumptions
        await client.post(f"/api/projects/{project_id}/analyze")

        # Ingest evidence
        ev_res = await client.post(f"/api/projects/{project_id}/evidence", json={
            "source_name": "Dev User #1",
            "content": "I already use Stripe Invoicing, but the tax calculation in my jurisdiction is missing.",
            "tags": ["taxes", "stripe"]
        })
        assert ev_res.status_code == 201

        # Analyze evidence
        analysis_res = await client.post(f"/api/projects/{project_id}/evidence/analyze")
        assert analysis_res.status_code == 200
        analysis = analysis_res.json()
        assert "themes" in analysis
        assert "recommendation" in analysis
        assert analysis["recommendation"]["action"] in ["PROCEED_TO_MVP", "VALIDATE_FIRST", "CHANGE_DIRECTION", "DONT_BUILD_YET"]

        # Check decision log
        dec_res = await client.get(f"/api/projects/{project_id}/decisions")
        assert dec_res.status_code == 200
        decisions = dec_res.json()
        assert len(decisions) >= 1

@pytest.mark.asyncio
async def test_langgraph_pipeline_execution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Use demo project
        res = await client.get("/api/projects")
        projects = res.json()
        demo_id = next(p["id"] for p in projects if "Student Freelance" in p["name"])

        # Run 8-node LangGraph pipeline
        pipe_res = await client.post(f"/api/projects/{demo_id}/pipeline/run")
        assert pipe_res.status_code == 200
        data = pipe_res.json()
        assert data["status"] == "success"
        assert len(data["logs"]) >= 6
        assert data["action"] is not None
