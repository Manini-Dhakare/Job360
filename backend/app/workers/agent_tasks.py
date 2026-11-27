"""Celery Beat Autonomous Scout Cron Tasks (Phase 7)"""
from app.core.celery_app import celery_app


@celery_app.task(name="tasks.run_autonomous_job_scout")
def run_autonomous_job_scout():
    """Daily cron worker (06:00 UTC) matching candidate profiles against new jobs."""
    pass
