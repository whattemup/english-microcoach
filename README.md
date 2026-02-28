# English MicroCoach

Monorepo (pnpm workspace) with:
- `@emc/api` (`apps/api`): Express + Prisma + PostgreSQL.
- `@emc/mobile` (`apps/mobile`): Expo React Native app.
- `@emc/shared` (`packages/shared`): shared Zod schemas/types.

See canonical spec: [`docs/HANDOFF.md`](docs/HANDOFF.md).

## Current System Status

- Mobile works end-to-end in **mock provider mode** (`MOCK_STT/TTS/LLM=true`).
- API provider integrations are scaffolded behind interfaces; local dev without keys should keep mock mode on.
- Mobile auth tokens are stored **in-memory only** (React context, no persistence).
- Redis is optional:
  - `/health` stays `200` if API process is up.
  - `/ready` returns `503` when required dependencies are not ready (DB always; Redis only when `REDIS_URL` is configured).

## Quickstart (canonical)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
docker compose -f docker-compose.local.yml up -d
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
pnpm dev
```

## Core commands

```bash
# API
pnpm --filter @emc/api dev
pnpm --filter @emc/api build
pnpm --filter @emc/api test

# Mobile (wrapper-backed)
pnpm --filter @emc/mobile dev
pnpm --filter @emc/mobile build

# Workspace
pnpm build
pnpm test
```

## Expo wrapper (mandatory)

Under pnpm hoisting, do not rely on global `expo`.

- `pnpm --filter @emc/mobile dev` runs `node ./scripts/expo.mjs start`
- `pnpm --filter @emc/mobile build` runs `node ./scripts/expo.mjs export`

## pnpm workspace + hoisting

This repo intentionally uses hoisted node resolution for Expo/Metro compatibility:
- `pnpm-workspace.yaml` defines `apps/*` and `packages/*` workspaces.
- `.npmrc` enables `node-linker=hoisted`, `public-hoist-pattern[]=*`, `shamefully-hoist=true`.

## Troubleshooting

- **PowerShell curl:** `curl` maps to `Invoke-WebRequest`; use `curl.exe` for real curl commands.
- **Expo CLI/path errors:** run mobile commands through pnpm scripts (wrapper), not global Expo.
- **Redis down:** expected behavior is `/health` `200`; `/ready` may be `503` when Redis is configured but unavailable.
