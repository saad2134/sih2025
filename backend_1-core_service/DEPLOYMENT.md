# ShikshaDisha Core API - Deployment Guide

## Overview

The Core API is the main backend service handling:
- User Management (CRUD operations)
- Action Tracking (user activities)
- Notifications (Email, Push, WebSocket)
- Learning Sessions & Behavior Tracking
- Streaks & Gamification
- PostgreSQL Database
- Redis Cache
- Celery Workers for async tasks

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- PostgreSQL 15 (optional - included in compose)
- Redis 7 (optional - included in compose)

### Run with Docker Compose

```bash
cd backend_1-core_service
docker-compose up -d --build
```

### Hot Reload Development

#### Dev Profile (Auto-Reload)
```bash
docker-compose --profile dev up -d
```

#### Manual Restart
Code changes are mounted via volumes. After code changes:

```bash
# Rebuild (for dependency changes)
docker-compose up -d --build

# Or just restart (for code-only changes)
docker-compose restart
```

### Run Standalone

```bash
# Build
docker build -t shiksha-core .

# Run
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shikshadisha \
  -e REDIS_URL=redis://localhost:6379/0 \
  shiksha-core
```

### Local Development (No Docker)

Requires PostgreSQL 15+ and Redis 7+ running locally.

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set environment variables
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shikshadisha
set REDIS_URL=redis://localhost:6379/0

# Run with auto-reload
uvicorn app.main:app --reload
```

---

## Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| API | shiksha-core-api | 8000 | FastAPI application |
| PostgreSQL | shiksha-db | 5432 | Database |
| Redis | shiksha-redis | 6379 | Cache & Queue |
| Worker | shiksha-worker | - | Celery worker |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgresql://postgres:postgres@db:5432/shikshadisha | PostgreSQL connection |
| `REDIS_URL` | redis://redis:6379/0 | Redis connection |
| `SECRET_KEY` | dev-secret-key-change-in-production | JWT secret key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 10080 | Token expiry (7 days) |
| `CELERY_BROKER_URL` | redis://redis:6379/1 | Celery broker |
| `CELERY_RESULT_BACKEND` | redis://redis:6379/2 | Celery results |
| `SMTP_HOST` | - | Email server host |
| `SMTP_PORT` | 587 | Email server port |
| `SMTP_USER` | - | Email username |
| `SMTP_PASSWORD` | - | Email password |
| `FCM_SERVER_KEY` | - | Firebase Cloud Messaging key |

---

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/` | Create user |
| GET | `/users/{user_id}` | Get user |
| PUT | `/users/{user_id}` | Update user |
| DELETE | `/users/{user_id}` | Delete user |

### Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/actions/` | Create action |
| GET | `/actions/` | List user actions |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications/send` | Send notification |
| GET | `/notifications/` | List notifications |
| POST | `/notifications/{id}/mark_read` | Mark as read |
| GET | `/notifications/unread-count` | Unread count |

### Behavior
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/behavior/session/start` | Start session |
| POST | `/behavior/session/end` | End session |
| GET | `/behavior/session/{id}` | Get session |
| POST | `/behavior/event` | Log event |
| GET | `/behavior/events/{user_id}` | Get user events |
| GET | `/behavior/profile/{user_id}` | Get engagement profile |
| POST | `/behavior/profile/{user_id}/update` | Update profile |

### Streaks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/streak/{user_id}` | Get streak |
| POST | `/streak/activity` | Log activity |
| POST | `/streak/{user_id}/use-freeze` | Use freeze |
| GET | `/streak/{user_id}/history` | Get history |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `/ws/notifications/{user_id}` | Real-time notifications |
| `/ws/presence/{user_id}` | User presence |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root info |
| GET | `/health` | Health check |

---

## Auto-Update with Watchtower

Add to your docker-compose.yml or create separate file:

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 60 --include-restart shiksha-core-api
    restart: unless-stopped
```

Or run standalone:

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 60 \
  --include-restart \
  shiksha-core-api
```

---

## Verify Deployment

```bash
# Health check
curl http://localhost:8000/health

# API docs
curl http://localhost:8000/docs

# List containers
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                STATUS          PORTS
abc123         shiksha-core-api    Up 2 minutes    0.0.0.0:8000->8000/tcp
def456         shiksha-db          Up 3 minutes    0.0.0.0:5432->5432/tcp
ghi789         shiksha-redis       Up 3 minutes    0.0.0.0:6379->6379/tcp
jkl012         shiksha-worker      Up 2 minutes
```

---

## Troubleshooting

### View Logs
```bash
# API logs
docker logs shiksha-core-api

# Worker logs
docker logs shiksha-worker

# Database logs
docker logs shiksha-db
```

### Common Issues

**Database connection failed**
```bash
# Check database is running
docker logs shiksha-db

# Verify connection string
echo $DATABASE_URL
```

**Redis connection failed**
```bash
# Check Redis is running
docker logs shiksha-redis

# Test connection
docker exec -it shiksha-redis redis-cli ping
```

**Migration issues**
```bash
# Recreate containers
docker-compose down -v
docker-compose up -d --build
```

---

## GitHub Container Registry

Image is automatically built and pushed on changes:

```
ghcr.io/saad2134/shiksha-disha/b1-core:latest
```

To pull:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
docker pull ghcr.io/<username>/shiksha-disha/b1-core:latest
```

---

## Development

### Run locally without Docker

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shikshadisha
export REDIS_URL=redis://localhost:6379/0

# Run server
uvicorn app.main:app --reload

# Run worker (separate terminal)
celery -A app.workers.celery worker --loglevel=info
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "add field"

# Run migrations
alembic upgrade head
```

---

## Ports

| Port | Service |
|------|---------|
| 8000 | Core API |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8080 | Adminer (Database UI) |
