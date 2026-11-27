# 4-Developer Module Ownership & Responsibility Matrix

To enable four developers to work simultaneously without code conflicts or architecture divergence, domain responsibilities and code paths are strictly partitioned:

---

## Developer 1: Squad Lead / Core Foundation, Identity & Monetization
- **Primary Domain**: Identity, Profiles, Onboarding, Credits & Stripe Billing
- **Backend Directory**:
  - `backend/app/modules/auth/`
  - `backend/app/modules/profiles/`
  - `backend/app/modules/billing/`
- **Frontend Directory**:
  - `frontend/src/app/(auth)/`
  - `frontend/src/app/(dashboard)/billing/`
  - `frontend/src/stores/user-store.ts`
- **Database Tables Owned**: `users`, `profiles`, `education`, `experience`, `projects`, `credits`, `credit_transactions`, `subscriptions`, `audit_logs`
- **Key Milestones**: Phase 1 (Foundation, Auth & Onboarding) and Phase 6 (Monetization & Credit Ledger)

---

## Developer 2: CV Intelligence & Customization Studio
- **Primary Domain**: Resume Ingestion, Document Parsing, 2-Panel Customizer, Cover Letters
- **Backend Directory**:
  - `backend/app/modules/resumes/`
  - `backend/app/modules/customizer/`
  - `backend/app/modules/cover_letter/`
  - `backend/app/workers/parsing_tasks.py`
- **Frontend Directory**:
  - `frontend/src/app/(dashboard)/resumes/`
  - `frontend/src/app/(dashboard)/customizer/`
  - `frontend/src/components/modules/customizer/`
- **Database Tables Owned**: `resumes`, `resume_analyses`, `customized_resumes`, `cover_letters`
- **Key Milestones**: Phase 2 (Resume Parsing & Normalization) and Phase 5 (Two-Panel Customizer & Cover Letter RAG)

---

## Developer 3: Job Ingestion, Aggregation & Application Lifecycle
- **Primary Domain**: 3-Tier Job Aggregator, Deduplication, Autonomous Scout, Kanban Tracker
- **Backend Directory**:
  - `backend/app/modules/jobs/`
  - `backend/app/modules/agent/`
  - `backend/app/modules/tracker/`
  - `backend/app/workers/ingestion_tasks.py`
  - `backend/app/workers/agent_tasks.py`
- **Frontend Directory**:
  - `frontend/src/app/(dashboard)/explore/`
  - `frontend/src/app/(dashboard)/tracker/`
  - `frontend/src/app/(dashboard)/agent/`
- **Database Tables Owned**: `companies`, `job_sources`, `jobs`, `saved_jobs`, `agent_configurations`, `applications`
- **Key Milestones**: Phase 3 (Job Aggregation & Explore) and Phase 7 (Autonomous Job-Hunting Agent)

---

## Developer 4: Deep Learning, Neural Matching & Interactive Prep
- **Primary Domain**: PyTorch Tri-Score Engine, pgvector Embeddings, Skill Assessments, Coaching & Mock Interview
- **Backend Directory**:
  - `backend/app/modules/matching/`
  - `backend/app/modules/skills/`
  - `backend/app/modules/assessments/`
  - `backend/app/modules/coaching/`
  - `backend/app/modules/interview/`
  - `backend/app/ai/`
  - `backend/app/workers/matching_tasks.py`
- **Frontend Directory**:
  - `frontend/src/app/(dashboard)/interview/`
  - `frontend/src/app/(dashboard)/coaching/`
  - `frontend/src/app/(dashboard)/assessments/`
- **Database Tables Owned**: `skills`, `profile_skills`, `job_skills`, `job_matches`, `skill_assessments`, `assessment_questions`, `coaching_sessions`, `interview_questions`
- **Key Milestones**: Phase 4 (Vector Embeddings & Tri-Score) and Phase 8 (Coaching, Assessments & Mock Interview)

---

## Team Coordination Protocols
1. **Branching Strategy**: Team members work on isolated feature branches (`feature/dev1-auth`, `feature/dev2-resume-parser`, etc.).
2. **Migrations**: All database schema changes must be generated via Alembic with automated downgrade/rollback paths. Never modify shared tables without team consensus.
3. **API Contracts**: All endpoints must return the standard JSON:API envelope defined in `app/common/responses.py` and documented in `docs/API_CONTRACTS.md`.
