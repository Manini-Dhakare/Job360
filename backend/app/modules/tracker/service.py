"""Kanban Job Application Tracker Service (Module 12)"""
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.jobs.models import Company, Job, JobSource
from app.modules.tracker.models import Application

VALID_STATUSES = (
    "WISHLIST",
    "APPLIED",
    "PHONE_SCREEN",
    "TECH_INTERVIEW",
    "FINAL_ROUND",
    "OFFERED",
    "REJECTED",
)


class TrackerService:
    """Service layer for application lifecycle tracking."""

    @staticmethod
    async def get_kanban(db: AsyncSession, user: User) -> Dict[str, List[dict]]:
        stmt = (
            select(Application, Job, Company, JobSource)
            .join(Job, Application.job_id == Job.job_id)
            .outerjoin(Company, Job.company_id == Company.company_id)
            .outerjoin(JobSource, Job.source_id == JobSource.source_id)
            .where(Application.user_id == user.user_id)
            .order_by(Application.applied_at.desc())
        )
        res = await db.execute(stmt)
        rows = res.all()

        columns: Dict[str, List[dict]] = {
            "WISHLIST": [],
            "APPLIED": [],
            "INTERVIEWING": [],
            "OFFERED": [],
            "REJECTED": [],
        }

        for app, job, company, source in rows:
            card = {
                "app_id": str(app.app_id),
                "job_id": str(app.job_id),
                "title": job.title,
                "company_name": company.name if company else "Company",
                "source_name": source.source_name if source else "Portal",
                "source_url": job.source_url,
                "location": job.location,
                "status": app.status,
                "notes": app.notes,
                "interview_date": app.interview_date.isoformat() if app.interview_date else None,
                "applied_at": app.applied_at.isoformat(),
            }
            if app.status in ("PHONE_SCREEN", "TECH_INTERVIEW", "FINAL_ROUND"):
                columns["INTERVIEWING"].append(card)
            elif app.status in columns:
                columns[app.status].append(card)
            else:
                columns["WISHLIST"].append(card)

        return columns

    @staticmethod
    async def create_application(
        db: AsyncSession,
        user: User,
        job_id: str,
        app_status: str = "WISHLIST",
        notes: Optional[str] = None,
    ) -> dict:
        norm_status = app_status.upper()
        if norm_status == "INTERVIEWING":
            norm_status = "TECH_INTERVIEW"
        if norm_status not in VALID_STATUSES:
            norm_status = "WISHLIST"

        existing_res = await db.execute(
            select(Application).where(Application.user_id == user.user_id, Application.job_id == job_id)
        )
        existing = existing_res.scalar_one_or_none()
        if existing:
            existing.status = norm_status
            if notes:
                existing.notes = notes
            await db.commit()
            await db.refresh(existing)
            return {"app_id": str(existing.app_id), "status": existing.status}

        app = Application(
            user_id=user.user_id,
            job_id=job_id,
            status=norm_status,
            notes=notes,
        )
        db.add(app)
        await db.commit()
        await db.refresh(app)
        return {"app_id": str(app.app_id), "status": app.status}

    @staticmethod
    async def update_status(
        db: AsyncSession,
        user: User,
        app_id: str,
        new_status: Optional[str] = None,
        notes: Optional[str] = None,
        interview_date: Optional[str] = None,
    ) -> dict:
        res = await db.execute(
            select(Application).where(Application.app_id == app_id, Application.user_id == user.user_id)
        )
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        if new_status:
            norm = new_status.upper()
            if norm == "INTERVIEWING":
                norm = "TECH_INTERVIEW"
            if norm not in VALID_STATUSES:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status.")
            app.status = norm

        if notes is not None:
            app.notes = notes

        if interview_date:
            try:
                app.interview_date = datetime.fromisoformat(interview_date)
            except ValueError:
                pass

        await db.commit()
        await db.refresh(app)
        return {
            "app_id": str(app.app_id),
            "status": app.status,
            "notes": app.notes,
        }

    @staticmethod
    async def delete_application(db: AsyncSession, user: User, app_id: str) -> dict:
        res = await db.execute(
            select(Application).where(Application.app_id == app_id, Application.user_id == user.user_id)
        )
        app = res.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")
        await db.delete(app)
        await db.commit()
        return {"deleted": True, "app_id": app_id}
