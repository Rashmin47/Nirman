import logging
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import (
    ProjectModel,
    AssumptionModel,
    ExperimentModel,
    EvidenceModel,
    ThemeModel,
    DecisionModel,
)

logger = logging.getLogger("nirman.seed")

DEMO_PROJECT_ID = "00000000-0000-0000-0000-000000000001"
EXP_ID = "00000000-0000-0000-0000-000000000010"
ASSUMPTION_1_ID = "00000000-0000-0000-0000-000000000101"
ASSUMPTION_2_ID = "00000000-0000-0000-0000-000000000102"
ASSUMPTION_3_ID = "00000000-0000-0000-0000-000000000103"
ASSUMPTION_4_ID = "00000000-0000-0000-0000-000000000104"
ASSUMPTION_5_ID = "00000000-0000-0000-0000-000000000105"
ASSUMPTION_6_ID = "00000000-0000-0000-0000-000000000106"

async def seed_demo_data(db: AsyncSession):
    """Seed the database with the realistic Student Freelance Platform project."""
    stmt = select(ProjectModel).where(ProjectModel.id == DEMO_PROJECT_ID)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        logger.info("Demo project already exists. Skipping seed.")
        return

    logger.info("Seeding realistic 'Student Freelance Platform' demo data...")
    now = datetime.utcnow()

    # 1. Project
    project = ProjectModel(
        id=DEMO_PROJECT_ID,
        name="Student Freelance Platform",
        idea_description="An app that helps college students find freelance opportunities by connecting them with local and digital SMB clients.",
        stage="pivot",
        problem="Students struggle to close paid freelance work; initially assumed to be gig discovery friction, but evidence proves the primary bottleneck is client trust and lack of verifiable proof of execution.",
        target_users=[
            "Undergraduate designers, frontend developers & content creators",
            "Early-stage tech founders and small business owners needing lean help"
        ],
        proposed_solution="Proof-of-Skill Profile: Instead of resumes, students complete verified micro-deliverables paired with milestone escrow protection.",
        unknowns=[
            "Will SMB clients accept student portfolios verified through sample sandbox tasks?",
            "What turnaround time do clients expect for sub-$300 projects?",
            "Can university clubs serve as the initial supply acquisition engine?"
        ],
        recommended_next_action="Build prototype verification card for frontend engineers and test with 5 SMB clients.",
        created_at=now - timedelta(days=14),
        updated_at=now
    )
    db.add(project)

    # 2. Assumptions
    assumptions = [
        AssumptionModel(
            id=ASSUMPTION_1_ID,
            project_id=DEMO_PROJECT_ID,
            title="Students mainly struggle to find freelance jobs",
            description="The primary blocker preventing students from freelancing is lack of awareness and discovery of available project postings.",
            risk="high",
            confidence=0.22,
            status="CONTRADICTED",
            evidence_count=32,
            why_it_matters="If job discovery is not the real blocker, building another marketplace job board will fail completely.",
            created_at=now - timedelta(days=14),
            updated_at=now - timedelta(days=1)
        ),
        AssumptionModel(
            id=ASSUMPTION_2_ID,
            project_id=DEMO_PROJECT_ID,
            title="Clients hesitate due to unverified student capability",
            description="Clients want junior support but fear incomplete delivery, lack of communication, and unverified skill claims.",
            risk="high",
            confidence=0.88,
            status="SUPPORTED",
            evidence_count=28,
            why_it_matters="Validates that credibility and proof-of-work are the central value proposition.",
            created_at=now - timedelta(days=14),
            updated_at=now - timedelta(days=1)
        ),
        AssumptionModel(
            id=ASSUMPTION_3_ID,
            project_id=DEMO_PROJECT_ID,
            title="Students will complete standardized micro-tasks to prove skill",
            description="Students are willing to invest 2-3 hours solving a curated practical prompt to earn an audited skill badge.",
            risk="medium",
            confidence=0.74,
            status="SUPPORTED",
            evidence_count=15,
            why_it_matters="Determines whether our verification pipeline can scale without manual grading bottlenecks.",
            created_at=now - timedelta(days=12),
            updated_at=now - timedelta(days=2)
        ),
        AssumptionModel(
            id=ASSUMPTION_4_ID,
            project_id=DEMO_PROJECT_ID,
            title="SMB clients will pay $150-$500 for vetted student deliverables",
            description="Small business owners have immediate small-scope budget ($150-$500) for tasks like landing page fixes or graphics.",
            risk="medium",
            confidence=0.55,
            status="TESTING",
            evidence_count=8,
            why_it_matters="Governs contract sizing and unit economics for transaction fees.",
            created_at=now - timedelta(days=10),
            updated_at=now - timedelta(days=3)
        ),
        AssumptionModel(
            id=ASSUMPTION_5_ID,
            project_id=DEMO_PROJECT_ID,
            title="Students will accept 10% platform take-rate for escrow safety",
            description="Students value payment guarantee and dispute mediation enough to give up 10% of gross contract value.",
            risk="low",
            confidence=0.40,
            status="UNKNOWN",
            evidence_count=4,
            why_it_matters="Defines revenue model viability.",
            created_at=now - timedelta(days=8),
            updated_at=now - timedelta(days=4)
        ),
        AssumptionModel(
            id=ASSUMPTION_6_ID,
            project_id=DEMO_PROJECT_ID,
            title="University CS & Design departments will endorse the platform",
            description="Faculty and student clubs will promote Nirman as a legitimate experiential learning pathway.",
            risk="medium",
            confidence=0.30,
            status="UNKNOWN",
            evidence_count=1,
            why_it_matters="Could drastically lower student acquisition cost (CAC).",
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=5)
        ),
    ]
    db.add_all(assumptions)

    # 3. Experiment
    experiment = ExperimentModel(
        id=EXP_ID,
        project_id=DEMO_PROJECT_ID,
        assumption_id=ASSUMPTION_1_ID,
        type="interview",
        title="Experiment #01: Discovery vs. Credibility Validation",
        objective="Determine whether students struggle more with discovering opportunities or establishing client trust.",
        questions=[
            "How do you currently find freelance or side projects?",
            "What happens when you reach out to a prospective client?",
            "What is the single biggest obstacle to closing a deal?",
            "Have you ever experienced delayed or non-payment from an informal gig?"
        ],
        success_criteria="At least 40% of respondents identify portfolio credibility and trust as a larger obstacle than finding gigs.",
        status="completed",
        created_at=now - timedelta(days=12),
        updated_at=now - timedelta(days=2)
    )
    db.add(experiment)

    # 4. Realistic Evidence Records (35 records)
    sample_evidence = [
        ("Aarav S. (Junior, CS)", "I applied to 14 postings on Upwork and Reddit ForHire. Zero replies. Clients clearly want someone with 3+ past reviews.", ["credibility", "upwork"]),
        ("Priya M. (Senior, UI/UX)", "Finding people who need design isn't hard, I see tweets every day. But when I show my Figma portfolio, they ask 'have you worked with actual live production apps?' and ghost me.", ["credibility", "portfolio"]),
        ("Kavya R. (Sophomore, Web)", "I got scammed twice for $200 each by someone on Discord who took the code and deleted their account. Trust and escrow are my #1 fear.", ["escrow", "payment"]),
        ("Rohan D. (Junior, Backend)", "There are too many job boards already. Another job board won't help me. What I need is someone vouching that my FastAPI code is production-ready.", ["credibility", "marketplace_fatigue"]),
        ("Ananya K. (Freelance Copywriter)", "Clients always say 'your sample looks great, but how do I know you'll meet our Tuesday deadline?' It's all about reliability trust.", ["trust", "reliability"]),
        ("Dev P. (Founder, Local Bakery)", "I tried hiring a college student for a Shopify setup. Great kid, but we had no contract and the site was 3 weeks late. I'd hire students again only if there's a milestone escrow.", ["client_perspective", "escrow"]),
        ("Sneha T. (Sophomore, Graphic Design)", "I spend 80% of my time making cold pitch slides and 20% designing. If I had a verified score or badge, I wouldn't have to write custom cover letters for $50 posters.", ["credibility", "pitching"]),
        ("Vikram B. (Senior, Mobile Dev)", "I have 4 GitHub repos, but non-technical clients don't read Git commits. They don't know what React Native means. They just want proof I won't disappear.", ["credibility", "github"]),
        ("Tanvi J. (Junior, Content)", "The biggest issue is scope creep and payment. I agreed to 3 articles and the client demanded 7 before releasing funds.", ["payment", "scope_creep"]),
        ("Aditya N. (SMB Owner, Marketing Agency)", "We love hiring college kids for quick research tasks. The only blocker is we get flooded with 50 unvetted applicants and can't spend hours vetting portfolios.", ["client_perspective", "vetting"]),
        ("Meera S. (Junior, Fullstack)", "I already use LinkedIn and Twitter to find clients. The pain is convincing them that a 20-year-old can ship clean TypeScript.", ["credibility", "age_bias"]),
        ("Karan V. (Senior, Data Science)", "Clients doubt that my Python scripts can handle messy CSV data. A sandbox task that proves I clean data properly would seal the deal immediately.", ["micro_tasks", "credibility"]),
        ("Ishita G. (Sophomore, Brand Design)", "I don't know how to price my services. I charge $80 for logos because I have no verified track record to justify $400.", ["pricing", "credibility"]),
        ("Nikhil C. (Junior, React Dev)", "Every client says 'send links to live sites'. But you can't have live client sites until someone hires you. It's a chicken and egg loop.", ["credibility", "experience_loop"]),
        ("Pooja L. (Founder, SaaS Startup)", "I'm willing to pay $300-$500 for targeted frontend components. But I need escrow. If they deliver, money releases. If they ghost, I get refunded.", ["client_perspective", "escrow", "pricing"]),
        ("Rahul B. (Senior, QA Tester)", "I'd happily do a 2-hour assessment test if it meant direct introductions to serious clients without bidding wars.", ["micro_tasks", "bidding"]),
        ("Shreya M. (Junior, Video Editing)", "Instagram DMs give me plenty of inquiries, but closing them is tough because creators don't trust handing raw footage to strangers.", ["trust", "discovery"]),
        ("Abhishek K. (Sophomore, Frontend)", "Competition on Upwork is insane. Freelancers with 500 reviews undercut us. We need a platform that values fresh verified skill over ten-year review history.", ["credibility", "competition"]),
        ("Zoya H. (Senior, Tech Writer)", "I wrote full API documentation for a team, and they delayed paying for 60 days. Escrow is non-negotiable for me now.", ["payment", "escrow"]),
        ("Siddharth M. (CTO, Early-stage Seed Co)", "We hire interns and freelancers every quarter. What impresses us is not a PDF resume, but an interactive demo link showing functional code.", ["client_perspective", "proof_of_work"]),
        ("Rhea S. (Junior, UI Designer)", "I have 3 case studies on Behance. Clients still asked for references from previous employers which I don't have as a student.", ["credibility", "references"]),
        ("Varun T. (Sophomore, Python Automation)", "I automated scrapers for an e-commerce shop. It took 3 days to find the client and 2 weeks to convince them I wasn't going to break their database.", ["credibility", "trust"]),
        ("Natasha P. (Junior, Social Media)", "I offered free trials to 3 local gyms just to prove I could run ad campaigns. Verification would save students from doing unpaid work.", ["credibility", "unpaid_work"]),
        ("Karthik R. (Senior, Backend)", "I don't care about a community forum or fancy profiles. Just give me milestone payments and a verified GitHub PR review badge.", ["escrow", "credibility"]),
        ("Divya N. (Sophomore, UX Researcher)", "I interviewed 5 peers in my university dorm. All 5 had applied for gigs, and all 5 were rejected specifically for 'lack of commercial experience'.", ["credibility", "commercial_experience"]),
        ("Harsh W. (Small Business, Real Estate)", "I need quick flyers and neighborhood landing pages every month. Budget is $150. Finding people is easy on Facebook groups, but 50% flake out.", ["client_perspective", "reliability"]),
        ("Anjali D. (Junior, Webflow Dev)", "Webflow jobs are everywhere. But clients compare college students with agencies in Eastern Europe. Proof of speed and quality is essential.", ["credibility", "competition"]),
        ("Gaurav S. (Senior, Mobile App Dev)", "I shipped an app to Google Play Store. When clients saw it live, they signed immediately. Proves that real tangible proof beats any resume.", ["proof_of_work", "credibility"]),
        ("Bhavna K. (Junior, Illustrator)", "Clients worry about copyright and revision rounds. Clear terms and escrow would make both sides feel safe.", ["terms", "escrow"]),
        ("Sameer T. (Director, University Incubator)", "Our student founders want to hire student designers on campus, but they struggle to assess quality beyond casual friend recommendations.", ["university", "credibility"]),
        ("Alok M. (Junior, Frontend)", "I tried Fiverr. After fees and fake reviews, it's impossible to stand out. An evidence-based skill evaluation would change everything.", ["fiverr", "credibility"]),
        ("Simran P. (Senior, Product Analyst)", "If Nirman can test my SQL and product intuition and give me a verified card, I can pitch seed startups with confidence.", ["micro_tasks", "credibility"]),
        ("Tarun E. (SMB Owner, Fitness Studio)", "I got burned by a student who copy-pasted a template from Envato and broke my booking links. I need proof of actual coding capability.", ["client_perspective", "credibility"]),
        ("Farhan Q. (Junior, Cloud DevOps)", "I set up AWS pipelines in my university lab. Clients assume students only know basic HTML. We need technical credibility proof.", ["credibility", "technical"]),
        ("Ayesha B. (Senior, Product Design)", "Discovery is solved by cold emailing. Trust is not solved. Solve trust and you solve the whole market.", ["credibility", "discovery"])
    ]

    for idx, (source, content, tags) in enumerate(sample_evidence):
        ev = EvidenceModel(
            id=f"00000000-0000-0000-0000-{idx+1:012d}",
            project_id=DEMO_PROJECT_ID,
            experiment_id=EXP_ID,
            source_name=source,
            content=content,
            tags=tags,
            supports_assumptions=[ASSUMPTION_2_ID] if "credibility" in tags or "trust" in tags else [],
            contradicts_assumptions=[ASSUMPTION_1_ID] if "credibility" in tags or "marketplace_fatigue" in tags else [],
            created_at=now - timedelta(days=2, hours=idx)
        )
        db.add(ev)

    # 5. Themes
    themes = [
        ThemeModel(
            id="00000000-0000-0000-0000-000000000301",
            project_id=DEMO_PROJECT_ID,
            theme="Portfolio credibility & proof of execution",
            count=18,
            percentage=45.0,
            sample_quotes=[
                "Finding people who need design isn't hard... but when I show my Figma portfolio, they ask 'have you worked with actual live production apps?' and ghost me.",
                "Discovery is solved by cold emailing. Trust is not solved. Solve trust and you solve the whole market."
            ],
            created_at=now - timedelta(days=1)
        ),
        ThemeModel(
            id="00000000-0000-0000-0000-000000000302",
            project_id=DEMO_PROJECT_ID,
            theme="Payment security & escrow trust",
            count=9,
            percentage=22.5,
            sample_quotes=[
                "I got scammed twice for $200 each by someone on Discord who took the code and deleted their account.",
                "I wrote full API documentation for a team, and they delayed paying for 60 days. Escrow is non-negotiable."
            ],
            created_at=now - timedelta(days=1)
        ),
        ThemeModel(
            id="00000000-0000-0000-0000-000000000303",
            project_id=DEMO_PROJECT_ID,
            theme="Opportunity discovery & matching",
            count=7,
            percentage=17.5,
            sample_quotes=[
                "I applied to 14 postings on Upwork and Reddit ForHire. Zero replies.",
                "There are too many job boards already. Another job board won't help me."
            ],
            created_at=now - timedelta(days=1)
        ),
        ThemeModel(
            id="00000000-0000-0000-0000-000000000304",
            project_id=DEMO_PROJECT_ID,
            theme="Pricing uncertainty & scoping",
            count=6,
            percentage=15.0,
            sample_quotes=[
                "I don't know how to price my services. I charge $80 for logos because I have no verified track record to justify $400."
            ],
            created_at=now - timedelta(days=1)
        ),
    ]
    db.add_all(themes)

    # 6. Strategic Decision #01
    decision = DecisionModel(
        id="00000000-0000-0000-0000-000000000401",
        project_id=DEMO_PROJECT_ID,
        decision_number=1,
        action="CHANGE_DIRECTION",
        original_assumption="Students mainly struggle to find freelance jobs.",
        evidence_summary="35 student and client interview responses analyzed across discovery, trust, pricing, and escrow.",
        key_finding="Portfolio credibility appeared in 45% of responses, significantly outstripping gig discovery (17.5%). Students can find job postings on Discord/Twitter/Upwork, but fail to convert due to client skepticism of junior experience.",
        decision_text="Do not build another freelance marketplace job board. Pivot direction to a Proof-of-Skill Profile and micro-deliverable escrow concept.",
        next_step="Build an interactive prototype for verifiable skill benchmark cards and test with 5 SMB clients.",
        created_at=now - timedelta(days=1)
    )
    db.add(decision)

    await db.commit()
    logger.info("Demo data seeding completed successfully.")
