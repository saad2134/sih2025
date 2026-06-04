# ShikshaDisha Backend

AI-Powered NSQF-Integrated Learning Ecosystem - Monolithic Backend (MVP/Demo)

## Quick Start

```bash
cd backend

# Copy environment
cp .env.example .env
# Edit .env with your API keys

# Start with Docker
docker-compose up -d

# Or run locally
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Seed Data

```bash
# Import NSQF courses
python scripts/seed_nsqf.py

# Import expert reviews
python scripts/seed_expert_reviews.py
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| SECRET_KEY | JWT signing secret | Yes |
| GEMINI_API_KEY | Google Gemini API key | For LLM tagging |
| SERP_API_KEY | SerpAPI key | For course discovery |
| FIRECRAWL_API_KEY | Firecrawl API key | For one-time scraping |
| SENTRY_DSN | Sentry error tracking | No |

## Tech Stack

- **API**: FastAPI 0.115 + Uvicorn
- **Database**: PostgreSQL 15 + pgvector
- **Cache/Broker**: Redis 7
- **Tasks**: Celery 5 + Celery Beat
- **Auth**: JWT (python-jose) + bcrypt
- **ML**: scikit-learn, faiss-cpu, numpy

## Architecture

```
┌─────────────────────────────────────┐
│     FastAPI Router (port 8000)      │
│  - Auth middleware                  │
│  - Rate limiting (60/min)           │
│  - Request ID tracking              │
└─────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐   ┌─────────┐   ┌──────────┐
│ Auth   │   │Matching │   │ Courses  │
│Service │   │ Engine  │   │ Service  │
└────────┘   └─────────┘   └──────────┘
    │             │             │
    ▼             ▼             ▼
┌────────┐   ┌─────────┐   ┌──────────┐
│Postgres│   │  Redis  │   │ Celery   │
│+pgvector│  │ (cache) │   │ (tasks)  │
└────────┘   └─────────┘   └──────────┘
```

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh tokens
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Current user

### Onboarding
- `GET /api/v1/onboarding/quiz` - VARK quiz questions
- `POST /api/v1/onboarding/submit` - Submit quiz (async, returns 202)
- `GET /api/v1/onboarding/status/{job_id}` - Poll job status
- `GET /api/v1/onboarding/profile` - Get learner profile

### Recommendations
- `GET /api/v1/recommendations` - Get course recommendations
- `GET /api/v1/recommendations/{id}/match-report` - Full match details
- `POST /api/v1/recommendations/{id}/enrol` - Enroll in course

### Courses
- `GET /api/v1/courses` - List courses
- `GET /api/v1/courses/{id}` - Course detail
- `GET /api/v1/courses/search?q=` - Search courses

### Career
- `GET /api/v1/career/skill-gap` - Skill gap analysis
- `GET /api/v1/career/score` - Career score

## Matching Engine

3-layer architecture:
1. **Hard Filter**: Language, math depth, time availability
2. **Rule Score**: VARK (30%) + Style (20%) + Time (20%) + NSQF (15%) + Quality (15%)
3. **FAISS Rerank**: Semantic search (activates at 50+ enrolments)

## Development

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/

# Format code
ruff format .
```

## License

MIT