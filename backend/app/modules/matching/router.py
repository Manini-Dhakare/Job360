"""Job-Specific Resume Matching & Tri-Score Router (Developer Squad 4)"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.matching.service import MatchingService

router = APIRouter()


class MatchCalculateRequest(BaseModel):
    job_id: str


@router.post("/calculate")
async def calculate_match_scores(
    payload: MatchCalculateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Compute Tri-Score: Best Match %, Job Match %, Resume Match %, and ATS Score %."""
    data = await MatchingService.calculate_for_job(db, current_user, payload.job_id)
    return standard_success_response(data)


@router.get("/job/{job_id}")
async def get_job_match_breakdown(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Fetch granular score breakdown and missing skills for target job."""
    data = await MatchingService.calculate_for_job(db, current_user, job_id)
    return standard_success_response(data)


@router.get("/recommended")
async def get_recommended_jobs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve top AI-recommended jobs sorted by Best Match %."""
    data = await MatchingService.get_recommended_jobs(db, current_user)
    return standard_success_response(data)
