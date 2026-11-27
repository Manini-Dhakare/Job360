"""Candidate Profile Models (Section 8.2: profiles, education, experience, projects)"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    profile_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), unique=True, nullable=False, index=True)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    target_role = Column(String(100), nullable=True, index=True)
    yoe = Column(Numeric(4, 1), nullable=True)
    location = Column(String(100), nullable=True, index=True)
    remote_pref = Column(Enum("REMOTE", "HYBRID", "ONSITE", name="remote_pref_enum"), default="REMOTE")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Education(Base):
    __tablename__ = "education"

    edu_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.profile_id"), nullable=False, index=True)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=True)
    field_of_study = Column(String(255), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    gpa = Column(Numeric(3, 2), nullable=True)


class Experience(Base):
    __tablename__ = "experience"

    exp_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.profile_id"), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=False)
    bullets = Column(JSONB, default=list)


class Project(Base):
    __tablename__ = "projects"

    proj_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.profile_id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(ARRAY(Text), default=list)
    repo_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
