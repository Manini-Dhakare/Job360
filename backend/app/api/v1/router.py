"""
Centralized API v1 Router Aggregator
Combines all domain module routers into a unified /api/v1 endpoint hierarchy.
Four development squads can contribute to their respective modules independently.
"""
from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.profiles.router import router as profiles_router
from app.modules.resumes.router import router as resumes_router
from app.modules.jobs.router import router as jobs_router
from app.modules.matching.router import router as matching_router
from app.modules.customizer.router import router as customizer_router
from app.modules.cover_letter.router import router as cover_letter_router
from app.modules.tracker.router import router as tracker_router
from app.modules.assessments.router import router as assessments_router
from app.modules.billing.router import router as billing_router
from app.modules.agent.router import router as agent_router
from app.modules.coaching.router import router as coaching_router
from app.modules.interview.router import router as interview_router
from app.modules.admin.router import router as admin_router

api_v1_router = APIRouter()

# Developer Squad 1: Identity, User Profiles & Monetization
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Module 1: Authentication"])
api_v1_router.include_router(profiles_router, prefix="/profiles", tags=["Module 2: Candidate Profiles"])
api_v1_router.include_router(billing_router, prefix="/billing", tags=["Module 5: Credits & Monetization"])

# Developer Squad 2: Resume Extraction, Customization & Cover Letters
api_v1_router.include_router(resumes_router, prefix="/resumes", tags=["Module 2: Resume Ingestion & Extraction"])
api_v1_router.include_router(customizer_router, prefix="/resumes", tags=["Module 4: Two-Panel Customizer"])
api_v1_router.include_router(cover_letter_router, prefix="/resumes", tags=["Module 10: Cover Letter Generator"])

# Developer Squad 3: Job Exploration, Aggregation, Autonomous Scout & Tracker
api_v1_router.include_router(jobs_router, prefix="/jobs", tags=["Module 3: Job Exploration & Search"])
api_v1_router.include_router(agent_router, prefix="/agent", tags=["Module 6: Autonomous Job Scout Agent"])
api_v1_router.include_router(tracker_router, prefix="/applications", tags=["Module 12: Kanban Job Tracker"])

# Developer Squad 4: PyTorch Matching, Skill Assessments, Coaching & Interviews
api_v1_router.include_router(matching_router, prefix="/matching", tags=["Module 3: PyTorch Tri-Score Matching"])
api_v1_router.include_router(assessments_router, prefix="/assessments", tags=["Module 11: Skill Assessments"])
api_v1_router.include_router(coaching_router, prefix="/coaching", tags=["Module 7: AI Career Coaching"])
api_v1_router.include_router(interview_router, prefix="/interview", tags=["Module 8: AI Mock Interview Studio"])

# Platform Governance
api_v1_router.include_router(admin_router, prefix="/admin", tags=["Module 9: Admin Governance"])
