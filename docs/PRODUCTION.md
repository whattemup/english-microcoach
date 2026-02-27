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

By default, `MOCK_STT`, `MOCK_TTS`, and `MOCK_LLM` are `true` unless you set them in server `.env`.

If your real providers are configured, set mocks off explicitly:

```bash
MOCK_STT=false
MOCK_TTS=false
MOCK_LLM=false
```

3) Verify:

```bash
curl -sS http://localhost:3001/health
curl -sS http://localhost:3001/ready
```


### Provider scaffolding environment variables

- `STT_PROVIDER`
- `TTS_PROVIDER`
- `LLM_PROVIDER`

Defaults are `not_configured`. If you set any `MOCK_*` flag to `false`, you must set the corresponding `*_PROVIDER` to a real provider value (real provider integrations are not implemented yet in this scaffold).

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
