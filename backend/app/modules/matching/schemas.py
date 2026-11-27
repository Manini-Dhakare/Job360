"""Matching Schemas (Section 9.2)"""
from typing import List, Optional
from pydantic import BaseModel, UUID4


class MatchCalculateRequest(BaseModel):
    resume_id: UUID4
    job_id: UUID4


class TriScoreResponse(BaseModel):
    job_match_score: float
    resume_match_score: float
    ats_score: float
    missing_skills: List[str]
    score_breakdown: dict
