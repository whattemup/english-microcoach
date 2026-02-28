# Production Guide

## Runtime baseline

- Node.js: **22.x** (matches `apps/api/Dockerfile` base image `node:22-alpine`).
- pnpm: **9.12.0** (from root `packageManager`).

## Required environment variables (API)

From `apps/api/.env.example`:

- `PORT` (default `3001`).
- `DATABASE_URL` (required PostgreSQL DSN).
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (required, long random values).
- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` (token TTLs).
- `MOCK_STT`, `MOCK_TTS`, `MOCK_LLM` (`false` in real-provider prod; `true` for mock-only prod).
- `STT_PROVIDER`, `TTS_PROVIDER`, `LLM_PROVIDER` (must not be `not_configured` when corresponding mock flag is `false`).
- `UPLOAD_DIR` (use persistent writable path, e.g. `/data/uploads`).
- `MAX_UPLOAD_MB`.
- `CORS_ORIGINS` (comma-separated allowed origins).
- `TRUST_PROXY` (`true` behind reverse proxy/LB).
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.
- `REDIS_URL` (optional; recommended for multi-instance rate limiting).
- `LOG_LEVEL`.

## CORS / proxy

- Production CORS is allowlist-based (`CORS_ORIGINS`). Empty list blocks browser origins.
- Set `TRUST_PROXY=true` when API is behind Nginx/ALB/Ingress so IP/rate-limit behavior is correct.

## Redis guidance

- Optional: API runs without Redis.
- Recommended for production: set `REDIS_URL` for shared rate-limiting state.
- If `REDIS_URL` is set and Redis is down, `/ready` returns `503`.

## Upload storage

- Audio uploads are written to `UPLOAD_DIR`.
- Mount this path to persistent storage (volume/object-store sidecar strategy).
- In `docker-compose.prod.yml`, default is `/data/uploads` mounted to volume `uploads`.

## Migrations (release flow)

```bash
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api exec prisma migrate deploy
pnpm --filter @emc/api build
```

## Health endpoints

- `GET /health`: liveness, returns `200 { ok: true }` if process is alive.
- `GET /ready`: readiness, checks Postgres and optional Redis; returns `503` when not ready.
