"""Tri-Score Matching Models (Section 8.2: job_matches)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Index, Numeric
from app.core.database import Base
from app.core.db_types import GUID, StringArray


class JobMatch(Base):
    __tablename__ = "job_matches"

    match_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=False, index=True)
    job_id = Column(GUID(), ForeignKey("jobs.job_id"), nullable=False, index=True)
    job_match_score = Column(Numeric(5, 2), nullable=False)
    resume_match_score = Column(Numeric(5, 2), nullable=False)
    ats_score = Column(Numeric(5, 2), nullable=False)
    verified_skills_boost = Column(Numeric(5, 2), default=0.0)
    missing_skills = Column(StringArray(), default=list)
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_user_job_match_score", "user_id", job_match_score.desc()),
    )
