"""Coaching Schemas (Section 9.2)"""
from typing import Optional
from pydantic import BaseModel, UUID4


class CoachingChatRequest(BaseModel):
    session_id: Optional[UUID4] = None
    message: str
