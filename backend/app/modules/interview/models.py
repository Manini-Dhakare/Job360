"""Mock Interview Models (Section 8.2: interview_questions)"""
import uuid
from sqlalchemy import Column, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.core.database import Base


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    q_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id"), nullable=True, index=True)
    role_category = Column(String(100), nullable=False, index=True)
    question_type = Column(
        Enum("BEHAVIORAL", "TECHNICAL", "CODING", name="interview_q_type_enum"),
        default="BEHAVIORAL",
        nullable=False,
    )
    question_text = Column(Text, nullable=False)
    star_answer = Column(JSONB, nullable=True)
    difficulty = Column(Enum("EASY", "MEDIUM", "HARD", name="interview_difficulty_enum"), default="MEDIUM")
