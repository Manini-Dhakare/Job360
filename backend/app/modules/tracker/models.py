"""Job Application Tracker Models (Section 8.2: applications)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    app_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.job_id"), nullable=False, index=True)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.resume_id"), nullable=True, index=True)
    status = Column(
        Enum("WISHLIST", "APPLIED", "PHONE_SCREEN", "TECH_INTERVIEW", "FINAL_ROUND", "OFFERED", "REJECTED", name="app_status_enum"),
        default="WISHLIST",
        nullable=False,
        index=True,
    )
    kanban_order = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)
    interview_date = Column(DateTime, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow, nullable=False)
