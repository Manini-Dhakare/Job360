"""Celery Vector Embeddings & Matching Worker Tasks (Phase 4)"""
from app.core.celery_app import celery_app


@celery_app.task(name="tasks.generate_job_embeddings_batch")
def generate_job_embeddings_batch(job_ids: list):
    """Batch dense vector embedding generation with torch.no_grad()."""
    pass
