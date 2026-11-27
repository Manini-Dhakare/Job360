"""Interview Schemas (Section 9.2)"""
from typing import Optional
from pydantic import BaseModel, UUID4


class InterviewEvaluateRequest(BaseModel):
    question_id: UUID4
    answer_text: str
