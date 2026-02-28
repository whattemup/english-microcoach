# HANDOFF (Canonical Technical Spec)

## 0. System Overview

English MicroCoach is a speaking-practice system: mobile users record short audio responses, the API transcribes (mock-first), scores attempts, and schedules review items.

What it is now:
- Functional local flow with mock STT/LLM/TTS.
- JWT auth, lessons catalog, attempts, review queue, roleplay, account delete.

What it is not yet:
- Real STT/TTS/LLM provider implementations (interfaces exist; runtime mock mode is the working path).

## 1. Repo Map

- `apps/api`: Express API, Prisma schema/migrations/seed.
- `apps/mobile`: Expo app (must use `scripts/expo.mjs` wrapper).
- `packages/shared`: shared Zod request schemas + TS DTO types.
- `docs`: operational docs and API contract.
- `docker-compose.local.yml`: local Postgres + Redis.
- `docker-compose.prod.yml`: production topology (Postgres + Redis + API).

## 2. Runtime Topology

`Mobile -> API -> Postgres`

Optional dependencies:
- Redis for distributed rate-limit store and readiness checks when `REDIS_URL` is set.

Providers:
- Mock-first STT/TTS/LLM via `MOCK_STT`, `MOCK_TTS`, `MOCK_LLM`.
- Real providers are selected by `STT_PROVIDER`, `TTS_PROVIDER`, `LLM_PROVIDER` when corresponding mock flag is `false`.
- Current code only resolves `not_configured` provider, which returns `501 provider_not_configured` if mock is off.

## 3. Local Dev (Canonical Commands)

From repo root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
docker compose -f docker-compose.local.yml up -d
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
pnpm dev
```

Mobile wrapper commands (mandatory under pnpm hoisting):

```bash
pnpm --filter @emc/mobile dev    # node ./scripts/expo.mjs start
pnpm --filter @emc/mobile build  # node ./scripts/expo.mjs export
```

## 4. API Architecture

Bootstrap and middleware:
- `src/app.ts`: Express app assembly.
- `src/index.ts`: server startup/shutdown.
- Middleware stack: `helmet`, dynamic `cors`, `compression`, JSON body parser, static `/uploads`, optional Redis-backed rate limiting with in-memory fallback.

Probes:
- `GET /health`: liveness (`{ ok: true }`), always process-level.
- `GET /ready`: readiness checks DB and (if configured) Redis; returns `503` when not ready.

Route mounting:
- Public: `/auth`, `/categories`, `/lessons`.
- Protected (`authMiddleware`): `/attempts`, `/roleplay`, `/review`, `/me`.

## 5. Mobile Architecture

- Navigation: native stack in `App.tsx`.
- Auth: `AuthContext` stores `accessToken` and `refreshToken` in memory only.
- API client: `src/api/client.ts` + `src/api/endpoints.ts`.
- Audio recording: `expo-av` in `src/utils/audio.ts`.
- Base URL: `EXPO_PUBLIC_API_URL` with Android localhost rewrite (`10.0.2.2`) in `src/api/baseUrl.ts`.
- Main screens: Login, Register, Home, Lessons, LessonDetail, Roleplay, Review, Profile.

## 6. Data Model (Prisma purpose summary)

- `User`: account identity + password hash.
- `LessonCategory`: top-level catalog grouping.
- `Lesson`: lesson metadata tied to a category.
- `LessonPhrase`: prompt phrase + translation + order within lesson.
- `Attempt`: per-user speaking submission + transcript + score artifacts.
- `Mistake`: aggregated missing-word counts per user/phrase/word.
- `ReviewItem`: spaced-repetition state per user/phrase (`dueDate`, `intervalDays`, `repetitions`, `easeFactor`).

## 7. Speech / Attempt Pipeline

1. Mobile records audio and submits multipart form (`audio`, `phraseId`, `expectedText`) to `POST /attempts`.
2. API validates body/file and phrase existence.
3. STT stage:
   - Mock: transcript = `expectedText` (or fallback mock text), confidence `0.93`.
   - Real mode: provider interface call.
4. Scoring stage: token normalization + Levenshtein-based similarity.
5. Persistence:
   - Save `Attempt`.
   - Upsert `Mistake` rows for missing words.
   - Upsert `ReviewItem` (due now, interval 1) when score < 90 or any missing words.
6. Response includes score fields, transcript, confidence, and `attemptId`.

## 8. Scoring Contract

Inputs:
- `expectedText` (reference), `transcript` (STT output).

Normalization:
- Lowercase, strip non letter/number/space/apostrophe chars, split tokens.

Computation:
- Token Levenshtein distance.
- `similarity = 1 - distance / max(len(expected), len(actual), 1)`.
- `score = round(similarity * 100)`, clamped `0..100`.

Outputs:
- `score`, `highlights[]` (`correct|missing|extra|different`), `missing[]`, `extra[]`, `spanishTip`.

## 9. SRS Contract

Shared/API contract currently enforces:
- `quality`: integer `0..5` (`POST /review/submit`).

SRS update behavior (`updateSrs`):
- `quality < 3`: reset repetitions to `0`, interval to `1` day.
- Else: increment repetitions, intervals follow `1`, `6`, then `round(interval * easeFactor)`.
- `easeFactor` updated and clamped to minimum `1.3`.

Mobile currently submits discrete quality values in this 0–5 range.

## 10. Provider Abstraction

- Interfaces: `STTProvider`, `TTSProvider`, `LLMProvider` in `src/providers/types.ts`.
- Resolver services: `services/stt.ts`, `services/tts.ts`, `services/llm.ts`.
- Env controls:
  - Mock flags: `MOCK_STT`, `MOCK_TTS`, `MOCK_LLM`.
  - Provider IDs: `STT_PROVIDER`, `TTS_PROVIDER`, `LLM_PROVIDER`.
- Failure modes:
  - Config boot failure if mock flag is false and provider is `not_configured`.
  - Request-time `501` with `provider_not_configured` payload when unresolved provider path executes.

## 11. Content / Seed

Seed source: `apps/api/prisma/seed.ts`.

Current seed result:
- 3 categories (`Conversación`, `Trabajo`, `Vida diaria`).
- 30 lessons total (10/category), 2 sample phrases per lesson.

Reseed commands:

```bash
pnpm --filter @emc/api prisma:migrate
pnpm --filter @emc/api prisma:seed
```

Destructive reset:

```bash
pnpm --filter @emc/api exec prisma migrate reset --force
pnpm --filter @emc/api prisma:seed
```

## 12. Deployment

Local compose:
- `docker-compose.local.yml` starts Postgres + Redis only.

Production compose:
- `docker-compose.prod.yml` runs Postgres + Redis + API.
- API uses `UPLOAD_DIR=/data/uploads`; mount `uploads` volume.

Production DB flow:

```bash
pnpm --filter @emc/api prisma:generate
pnpm --filter @emc/api exec prisma migrate deploy
```

Core env checklist: `DATABASE_URL`, JWT secrets, mock/provider toggles, upload/rate-limit/CORS/proxy settings.

## 13. Workflow Contract

- Use pnpm workspace commands from repo root.
- Keep `pnpm-lock.yaml` committed with dependency changes.
- Before merge, run:

```bash
pnpm --filter @emc/api build
pnpm --filter @emc/api test
pnpm --filter @emc/mobile build
pnpm --filter @emc/mobile dev -- --help
```

- No separate CI workflow file is present; these local checks are the current required baseline.

## 14. Known Constraints / Intentional Simplifications

### Implemented
- Mock provider path works end-to-end locally.
- Deterministic token-based scoring.
- Basic SRS queue updates from review submissions.
- Optional Redis with safe fallbacks.

### Intentional Simplifications
- Auth tokens are in-memory only on mobile.
- Roleplay response is one-turn request/response.
- Seed content is synthetic placeholder phrases.
- Provider resolver only supports `not_configured` right now.

### Extension Hooks
- Add real provider adapters behind existing provider interfaces.
- Persist tokens securely (e.g., secure storage) in mobile.
- Expand scoring/phonetics while preserving current response contract.
- Replace seed placeholders with curated curriculum content.

## 15. Production Checklist

- [ ] Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] Set `DATABASE_URL` to managed Postgres.
- [ ] Set `UPLOAD_DIR` to writable persistent volume path.
- [ ] Set `TRUST_PROXY=true` when behind reverse proxy.
- [ ] Configure `CORS_ORIGINS` for real frontend origins.
- [ ] Decide Redis strategy (`REDIS_URL` optional, recommended for multi-instance).
- [ ] Decide provider mode (`MOCK_*` true/false) and matching provider vars.
- [ ] Run `prisma migrate deploy` during release.
- [ ] Probe `GET /health` and `GET /ready` after deploy.
