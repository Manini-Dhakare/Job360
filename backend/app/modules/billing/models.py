"""Billing & Credits Models (Section 8.2: credits, credit_transactions, subscriptions)"""
import uuid
from datetime import datetime
from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Credit(Base):
    __tablename__ = "credits"

    credit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), unique=True, nullable=False, index=True)
    balance = Column(Integer, default=5, nullable=False)
    lifetime_granted = Column(Integer, default=5, nullable=False)
    lifetime_consumed = Column(Integer, default=0, nullable=False)
    last_refill_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("balance >= 0", name="check_positive_credit_balance"),
    )


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    tx_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    tx_type = Column(Enum("REFILL", "CONSUME", "REFUND", "BONUS", name="credit_tx_type_enum"), nullable=False)
    reason = Column(String(255), nullable=False)
    idempotency_key = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Subscription(Base):
    __tablename__ = "subscriptions"

    sub_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    stripe_customer_id = Column(String(255), unique=True, nullable=False)
    stripe_subscription_id = Column(String(255), nullable=True)
    tier = Column(Enum("FREE", "PRO", "UNLIMITED", name="subscription_tier_enum"), default="FREE", nullable=False)
    status = Column(Enum("ACTIVE", "PAST_DUE", "CANCELED", name="subscription_status_enum"), default="ACTIVE", nullable=False)
    current_period_end = Column(DateTime, nullable=True)
