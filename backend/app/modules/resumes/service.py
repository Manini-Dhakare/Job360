"""Resume Parsing & Normalization Service (Module 2)"""
import io
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List

import fitz  # PyMuPDF
from docx import Document
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.profiles.models import Profile
from app.modules.resumes.models import Resume

MAX_RESUME_BYTES = 10 * 1024 * 1024  # 10 MB

# Canonical skill catalog used for deterministic skill extraction & matching
CANONICAL_SKILLS: List[str] = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "SQL",
    "React", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "pgvector", "Elasticsearch",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "CI/CD", "GitHub Actions",
    "Git", "REST API", "GraphQL", "Microservices", "Kafka", "RabbitMQ", "Celery",
    "PyTorch", "TensorFlow", "Scikit-learn", "LangChain", "OpenAI", "LLM", "NLP",
    "Tailwind CSS", "HTML", "CSS", "Linux", "Agile", "Scrum", "System Design",
    "Unit Testing", "Pytest", "Playwright", "Data Structures", "Algorithms",
]

SKILL_ALIASES: Dict[str, str] = {
    "reactjs": "React",
    "react.js": "React",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "k8s": "Kubernetes",
    "restful": "REST API",
    "rest apis": "REST API",
    "tailwind": "Tailwind CSS",
    "ci/cd": "CI/CD",
    "ml": "PyTorch",
}


def extract_skills_from_text(text: str) -> List[str]:
    """Deterministically extract canonical skills from text."""
    lower = text.lower()
    found: List[str] = []

    for alias, canonical in SKILL_ALIASES.items():
        if re.search(rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])", lower):
            if canonical not in found:
                found.append(canonical)

    for skill in CANONICAL_SKILLS:
        pattern = rf"(?<![a-z0-9]){re.escape(skill.lower())}(?![a-z0-9])"
        if re.search(pattern, lower) and skill not in found:
            found.append(skill)

    return found


def compute_ats_structure_score(text: str) -> Dict[str, Any]:
    """Compute structural ATS readiness score (PDF Section 10.3: S_ats)."""
    lower = text.lower()
    has_experience = any(h in lower for h in ["experience", "work history", "employment"])
    has_education = any(h in lower for h in ["education", "university", "b.tech", "bachelor", "master"])
    has_skills = "skills" in lower
    has_email = bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))

    heading_score = (sum([has_experience, has_education, has_skills, has_email]) / 4.0) * 100.0
    chron_score = 90.0 if re.search(r"\b(20\d{2}|19\d{2})\b", text) else 55.0
    word_count = len(text.split())
    density_score = 95.0 if 180 <= word_count <= 1100 else (70.0 if word_count > 80 else 45.0)
    font_score = 92.0 if word_count > 50 else 50.0

    s_ats = round(
        0.35 * heading_score + 0.25 * chron_score + 0.20 * font_score + 0.20 * density_score,
        1,
    )
    return {
        "ats_score": s_ats,
        "word_count": word_count,
        "checks": {
            "standard_headings": has_experience and has_education,
            "skills_section": has_skills,
            "contact_email": has_email,
            "chronology_dates": chron_score >= 80,
        },
    }


def parse_resume_bytes(filename: str, content: bytes) -> Dict[str, Any]:
    """Extract raw text, skills, and ATS metrics from PDF or DOCX bytes."""
    ext = Path(filename).suffix.lower()
    raw_text = ""

    if ext == ".pdf":
        doc = fitz.open(stream=content, filetype="pdf")
        pages = [page.get_text("text", flags=fitz.TEXTFLAGS_SEARCH) for page in doc]
        raw_text = "\n".join(pages).strip()
    elif ext == ".docx":
        doc = Document(io.BytesIO(content))
        raw_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a PDF or DOCX resume.",
        )

    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract text from this file. Please upload a text-based PDF or DOCX.",
        )

    skills = extract_skills_from_text(raw_text)
    ats = compute_ats_structure_score(raw_text)
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    bullets = [line.lstrip("•-* ").strip() for line in lines if line.startswith(("•", "-", "*"))][:20]

    return {
        "raw_text": raw_text,
        "parsed_json": {
            "skills": skills,
            "bullets": bullets,
            "ats": ats,
            "preview_lines": lines[:25],
        },
    }


class ResumeService:
    """Service layer for resume ingestion and management."""

    @staticmethod
    async def upload_and_parse(db: AsyncSession, user: User, file: UploadFile) -> dict:
        content = await file.read()
        if len(content) > MAX_RESUME_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Resume file must be under 10 MB.",
            )

        filename = file.filename or "resume.pdf"
        parsed = parse_resume_bytes(filename, content)

        prof_res = await db.execute(select(Profile).where(Profile.user_id == user.user_id))
        profile = prof_res.scalar_one_or_none()
        if not profile:
            profile = Profile(user_id=user.user_id, headline=user.email.split("@")[0])
            db.add(profile)
            await db.flush()

        existing_res = await db.execute(select(Resume).where(Resume.profile_id == profile.profile_id))
        has_existing = existing_res.scalars().first() is not None

        upload_dir = Path("uploads") / str(user.user_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        stored_name = f"{uuid.uuid4().hex}_{Path(filename).name}"
        file_path = upload_dir / stored_name
        file_path.write_bytes(content)

        resume = Resume(
            profile_id=profile.profile_id,
            title=Path(filename).stem,
            file_url=str(file_path),
            raw_text=parsed["raw_text"],
            parsed_json=parsed["parsed_json"],
            is_primary=not has_existing,
        )
        db.add(resume)
        await db.commit()
        await db.refresh(resume)

        return {
            "resume_id": str(resume.resume_id),
            "title": resume.title,
            "is_primary": resume.is_primary,
            "parsed_json": resume.parsed_json,
            "created_at": resume.created_at.isoformat(),
        }

    @staticmethod
    async def list_resumes(db: AsyncSession, user: User) -> List[dict]:
        prof_res = await db.execute(select(Profile).where(Profile.user_id == user.user_id))
        profile = prof_res.scalar_one_or_none()
        if not profile:
            return []

        res = await db.execute(
            select(Resume)
            .where(Resume.profile_id == profile.profile_id)
            .order_by(Resume.created_at.desc())
        )
        resumes = res.scalars().all()
        return [
            {
                "resume_id": str(r.resume_id),
                "title": r.title,
                "is_primary": r.is_primary,
                "parsed_json": r.parsed_json or {},
                "created_at": r.created_at.isoformat(),
            }
            for r in resumes
        ]

    @staticmethod
    async def set_primary(db: AsyncSession, user: User, resume_id: str) -> dict:
        prof_res = await db.execute(select(Profile).where(Profile.user_id == user.user_id))
        profile = prof_res.scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

        await db.execute(
            update(Resume)
            .where(Resume.profile_id == profile.profile_id)
            .values(is_primary=False)
        )
        res = await db.execute(
            select(Resume).where(Resume.resume_id == resume_id, Resume.profile_id == profile.profile_id)
        )
        resume = res.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
        resume.is_primary = True
        await db.commit()
        return {"resume_id": str(resume.resume_id), "is_primary": True}
