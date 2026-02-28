# Progress Snapshot

## Implemented

- pnpm monorepo with API, mobile, and shared package.
- API routes for auth, catalog, attempts, roleplay, review, and account deletion.
- Prisma schema + seed (3 categories, 30 lessons).
- Mobile screens for auth, lessons, roleplay, review, profile.
- Expo wrapper script in mobile to avoid pnpm hoisting CLI path issues.

## Current operating mode

- Mock STT/TTS/LLM is the default local path.
- Real provider interfaces exist, but concrete provider integrations are not implemented yet.
