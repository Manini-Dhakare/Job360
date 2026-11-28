"""
Free-Tier Retrieval-Augmented Generation (RAG) Engine for Interview Prep & Coaching.
Retrieves candidate resume context + company/role questions using PyTorch embeddings,
and optionally generates grounded feedback via free-tier LLM APIs (Groq / Ollama) or local rubric.
"""
import os
from typing import Any, Dict, List, Optional

import httpx

from app.ai.embeddings import embedding_engine


class InterviewRAGEngine:
    """RAG pipeline retrieving resume & company context for grounded STAR feedback."""

    @staticmethod
    def retrieve_relevant_resume_context(
        question_text: str,
        resume_bullets: List[str],
        resume_skills: List[str],
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """Rank candidate's own resume bullets by semantic similarity to the interview question."""
        scored_bullets = []
        for bullet in resume_bullets:
            sim = embedding_engine.semantic_similarity(question_text, bullet)
            scored_bullets.append((sim, bullet))
        scored_bullets.sort(key=lambda x: x[0], reverse=True)

        relevant_skills = [
            s for s in resume_skills if s.lower() in question_text.lower()
        ]
        return {
            "top_bullets": [b for _, b in scored_bullets[:top_k]],
            "relevant_skills": relevant_skills[:6],
            "engine": "pytorch" if embedding_engine.is_neural else "lexical-fallback",
        }

    @staticmethod
    async def generate_rag_feedback(
        question_text: str,
        candidate_answer: str,
        company_name: Optional[str],
        resume_context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Evaluate answer using retrieved resume context + free-tier LLM (Groq/Ollama) or deterministic STAR."""
        text = candidate_answer.strip()
        words = len(text.split())
        lower = text.lower()

        has_situation = any(w in lower for w in ("when", "during", "project", "team", "context", "situation"))
        has_action = any(w in lower for w in ("built", "designed", "implemented", "led", "created", "fixed", "i "))
        has_result = any(w in lower for w in ("%", "reduced", "improved", "increased", "result", "achieved", "latency", "saved"))

        score = 40
        if words >= 25:
            score += 20
        if has_situation:
            score += 12
        if has_action:
            score += 14
        if has_result:
            score += 14
        score = min(98, score)

        feedback: List[str] = []
        if words < 25:
            feedback.append("Add more detail (aim for 40–100 words covering context and actions).")
        if not has_situation:
            feedback.append("Clarify the Situation/Task at the start so the interviewer understands the stakes.")
        if not has_action:
            feedback.append("Highlight your specific individual Actions ('I designed...', 'I implemented...').")
        if not has_result:
            feedback.append("Quantify the Result (e.g., latency reduced by X%, uptime improved, bugs eliminated).")

        # Free-tier Groq LLM enhancement if GROQ_API_KEY is configured
        groq_key = os.getenv("GROQ_API_KEY", "").strip()
        llm_advice: Optional[str] = None
        if groq_key:
            try:
                context_str = "\n".join(resume_context.get("top_bullets", []))
                prompt = (
                    f"Company: {company_name or 'General'}\n"
                    f"Question: {question_text}\n"
                    f"Candidate Resume Context:\n{context_str}\n\n"
                    f"Candidate Answer:\n{candidate_answer}\n\n"
                    "Give 2 concise, grounded sentences of STAR interview feedback referencing only the candidate's real resume context."
                )
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {groq_key}"},
                        json={
                            "model": "llama-3.1-8b-instant",
                            "messages": [{"role": "user", "content": prompt}],
                            "max_tokens": 180,
                            "temperature": 0.3,
                        },
                    )
                    if resp.status_code == 200:
                        llm_advice = resp.json()["choices"][0]["message"]["content"].strip()
            except Exception:
                pass

        if llm_advice:
            feedback.insert(0, llm_advice)
        elif resume_context.get("top_bullets"):
            feedback.append(
                f"Tip from your resume: You can reference '{resume_context['top_bullets'][0][:90]}...' as a concrete example."
            )
        elif not feedback:
            feedback.append("Strong STAR structure with clear personal ownership and measurable impact!")

        return {
            "score": score,
            "word_count": words,
            "star_check": {
                "situation": has_situation,
                "action": has_action,
                "result": has_result,
            },
            "rag_context": resume_context,
            "feedback": feedback,
        }
