"""AI Coaching & Roadmap Models (Section 8.2: coaching_sessions)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, Text, UUID
from app.core.database import Base


class CoachingSession(Base):
    __tablename__ = "coaching_sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    topic = Column(
        Enum("CAREER_PATH", "RESUME_CRITIQUE", "INTERVIEW_PREP", "LEARNING_ROADMAP", name="coaching_topic_enum"),
        default="CAREER_PATH",
        nullable=False,
    )
    messages = Column(JSONB, default=list)
    action_items = Column(ARRAY(Text), default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
