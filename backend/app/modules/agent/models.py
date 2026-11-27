"""Autonomous Job Hunter Agent Models (Section 8.2: agent_configurations)"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY, Text, UUID
from app.core.database import Base


class AgentConfiguration(Base):
    __tablename__ = "agent_configurations"

    agent_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), unique=True, nullable=False, index=True)
    target_titles = Column(ARRAY(Text), default=list)
    locations = Column(ARRAY(Text), default=list)
    min_match_score = Column(Numeric(5, 2), default=80.0, nullable=False)
    run_frequency = Column(Enum("DAILY", "WEEKLY", name="agent_run_freq_enum"), default="DAILY", nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    last_run_at = Column(DateTime, nullable=True, index=True)
