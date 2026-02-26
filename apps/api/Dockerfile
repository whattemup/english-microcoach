FROM node:22-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /repo

# ---- deps ----
FROM base AS deps

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --frozen-lockfile --filter @emc/api... \
  && pnpm store prune

# ---- build ----
FROM base AS build

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /repo/package.json ./package.json
COPY --from=deps /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm --filter @emc/api prisma:generate \
  && pnpm --filter @emc/shared build \
  && pnpm --filter @emc/api build

# Create a minimal production bundle for the API.
RUN pnpm --filter @emc/api deploy --prod /prod

# ---- runtime ----
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /prod/ ./

EXPOSE 3001

CMD ["node", "dist/src/index.js"]
