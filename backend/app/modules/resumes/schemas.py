"""Resume Schemas (Section 9.2)"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ParsedResumeResponse(BaseModel):
    resume_id: str
    contact_info: Dict[str, Any]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    skills: List[str]
    projects: List[Dict[str, Any]]
