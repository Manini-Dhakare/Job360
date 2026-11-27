"""Admin Schemas (Section 9.2)"""
from pydantic import BaseModel, UUID4


class AdminCreditGrantRequest(BaseModel):
    user_id: UUID4
    amount: int
    reason: str = "Administrative grant"
