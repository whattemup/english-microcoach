# English MicroCoach

English MicroCoach is a pnpm monorepo for practicing spoken English with short lessons, audio attempts, and feedback loops.
It includes an Express API, an Expo mobile app, and a shared schema/types package.
The current repo is optimized for local development with Docker Postgres and mock AI provider flags.

## Monorepo structure

- `apps/api` — Express + TypeScript API
- `apps/mobile` — Expo + React Native app
- `packages/shared` — shared Zod schemas and TS types
- `docs` — project documentation and handoff notes

## Quickstart (Windows-first)

1. Install dependencies:

```bash
pnpm install
```

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Copy env files:

- `apps/api/.env.example` -> `apps/api/.env`
- `apps/mobile/.env.example` -> `apps/mobile/.env`

4. Run Prisma workflow (prefer `pnpm exec` form):

```bash
pnpm --filter @emc/api exec prisma generate
pnpm --filter @emc/api exec prisma migrate dev
pnpm --filter @emc/api exec prisma db seed
```

5. Start development servers:

```bash
pnpm dev
```

## Important

### Expo networking

- Physical device (Expo Go) must use your LAN IP, not `localhost`.
- Android emulator should use `http://10.0.2.2:3001`.

### Prisma EPERM rename lock on Windows

If Prisma generate fails with EPERM/rename errors:

1. Stop Node/TSX/Expo processes.
2. Remove Prisma engine cache at:
   `node_modules\\.pnpm\\@prisma+client@<version>_prisma@<version>\\node_modules\\.prisma`
3. Re-run:
   `pnpm --filter @emc/api exec prisma generate`

## Environment modes

### Local development

- PostgreSQL runs via Docker Compose.
- `MOCK_STT`, `MOCK_TTS`, and `MOCK_LLM` can stay enabled for local flows without external provider keys.

### Production

- Intended to run with external PostgreSQL and real STT/TTS/LLM providers.
- Full production deployment/runbook is **Not implemented yet** in this repo.

## Docs

- [docs/README.md](docs/README.md)
- [docs/SOURCE_OF_TRUTH.md](docs/SOURCE_OF_TRUTH.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/API.md](docs/API.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/PROGRESS.md](docs/PROGRESS.md)
- [docs/HANDOFF.md](docs/HANDOFF.md)
