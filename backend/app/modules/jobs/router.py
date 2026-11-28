"""Job Exploration & Ingestion Router (Developer Squad 3)"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.jobs.models import Company, Job, JobSource
from app.modules.jobs.service import JobService
from app.modules.matching.service import MatchingService, compute_job_scores

router = APIRouter()


@router.get("/search")
async def search_jobs(
    query: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    remote: Optional[bool] = Query(default=None),
    source: Optional[str] = Query(default=None),
    min_score: float = Query(default=0.0, ge=0.0, le=100.0),
    sort_by: str = Query(default="best_match"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Paginated job search with multi-portal links, filters, Best Match % and ATS Score %."""
    jobs = await JobService.search_jobs(
        db=db,
        user=current_user,
        query=query,
        location=location,
        remote=remote,
        source_filter=source,
        min_score=min_score,
        sort_by=sort_by,
    )
    return standard_success_response({"jobs": jobs, "total": len(jobs)})


@router.post("/sync")
async def sync_jobs(
    query: str = Query(default="Software Engineer"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Pull fresh listings from Greenhouse ATS & configured aggregator APIs."""
    inserted = await JobService.sync_external_sources(db, query=query)
    return standard_success_response({"inserted": inserted})


@router.get("/{job_id}")
async def get_job_detail(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve full job description and ATS/Best Match breakdown."""
    res = await db.execute(
        select(Job, Company, JobSource)
        .outerjoin(Company, Job.company_id == Company.company_id)
        .outerjoin(JobSource, Job.source_id == JobSource.source_id)
        .where(Job.job_id == job_id)
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    job, company, source = row
    profile, resume = await MatchingService.get_candidate_context(db, current_user)
    scores = compute_job_scores(
        job.title, job.description, job.location, bool(job.is_remote), job.min_yoe or 0, profile, resume
    )
    return standard_success_response(
        {
            "job_id": str(job.job_id),
            "title": job.title,
            "company_name": company.name if company else "Company",
            "source_name": source.source_name if source else "Direct Portal",
            "source_url": job.source_url,
            "location": job.location,
            "is_remote": bool(job.is_remote),
            "description": job.description,
            **scores,
        }
    )


@router.post("/{job_id}/save")
async def save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Bookmark job listing to candidate profile."""
    data = await JobService.save_job(db, current_user, job_id)
    return standard_success_response(data)


@router.delete("/{job_id}/save")
async def unsave_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Remove bookmarked job listing."""
    data = await JobService.unsave_job(db, current_user, job_id)
    return standard_success_response(data)
