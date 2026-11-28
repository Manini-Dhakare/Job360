"""Cover Letter Models (Section 8.2: cover_letters)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from app.core.database import Base
from app.core.db_types import GUID


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    letter_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=False, index=True)
    job_id = Column(GUID(), nullable=False, index=True)
    resume_id = Column(GUID(), ForeignKey("resumes.resume_id"), nullable=False, index=True)
    letter_text = Column(Text, nullable=False)
    tone = Column(String(50), default="Professional", nullable=False)
    pdf_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
