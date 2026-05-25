# Database Strategy: Firebase & Cloud SQL

## Current State

- **Primary database**: PostgreSQL 15 with pgvector extension, running in Docker
- **Driver**: asyncpg via SQLAlchemy 2.0 async
- **Migrations**: Alembic
- **Dev URL**: `postgresql+asyncpg://postgres:postgres@localhost:5432/shikshadisha`
- **Prod URL**: `postgresql+asyncpg://postgres:postgres@db:5432/shikshadisha` (Docker service name)

---

## Option 1: Cloud SQL for PostgreSQL (Recommended)

### Overview

Replace self-managed Docker PostgreSQL with Google Cloud SQL — a fully managed PostgreSQL service. **Zero code changes required.**

### Why This Works

| Aspect | Current (Docker Postgres) | Cloud SQL |
|--------|--------------------------|-----------|
| Code changes | — | **None** |
| SQLAlchemy | Works | Works identically |
| Alembic migrations | Works | Works identically |
| Joins, aggregates, ILIKE | Works | Works identically |
| pgvector | Works | Works (Cloud SQL supports pgvector) |
| Backup/HA | Manual | Built-in automated backups, point-in-time recovery |
| Scaling | Vertical (manual) | Vertical + read replicas |

### Firebase Integration

Firebase Auth, Storage, and FCM can coexist alongside Cloud SQL seamlessly. The architecture:

```
Frontend (Next.js)
  ├── Firebase Auth (authentication)
  ├── Firebase Storage (file uploads)
  └── FastAPI Backend → Cloud SQL PostgreSQL
        └── Firebase Admin SDK (for auth verification, FCM)
```

### Migration Steps

1. **Create Cloud SQL instance** (gcloud CLI or Console)
2. **Set `DATABASE_URL`** to Cloud SQL connection string via Cloud SQL Auth Proxy
3. **Run `alembic upgrade head`** against Cloud SQL
4. **Update `CORS_ALLOWED_ORIGINS`** to include production domains
5. **Deploy** — same Docker image, same code

### Connection

```
DATABASE_URL=postgresql+asyncpg://USER:PASS@CLOUD_SQL_PUBLIC_IP:5432/shikshadisha
```

For production, use the Cloud SQL Auth Proxy sidecar container for encrypted connections.

---

## Option 2: Dual Database (PostgreSQL + Firestore)

### Overview

Keep PostgreSQL as the primary database and add Firestore alongside it, switching between them via `DB_PROVIDER` environment variable.

### Architecture

```
┌──────────────────────┐
│    Routers/Services   │  ← Same interface regardless of DB
├──────────────────────┤
│   Repository Layer    │  ← Abstract interface
├──────────┬───────────┤
│ Postgres  │ Firestore │  ← Two implementations
│ Repos     │ Repos      │
└──────────┴───────────┘
```

### Implementation Approach

1. **Repository Pattern**: Abstract data access behind interfaces (`UserRepository`, `CourseRepository`, etc.)
2. **Factory**: `DB_PROVIDER=postgres|firestore` env variable selects implementation at startup
3. **Postgres repos**: Wrap existing SQLAlchemy queries
4. **Firestore repos**: Rewrite using `google-cloud-firestore` SDK

### What Would Need to Change

| Layer | Files | Impact |
|-------|-------|--------|
| Core DB | `app/db/session.py` | Add Firestore client init alongside SQLAlchemy |
| Models | 7 model files | Keep SQLAlchemy models; add Pydantic schemas for Firestore |
| Services | 5 files | Rewrite data access to call repository methods |
| Routers | 10 files | Inject repository dependencies instead of raw sessions |
| Tasks | 6 files | Same — switch to repository methods |
| Config | `app/config.py` | Add `DB_PROVIDER` setting |
| Alembic | 12 files | Keep for Postgres; irrelevant for Firestore |
| **New files** | ~20 files | Repository interfaces, implementations, factory |

### Key Technical Gaps (Firestore)

| PostgreSQL Feature | Firestore Workaround |
|-------------------|---------------------|
| Joins (selectinload) | 2+ Firestore reads + in-memory composition |
| Aggregates (COUNT, GROUP BY) | Maintain counter fields, client-side computation |
| ILIKE / full-text search | Needs Algolia/Meilisearch or basic `array-contains` |
| UPSERT (on_conflict_do_update) | Read + transaction write |
| Unique constraints | App-level enforcement via queries + transactions |
| Server-side defaults | Client-side `datetime.utcnow()` |

### Migration Complexity

- ~25 new files, ~25 modified files
- Estimated effort: several days of development
- Higher long-term maintenance burden (two DB backends)

---

## Recommendation

**Start with Cloud SQL (Option 1)** — zero code changes, fully managed, works with existing pgvector and full-text search infrastructure.

If Firestore is needed later (for real-time sync, serverless scaling), the repository pattern can be introduced incrementally as a separate project phase. The Cloud SQL migration doesn't preclude adding Firestore in the future.
