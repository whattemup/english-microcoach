# Progress Log

## Baseline (2026-02-26)

- Branch: `work`
- API: TypeScript build is passing (`tsc -p tsconfig.json`) and service runs on `:3001` in local dev.
- DB: Docker Compose PostgreSQL local flow is working.
- Seed: Prisma seed creates 3 categories and 30 lessons.
- Mobile: Expo app starts; authenticated end-to-end app flow wiring is still in progress.

## Current status (2026-02-26)

Core local development flow is working on this repository: API builds, database bootstrap works through Docker + Prisma, lesson catalog seeding is in place, and public lesson browsing endpoints are enabled.

## Completed

- **2026-02-26** Docker PostgreSQL is running via `docker compose`.
- **2026-02-26** Prisma migration and seed workflow is working locally.
- **2026-02-26** Seed currently creates 3 lesson categories and 30 lessons.
- **2026-02-26** `GET /categories` is public and returns category data.
- **2026-02-26** API TypeScript build passes (`tsc -p tsconfig.json`).
- **2026-02-26** Known Windows Prisma EPERM rename issue is documented with workaround.

## In progress

- **2026-02-26** Tightening docs as a single source of truth for architecture/setup/API/auth and handoff.
- **2026-02-26** Keeping API docs aligned with actual route protection and request shapes.

## Next up

1. **2026-02-26** Add endpoint-level examples for more protected flows from real request/response captures.
2. **2026-02-26** Add deployment-oriented environment documentation (beyond local dev).
3. **2026-02-26** Add troubleshooting notes for mobile networking by platform (iOS simulator vs device vs Android emulator).
