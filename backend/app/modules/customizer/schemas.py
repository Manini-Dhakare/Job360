"""Two-Panel Customizer Schemas (Strictly matching Section 9.3)"""
from typing import List
from pydantic import BaseModel, UUID4


class ResumeCustomizeRequest(BaseModel):
    resume_id: UUID4
    job_id: UUID4
    confirmed_missing_skills: List[str]
    target_bullet_ids: List[str]
    idempotency_key: str
