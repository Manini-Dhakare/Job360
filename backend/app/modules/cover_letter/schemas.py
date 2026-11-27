"""Cover Letter Schemas"""
from pydantic import BaseModel, UUID4


class CoverLetterGenerateRequest(BaseModel):
    resume_id: UUID4
    job_id: UUID4
    tone: str = "Professional"
