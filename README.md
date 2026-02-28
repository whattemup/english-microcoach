# English MicroCoach

English MicroCoach is a pnpm workspace with an Expo mobile app and an Express API for short spoken-English practice loops: record audio, get deterministic scoring, and review weak phrases with SRS-backed scheduling.

## Architecture

- `apps/mobile` — Expo React Native client (`@emc/mobile`)
- `apps/api` — Express + Prisma API (`@emc/api`)
- `packages/shared` — shared Zod schemas and TypeScript types (`@emc/shared`)
- `docs` — technical docs, setup, API reference, production notes, and handoff guide

## Quickstart

1. Install dependencies:

```bash
pnpm install
```

2. Create env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

3. Start local infra (Postgres + Redis):

```bash
docker compose -f docker-compose.local.yml up -d
```

4. Prepare database:

```bash
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
```

5. Start API + mobile dev servers:

```bash
pnpm dev
```

## Dev workflow

- Run both apps:

```bash
pnpm dev
```

- Run API only:

```bash
pnpm --filter @emc/api dev
```

- Run mobile only (via repo Expo wrapper):

```bash
pnpm --filter @emc/mobile dev
```

## Build workflow

- Build all workspace packages/apps with build scripts:

```bash
pnpm build
```

- Build API:

```bash
pnpm --filter @emc/api build
```

- Export mobile bundle (Expo export through wrapper):

```bash
pnpm --filter @emc/mobile build
```

## Testing

- Run all tests that exist in the workspace:

```bash
pnpm test
```

- Run API tests only:

```bash
pnpm --filter @emc/api test
```

## Mock providers (current behavior)

The API supports mock toggles for STT/TTS/LLM:

- `MOCK_STT`
- `MOCK_TTS`
- `MOCK_LLM`

In non-production environments, mocks default to enabled unless explicitly set. Real providers are currently scaffolded only; if a mock is disabled, the matching `*_PROVIDER` value must be set and implemented.

## Database operations

- Start DB stack:

```bash
docker compose -f docker-compose.local.yml up -d
```

- Stop DB stack:

```bash
docker compose -f docker-compose.local.yml down
```

- Reset DB data and reseed:

```bash
pnpm --filter @emc/api exec prisma migrate reset --force
pnpm --filter @emc/api prisma:seed
```

## pnpm workspace + hoisting

This repo uses pnpm workspaces (`pnpm-workspace.yaml`) and hoisted node linking:

- Root `package.json`: `nodeLinker: hoisted`, `publicHoistPattern: ["*"]`
- `.npmrc`: `node-linker=hoisted`, `public-hoist-pattern[]=*`, `shamefully-hoist=true`

This is intentional and required for current Expo/React Native dependency resolution behavior.

## Folder structure

```text
english-microcoach/
├─ apps/
│  ├─ api/
│  │  ├─ prisma/
│  │  ├─ src/
│  │  └─ .env.example
│  └─ mobile/
│     ├─ scripts/expo.mjs
│     ├─ src/
│     └─ .env.example
├─ packages/
│  └─ shared/
├─ docs/
├─ docker-compose.yml
├─ docker-compose.local.yml
├─ docker-compose.prod.yml
├─ package.json
├─ pnpm-workspace.yaml
└─ .npmrc
```
