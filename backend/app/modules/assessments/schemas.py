"""Assessments Schemas (Section 9.2)"""
from typing import Any, Dict, List
from pydantic import BaseModel


class AssessmentSubmitRequest(BaseModel):
    answers: List[Dict[str, Any]]
