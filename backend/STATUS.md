# Backend

This folder contains the **monolithic backend** for ShikshaDisha MVP.

For production scaling, this code will be split into microservices via an API gateway.
See `../docs/ARCHITECTURE_PLAN.md` for details.

## Status

- [x] Auth service (register, login, JWT)
- [x] Onboarding (VARK quiz, profile creation)
- [x] Matching engine (3-layer architecture)
- [x] Course CRUD
- [x] Career skill gap
- [x] Reviews
- [x] Celery tasks (stubs)
- [x] Docker + docker-compose
- [x] Complete Celery task implementations
- [x] Alembic migrations
- [x] Unit / integration tests (E2E suite implemented and verified)