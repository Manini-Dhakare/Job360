# Job360 - AI-Powered Career Platform

> **Target Benchmark**: [Jobright AI](https://jobright.ai/) Architectural Paradigm  
> **Core Tech Stack**: Python 3.12 (FastAPI), PostgreSQL 16 (pgvector), PyTorch 2.4+ (Neural Inference), Next.js 14 (App Router) + React 18 + Tailwind CSS.

---

## 1. Executive Overview

Job360 is an enterprise-grade AI career copilot engineered to eliminate frictions in modern job seeking:
1. **Explore**: 3-tier job aggregation (Adzuna/Jooble APIs, direct ATS feeds, regional proxy crawlers) with MD5 deduplication.
2. **Resume Studio**: Multi-format parsing (PyMuPDF, pdfplumber), layout recognition, and canonical profile builder.
3. **Job-Specific Matching**: PyTorch Tri-Score engine (Job Match %, Resume Match %, ATS Score %) powered by `BAAI/bge-large-en` dense vectors in PostgreSQL `pgvector` with HNSW indexing and cross-encoder re-ranking.
4. **Signature 2-Panel Customizer**: Jobright-inspired side-by-side reconciliation (Left: verified assets; Right: target skill gaps with explicit confirmation) with strict anti-fabrication STAR bullet rewriting.
5. **Credit & Subscription System**: Atomic credit ledger (SELECT FOR UPDATE) with Stripe Checkout integration.
6. **Autonomous Job Scout**: Celery Beat background agent scanning daily for high-affinity opportunities (>=80%).
7. **AI Mock Interview Studio**: PyTorch Whisper speech-to-text, company question banks, and STAR scoring rubrics.
8. **Skill Assessment Engine**: Scenario-based dynamic quizzes awarding Verified Skill Badges.
9. **Job Application Tracker**: Drag-and-drop Kanban lifecycle pipeline (Wishlist to Offer/Rejection).

---

## 2. Team Work Breakdown (4 Developers Concurrent Setup)

The architecture is partitioned into four decoupled modules so team members can work in parallel without code collisions:

| Developer / Squad | Domain Responsibilities | Backend Modules (`backend/app/modules/`) | Frontend Views (`frontend/src/app/`) |
| :--- | :--- | :--- | :--- |
| **Developer 1** (Core & Billing) | Auth (OAuth/JWT), Candidate Profiles, Stripe Subscriptions & Atomic Credit Ledger | `auth/`, `profiles/`, `billing/` | `(auth)/`, `(dashboard)/billing/` |
| **Developer 2** (CV & Customizer) | Resume Parsing (PyMuPDF), 2-Panel Customizer, Anti-Fabrication STAR Rewriter, Cover Letter | `resumes/`, `customizer/`, `cover_letter/` | `(dashboard)/resumes/`, `(dashboard)/customizer/` |
| **Developer 3** (Ingestion & Pipeline) | 3-Tier Job Aggregator, MD5 Deduplication, Celery Beat Scout Agent, Kanban Tracker | `jobs/`, `agent/`, `tracker/` | `(dashboard)/explore/`, `(dashboard)/tracker/`, `(dashboard)/agent/` |
| **Developer 4** (AI & Evaluation) | PyTorch Tri-Score Matching, pgvector HNSW search, Skill Assessments, Mock Interview & Coaching | `matching/`, `skills/`, `assessments/`, `coaching/`, `interview/` | `(dashboard)/interview/`, `(dashboard)/coaching/`, `(dashboard)/assessments/` |

---

## 3. Technology Stack Reference

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript, Zustand, TanStack Query v5, Radix UI, Framer Motion.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Asyncpg, Alembic.
- **Database & Vectors**: PostgreSQL 16 with `pgvector` (HNSW indexing, 1024-dim dense vectors).
- **Deep Learning / AI**: PyTorch 2.4+, SentenceTransformers (`BAAI/bge-large-en-v1.5`), CrossEncoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`), Whisper audio inference.
- **Task Queue & Caching**: Redis 7.2 + Celery 5.4 (with Celery Beat scheduler).
- **Payment & Storage**: Stripe Checkout, AWS S3 / Cloudflare R2.
- **Containerization**: Docker Compose with multi-stage builds.

---

## 4. Quick Start: Local Development Environment

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ & npm / pnpm
- Python 3.12+ (if running backend outside Docker)

### 1. Environment Setup
```bash
# Copy example environment configuration
cp .env.example .env
cp backend/.env.example backend/.env (if needed)
cp frontend/.env.example frontend/.env.local (if needed)
```

### 2. Launch Supporting Services (PostgreSQL + pgvector & Redis)
```bash
docker compose up -d postgres redis
```
The PostgreSQL container automatically runs `scripts/init-db.sql` to install `uuid-ossp` and `vector` extensions.

### 3. Launch Full Containerized Stack
```bash
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- FastAPI OpenAPI Docs: `http://localhost:8000/docs`
- Healthcheck Endpoint: `http://localhost:8000/healthz`

---

## 5. Antigravity Development Lifecycle & Governance

All future module implementation must strictly uphold the project handbook directives:
1. **Non-Regression Rule**: Database migrations and service boundaries must remain isolated. Never modify core auth or credit billing when working on peripheral AI features.
2. **Anti-Fabrication Guardrail**: Under no circumstances should the system hallucinate experience, credentials, or metrics.
3. **No Automated Submissions**: Final job submissions remain candidate-controlled (via verified redirects or explicit user clicks).
4. **Standard Envelopes**: All endpoints adhere to JSON:API standard envelopes (`meta.request_id`, `success: true/false`).
