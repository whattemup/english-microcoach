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

## How to extend content

Seed content lives in `apps/api/prisma/seed.ts` under `lessonsByCategory`.

1. Pick one of the existing categories (`Conversación`, `Trabajo`, `Vida diaria`) or add a new entry to both `categoryData` and `lessonsByCategory`.
2. Add a lesson object with:
   - `title` (human-readable lesson name)
   - `level` (`A1`, `A2`, or `B1`)
   - `phrases` with exactly two entries:
     - first phrase is learner output (seeded with `order: 0`)
     - second phrase is realistic response/follow-up (seeded with `order: 1`)
3. Keep `tags` as an array of lowercase strings (kebab-case recommended).
4. Regenerate DB data so your new content is applied:

```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
pnpm --filter @emc/api exec prisma migrate reset --force
```
