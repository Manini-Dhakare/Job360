"""Customized Resumes Model (Section 8.2: customized_resumes)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from app.core.database import Base
from app.core.db_types import GUID, JSONType, StringArray


class CustomizedResume(Base):
    __tablename__ = "customized_resumes"

    cust_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    resume_id = Column(GUID(), ForeignKey("resumes.resume_id"), nullable=False, index=True)
    job_id = Column(GUID(), nullable=False, index=True)
    customized_bullets = Column(JSONType(), nullable=False)
    added_skills = Column(StringArray(), default=list)
    pdf_url = Column(String(500), nullable=True)
    docx_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
