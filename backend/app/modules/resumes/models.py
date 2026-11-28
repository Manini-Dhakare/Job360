"""Resume Models (Section 8.2: resumes, resume_analyses)"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from app.core.database import Base
from app.core.db_types import GUID, JSONType


class Resume(Base):
    __tablename__ = "resumes"

    resume_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    profile_id = Column(GUID(), ForeignKey("profiles.profile_id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSONType(), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    analysis_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    resume_id = Column(GUID(), ForeignKey("resumes.resume_id"), nullable=False, index=True)
    job_id = Column(GUID(), nullable=False, index=True)
    score_breakdown = Column(JSONType(), nullable=False)
    bullet_feedback = Column(JSONType(), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
