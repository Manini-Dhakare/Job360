"""AI Coaching & Roadmap Models (Section 8.2: coaching_sessions)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, ForeignKey
from app.core.database import Base
from app.core.db_types import GUID, JSONType, StringArray


class CoachingSession(Base):
    __tablename__ = "coaching_sessions"

    session_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=False, index=True)
    topic = Column(
        Enum("CAREER_PATH", "RESUME_CRITIQUE", "INTERVIEW_PREP", "LEARNING_ROADMAP", name="coaching_topic_enum"),
        default="CAREER_PATH",
        nullable=False,
    )
    messages = Column(JSONType(), default=list)
    action_items = Column(StringArray(), default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
