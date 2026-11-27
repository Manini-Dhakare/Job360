"""
Celery Distributed Task Queue & Beat Scheduler Configuration
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "job360_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_max_tasks_per_child=50,  # Worker recycling to free OS memory as per runbook
)

# Registered background task packages
celery_app.autodiscover_tasks([
    "app.workers",
])
