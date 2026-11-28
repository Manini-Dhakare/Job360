"""Job Exploration & Aggregation Models (Section 8.2: companies, job_sources, jobs, saved_jobs)"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text
from app.core.database import Base
from app.core.db_types import GUID, VectorType


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    domain = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    industry = Column(String(100), nullable=True)
    size_range = Column(String(50), nullable=True)


class JobSource(Base):
    __tablename__ = "job_sources"

    source_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    source_name = Column(String(100), nullable=False)
    source_type = Column(Enum("API", "PARTNER", "FEED", "PROXY_SCRAPER", name="source_type_enum"), nullable=False)
    base_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    company_id = Column(GUID(), ForeignKey("companies.company_id"), nullable=True, index=True)
    source_id = Column(GUID(), ForeignKey("job_sources.source_id"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=True)
    is_remote = Column(Boolean, default=False)
    min_yoe = Column(Integer, default=0)
    salary_min = Column(Numeric(12, 2), nullable=True)
    salary_max = Column(Numeric(12, 2), nullable=True)
    source_url = Column(String(1000), nullable=False)
    embedding = Column(VectorType(1024), nullable=True)
    deduplication_hash = Column(String(32), unique=True, nullable=False, index=True)
    status = Column(Enum("ACTIVE", "CLOSED", name="job_status_enum"), default="ACTIVE", index=True)
    posted_at = Column(DateTime, default=datetime.utcnow, index=True)


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    saved_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=False, index=True)
    job_id = Column(GUID(), ForeignKey("jobs.job_id"), nullable=False, index=True)
    folder = Column(String(100), default="Default")
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_unique_user_saved_job", "user_id", "job_id", unique=True),
    )
