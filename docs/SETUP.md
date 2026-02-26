# Setup (Windows-first)

## Requirements

- Node.js 20+
- pnpm 9+
- Docker Desktop (Linux engine running)

## 1) Install dependencies

```bash
pnpm install
```

## 2) Start PostgreSQL (Docker)

From repo root:

```bash
docker compose up -d
```

## 3) Configure env files

### API (`apps/api/.env`)

Copy example and verify at least:

```env
DATABASE_URL="postgresql://emc:emc@localhost:5432/emc?schema=public"
JWT_ACCESS_SECRET="access_secret_dev"
JWT_REFRESH_SECRET="refresh_secret_dev"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
MOCK_STT=true
MOCK_TTS=true
MOCK_LLM=true
```

### Mobile (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## 4) Prisma workflow (always use `pnpm exec`)

```bash
pnpm --filter @emc/api exec prisma generate
pnpm --filter @emc/api exec prisma migrate dev
pnpm --filter @emc/api exec prisma db seed
```

## 5) Start services

```bash
pnpm dev
```

This runs API + mobile dev servers in parallel.

## Troubleshooting

### `P1001: Can't reach database server`

- Check Docker container is running: `docker compose ps`
- Confirm `DATABASE_URL` host/port/db/user/password match docker compose config.
- Retry migration once DB is healthy.

### Prisma EPERM rename lock (Windows)

Symptom: EPERM during Prisma engine rename/generate.

Workaround:
1. Stop Node/TSX/Expo processes that may lock files.
2. Remove Prisma generated cache folder:
   `apps\\api\\node_modules\\.prisma`
3. Rerun:
   `pnpm --filter @emc/api exec prisma generate`

Optional: add Windows Defender exclusion for the repo to reduce file lock contention.

### Docker Desktop engine pipe error

If Docker commands fail with pipe/engine connection errors:
- Open Docker Desktop.
- Ensure Docker Desktop is running and set to Linux containers.
- Wait until engine status is healthy, then rerun `docker compose up -d`.

## Expo networking notes

- Physical phone + Expo Go: use LAN IP (`http://<your-lan-ip>:3001`), not `localhost`.
- Android emulator: use `http://10.0.2.2:3001`.
