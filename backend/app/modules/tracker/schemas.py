"""Tracker Schemas (Section 9.2)"""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class ApplicationStatusUpdateRequest(BaseModel):
    status: Literal["wishlist", "applied", "phone_screen", "tech_interview", "final_round", "offered", "rejected"]
    kanban_order: Optional[int] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
