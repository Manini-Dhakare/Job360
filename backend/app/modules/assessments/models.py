"""Skill Assessment Models (Section 8.2: skill_assessments, assessment_questions)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from app.core.database import Base
from app.core.db_types import GUID, JSONType


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    assessment_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=False, index=True)
    skill_id = Column(GUID(), ForeignKey("skills.skill_id"), nullable=False, index=True)
    score = Column(Numeric(5, 2), nullable=True)
    status = Column(Enum("IN_PROGRESS", "PASSED", "FAILED", name="assessment_status_enum"), default="IN_PROGRESS", nullable=False)
    completed_at = Column(DateTime, nullable=True)


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    q_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    skill_id = Column(GUID(), ForeignKey("skills.skill_id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSONType(), nullable=False)
    correct_option = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(Enum("EASY", "MEDIUM", "HARD", name="difficulty_level_enum"), default="MEDIUM")
