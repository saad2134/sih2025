# Vercel Serverless Deployment Plan

Zero-cost approach: Vercel (frontend + API) + Supabase (database). No credit card required for signup.

## Architecture

```
Vercel (serverless)
  ├── Next.js Frontend (vercel.app)
  │     └── SSR pages, static assets
  └── FastAPI Backend (serverless function)
        └── /api/* routes via Python runtime

Supabase (managed Postgres)
  └── PostgreSQL 15 + pgvector
        └── Auth, Storage (optional)
```

## Why Not Oracle Cloud

- Requires credit card with a $1 verification charge
- Many Indian/international cards are rejected
- Manual VM maintenance (updates, security, Docker health)

## Service Breakdown

### 1. Frontend — Vercel (Next.js)

**Cost**: Free
**Credit card**: Not required
**Plan**: Hobby (100GB bandwidth, 6000 build minutes/month, 1 concurrent build)

**Setup**:
1. Push `web/` to GitHub
2. Import repo into Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_BACKEND_BASE_URL` = `https://your-project.vercel.app` (same domain, serverless API)
   - `NEXTAUTH_URL` = `https://your-project.vercel.app`
   - `NEXTAUTH_SECRET` = generate a random 32-char string
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if using Google Auth)
4. Deploy

### 2. Backend API — Vercel Serverless (Python/FastAPI)

**Cost**: Free (included in Hobby plan)
**Credit card**: Not required

FastAPI runs as a Vercel serverless function via the Python runtime. Each request spins up a function instance.

#### Migration Steps

1. **Create `api/index.py`** in the `web/` directory (or as a separate repo):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-project.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include your existing routers
# from app.routers import auth_router, ...

# app.include_router(auth_router, prefix="/api/v1")

handler = Mangum(app)
```

2. **Add `vercel.json`** in `web/`:

```json
{
  "functions": {
    "api/index.py": {
      "runtime": "python3.11",
      "memory": 512,
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" }
  ]
}
```

3. **Add `requirements.txt`** in `api/`:

```
fastapi==0.115.0
mangum==0.17.0
sqlalchemy[asyncio]==2.0.32
asyncpg==0.29.0
psycopg2-binary==2.9.9
pgvector==0.2.5
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.27.0
google-generativeai==0.8.0
sentry-sdk==2.12.0
slowapi==0.1.9
alembic==1.13.2
```

#### Key Limitations

| Feature | Issue | Workaround |
|---------|-------|------------|
| **WebSockets** | Not supported on serverless | Remove real-time features or use Supabase Realtime |
| **Celery / background tasks** | No long-running processes | Replace with Vercel Cron Jobs + lightweight API endpoints |
| **Redis** | No persistent Redis on free tier | Replace with Supabase tables for cache, queues |
| **File uploads** | /tmp is ephemeral (max 512MB) | Already using Uploadcare — no change needed |
| **pgvector** | Requires pgvector extension | Supabase supports pgvector natively |
| **Cold starts** | ~1-3s for Python | Acceptable for low-traffic demo |
| **Function timeout** | Max 30s (Hobby), 60s (Pro) | Ensure no endpoint exceeds this |
| **Request size** | 4.5MB max body | Already within limits |

### 3. Database — Supabase (Managed PostgreSQL)

**Cost**: Free
**Credit card**: Not required
**Plan**: Free (500MB database, 2GB bandwidth, 50K monthly active users)

**Setup**:
1. Sign up at supabase.com (no credit card)
2. Create a new project, choose a region close to you
3. Copy the connection string from Project Settings → Database

**Connection string format**:
```
postgresql+asyncpg://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
```

**Enable pgvector**:
```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

**Run migrations**:
```bash
# From your local machine with the DATABASE_URL pointing to Supabase
alembic upgrade head
```

### 4. Redis Replacement

Supabase does not offer Redis. Replace Redis usage with:

| Current Usage | Replacement |
|---------------|-------------|
| Celery broker | Vercel Cron + API endpoints |
| Rate limiting | `slowapi` with in-memory (single-instance) or Supabase table |
| Session cache | Supabase `pg_session` table with TTL |
| Job queues | Supabase `jobs` table + Vercel Cron polling |

## Environment Variables

### Frontend (`Vercel Project Settings → Environment Variables`)

```
NEXT_PUBLIC_BACKEND_BASE_URL=https://your-project.vercel.app
BACKEND_BASE_URL=https://your-project.vercel.app
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<random-32-char-string>
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=<your-key>
```

### Backend (same Vercel project, same env vars)

```
DATABASE_URL=postgresql+asyncpg://postgres:<password>@<project>.supabase.co:5432/postgres
SECRET_KEY=<random-32-char-string>
ENVIRONMENT=production
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
GEMINI_API_KEY=<your-key>
SERP_API_KEY=<your-key>
FIRECRAWL_API_KEY=<your-key>
SENTRY_DSN=<your-dsn>
```

## Deployment Steps

1. **Prepare backend for serverless**:
   - Add `api/index.py` with Mangum wrapper
   - Add `vercel.json` with rewrites
   - Add `api/requirements.txt`

2. **Set up Supabase**:
   - Create project, enable pgvector
   - Run Alembic migrations against Supabase connection string

3. **Push to GitHub** and import into Vercel

4. **Configure Vercel**:
   - Framework preset: Next.js
   - Root directory: `web/`
   - Build command: `next build`
   - Output directory: `.next`

5. **Add all environment variables**

6. **Deploy** — Vercel detects both Next.js pages and Python functions automatically

## Testing Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally (simulates serverless environment)
cd web
vercel dev
```

## Cost Summary

| Service | Monthly Cost | Credit Card Required |
|---------|-------------|---------------------|
| Vercel Hobby | $0 | No |
| Supabase Free | $0 | No |
| Uploadcare (existing) | $0 (already set up) | — |
| **Total** | **$0/month** | **None** |

## Trade-offs vs VM/Hybrid Hosting

| Aspect | Vercel + Supabase | VM (Docker Compose) |
|--------|-------------------|---------------------|
| Cost | $0 | Usually $4-6/month |
| Setup effort | 1-2 hours | 30 min |
| Cold starts | Yes (Python) | No |
| Background jobs | Limited | Full Celery/Redis |
| WebSockets | No | Yes |
| Maintenance | Zero | OS updates, Docker health |
| Scaling | Auto | Manual |
| Database backups | Auto (Supabase) | Manual |
