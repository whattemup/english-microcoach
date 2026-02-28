# Local Setup

From repo root:

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

## Single-app commands

```bash
pnpm --filter @emc/api dev
pnpm --filter @emc/mobile dev
```

## Notes

- Use mobile wrapper scripts only (`pnpm --filter @emc/mobile dev|build`).
- PowerShell users: use `curl.exe` (not `curl`) for API checks.
