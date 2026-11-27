"""Customized Resumes Model (Section 8.2: customized_resumes)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, Text, UUID
from app.core.database import Base


class CustomizedResume(Base):
    __tablename__ = "customized_resumes"

    cust_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.resume_id"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customized_bullets = Column(JSONB, nullable=False)
    added_skills = Column(ARRAY(Text), default=list)
    pdf_url = Column(String(500), nullable=True)
    docx_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
