"""Job Application Tracker Models (Section 8.2: applications)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text
from app.core.database import Base
from app.core.db_types import GUID


class Application(Base):
    __tablename__ = "applications"

    app_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=False, index=True)
    job_id = Column(GUID(), ForeignKey("jobs.job_id"), nullable=False, index=True)
    resume_id = Column(GUID(), ForeignKey("resumes.resume_id"), nullable=True, index=True)
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
