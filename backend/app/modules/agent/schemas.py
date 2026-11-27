"""Agent Schemas (Section 9.2)"""
from typing import List, Literal, Optional
from pydantic import BaseModel


class AgentConfigRequest(BaseModel):
    target_titles: List[str]
    locations: List[str]
    min_match_score: float = 80.0
    run_frequency: Literal["daily", "weekly"] = "daily"
    is_active: bool = True
