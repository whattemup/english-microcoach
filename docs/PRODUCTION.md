# Production Deployment (Practical)

This repo is set up to run locally with Docker Compose and to deploy the API as a container.

## What “production-ready” means here

- Fail-fast env validation
- Health (`/health`) + readiness (`/ready`) endpoints
- Structured request logging + redaction
- Rate limiting (Redis-backed when `REDIS_URL` is set)
- Safer uploads (size limit + audio-only allowlist)
- Graceful shutdown on SIGTERM/SIGINT
- GitHub Actions CI (build + unit tests)

## Deploy with Docker Compose (single host)

1) On the server, create a `.env` file (next to `docker-compose.prod.yml`) with at least:

```bash
POSTGRES_PASSWORD=change_me
JWT_ACCESS_SECRET=use_a_long_random_secret
JWT_REFRESH_SECRET=use_a_long_random_secret
```

2) Bring up the stack:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

3) Verify:

```bash
curl -sS http://localhost:3001/health
curl -sS http://localhost:3001/ready
```

## Mobile production

For Expo/React Native, use EAS Build + EAS Update.

- Set `EXPO_PUBLIC_API_URL` to your API base URL.
- Use HTTPS in production.

## Ops checklist

- Put API behind a reverse proxy (Caddy/Nginx) with HTTPS.
- Set `TRUST_PROXY=true` when behind a proxy.
- Set `CORS_ORIGINS` to your production domains.
- Use a real STT/TTS/LLM provider (`MOCK_* = false`) and secure API keys via secret manager.
- Use a managed Postgres (recommended) for backups and upgrades.
