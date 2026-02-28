# Local Setup

## Requirements

- Node.js 20+
- pnpm 9+
- Docker (with Compose)

## 1) Install dependencies

```bash
pnpm install
```

## 2) Configure env files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

## 3) Start local infrastructure

```bash
docker compose -f docker-compose.local.yml up -d
```

Services started by this file:
- `postgres` on `5432`
- `redis` on `6379`

## 4) Prepare database

```bash
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
```

## 5) Run apps

```bash
pnpm dev
```

## Useful commands

- API only:

```bash
pnpm --filter @emc/api dev
```

- Mobile only:

```bash
pnpm --filter @emc/mobile dev
```

- Reset DB:

```bash
pnpm --filter @emc/api exec prisma migrate reset --force
pnpm --filter @emc/api prisma:seed
```
