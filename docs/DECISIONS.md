# Architecture Decisions

## 1) Monorepo + hoisted pnpm linker

Use pnpm workspace with hoisted linker (`.npmrc` + root `package.json`) to keep Expo/Metro resolution stable.

## 2) Expo wrapper scripts are mandatory

Mobile commands run through `apps/mobile/scripts/expo.mjs` (`start`/`export`) instead of relying on global Expo CLI paths.

## 3) Shared contracts in `@emc/shared`

API validates request bodies with shared Zod schemas to keep client/server contracts aligned.

## 4) Mock-first provider strategy

STT/TTS/LLM are abstracted behind interfaces. Mock mode is the default working local path; real providers are extension work.

## 5) Reliability probes split

- `/health`: process liveness only.
- `/ready`: dependency readiness (Postgres and optional Redis).
