"""Skill Assessments & Verified Badges Router (Developer Squad 4)"""
from typing import Dict, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.common.responses import standard_success_response
from app.core.security import get_current_user
from app.modules.auth.models import User

router = APIRouter()

QUIZ_BANK = [
    {
        "quiz_id": "python-backend",
        "title": "Python & FastAPI Backend",
        "skill": "Python / FastAPI",
        "questions": [
            {
                "id": "q1",
                "question": "Which HTTP status code should an async resume-parsing endpoint return when queuing a background Celery job?",
                "options": ["200 OK", "202 Accepted", "404 Not Found", "500 Internal Server Error"],
                "answer_index": 1,
            },
            {
                "id": "q2",
                "question": "In PostgreSQL, which clause prevents concurrent credit double-spending during a transaction?",
                "options": ["SELECT FOR UPDATE", "GROUP BY", "ORDER BY", "TRUNCATE"],
                "answer_index": 0,
            },
            {
                "id": "q3",
                "question": "Why does Job360 store an MD5 deduplication_hash on aggregated jobs?",
                "options": ["Encrypt passwords", "Merge identical job postings across portals", "Render PDFs", "Compress images"],
                "answer_index": 1,
            },
        ],
    },
    {
        "quiz_id": "react-nextjs",
        "title": "React & Next.js App Router",
        "skill": "React / Next.js",
        "questions": [
            {
                "id": "q1",
                "question": "Which directive is required at the top of a Next.js App Router file that uses useState or useEffect?",
                "options": ['"use server"', '"use client"', '"use strict"', '"use cache"'],
                "answer_index": 1,
            },
            {
                "id": "q2",
                "question": "Which library is used in Job360 for server-state caching and optimistic mutations?",
                "options": ["TanStack Query", "jQuery", "Lodash", "Moment.js"],
                "answer_index": 0,
            },
        ],
    },
]


class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: Dict[str, int]


@router.get("/quizzes")
async def list_quizzes(current_user: User = Depends(get_current_user)):
    """Return available skill assessment quizzes."""
    sanitized = []
    for q in QUIZ_BANK:
        sanitized.append(
            {
                "quiz_id": q["quiz_id"],
                "title": q["title"],
                "skill": q["skill"],
                "questions": [
                    {"id": item["id"], "question": item["question"], "options": item["options"]}
                    for item in q["questions"]
                ],
            }
        )
    return standard_success_response(sanitized)


@router.post("/submit")
async def submit_quiz(
    payload: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
):
    """Grade quiz submission and award Verified Skill Badge if score >= 60%."""
    quiz = next((q for q in QUIZ_BANK if q["quiz_id"] == payload.quiz_id), None)
    if not quiz:
        return standard_success_response({"score": 0, "passed": False})

    total = len(quiz["questions"])
    correct = sum(
        1 for item in quiz["questions"] if payload.answers.get(item["id"]) == item["answer_index"]
    )
    score = round((correct / total) * 100, 1) if total else 0.0
    passed = score >= 60.0
    return standard_success_response(
        {
            "quiz_id": quiz["quiz_id"],
            "skill": quiz["skill"],
            "correct": correct,
            "total": total,
            "score": score,
            "passed": passed,
            "badge": f"Verified: {quiz['skill']}" if passed else None,
        }
    )
