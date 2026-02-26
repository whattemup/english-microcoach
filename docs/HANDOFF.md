# Handoff Guide

Quick pickup checklist for new developers joining English MicroCoach.

1. Read the project root [README](../README.md) for repo purpose and quickstart.
2. Read [SOURCE_OF_TRUTH.md](./SOURCE_OF_TRUTH.md) before changing product/API behavior.
3. Follow [SETUP.md](./SETUP.md) exactly for local environment bootstrap.
4. Check [PROGRESS.md](./PROGRESS.md) for current milestone and active work.
5. Review [DECISIONS.md](./DECISIONS.md) before making architectural changes.

## Common gotchas

- **Expo URL**: devices must use LAN IP; Android emulator uses `http://10.0.2.2:3001`.
- **Prisma EPERM (Windows)**: stop Node/TSX/Expo processes, delete Prisma cache under `node_modules/.pnpm/.../node_modules/.prisma`, then rerun `pnpm --filter @emc/api exec prisma generate`.
