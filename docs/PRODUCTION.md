# Production Notes

## Environment variables (API)

Defined in `apps/api/.env.example` and validated in `apps/api/src/config.ts`:

- Core: `NODE_ENV`, `PORT`, `DATABASE_URL`
- Auth: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`
- Providers: `MOCK_STT`, `MOCK_TTS`, `MOCK_LLM`, `STT_PROVIDER`, `TTS_PROVIDER`, `LLM_PROVIDER`
- Uploads: `UPLOAD_DIR`, `MAX_UPLOAD_MB`
- Network/security: `CORS_ORIGINS`, `TRUST_PROXY`
- Rate limit: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `REDIS_URL`
- Logging: `LOG_LEVEL`

## Docker notes

- Local infra: `docker-compose.local.yml` (`postgres`, `redis`).
- DB-only quick start: `docker-compose.yml` (`postgres` only).
- Production stack template: `docker-compose.prod.yml` (`postgres`, `redis`, `api`).

Bring up production compose template:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## Build steps

```bash
pnpm install
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api build
pnpm --filter @emc/api test
pnpm --filter @emc/mobile build
```

## Deployment steps (single host template)

1. Provide production secrets in `.env` for compose.
2. Start `docker-compose.prod.yml`.
3. Run DB migration workflow before serving traffic.
4. Verify probes:

```bash
curl -sS http://localhost:3001/health
curl -sS http://localhost:3001/ready
```

## Production warnings

- Real STT/TTS/LLM providers are not implemented beyond `not_configured`; disabling mocks without adding providers will break those flows.
- In production CORS defaults to deny when `CORS_ORIGINS` is empty.
- `DELETE /me` is a hard delete.
- Uploaded audio files are stored on disk; configure durable writable storage (`UPLOAD_DIR`).

## Key rotation notes

- Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` together in a planned window.
- Existing refresh tokens signed by previous secret become invalid after rotation.
- Keep secret values outside source control (secret manager or host-level env).

## Rate limiting notes

- API always applies rate limiting middleware except `/health` and `/ready`.
- If `REDIS_URL` is set and available, limiter uses Redis store (better for multi-instance).
- If Redis init/runtime fails, limiter logs a warning and falls back/fails open to avoid total outage.
