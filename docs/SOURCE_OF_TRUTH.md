# Source of Truth Files

Use these files first when updating docs:

- Workspace/tooling: `package.json`, `pnpm-workspace.yaml`, `.npmrc`.
- Local/prod infra: `docker-compose.local.yml`, `docker-compose.prod.yml`.
- API env/config: `apps/api/.env.example`, `apps/api/src/config.ts`.
- Mobile env/runtime: `apps/mobile/.env.example`, `apps/mobile/src/api/baseUrl.ts`.
- Expo wrapper: `apps/mobile/scripts/expo.mjs`.
- API routes: `apps/api/src/routes/*.ts` and `apps/api/src/app.ts`.
- API behavior/services: `apps/api/src/services/*.ts`, `apps/api/src/middleware/*.ts`.
- Data model/content: `apps/api/prisma/schema.prisma`, `apps/api/prisma/seed.ts`.
