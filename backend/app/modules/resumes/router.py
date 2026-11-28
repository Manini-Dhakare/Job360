"""Resume Upload & Parsing Router (Developer Squad 2)"""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.profiles.models import Profile
from app.modules.resumes.models import Resume
from app.modules.resumes.service import ResumeService

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Upload PDF/DOCX resume, extract skills, and compute ATS baseline."""
    data = await ResumeService.upload_and_parse(db, current_user, file)
    return standard_success_response(data)


@router.get("")
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """List all uploaded resumes for the authenticated candidate."""
    data = await ResumeService.list_resumes(db, current_user)
    return standard_success_response(data)


@router.get("/{resume_id}/parsed")
async def get_parsed_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve structured JSON entities from parsed resume."""
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.user_id))
    profile = prof_res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    res = await db.execute(
        select(Resume).where(Resume.resume_id == resume_id, Resume.profile_id == profile.profile_id)
    )
    resume = res.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    return standard_success_response(
        {
            "resume_id": str(resume.resume_id),
            "title": resume.title,
            "is_primary": resume.is_primary,
            "parsed_json": resume.parsed_json or {},
            "created_at": resume.created_at.isoformat(),
        }
    )


@router.post("/{resume_id}/primary")
async def set_primary_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Set the active primary resume used for ATS & Best Match scoring."""
    data = await ResumeService.set_primary(db, current_user, resume_id)
    return standard_success_response(data)
