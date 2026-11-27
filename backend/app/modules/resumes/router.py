"""Resume Ingestion & Parsing Router (Developer Squad 2)"""
from fastapi import APIRouter

router = APIRouter()

@router.post("/upload")
async def upload_resume():
    """Upload PDF/DOCX resume and queue Celery parsing worker (202 Accepted)."""
    return {"message": "Endpoint stub - ready for implementation"}

@router.get("/{resume_id}/parsed")
async def get_parsed_resume(resume_id: str):
    """Fetch structured JSON extraction (skills, edu, exp, proj) for a resume."""
    return {"message": "Endpoint stub - ready for implementation"}
