# Architecture Decisions

## 1) pnpm workspace + hoisted linker

- Keep repository as a pnpm workspace (`apps/*`, `packages/*`).
- Use hoisted node linker (`node-linker=hoisted`, `public-hoist-pattern[]=*`, `shamefully-hoist=true`) for current Expo/React Native dependency resolution needs.

## 2) Shared validation contracts in `@emc/shared`

- Store shared Zod schemas and TypeScript DTO types in one package used by API and mobile.
- API validates requests against shared schemas at route boundaries.

## 3) Stateless auth

- Use JWT access and refresh tokens.
- Keep API stateless with bearer auth middleware on protected routes.

## 4) Mock-first provider abstraction

- Keep STT/TTS/LLM behind provider interfaces.
- Support local operation without external credentials through mock toggles.

## 5) Deterministic scoring and simple SRS

- Speaking attempt score comes from normalized token Levenshtein similarity.
- Review scheduling uses an SM-2-like update function over `intervalDays`, `repetitions`, and `easeFactor`.
