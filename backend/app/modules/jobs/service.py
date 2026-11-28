"""Job Exploration & Multi-Source Aggregation Service (Module 3)"""
import hashlib
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.jobs.models import Company, Job, JobSource, SavedJob
from app.modules.matching.service import MatchingService, compute_job_scores


def make_dedup_hash(company: str, title: str, location: str) -> str:
    raw = f"{company.strip().lower()}|{title.strip().lower()}|{location.strip().lower()}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


# Curated multi-portal & company career portal seed listings for instant local testing
SEED_JOBS: List[Dict[str, Any]] = [
    {
        "company": "Google",
        "domain": "google.com",
        "industry": "Technology",
        "source_name": "Company Career Portal",
        "source_type": "FEED",
        "title": "Software Engineer, Full-Stack (Next.js & Python)",
        "location": "Bengaluru, India",
        "is_remote": False,
        "min_yoe": 2,
        "salary_min": 2400000,
        "salary_max": 3800000,
        "source_url": "https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineer",
        "description": "Build scalable web applications using Python, FastAPI, TypeScript, React, Next.js, PostgreSQL, Docker, and Kubernetes. Strong experience in REST APIs, System Design, and CI/CD pipelines required.",
    },
    {
        "company": "Stripe",
        "domain": "stripe.com",
        "industry": "Fintech",
        "source_name": "Greenhouse ATS",
        "source_type": "FEED",
        "title": "Senior Backend Engineer, Payments Infrastructure",
        "location": "Remote (Global)",
        "is_remote": True,
        "min_yoe": 4,
        "salary_min": 4500000,
        "salary_max": 6800000,
        "source_url": "https://stripe.com/jobs/search?query=Backend+Engineer",
        "description": "Design resilient distributed payment systems using Python, Go, PostgreSQL, Redis, Kafka, Microservices, Docker, and AWS. Experience with high-throughput REST APIs and idempotent ledgers.",
    },
    {
        "company": "Microsoft",
        "domain": "microsoft.com",
        "industry": "Cloud & AI",
        "source_name": "LinkedIn Jobs (via Aggregator)",
        "source_type": "PARTNER",
        "title": "Full-Stack AI Engineer (React, FastAPI, PyTorch)",
        "location": "Hyderabad, India (Hybrid)",
        "is_remote": True,
        "min_yoe": 2,
        "salary_min": 2200000,
        "salary_max": 3500000,
        "source_url": "https://www.linkedin.com/jobs/search/?keywords=Microsoft%20Full%20Stack%20AI%20Engineer",
        "description": "Develop AI copilot experiences with React, TypeScript, Tailwind CSS, Python, FastAPI, PyTorch, OpenAI, LLM orchestration, PostgreSQL, pgvector, and Azure.",
    },
    {
        "company": "Razorpay",
        "domain": "razorpay.com",
        "industry": "Fintech",
        "source_name": "Naukri Portal (via Aggregator)",
        "source_type": "PARTNER",
        "title": "Software Development Engineer II - Platform",
        "location": "Bengaluru, India",
        "is_remote": False,
        "min_yoe": 3,
        "salary_min": 2000000,
        "salary_max": 3200000,
        "source_url": "https://www.naukri.com/razorpay-jobs",
        "description": "Scale core merchant APIs using Python, Go, MySQL, PostgreSQL, Redis, RabbitMQ, Docker, Kubernetes, and AWS. Strong Data Structures, Algorithms, and System Design.",
    },
    {
        "company": "Amazon",
        "domain": "amazon.jobs",
        "industry": "E-Commerce & Cloud",
        "source_name": "Company Career Portal",
        "source_type": "FEED",
        "title": "Software Development Engineer (SDE-1)",
        "location": "Bengaluru / Chennai, India",
        "is_remote": False,
        "min_yoe": 1,
        "salary_min": 1800000,
        "salary_max": 2800000,
        "source_url": "https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer",
        "description": "Build distributed services in Java, Python, TypeScript, AWS, Microservices, REST API, SQL, and Linux. Focus on Data Structures, Algorithms, and automated unit testing.",
    },
    {
        "company": "Flipkart",
        "domain": "flipkartcareers.com",
        "industry": "E-Commerce",
        "source_name": "Naukri Portal (via Aggregator)",
        "source_type": "PARTNER",
        "title": "Frontend Engineer II (React / Next.js)",
        "location": "Bengaluru, India",
        "is_remote": False,
        "min_yoe": 2,
        "salary_min": 1800000,
        "salary_max": 2900000,
        "source_url": "https://www.naukri.com/flipkart-jobs",
        "description": "Craft high-performance storefront experiences with JavaScript, TypeScript, React, Next.js, Tailwind CSS, HTML, CSS, GraphQL, and Playwright testing.",
    },
    {
        "company": "Databricks",
        "domain": "databricks.com",
        "industry": "Data & AI",
        "source_name": "Greenhouse ATS",
        "source_type": "FEED",
        "title": "Machine Learning & Backend Engineer",
        "location": "Remote / Bengaluru",
        "is_remote": True,
        "min_yoe": 3,
        "salary_min": 3200000,
        "salary_max": 4800000,
        "source_url": "https://www.databricks.com/company/careers/open-positions",
        "description": "Build vector search and LLM pipelines using Python, PyTorch, NLP, LangChain, PostgreSQL, pgvector, Docker, Kubernetes, and Terraform.",
    },
    {
        "company": "Atlassian",
        "domain": "atlassian.com",
        "industry": "SaaS",
        "source_name": "LinkedIn Jobs (via Aggregator)",
        "source_type": "PARTNER",
        "title": "Full-Stack Software Engineer (Remote)",
        "location": "Remote (India)",
        "is_remote": True,
        "min_yoe": 2,
        "salary_min": 2500000,
        "salary_max": 3900000,
        "source_url": "https://www.linkedin.com/jobs/search/?keywords=Atlassian%20Full%20Stack%20Engineer",
        "description": "Develop collaborative cloud tools with TypeScript, React, Node.js, Python, PostgreSQL, Redis, Docker, CI/CD, and Agile Scrum practices.",
    },
    {
        "company": "Swiggy",
        "domain": "swiggy.com",
        "industry": "Consumer Tech",
        "source_name": "Company Career Portal",
        "source_type": "FEED",
        "title": "Backend Engineer - Real-Time Logistics",
        "location": "Bengaluru, India (Hybrid)",
        "is_remote": True,
        "min_yoe": 2,
        "salary_min": 1900000,
        "salary_max": 3000000,
        "source_url": "https://careers.swiggy.com/",
        "description": "Optimize dispatch pipelines with Python, Go, Java, Kafka, Redis, PostgreSQL, Microservices, and Kubernetes.",
    },
    {
        "company": "Figma",
        "domain": "figma.com",
        "industry": "Design Software",
        "source_name": "Lever ATS",
        "source_type": "FEED",
        "title": "Product Engineer, Web Platform",
        "location": "San Francisco / Remote",
        "is_remote": True,
        "min_yoe": 3,
        "salary_min": 4200000,
        "salary_max": 6000000,
        "source_url": "https://www.figma.com/careers/#job-openings",
        "description": "Build collaborative web interfaces using TypeScript, React, Next.js, Node.js, GraphQL, PostgreSQL, and GitHub Actions.",
    },
]


async def _get_or_create_company(db: AsyncSession, name: str, domain: str = "", industry: str = "Technology") -> Company:
    res = await db.execute(select(Company).where(Company.name == name))
    company = res.scalar_one_or_none()
    if not company:
        company = Company(name=name, domain=domain, industry=industry)
        db.add(company)
        await db.flush()
    return company


async def _get_or_create_source(db: AsyncSession, source_name: str, source_type: str = "API") -> JobSource:
    res = await db.execute(select(JobSource).where(JobSource.source_name == source_name))
    source = res.scalar_one_or_none()
    if not source:
        source = JobSource(source_name=source_name, source_type=source_type, is_active=True)
        db.add(source)
        await db.flush()
    return source


class JobService:
    """Service layer for multi-portal & company career portal job aggregation."""

    @staticmethod
    async def ensure_seed_jobs(db: AsyncSession) -> None:
        existing = await db.execute(select(Job.job_id).limit(1))
        if existing.scalar_one_or_none() is not None:
            return

        for item in SEED_JOBS:
            company = await _get_or_create_company(db, item["company"], item["domain"], item["industry"])
            source = await _get_or_create_source(db, item["source_name"], item["source_type"])
            d_hash = make_dedup_hash(item["company"], item["title"], item["location"])
            dup = await db.execute(select(Job).where(Job.deduplication_hash == d_hash))
            if dup.scalar_one_or_none():
                continue

            job = Job(
                company_id=company.company_id,
                source_id=source.source_id,
                title=item["title"],
                description=item["description"],
                location=item["location"],
                is_remote=item["is_remote"],
                min_yoe=item["min_yoe"],
                salary_min=item["salary_min"],
                salary_max=item["salary_max"],
                source_url=item["source_url"],
                deduplication_hash=d_hash,
                status="ACTIVE",
                posted_at=datetime.utcnow(),
            )
            db.add(job)
        await db.commit()

    @staticmethod
    async def sync_external_sources(db: AsyncSession, query: str = "Software Engineer") -> int:
        """Fetch live jobs from configured authorized APIs (JSearch/Adzuna/Greenhouse) and deduplicate."""
        inserted = 0
        items_to_insert: List[Dict[str, Any]] = []

        # 1. Public Greenhouse ATS feeds (no API key needed)
        for board in ("stripe", "databricks"):
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs")
                    if resp.status_code == 200:
                        for j in resp.json().get("jobs", [])[:5]:
                            loc = (j.get("location") or {}).get("name", "Remote")
                            items_to_insert.append(
                                {
                                    "company": board.capitalize(),
                                    "domain": f"{board}.com",
                                    "source_name": "Greenhouse ATS",
                                    "source_type": "FEED",
                                    "title": j.get("title", "Engineer"),
                                    "location": loc,
                                    "is_remote": "remote" in loc.lower(),
                                    "source_url": j.get("absolute_url", f"https://{board}.com/careers"),
                                    "description": f"{j.get('title', '')} at {board.capitalize()} ({loc}). Apply directly via Greenhouse company career portal.",
                                }
                            )
            except Exception:
                pass

        # 2. Remotive & Arbeitnow (100% free public job APIs, no API key needed)
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                remotive = await client.get("https://remotive.com/api/remote-jobs", params={"search": query, "limit": 6})
                if remotive.status_code == 200:
                    for j in remotive.json().get("jobs", [])[:6]:
                        items_to_insert.append(
                            {
                                "company": j.get("company_name") or "Remote Company",
                                "domain": "",
                                "source_name": "Remotive (Free Portal)",
                                "source_type": "API",
                                "title": j.get("title") or "Software Engineer",
                                "location": j.get("candidate_required_location") or "Remote",
                                "is_remote": True,
                                "source_url": j.get("url") or "https://remotive.com",
                                "description": (j.get("description") or j.get("title") or "")[:2500],
                            }
                        )
        except Exception:
            pass

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                arbeit = await client.get("https://www.arbeitnow.com/api/job-board-api")
                if arbeit.status_code == 200:
                    for j in arbeit.json().get("data", [])[:6]:
                        items_to_insert.append(
                            {
                                "company": j.get("company_name") or "Company",
                                "domain": "",
                                "source_name": "Arbeitnow (Free Portal)",
                                "source_type": "API",
                                "title": j.get("title") or "Software Engineer",
                                "location": j.get("location") or "Remote",
                                "is_remote": bool(j.get("remote")),
                                "source_url": j.get("url") or "https://www.arbeitnow.com",
                                "description": (j.get("description") or j.get("title") or "")[:2500],
                            }
                        )
        except Exception:
            pass

        # 3. JSearch RapidAPI (aggregates LinkedIn, Naukri, Indeed, Glassdoor) if free-tier key is present
        jsearch_key = os.getenv("JSEARCH_RAPIDAPI_KEY", "").strip()
        if jsearch_key:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(
                        "https://jsearch.p.rapidapi.com/search",
                        params={"query": query, "num_pages": "1"},
                        headers={
                            "X-RapidAPI-Key": jsearch_key,
                            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                        },
                    )
                    if resp.status_code == 200:
                        for j in resp.json().get("data", [])[:10]:
                            loc = ", ".join(filter(None, [j.get("job_city"), j.get("job_country")])) or "Remote"
                            items_to_insert.append(
                                {
                                    "company": j.get("employer_name") or "Company",
                                    "domain": "",
                                    "source_name": j.get("job_publisher") or "JSearch Aggregator",
                                    "source_type": "API",
                                    "title": j.get("job_title") or "Software Engineer",
                                    "location": loc,
                                    "is_remote": bool(j.get("job_is_remote")),
                                    "source_url": j.get("job_apply_link") or "https://www.linkedin.com/jobs",
                                    "description": (j.get("job_description") or "")[:3000],
                                }
                            )
            except Exception:
                pass

        for item in items_to_insert:
            d_hash = make_dedup_hash(item["company"], item["title"], item["location"])
            dup = await db.execute(select(Job).where(Job.deduplication_hash == d_hash))
            if dup.scalar_one_or_none():
                continue
            company = await _get_or_create_company(db, item["company"], item["domain"])
            source = await _get_or_create_source(db, item["source_name"], item["source_type"])
            db.add(
                Job(
                    company_id=company.company_id,
                    source_id=source.source_id,
                    title=item["title"][:255],
                    description=item["description"] or item["title"],
                    location=item["location"][:255],
                    is_remote=item["is_remote"],
                    min_yoe=2,
                    source_url=item["source_url"][:1000],
                    deduplication_hash=d_hash,
                    status="ACTIVE",
                    posted_at=datetime.utcnow(),
                )
            )
            inserted += 1

        if inserted:
            await db.commit()
        return inserted

    @staticmethod
    async def search_jobs(
        db: AsyncSession,
        user: User,
        query: Optional[str] = None,
        location: Optional[str] = None,
        remote: Optional[bool] = None,
        source_filter: Optional[str] = None,
        min_score: float = 0.0,
        sort_by: str = "best_match",
    ) -> List[dict]:
        await JobService.ensure_seed_jobs(db)
        profile, resume = await MatchingService.get_candidate_context(db, user)

        stmt = (
            select(Job, Company, JobSource)
            .outerjoin(Company, Job.company_id == Company.company_id)
            .outerjoin(JobSource, Job.source_id == JobSource.source_id)
            .where(Job.status == "ACTIVE")
        )
        res = await db.execute(stmt)
        rows = res.all()

        saved_res = await db.execute(select(SavedJob.job_id).where(SavedJob.user_id == user.user_id))
        saved_ids = {str(jid) for jid in saved_res.scalars().all()}

        results: List[dict] = []
        q_low = query.strip().lower() if query else ""
        loc_low = location.strip().lower() if location else ""
        src_low = source_filter.strip().lower() if source_filter else ""

        for job, company, source in rows:
            company_name = company.name if company else "Company"
            source_name = source.source_name if source else "Direct Portal"

            if q_low and q_low not in job.title.lower() and q_low not in company_name.lower() and q_low not in job.description.lower():
                continue
            if loc_low and loc_low not in (job.location or "").lower():
                continue
            if remote is True and not job.is_remote:
                continue
            if src_low and src_low not in source_name.lower():
                continue

            scores = compute_job_scores(
                job.title,
                job.description,
                job.location,
                bool(job.is_remote),
                job.min_yoe or 0,
                profile,
                resume,
            )
            if scores["best_match_score"] < min_score:
                continue

            results.append(
                {
                    "job_id": str(job.job_id),
                    "title": job.title,
                    "company_id": str(job.company_id) if job.company_id else None,
                    "company_name": company_name,
                    "source_name": source_name,
                    "source_url": job.source_url,
                    "location": job.location,
                    "is_remote": bool(job.is_remote),
                    "min_yoe": job.min_yoe,
                    "salary_min": float(job.salary_min) if job.salary_min else None,
                    "salary_max": float(job.salary_max) if job.salary_max else None,
                    "description": job.description,
                    "posted_at": job.posted_at.isoformat() if job.posted_at else None,
                    "is_saved": str(job.job_id) in saved_ids,
                    **scores,
                }
            )

        if sort_by == "ats_score":
            results.sort(key=lambda x: x["ats_score"], reverse=True)
        elif sort_by == "recent":
            results.sort(key=lambda x: x["posted_at"] or "", reverse=True)
        else:
            results.sort(key=lambda x: x["best_match_score"], reverse=True)

        return results

    @staticmethod
    async def save_job(db: AsyncSession, user: User, job_id: str) -> dict:
        existing = await db.execute(
            select(SavedJob).where(SavedJob.user_id == user.user_id, SavedJob.job_id == job_id)
        )
        if not existing.scalar_one_or_none():
            db.add(SavedJob(user_id=user.user_id, job_id=job_id))
            await db.commit()
        return {"job_id": job_id, "saved": True}

    @staticmethod
    async def unsave_job(db: AsyncSession, user: User, job_id: str) -> dict:
        existing = await db.execute(
            select(SavedJob).where(SavedJob.user_id == user.user_id, SavedJob.job_id == job_id)
        )
        row = existing.scalar_one_or_none()
        if row:
            await db.delete(row)
            await db.commit()
        return {"job_id": job_id, "saved": False}
