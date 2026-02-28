# Progress Snapshot

## Current baseline

- Monorepo contains `@emc/api`, `@emc/mobile`, and `@emc/shared`.
- API has auth, catalog, attempts, roleplay, review, and account deletion routes wired.
- Prisma schema + seed are in place (3 categories, 30 lessons in seed script).
- Mobile app has screens for login/register/home/lessons/lesson detail/roleplay/review/profile.

## Documentation objective

Documentation was rewritten to match code and scripts exactly, including:
- Expo wrapper usage (`node ./scripts/expo.mjs`)
- pnpm workspace + hoisting configuration
- actual docker compose files/services
- real env vars and route contracts
