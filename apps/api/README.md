# @emc/api

Express + Prisma API for English MicroCoach.

## Commands

From repo root:

```bash
pnpm --filter @emc/api dev
pnpm --filter @emc/api build
pnpm --filter @emc/api start
pnpm --filter @emc/api test
```

## Environment

Create env file:

```bash
cp apps/api/.env.example apps/api/.env
```

All required/current variables are documented in `.env.example`.

## DB setup

Start local services:

```bash
docker compose -f docker-compose.local.yml up -d
```

Generate Prisma client + apply migration + seed data:

```bash
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
```

## Migrations

Create/apply migration (current script name):

```bash
pnpm --filter @emc/api prisma:migrate
```

Reset local DB (destructive):

```bash
pnpm --filter @emc/api exec prisma migrate reset --force
```

## Seed

Run seed explicitly:

```bash
pnpm --filter @emc/api prisma:seed
```

Current seed creates 3 categories and 30 lessons with sample phrases.

## Testing

```bash
pnpm --filter @emc/api test
```

## Mock vs real providers

- Defaults are mock-friendly in local/dev (`MOCK_STT`, `MOCK_TTS`, `MOCK_LLM`).
- Provider selection env vars exist (`STT_PROVIDER`, `TTS_PROVIDER`, `LLM_PROVIDER`) but only a `not_configured` provider implementation exists right now.
- If any mock flag is `false` and provider is not implemented/configured, requests fail with a provider-not-configured error.
