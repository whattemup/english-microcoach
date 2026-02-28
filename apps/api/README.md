# @emc/api

Express + Prisma API.

## Setup

```bash
cp apps/api/.env.example apps/api/.env
docker compose -f docker-compose.local.yml up -d
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
```

## Commands

```bash
pnpm --filter @emc/api dev
pnpm --filter @emc/api build
pnpm --filter @emc/api start
pnpm --filter @emc/api test
```

## Notes

- Local default is mock providers (`MOCK_STT/TTS/LLM=true`).
- If any mock flag is `false`, matching `*_PROVIDER` must be configured and implemented.
- Probes: `/health` (liveness), `/ready` (DB + optional Redis readiness).
