"""Kanban Job Application Tracker Router (Developer Squad 3)"""
from typing import Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.tracker.service import TrackerService

router = APIRouter()


class CreateApplicationRequest(BaseModel):
    job_id: str
    status: str = "WISHLIST"
    notes: Optional[str] = None


class UpdateApplicationRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[str] = None


@router.get("/kanban")
async def get_kanban_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve categorized application cards organized across Kanban columns."""
    data = await TrackerService.get_kanban(db, current_user)
    return standard_success_response(data)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: CreateApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Track a job application in the Kanban pipeline."""
    data = await TrackerService.create_application(
        db, current_user, payload.job_id, payload.status, payload.notes
    )
    return standard_success_response(data)


@router.patch("/{app_id}/status")
async def update_application_status(
    app_id: str,
    payload: UpdateApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Update pipeline stage, notes, or interview date."""
    data = await TrackerService.update_status(
        db, current_user, app_id, payload.status, payload.notes, payload.interview_date
    )
    return standard_success_response(data)


@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Delete an application from the Kanban tracker."""
    data = await TrackerService.delete_application(db, current_user, app_id)
    return standard_success_response(data)
