"""AI Mock Interview & Question Bank Router (Developer Squad 4)"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.responses import standard_success_response
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.modules.auth.models import User
from app.modules.interview.service import InterviewService

router = APIRouter()


class EvaluateAnswerRequest(BaseModel):
    question_text: str
    answer: str
    company_name: Optional[str] = None


@router.get("/questions")
async def get_interview_questions(
    company: Optional[str] = Query(default=None),
    question_type: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve company-specific or overall interview questions with STAR model answers."""
    data = await InterviewService.list_questions(db, company=company, question_type=question_type)
    return standard_success_response(data)


@router.post("/evaluate-answer")
async def evaluate_interview_answer(
    payload: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Evaluate candidate practice answer using RAG (resume context + STAR rubric)."""
    data = await InterviewService.evaluate_answer_with_rag(
        db, current_user, payload.question_text, payload.answer, payload.company_name
    )
    return standard_success_response(data)
