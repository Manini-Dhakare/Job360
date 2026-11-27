"""Profiles Domain Schemas"""
from typing import List, Optional
from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    target_role: Optional[str] = None
    yoe: Optional[float] = None
    location: Optional[str] = None
    remote_pref: Optional[str] = None


class ProfileSkillAddRequest(BaseModel):
    skill_names: List[str]
