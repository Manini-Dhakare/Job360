# API Contracts & Response Envelopes

All backend REST endpoints strictly comply with JSON:API standards and the envelope definitions in Section 9.1 of the handbook.

---

## 1. Response Envelopes

### Standard Success Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-27T12:00:00Z",
    "request_id": "req_88f91a"
  }
}
```

### Standard Error Envelope (HTTP 400 / 401 / 403 / 404 / 422 / 500)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "User has 0 credits remaining. Customization requires 1 credit.",
    "details": {
      "current_balance": 0,
      "required": 1
    }
  },
  "meta": {
    "timestamp": "2026-11-27T12:00:00Z",
    "request_id": "req_88f91a"
  }
}
```

---

## 2. Core Endpoint Catalog by Module

### Auth & Onboarding (Developer 1)
- `POST /api/v1/auth/register` - Create candidate account.
- `POST /api/v1/auth/login` - Authenticate & issue JWT cookie.
- `POST /api/v1/auth/refresh` - Refresh access token.
- `POST /api/v1/onboarding/complete` - Initialize preferences & grant 5 credits.
- `GET /api/v1/profiles/me` - Fetch candidate profile.
- `PUT /api/v1/profiles/me` - Update profile data.

### Resume & Customizer (Developer 2)
- `POST /api/v1/resumes/upload` - Upload resume (returns 202 task_id).
- `GET /api/v1/resumes/{id}/parsed` - Fetch structured resume JSON.
- `POST /api/v1/resumes/customize` - 2-panel customization (consumes 1 credit).
- `GET /api/v1/resumes/customized/{id}/download` - Download tailored PDF/DOCX.
- `POST /api/v1/resumes/cover-letter` - Generate RAG cover letter.

### Jobs & Ingestion (Developer 3)
- `GET /api/v1/jobs/search` - Search job postings with filters & scores.
- `GET /api/v1/jobs/{id}` - Retrieve job details.
- `POST /api/v1/jobs/{id}/save` - Bookmark job listing.
- `DELETE /api/v1/jobs/{id}/save` - Unsave job listing.
- `GET /api/v1/agent/config` - Get candidate scout settings.
- `PUT /api/v1/agent/config` - Update scout settings.
- `GET /api/v1/applications/kanban` - Fetch Kanban application board.
- `PATCH /api/v1/applications/{id}/status` - Move stage in Kanban.

### AI Matching & Prep (Developer 4)
- `POST /api/v1/matching/calculate` - Calculate Tri-Score (Job, Resume, ATS).
- `GET /api/v1/matching/job/{job_id}` - Granular breakdown for a job.
- `POST /api/v1/assessments/{skill_id}/start` - Begin timed skill test.
- `POST /api/v1/assessments/{id}/submit` - Submit answers & award verified badge.
- `POST /api/v1/coaching/chat` - SSE streaming career coach chat.
- `GET /api/v1/interview/questions` - Question bank with model STAR answers.

### Billing (Developer 1)
- `POST /api/v1/billing/checkout` - Create Stripe Checkout session.
- `POST /api/v1/billing/webhook` - Stripe webhook listener.
- `GET /api/v1/billing/balance` - Retrieve credit balance.
- `GET /api/v1/billing/transactions` - Retrieve credit audit trail.
