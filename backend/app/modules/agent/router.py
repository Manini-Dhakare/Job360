"""Autonomous AI Job-Hunter Agent Router (Developer Squad 3)"""
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.agent.models import AgentConfiguration
from app.modules.auth.models import User
from app.modules.jobs.service import JobService

router = APIRouter()


class AgentConfigPayload(BaseModel):
    target_titles: List[str] = ["Software Engineer"]
    locations: List[str] = ["Remote"]
    min_match_score: float = 70.0
    run_frequency: str = "DAILY"
    is_active: bool = True


@router.get("/config")
async def get_agent_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve candidate's Autonomous Job-Hunter Agent settings."""
    res = await db.execute(
        select(AgentConfiguration).where(AgentConfiguration.user_id == current_user.user_id)
    )
    cfg = res.scalar_one_or_none()
    if not cfg:
        return standard_success_response(
            {
                "target_titles": ["Software Engineer"],
                "locations": ["Remote"],
                "min_match_score": 70.0,
                "run_frequency": "DAILY",
                "is_active": True,
                "last_run_at": None,
            }
        )
    return standard_success_response(
        {
            "target_titles": cfg.target_titles or [],
            "locations": cfg.locations or [],
            "min_match_score": float(cfg.min_match_score),
            "run_frequency": cfg.run_frequency,
            "is_active": bool(cfg.is_active),
            "last_run_at": cfg.last_run_at.isoformat() if cfg.last_run_at else None,
        }
    )


@router.put("/config")
async def update_agent_config(
    payload: AgentConfigPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Save Autonomous Job-Hunter Agent settings."""
    res = await db.execute(
        select(AgentConfiguration).where(AgentConfiguration.user_id == current_user.user_id)
    )
    cfg = res.scalar_one_or_none()
    freq = payload.run_frequency.upper()
    if freq not in ("DAILY", "WEEKLY"):
        freq = "DAILY"

    if not cfg:
        cfg = AgentConfiguration(
            user_id=current_user.user_id,
            target_titles=payload.target_titles,
            locations=payload.locations,
            min_match_score=payload.min_match_score,
            run_frequency=freq,
            is_active=payload.is_active,
        )
        db.add(cfg)
    else:
        cfg.target_titles = payload.target_titles
        cfg.locations = payload.locations
        cfg.min_match_score = payload.min_match_score
        cfg.run_frequency = freq
        cfg.is_active = payload.is_active

    await db.commit()
    return standard_success_response({"updated": True})


@router.post("/run-now")
async def run_agent_now(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Run an immediate Job-Hunter scan against aggregated portals."""
    res = await db.execute(
        select(AgentConfiguration).where(AgentConfiguration.user_id == current_user.user_id)
    )
    cfg = res.scalar_one_or_none()
    min_score = float(cfg.min_match_score) if cfg else 65.0
    query = cfg.target_titles[0] if cfg and cfg.target_titles else None

    if cfg:
        cfg.last_run_at = datetime.utcnow()
        await db.commit()

    jobs = await JobService.search_jobs(
        db=db,
        user=current_user,
        query=query,
        min_score=min_score,
        sort_by="best_match",
    )
    return standard_success_response({"discoveries": jobs[:10], "count": len(jobs)})
