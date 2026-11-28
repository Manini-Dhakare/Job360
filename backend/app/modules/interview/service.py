"""Company-Specific & Overall Interview Preparation Service (Module 8)"""
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rag import InterviewRAGEngine
from app.modules.auth.models import User
from app.modules.interview.models import InterviewQuestion
from app.modules.jobs.models import Company
from app.modules.matching.service import MatchingService

SEED_INTERVIEW_QUESTIONS: List[Dict[str, Any]] = [
    # Overall / General Prep
    {
        "company": None,
        "role_category": "Overall Software Engineering",
        "question_type": "BEHAVIORAL",
        "difficulty": "MEDIUM",
        "question_text": "Tell me about a time you resolved a critical production bug under tight deadlines.",
        "star_answer": {
            "situation": "Our checkout API experienced intermittent 500 errors during peak evening traffic.",
            "task": "Identify the root cause and restore 99.9% uptime without rolling back the release.",
            "action": "Correlated structured logs with PostgreSQL connection pool metrics, isolated an unclosed async session, and deployed a hotfix with connection-pool limits and regression tests.",
            "result": "Eliminated timeouts within 45 minutes and reduced p95 API latency by 32%.",
        },
    },
    {
        "company": None,
        "role_category": "Overall Software Engineering",
        "question_type": "TECHNICAL",
        "difficulty": "MEDIUM",
        "question_text": "How would you design a rate-limited job aggregation pipeline that avoids duplicate postings across portals?",
        "star_answer": {
            "situation": "Aggregating jobs from multiple external APIs risks rate-limit throttling (429) and duplicate entries.",
            "task": "Build a resilient ingestion pipeline with sub-100ms search queries.",
            "action": "Use Redis token-bucket rate limiting + 6-hour query caching, compute an MD5 deduplication hash on (company, normalized title, location), and index jobs in PostgreSQL.",
            "result": "Zero 429 quota failures and deduplicated job cards across portals.",
        },
    },
    {
        "company": None,
        "role_category": "Overall Software Engineering",
        "question_type": "CODING",
        "difficulty": "MEDIUM",
        "question_text": "Implement an LRU Cache with O(1) get and put operations and explain thread-safety considerations.",
        "star_answer": {
            "situation": "In-memory caching requires fast eviction of least-recently-used keys.",
            "task": "Achieve O(1) time complexity for both reads and writes.",
            "action": "Combine a hash map for O(1) key lookup with a doubly-linked list to track recency order, moving accessed nodes to the head and evicting from the tail.",
            "result": "Constant-time O(1) operations; guarded by a mutex/lock in multi-threaded runtimes.",
        },
    },
    # Google
    {
        "company": "Google",
        "role_category": "Software Engineer",
        "question_type": "CODING",
        "difficulty": "HARD",
        "question_text": "Given a stream of job postings and user skill sets, how do you efficiently find the top-K matching jobs in real time?",
        "star_answer": {
            "situation": "Matching millions of jobs against candidate profiles cannot scan every row linearly.",
            "task": "Return top-K relevant jobs under 50ms.",
            "action": "Represent profiles and jobs as normalized dense vectors, index them with HNSW (pgvector), and maintain a min-heap of size K during candidate scoring.",
            "result": "Sub-35ms approximate nearest neighbor retrieval with >96% recall.",
        },
    },
    {
        "company": "Google",
        "role_category": "Software Engineer",
        "question_type": "BEHAVIORAL",
        "difficulty": "MEDIUM",
        "question_text": "Describe a situation where you had to navigate ambiguity in product requirements.",
        "star_answer": {
            "situation": "A new AI matching feature had conflicting stakeholder expectations on scoring weights.",
            "task": "Align engineering and product on a measurable scoring model.",
            "action": "Proposed a transparent Tri-Score breakdown (Job Match, Resume Match, ATS Score), prototyped both variants, and ran A/B evaluation against 50 sample resumes.",
            "result": "Shipped on schedule with 94% user clarity satisfaction.",
        },
    },
    # Stripe
    {
        "company": "Stripe",
        "role_category": "Backend Engineer",
        "question_type": "TECHNICAL",
        "difficulty": "HARD",
        "question_text": "How do you guarantee idempotency and prevent double-spending in a credit or payment ledger?",
        "star_answer": {
            "situation": "Concurrent requests or webhook retries can accidentally deduct or grant credits twice.",
            "task": "Ensure every ledger mutation executes at most once.",
            "action": "Enforce a unique idempotency_key constraint on transactions and acquire row-level locks via PostgreSQL SELECT FOR UPDATE inside an atomic DB transaction.",
            "result": "Zero double-spending race conditions under concurrent load.",
        },
    },
    # Microsoft
    {
        "company": "Microsoft",
        "role_category": "Full-Stack AI Engineer",
        "question_type": "TECHNICAL",
        "difficulty": "MEDIUM",
        "question_text": "How do you prevent LLM hallucinations when customizing a candidate's resume?",
        "star_answer": {
            "situation": "Standard LLMs often invent metrics or unverified skills when rewriting resume bullets.",
            "task": "Guarantee strict factual grounding.",
            "action": "Use a two-panel confirmation flow so only user-verified skills enter the prompt, enforce Pydantic JSON schemas, and isolate system instructions from user text.",
            "result": "Maintains <0.1% hallucination rate while boosting ATS keyword alignment.",
        },
    },
    # Amazon
    {
        "company": "Amazon",
        "role_category": "SDE-1",
        "question_type": "BEHAVIORAL",
        "difficulty": "MEDIUM",
        "question_text": "Tell me about a time you took ownership of a problem outside your immediate team's scope.",
        "star_answer": {
            "situation": "Frontend builds were failing intermittently due to unignored environment files in the shared repo.",
            "task": "Unblock the team and prevent repeat build failures.",
            "action": "Audited the build pipeline, added missing utility modules and strict TypeScript checks, and documented local setup steps.",
            "result": "Reduced onboarding setup time for new engineers from half a day to 10 minutes.",
        },
    },
    # Razorpay
    {
        "company": "Razorpay",
        "role_category": "SDE-II Platform",
        "question_type": "TECHNICAL",
        "difficulty": "MEDIUM",
        "question_text": "How do you design circuit breakers and fallbacks for unreliable third-party APIs?",
        "star_answer": {
            "situation": "External job or payment APIs occasionally spike in latency or return 429/503 errors.",
            "task": "Keep the user-facing application responsive during upstream outages.",
            "action": "Wrap external HTTP calls in a circuit breaker that opens after 5 consecutive failures, serve cached Redis results, and retry with exponential backoff.",
            "result": "99.95% endpoint availability even during third-party downtime.",
        },
    },
]


class InterviewService:
    """Service layer for Company-Specific & Overall Interview Prep."""

    @staticmethod
    async def ensure_seed_questions(db: AsyncSession) -> None:
        existing = await db.execute(select(InterviewQuestion.q_id).limit(1))
        if existing.scalar_one_or_none() is not None:
            return

        for item in SEED_INTERVIEW_QUESTIONS:
            company_id = None
            if item["company"]:
                comp_res = await db.execute(select(Company).where(Company.name == item["company"]))
                comp = comp_res.scalar_one_or_none()
                if not comp:
                    comp = Company(name=item["company"], industry="Technology")
                    db.add(comp)
                    await db.flush()
                company_id = comp.company_id

            db.add(
                InterviewQuestion(
                    company_id=company_id,
                    role_category=item["role_category"],
                    question_type=item["question_type"],
                    question_text=item["question_text"],
                    star_answer=item["star_answer"],
                    difficulty=item["difficulty"],
                )
            )
        await db.commit()

    @staticmethod
    async def list_questions(
        db: AsyncSession,
        company: Optional[str] = None,
        question_type: Optional[str] = None,
    ) -> dict:
        await InterviewService.ensure_seed_questions(db)

        stmt = select(InterviewQuestion, Company).outerjoin(
            Company, InterviewQuestion.company_id == Company.company_id
        )
        res = await db.execute(stmt)
        rows = res.all()

        companies_set = sorted({c.name for _, c in rows if c is not None})
        comp_filter = company.strip().lower() if company else ""
        type_filter = question_type.strip().upper() if question_type else ""

        questions = []
        for q, c in rows:
            c_name = c.name if c else "Overall"
            if comp_filter == "overall" and c is not None:
                continue
            elif comp_filter and comp_filter != "overall" and comp_filter not in c_name.lower():
                continue
            if type_filter and type_filter != "ALL" and q.question_type != type_filter:
                continue

            questions.append(
                {
                    "q_id": str(q.q_id),
                    "company_name": c_name,
                    "role_category": q.role_category,
                    "question_type": q.question_type,
                    "question_text": q.question_text,
                    "star_answer": q.star_answer or {},
                    "difficulty": q.difficulty,
                }
            )

        return {"companies": companies_set, "questions": questions}

    @staticmethod
    async def evaluate_answer_with_rag(
        db: AsyncSession,
        user: User,
        question_text: str,
        candidate_answer: str,
        company_name: Optional[str] = None,
    ) -> dict:
        """Evaluate candidate answer using RAG over their parsed resume + STAR rubric."""
        _, resume = await MatchingService.get_candidate_context(db, user)
        parsed = (resume.parsed_json or {}) if resume else {}
        rag_ctx = InterviewRAGEngine.retrieve_relevant_resume_context(
            question_text=question_text,
            resume_bullets=parsed.get("bullets", []),
            resume_skills=parsed.get("skills", []),
        )
        return await InterviewRAGEngine.generate_rag_feedback(
            question_text=question_text,
            candidate_answer=candidate_answer,
            company_name=company_name,
            resume_context=rag_ctx,
        )
