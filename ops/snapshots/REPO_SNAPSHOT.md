# Repository Snapshot

Generated at: 2026-02-27T10:47:47.410Z

## Top-level tree (depth 4)

```text
.
  - .dockerignore
  - .github/
    - .github/workflows/
      - .github/workflows/ci.yml
  - .gitignore
  - apps/
    - apps/api/
      - apps/api/.env.example
      - apps/api/Dockerfile
      - apps/api/package.json
      - apps/api/prisma/
        - apps/api/prisma/migrations/
        - apps/api/prisma/schema.prisma
        - apps/api/prisma/seed.ts
      - apps/api/scripts/
        - apps/api/scripts/prisma-generate.js
      - apps/api/src/
        - apps/api/src/app.ts
        - apps/api/src/config.ts
        - apps/api/src/index.ts
        - apps/api/src/middleware/
        - apps/api/src/prisma.ts
        - apps/api/src/routes/
        - apps/api/src/services/
        - apps/api/src/types/
        - apps/api/src/utils/
      - apps/api/tests/
        - apps/api/tests/scoring.test.ts
      - apps/api/tsconfig.json
    - apps/mobile/
      - apps/mobile/.env.example
      - apps/mobile/app.json
      - apps/mobile/App.tsx
      - apps/mobile/babel.config.js
      - apps/mobile/metro.config.js
      - apps/mobile/package.json
      - apps/mobile/src/
        - apps/mobile/src/api/
        - apps/mobile/src/components/
        - apps/mobile/src/context/
        - apps/mobile/src/screens/
        - apps/mobile/src/types.ts
        - apps/mobile/src/utils/
      - apps/mobile/tsconfig.json
  - docker-compose.local.yml
  - docker-compose.prod.yml
  - docker-compose.yml
  - docs/
    - docs/API.md
    - docs/DECISIONS.md
    - docs/HANDOFF.md
    - docs/PRODUCTION.md
    - docs/PROGRESS.md
    - docs/README.md
    - docs/SETUP.md
    - docs/SOURCE_OF_TRUTH.md
  - ops/
    - ops/snapshots/
      - ops/snapshots/FILE_INDEX.json
      - ops/snapshots/README.md
    - ops/tools/
      - ops/tools/generate_repo_snapshot.mjs
  - package.json
  - packages/
    - packages/shared/
      - packages/shared/package.json
      - packages/shared/src/
        - packages/shared/src/index.ts
        - packages/shared/src/schemas.ts
        - packages/shared/src/types.ts
      - packages/shared/tsconfig.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - README.md
  - tsconfig.base.json
```

## apps/* and packages/* key entry files

### apps/api

- apps/api/Dockerfile
- apps/api/package.json
- apps/api/prisma/schema.prisma
- apps/api/src/index.ts
- apps/api/tsconfig.json

### apps/mobile

- apps/mobile/App.tsx
- apps/mobile/package.json
- apps/mobile/tsconfig.json

### packages/shared

- packages/shared/package.json
- packages/shared/src/index.ts
- packages/shared/tsconfig.json

## CI workflows (.github/workflows)

- .github/workflows/ci.yml

## docker-compose*.yml files

- docker-compose.local.yml
- docker-compose.prod.yml
- docker-compose.yml

## docs/* files

- docs/API.md
- docs/DECISIONS.md
- docs/HANDOFF.md
- docs/PRODUCTION.md
- docs/PROGRESS.md
- docs/README.md
- docs/SETUP.md
- docs/SOURCE_OF_TRUTH.md
