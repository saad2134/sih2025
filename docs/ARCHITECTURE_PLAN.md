# Architecture Plan: Unified API with Dual Backend Modes

## Overview

The system supports two deployment modes with a **single frontend** that points to one backend URL:

| Mode | Target | Description |
|------|--------|-------------|
| **MVP/Demo** | Monolithic Backend | All features run in a single service |
| **Production** | Router + Microservices | API gateway routes to specialized sub-services |

The frontend remains unchanged between modes — only the backend configuration differs.

---

## Frontend Configuration

```typescript
// frontend-web/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

All API calls go to `API_BASE_URL`. Path-based routing determines the destination.

---

## API Schema (Canonical)

### Route Structure

All endpoints follow: `/api/v1/{domain}/{action}`

### Standard Response Envelope

```json
// Success
{ "success": true, "data": {...} }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": {...} } }
```

### Auth

| Method | Endpoint | Description | Schema |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | User registration | `SignupRequest` |
| POST | `/api/v1/auth/login` | User login | `LoginRequest` |
| POST | `/api/v1/auth/refresh` | Refresh tokens | `refresh_token` |
| POST | `/api/v1/auth/logout` | Logout | `refresh_token` |
| GET | `/api/v1/auth/me` | Get current user | `UserOut` |

### Onboarding

| Method | Endpoint | Description | Schema |
|--------|----------|-------------|--------|
| GET | `/api/v1/onboarding/quiz` | Get VARK quiz questions | `QuizResponse` |
| POST | `/api/v1/onboarding/submit` | Submit quiz + profile | `OnboardingSubmit` → 202 + `{job_id}` |
| GET | `/api/v1/onboarding/status/{job_id}` | Poll job status | `OnboardingStatus` |
| GET | `/api/v1/onboarding/profile` | Get learner profile | `LearnerProfile` |
| PATCH | `/api/v1/onboarding/profile` | Update profile | Partial profile |

### Recommendations

| Method | Endpoint | Description | Schema |
|--------|----------|-------------|--------|
| GET | `/api/v1/recommendations` | Get recommendations | `{course, match_report}[]` |
| GET | `/api/v1/recommendations/{id}/match-report` | Full match report | `MatchReport` |
| GET | `/api/v1/recommendations/compare` | Compare courses | `CompareResponse` |
| POST | `/api/v1/recommendations/{id}/enrol` | Enrol in course | 201 |

### Courses

| Method | Endpoint | Description | Schema |
|--------|----------|-------------|--------|
| GET | `/api/v1/courses` | List courses | Paginated |
| GET | `/api/v1/courses/{id}` | Course detail | `CourseDetail` |
| GET | `/api/v1/courses/search` | Full-text search | `CourseSearch` |
| GET | `/api/v1/courses/{id}/difficulty-curve` | Week-by-week | `DifficultyCurve` |
| GET | `/api/v1/courses/{id}/reviews` | Get reviews | VARK filtered |

### Career

| Method | Endpoint | Description | Schema |
|--------|----------|-------------|--------|
| GET | `/api/v1/career/skill-gap` | Skill gap analysis | `SkillGap` |
| GET | `/api/v1/career/score` | Career score | `CareerScore` |

### Reviews

| Method | Endpoint | Description | Schema |
|--------|----------|-------------|--------|
| POST | `/api/v1/reviews/submit` | Submit review | `ReviewSubmit` |

---

## Error Contracts

| HTTP | Error Code | When | Frontend Action |
|------|------------|------|-----------------|
| 400 | VALIDATION_ERROR | Pydantic validation failed | Show field-level errors |
| 401 | TOKEN_EXPIRED | Access token expired | Use /auth/refresh |
| 401 | INVALID_TOKEN | Bad signature | Redirect to login |
| 403 | ONBOARDING_REQUIRED | Hit /recommendations before quiz | Redirect to onboarding |
| 404 | NOT_FOUND | Course/resource absent | Show not-found UI |
| 409 | DUPLICATE_EMAIL | Email already registered | Show 'email taken' |
| 429 | RATE_LIMITED | 60 req/min exceeded | Backoff and retry |
| 500 | INTERNAL_ERROR | Unhandled exception | Show generic + sentry_id |
| 503 | JOB_FAILED | Celery job failed | Retry button |

---

## Deployment Modes

### Mode A: Monolithic Backend (MVP/Demo) — CURRENT FOCUS

```
┌─────────────────────────────────────┐
│           MONOLITH (port 8000)      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  FastAPI Router + Middleware  │  │
│  │  - JWT Auth                   │  │
│  │  - Rate Limiting (60/min)     │  │
│  │  - X-Request-ID               │  │
│  │  - Sentry                     │  │
│  └───────────────────────────────┘  │
│              │                       │
│  ┌───────────┴───────────────────┐  │
│  │       Service Modules          │  │
│  │  AuthSvc | OnboardingSvc       │  │
│  │  MatchingSvc | CourseSvc        │  │
│  │  ReviewSvc | CareerSvc          │  │
│  └───────────────────────────────┘  │
│              │                       │
│  ┌───────────┴───────────────────┐  │
│  │       ML / Matching Engine     │  │
│  │  Layer 1: Hard Filters         │  │
│  │  Layer 2: Rule-based Score     │  │
│  │  Layer 3: FAISS rerank         │  │
│  └───────────────────────────────┘  │
│              │                       │
│  ┌───────────┴───────────────────┐  │
│  │       Data Layer               │  │
│  │  PostgreSQL 15 + pgvector      │  │
│  │  Redis 7 (cache + broker)      │  │
│  └───────────────────────────────┘  │
│              │                       │
│  ┌───────────┴───────────────────┐  │
│  │       Background Tasks       │  │
│  │  Celery 5 + Celery Beat       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Mode B: Router + Microservices (Production)

```
                              FRONTEND
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │    API Router (8000)   │
                     │  - JWT Middleware      │
                     │  - Rate Limiting       │
                     │  - Route to services   │
                     └───────────┬───────────┘
                                 │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    ┌───────────┐       ┌──────────────┐     ┌──────────────┐
    │    AUTH   │       │     AI      │     │  COMPANION   │
    │   SERVICE │       │   ENGINE    │     │   SERVICE    │
    │   (8001)  │       │   (9000)   │     │   (9001)     │
    └───────────┘       └──────────────┘     └──────────────┘
```

---

## Matching Engine — 3 Layers

### Layer 1: Hard Filter (Always Active)
- language match
- difficulty in allowed set
- math_depth WARN (comfort+1) vs EXCLUDE (comfort+2)
- time WARN (>1.5x) vs EXCLUDE (>2.5x)

### Layer 2: Rule-Based Score (Always Active)
| Dimension | Weight | Formula |
|-----------|--------|---------|
| VARK cosine | 30% | Cosine similarity of VARK vectors |
| Style Jaccard | 20% | Jaccard of style preferences |
| Time fit | 20% | 1 - |course_hrs - user_hrs| / max |
| NSQF alignment | 15% | Bonus for certification goals |
| Quality signal | 15% | (rating/5) × log(reviews+1) |

### Layer 3: FAISS Rerank (Active at 50+ enrolments)
- Semantic search on learner goal + topic
- Collaborative completion rate boost
- FAISS index serialized to disk

---

## match_report Schema

```json
{
  "overall_match_pct": 85,
  "vark_alignment_pct": 82,
  "style_match_pct": 78,
  "time_fit": "Good — 6 hrs/week (you said 8 available)",
  "nsqf_match": true,
  "math_level": "WARN",
  "math_warning_detail": "Requires: derivatives, probability",
  "math_topics_ahead": ["derivatives", "probability"],
  "completion_rate_your_cluster": 0.72,
  "completion_rate_global": 0.65,
  "collab_confidence": "HIGH",
  "week_breakdown": [...],
  "recommendation_label": "Strong Match",
  "warnings": [...],
  "why_this_ranking": "Ranked #2 because..."
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/shikshadisha
REDIS_URL=redis://localhost:6379/0

# Auth
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# External APIs
GEMINI_API_KEY=...
SERP_API_KEY=...
FIRECRAWL_API_KEY=...

# Sentry
SENTRY_DSN=...

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

---

## Implementation Checklist

- [x] Define canonical API schema
- [x] Create backend/app structure
- [x] Implement database models with pgvector
- [x] Implement auth service (register, login, refresh, logout)
- [x] Implement onboarding service (VARK quiz, submit, status)
- [x] Implement matching engine (3 layers)
- [x] Implement recommendations endpoints
- [x] Implement courses endpoints
- [x] Implement career/skill-gap endpoints
- [x] Implement rate limiting and middleware
- [x] Create NSQF seed script
- [x] Write docker-compose for monolith
- [x] Update frontend API URL to single backend
- [x] Complete Celery task implementations (fully converted to run asynchronously under asyncio.run and configured NullPool to prevent closed event loop pool bugs)
- [x] Write more unit/integration tests (implemented E2E integration test at test_student_flow.py covering the complete user onboarding, recommendations, chatbot, payments, and feedback loop)
- [x] Add Alembic migration runner (implemented 002_subscription and 003_add_search_vector migrations, resolving the missing search_vector DB column blocker)
- [x] Implement Dynamic Course Discovery (SerpAPI + Firecrawl + Gemini 2.5 Flash) and Milestone Overrides (see [COURSE_SEARCH_AND_MATCHING.md](file:///c:/Users/UwU/Desktop/shiksha-disha/docs/COURSE_SEARCH_AND_MATCHING.md))

---

## Notes

- Onboarding submit is ASYNC: returns 202 + job_id, Celery computes recommendations
- Frontend polls `/onboarding/status/{job_id}` until `status='ready'`
- FAISS index saved to disk on every update, loaded on startup
- Firecrawl: one-time scrape per URL, cached forever
- No scraped testimonials — expert review cards at launch, user reviews after 100 users
- VARK weight capped at 30% (not dominant signal)