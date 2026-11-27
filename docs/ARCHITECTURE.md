# System Architecture & Technical Specifications

This document outlines the foundational architecture of the Job360 platform as specified in the engineering handbook.

---

## 1. High-Level Architectural Topology

```
+-----------------------------------------------------------------------------------+
|                           CLIENT PRESENTATION TIER                                |
|                Next.js 14 (App Router) + React 18 + Tailwind CSS                  |
|                 Zustand (Local State) | TanStack Query v5 (Server Cache)          |
+------------------------------------------+----------------------------------------+
                                           | HTTP / SSE / REST
                                           v
+-----------------------------------------------------------------------------------+
|                        API GATEWAY & FASTAPI SERVICE                              |
|                 JWT Auth | CORS Middleware | Pydantic v2 Envelopes                |
+-------------------+----------------------+-------------------+--------------------+
                    |                      |                   |
                    v                      v                   v
        +-----------------------+ +------------------+ +--------------------+
        |  PostgreSQL 16        | |   Redis 7.2      | |  PyTorch 2.4+      |
        |  + pgvector           | |   - Query Cache  | |  Neural Inference  |
        |  - 25 Relational      | |   - Celery Broker| |  - Bi-Encoder      |
        |    Entities           | |   - Rate Limits  | |  - Cross-Encoder   |
        |  - HNSW Vector Index  | +--------+---------+ |  - Whisper Engine  |
        +-----------------------+          |           +--------------------+
                                           v
                               +-----------------------+
                               |    Celery Workers     |
                               | - Resume Parsers      |
                               | - 3-Tier Job Ingest   |
                               | - Autonomous Beat     |
                               +-----------------------+
```

---

## 2. Database & Data Models (All 25 Tables)

The database schema is consolidated in PostgreSQL 16 with `pgvector`:

1. `users`: Core identity, bcrypt credentials, role (`CANDIDATE`, `ADMIN`), status.
2. `profiles`: Canonical career graph, headline, YOE, location, remote preference.
3. `education`: Normalized academic degrees, institutions, GPAs.
4. `experience`: Work history, position, dates, JSONB achievement bullets.
5. `projects`: Candidate portfolio items, tech stack array, repository & live URLs.
6. `skills`: Canonical skill taxonomy (Hard, Soft, Tool, Cert) with synonyms GIN index.
7. `profile_skills`: Candidate-to-skill associations with verified status flag.
8. `resumes`: Multi-version resumes, raw text, and parsed JSON structures.
9. `resume_analyses`: Alignment audit between resumes and target job listings.
10. `customized_resumes`: Tailored CV revisions from 2-panel customizer, PDF/DOCX links.
11. `companies`: Company registry, domain, logo, industry, size.
12. `job_sources`: Providers (Adzuna, Jooble, JSearch, ATS Feeds, Scrapers).
13. `jobs`: Aggregated listings with 1024-dim vector embedding, deduplication hash, salary.
14. `job_skills`: Extracted job requirements and mandatory flags.
15. `saved_jobs`: Bookmarked listings with candidate notes and folders.
16. `job_matches`: Pre-computed Tri-Scores (Job Match, Resume Match, ATS score).
17. `cover_letters`: Tailored 3-paragraph RAG cover letters.
18. `applications`: Kanban application lifecycle records with stage and interview dates.
19. `skill_assessments`: Quiz attempts, timestamps, scores, passing status.
20. `assessment_questions`: Dynamic question bank with multiple-choice scenario items.
21. `agent_configurations`: Autonomous Scout agent preferences and schedules.
22. `coaching_sessions`: Streaming AI career coaching dialogue logs in JSONB.
23. `interview_questions`: Company/role interview repository with STAR model answers.
24. `credits`: Atomic user credit balances with `balance >= 0` check constraints.
25. `credit_transactions`: Immutable audit ledger with idempotency keys.

---

## 3. PyTorch Neural Inference Pipeline

- **Dense Embeddings**: `BAAI/bge-large-en-v1.5` transformer model running locally with PyTorch. Generates normalized 1024-dimensional dense vectors stored directly in PostgreSQL using `vector(1024)`.
- **HNSW Indexing**: `CREATE INDEX idx_jobs_embedding ON jobs USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);` ensuring sub-35ms approximate nearest neighbor (ANN) retrieval over 1M+ listings.
- **Cross-Encoder Re-Ranking**: `cross-encoder/ms-marco-MiniLM-L-6-v2` re-ranks top 50 candidates with full cross-attention scoring.
- **Speech-to-Text**: PyTorch Whisper audio inference for mock interview speech practice.

---

## 4. Anti-Fabrication & Ethical Guardrails

- The customizer is **strictly constrained**: it never invents job titles, metrics, degrees, or employers.
- It only incorporates missing skills explicitly checked by the user in the right panel (`confirmed_missing_skills`).
- No unauthorized bot application submissions: candidates are redirected to verified official employer URLs.
