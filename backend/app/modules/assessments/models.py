"""Skill Assessment Models (Section 8.2: skill_assessments, assessment_questions)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.core.database import Base


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    assessment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.skill_id"), nullable=False, index=True)
    score = Column(Numeric(5, 2), nullable=True)
    status = Column(Enum("IN_PROGRESS", "PASSED", "FAILED", name="assessment_status_enum"), default="IN_PROGRESS", nullable=False)
    completed_at = Column(DateTime, nullable=True)


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    q_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.skill_id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False)
    correct_option = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(Enum("EASY", "MEDIUM", "HARD", name="difficulty_level_enum"), default="MEDIUM")
