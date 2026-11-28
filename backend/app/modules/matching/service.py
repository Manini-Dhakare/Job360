"""AI Job Matching & Tri-Score Engine (Module 4 - PDF Section 10.3)"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.embeddings import embedding_engine
from app.modules.auth.models import User
from app.modules.jobs.models import Company, Job
from app.modules.matching.models import JobMatch
from app.modules.profiles.models import Profile
from app.modules.resumes.models import Resume
from app.modules.resumes.service import extract_skills_from_text


def compute_job_scores(
    job_title: str,
    job_description: str,
    job_location: Optional[str],
    job_is_remote: bool,
    job_min_yoe: int,
    profile: Optional[Profile],
    resume: Optional[Resume],
) -> Dict[str, Any]:
    """Compute Job Match, Resume Match, Best Match, and ATS Compatibility scores."""
    jd_skills = extract_skills_from_text(f"{job_title}\n{job_description}")
    resume_json = (resume.parsed_json or {}) if resume else {}
    candidate_skills: List[str] = resume_json.get("skills", [])
    candidate_set = {s.lower() for s in candidate_skills}

    if jd_skills:
        matched = [s for s in jd_skills if s.lower() in candidate_set]
        missing = [s for s in jd_skills if s.lower() not in candidate_set]
        s_skills = (len(matched) / len(jd_skills)) * 100.0
    else:
        matched = candidate_skills[:5]
        missing = []
        s_skills = 75.0 if candidate_skills else 50.0

    # Experience fit (S_yoe)
    cand_yoe = float(profile.yoe) if profile and profile.yoe is not None else 1.0
    req_yoe = max(0, job_min_yoe or 0)
    if req_yoe == 0 or cand_yoe >= req_yoe:
        s_yoe = 100.0
    else:
        s_yoe = max(35.0, (cand_yoe / req_yoe) * 100.0)

    # Education & Location fit (S_edu, S_loc)
    s_edu = 90.0 if resume else 70.0
    if job_is_remote and (not profile or profile.remote_pref == "REMOTE"):
        s_loc = 100.0
    elif profile and profile.location and job_location:
        loc_overlap = any(
            part.strip().lower() in job_location.lower()
            for part in profile.location.split("/")
            if part.strip()
        )
        s_loc = 100.0 if loc_overlap else 72.0
    else:
        s_loc = 80.0

    # Role & semantic similarity via PyTorch Bi-Encoder (PDF Section 10.3: CosSim(V_res, V_jd))
    resume_text = (resume.raw_text or " ".join(candidate_skills)) if resume else ""
    semantic_sim = embedding_engine.semantic_similarity(
        resume_text,
        f"{job_title}\n{job_description}",
    )
    cos_sim_pct = semantic_sim * 100.0

    job_match_score = round(
        min(99.0, 0.40 * s_skills + 0.30 * s_yoe + 0.15 * s_edu + 0.15 * s_loc),
        1,
    )
    resume_match_score = round(
        min(99.0, 0.60 * cos_sim_pct + 0.40 * s_skills),
        1,
    )
    best_match_score = round(0.55 * job_match_score + 0.45 * resume_match_score, 1)

    base_ats = float(resume_json.get("ats", {}).get("ats_score", 62.0)) if resume else 50.0
    ats_score = round(min(99.0, 0.55 * base_ats + 0.45 * s_skills), 1)

    return {
        "best_match_score": best_match_score,
        "job_match_score": job_match_score,
        "resume_match_score": resume_match_score,
        "ats_score": ats_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "breakdown": {
            "skills_score": round(s_skills, 1),
            "experience_score": round(s_yoe, 1),
            "education_score": round(s_edu, 1),
            "location_score": round(s_loc, 1),
        },
    }


class MatchingService:
    """Service layer for Tri-Score & ATS Match calculation."""

    @staticmethod
    async def get_candidate_context(db: AsyncSession, user: User):
        prof_res = await db.execute(select(Profile).where(Profile.user_id == user.user_id))
        profile = prof_res.scalar_one_or_none()
        resume = None
        if profile:
            res_q = await db.execute(
                select(Resume)
                .where(Resume.profile_id == profile.profile_id)
                .order_by(Resume.is_primary.desc(), Resume.created_at.desc())
            )
            resume = res_q.scalars().first()
        return profile, resume

    @staticmethod
    async def calculate_for_job(db: AsyncSession, user: User, job_id: str) -> dict:
        job_res = await db.execute(select(Job).where(Job.job_id == job_id))
        job = job_res.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

        profile, resume = await MatchingService.get_candidate_context(db, user)
        scores = compute_job_scores(
            job_title=job.title,
            job_description=job.description,
            job_location=job.location,
            job_is_remote=bool(job.is_remote),
            job_min_yoe=job.min_yoe or 0,
            profile=profile,
            resume=resume,
        )

        # Persist/update JobMatch record
        existing_res = await db.execute(
            select(JobMatch).where(JobMatch.user_id == user.user_id, JobMatch.job_id == job.job_id)
        )
        match_row = existing_res.scalar_one_or_none()
        if not match_row:
            match_row = JobMatch(
                user_id=user.user_id,
                job_id=job.job_id,
                job_match_score=scores["job_match_score"],
                resume_match_score=scores["resume_match_score"],
                ats_score=scores["ats_score"],
                missing_skills=scores["missing_skills"],
            )
            db.add(match_row)
        else:
            match_row.job_match_score = scores["job_match_score"]
            match_row.resume_match_score = scores["resume_match_score"]
            match_row.ats_score = scores["ats_score"]
            match_row.missing_skills = scores["missing_skills"]
        await db.commit()

        return {
            "job_id": str(job.job_id),
            "has_resume": resume is not None,
            **scores,
        }

    @staticmethod
    async def get_recommended_jobs(db: AsyncSession, user: User, limit: int = 10) -> List[dict]:
        profile, resume = await MatchingService.get_candidate_context(db, user)
        res = await db.execute(
            select(Job, Company)
            .outerjoin(Company, Job.company_id == Company.company_id)
            .where(Job.status == "ACTIVE")
            .limit(100)
        )
        rows = res.all()
        scored = []
        for job, company in rows:
            s = compute_job_scores(
                job.title,
                job.description,
                job.location,
                bool(job.is_remote),
                job.min_yoe or 0,
                profile,
                resume,
            )
            scored.append(
                {
                    "job_id": str(job.job_id),
                    "title": job.title,
                    "company_name": company.name if company else "Company",
                    "location": job.location,
                    "is_remote": bool(job.is_remote),
                    "source_url": job.source_url,
                    **s,
                }
            )
        scored.sort(key=lambda x: x["best_match_score"], reverse=True)
        return scored[:limit]
