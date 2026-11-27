"""Skills Taxonomy & Association Models (Section 8.2: skills, profile_skills, job_skills)"""
import uuid
from sqlalchemy import Boolean, Column, Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import ARRAY, Text, UUID
from app.core.database import Base


class Skill(Base):
    __tablename__ = "skills"

    skill_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(Enum("HARD", "SOFT", "TOOL", "CERT", name="skill_category_enum"), nullable=False)
    synonyms = Column(ARRAY(Text), default=list)

    __table_args__ = (
        Index("idx_skills_synonyms", synonyms, postgresql_using="gin"),
    )


class ProfileSkill(Base):
    __tablename__ = "profile_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.profile_id"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.skill_id"), nullable=False, index=True)
    proficiency = Column(Enum("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", name="proficiency_enum"), default="INTERMEDIATE")
    verified = Column(Boolean, default=False, nullable=False, index=True)


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.job_id"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.skill_id"), nullable=False, index=True)
    is_required = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        Index("idx_unique_job_skill", "job_id", "skill_id", unique=True),
    )
