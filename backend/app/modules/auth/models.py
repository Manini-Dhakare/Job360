"""Auth & User Entity Models (Section 8.2: users table)"""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, String
from app.core.database import Base
from app.core.db_types import GUID


class User(Base):
    __tablename__ = "users"

    user_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("CANDIDATE", "ADMIN", name="user_role_enum"), default="CANDIDATE", nullable=False)
    status = Column(Enum("ACTIVE", "INACTIVE", "BANNED", name="user_status_enum"), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
