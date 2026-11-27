"""Celery 3-Tier Job Ingestion Worker Tasks (Phase 3)"""
from app.core.celery_app import celery_app


@celery_app.task(name="tasks.ingest_external_job_feeds")
def ingest_external_job_feeds(source_name: str):
    """Scheduled task to query external APIs and proxy crawlers with rate limits."""
    pass
