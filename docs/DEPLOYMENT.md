# ShikshaDisha - Full Deployment Guide

> Complete deployment instructions for all ShikshaDisha backend services

---

## Overview

ShikshaDisha consists of 3 backend microservices:

| Service | Port | Description |
|---------|------|-------------|
| **backend_1-core_service** | 8000 | Core API, Users, Actions, Notifications, Database |
| **backend_2-ai_engine_service** | 9000 | AI Matching Engine, Course Recommendations |
| **backend_3-ai_companion_service** | 9001 | AI Companion, Chat, Skill Forecasting |

---

## Quick Deploy All Services

### Option 1: Deploy Each Service Separately

```bash
# 1. Core API (with PostgreSQL + Redis + Celery)
cd backend_1-core_service
docker-compose up -d --build

# 2. AI Engine Service
cd ../backend_2-ai_engine_service
docker-compose up -d --build

# 3. AI Companion Service
cd ../backend_3-ai_companion_service
docker-compose up -d --build
```

### Option 2: Deploy All at Once

```bash
# Create a root docker-compose.yml for orchestration
```

### Option 3: Pull Pre-built Images

```bash
# Core API
docker pull ghcr.io/saad2134/shiksha-disha/b1-core:latest

# AI Engine
docker pull ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest

# AI Companion
docker pull ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
```

---

## Backend Services

### 1. Core API (backend_1-core_service)

**Port:** 8000

**Features:**
- User Management (CRUD)
- Action Tracking
- Notifications (Email, Push, WebSocket)
- Learning Sessions & Behavior Tracking
- Streaks & Gamification
- PostgreSQL Database
- Redis Cache
- Celery Workers for async tasks

**Deploy:**
```bash
cd backend_1-core_service

# With Docker Compose (recommended)
docker-compose up -d --build

# Or run manually
docker build -t shiksha-core .
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shikshadisha \
  -e REDIS_URL=redis://localhost:6379/0 \
  shiksha-core
```

**Environment Variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://...@db:5432/shikshadisha | PostgreSQL connection |
| REDIS_URL | redis://redis:6379/0 | Redis connection |
| SECRET_KEY | dev-secret | JWT secret key |

**API Docs:** http://localhost:8000/docs

**Database Admin:** http://localhost:8080
- System: PostgreSQL
- Server: db
- User: postgres
- Password: postgres
- Database: shikshadisha

---

### 2. AI Engine Service (backend_2-ai_engine_service)

**Port:** 9000

**Features:**
- Semantic Course Matching
- NSQF Course Recommendations
- Behavior Analysis
- Engagement & Dropout Prediction
- FAISS Index for fast search

**Deploy:**
```bash
cd backend_2-ai_engine_service

# With Docker Compose
docker-compose up -d --build

# Or manually
docker build -t shiksha-ai-engine .
docker run -d -p 9000:9000 shiksha-ai-engine
```

**Environment Variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| EMBEDDING_MODEL | all-MiniLM-L6-v2 | Sentence transformer model |
| NSQF_COURSES_PATH | ./data/nsqf_courses.csv | Course data CSV |

**API Docs:** http://localhost:9000/docs

---

### 3. AI Companion (/backend_3-ai_companion_service)

**Port:** 9001

**Features:**
- AI Chat Companion
- Skill Forecasting
- Industry Alerts
- Content Recommendations

**Deploy:**
```bash
cd backend_3-ai_companion_service

# With Docker Compose
docker-compose up -d --build

# Or manually
docker build -t shiksha-ai-companion .
docker run -d -p 9001:9001 shiksha-ai-companion
```

**API Docs:** http://localhost:9001/docs

---

## Auto-Update with Watchtower

Add Watchtower to automatically update containers:

```yaml
# docker-compose.full.yml
version: "3.8"

services:
  core:
    image: ghcr.io/saad2134/shiksha-disha/b1-core:latest
    # ... other config

  ai-engine:
    image: ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
    # ... other config

  ai-companion:
    image: ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
    # ... other config

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 60 --include-restart core ai-engine ai-companion
```

Run:
```bash
docker-compose -f docker-compose.full.yml up -d
```

---

## Verify Deployment

```bash
# Check all services
curl http://localhost:8000/health    # Core API
curl http://localhost:9000/health    # AI Engine
curl http://localhost:9001/health    # AI Companion

# Check Docker containers
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                    STATUS          PORTS
abc123         shiksha-core-api         Up 2 minutes    0.0.0.0:8000->8000/tcp
def456         shiksha-ai-engine        Up 2 minutes    0.0.0.0:9000->9000/tcp
ghi789         shiksha-ai-companion     Up 2 minutes    0.0.0.0:9001->9001/tcp
jkl012         shiksha-db               Up 3 minutes    0.0.0.0:5432->5432/tcp
mno345         shiksha-redis            Up 3 minutes    0.0.0.0:6379->6379/tcp
```

---

## Post-Deployment Setup & Data Seeding

### 1. Database Migrations
Before starting the backend services, make sure to execute all database migrations using Alembic:
```bash
cd backend
python -m alembic upgrade head
```

### 2. Seeding Initial Courses Data
ShikshaDisha requires initial course data to generate recommendations. A CSV of NSQF courses must be placed at `backend/data/nsqf_courses.csv` (can be copied from `backend_2-ai_engine_service/data/nsqf_courses.csv`) and seeded using:
```bash
cd backend
# Create data folder and copy the CSV
mkdir data
cp ../backend_2-ai_engine_service/data/nsqf_courses.csv ./data/nsqf_courses.csv

# Seed the database
python -m scripts.seed_nsqf
```

---

## External Integrations & Fallbacks

For full production capabilities, configure the following keys in your environment (or `backend/.env` file). If left unset, the backend will gracefully run in **mock/sandbox mode**:

| Variable | Target Integration | Mock Fallback Behavior |
|----------|--------------------|------------------------|
| `POLAR_API_KEY` | Polar.sh subscriptions | Returns a mock checkout success URL and bypasses Polar payment flow. |
| `POLAR_WEBHOOK_SECRET` | Polar webhook signatures | Signature validation is bypassed during subscription state updates. |
| `GEMINI_API_KEY` | Gemini AI Companion chatbot | AI Chat Companion operates in local mock mode utilizing user profile context. |
| `GOOGLE_APPS_SCRIPT_URL`| Apps Script Feedback form | Form feedback inputs are logged to the console/server logs rather than posting outbound. |
| `SERP_API_KEY` & `FIRECRAWL_API_KEY` | SerpAPI & Firecrawl scraping | Job skill extraction uses cached/preconfigured mappings in Redis. |

---

## Windows Local Development Tips

1. **Celery Pool Configuration**: On Windows, the standard billiard multiprocess fork pool is buggy and throws `ValueError`. You must run Celery with the `solo` pool:
   ```bash
   python -m celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
   ```
2. **Database Engine Pool Class**: To avoid `RuntimeError: Event loop is closed` when Celery runs database queries inside a temporary event loop, the database engine is configured to use `NullPool` (disabling pool reuse across different loops).

---

## Troubleshooting

### View Logs
```bash
docker logs shiksha-core-api
docker logs shiksha-ai-engine
docker logs shiksha-ai-companion
```

### Rebuild Services
```bash
cd backend_1-core_service && docker-compose up -d --build
cd ../backend_2-ai_engine_service && docker-compose up -d --build
cd ../backend_3-ai_companion_service && docker-compose up -d --build
```

### Stop All Services
```bash
cd backend_1-core_service && docker-compose down
cd ../backend_2-ai_engine_service && docker-compose down
cd ../backend_3-ai_companion_service && docker-compose down
```

---

## Development (Hot Reload)

### Option 1: Dev Profile (Auto-Reload)
```bash
# Start with --profile dev to enable auto-reload
docker-compose --profile dev up -d
```

### Option 2: Manual Restart
Code changes are mounted into containers via volumes. After code changes:

```bash
# Rebuild and restart (for dependency changes)
docker-compose up -d --build

# Or just restart (for code-only changes)
docker-compose restart
```

The volumes mount your local code into the container for live updates.

---

## GitHub Container Registry

After GitHub Actions runs, images are available at:

```
ghcr.io/saad2134/shiksha-disha/b1-core:latest
ghcr.io/saad2134/shiksha-disha/b2-ai-engine:latest
ghcr.io/saad2134/shiksha-disha/b3-ai-companion:latest
```

To pull:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
docker pull ghcr.io/saad2134/shiksha-disha/b1-core:latest
```