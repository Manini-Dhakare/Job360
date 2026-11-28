"""Audit Logs Model (Section 8.2 & Phase 1)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from app.core.database import Base
from app.core.db_types import GUID, JSONType


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.user_id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details = Column(JSONType(), default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
