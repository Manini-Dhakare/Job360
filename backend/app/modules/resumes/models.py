"""Resume Models (Section 8.2: resumes, resume_analyses)"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    resume_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.profile_id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSONB, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_resumes_parsed_json", parsed_json, postgresql_using="gin"),
    )


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    analysis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.resume_id"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    score_breakdown = Column(JSONB, nullable=False)
    bullet_feedback = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
