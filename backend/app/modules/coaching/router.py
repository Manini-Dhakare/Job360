"""AI Career Coaching Router (Developer Squad 4)"""
import os
import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.matching.service import MatchingService

router = APIRouter()


class CoachingChatRequest(BaseModel):
    topic: str = "Career Strategy"
    message: str


@router.post("/chat")
async def coaching_chat(
    payload: CoachingChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Provide grounded AI career coaching using candidate profile & resume context."""
    profile, resume = await MatchingService.get_candidate_context(db, current_user)
    skills = (resume.parsed_json or {}).get("skills", []) if resume else []
    target_role = profile.target_role if profile and profile.target_role else "Software Engineer"

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        try:
            prompt = (
                f"You are Job360's AI Career Coach.\n"
                f"Candidate Target Role: {target_role}\n"
                f"Verified Skills: {', '.join(skills[:12]) or 'Not uploaded yet'}\n"
                f"Topic: {payload.topic}\n"
                f"User Question: {payload.message}\n\n"
                "Give practical, concise, actionable career advice in 3-4 bullet points."
            )
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 280,
                        "temperature": 0.4,
                    },
                )
                if resp.status_code == 200:
                    reply = resp.json()["choices"][0]["message"]["content"].strip()
                    return standard_success_response({"reply": reply, "provider": "groq-free"})
        except Exception:
            pass

    skills_note = f"Your verified skills ({', '.join(skills[:6])}) give you a solid foundation." if skills else "Upload your resume in Resume Studio first so I can tailor advice to your exact skills."
    reply = (
        f"**{payload.topic} Plan for {target_role}:**\n"
        f"• {skills_note}\n"
        f"• Focus on jobs in Explore where your **Best Match >= 75%** and close missing ATS keywords before applying.\n"
        f"• Log each application in **Application Tracker** and review company-specific STAR questions in **Mock Interview Studio**.\n"
        f"• Note: For executive salary negotiation or specialized transitions, consider consulting a certified human career coach."
    )
    return standard_success_response({"reply": reply, "provider": "grounded-local"})
