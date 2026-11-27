"""Celery Resume Parsing Worker Task (Phase 2)"""
from app.core.celery_app import celery_app


@celery_app.task(name="tasks.parse_resume_document")
def parse_resume_document(resume_id: str, file_url: str):
    """Asynchronous worker task for layout-aware text extraction."""
    pass
