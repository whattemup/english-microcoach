# HANDOFF (Canonical Technical Spec)

## 1) System architecture

English MicroCoach is a pnpm monorepo with:
- Mobile app (`apps/mobile`) built on Expo/React Native.
- API (`apps/api`) built on Express + Prisma.
- Shared package (`packages/shared`) for schemas/types.

Runtime dependencies:
- PostgreSQL required.
- Redis optional (rate-limit store + readiness detail when configured).
- STT/TTS/LLM integrations currently mock-first.

## 2) Mobile architecture

- Navigation: native stack in `App.tsx`.
- Auth state: in-memory React context (`AuthContext`).
- API client: `src/api/client.ts` + endpoint helpers.
- Audio capture: `expo-av` recording utility (`src/utils/audio.ts`).
- Screens:
  - `Login`, `Register`
  - `Home` (categories)
  - `Lessons`, `LessonDetail` (attempt recording/submission)
  - `Roleplay`
  - `Review`
  - `Profile` (logout + delete account)

Expo command wrapper is mandatory and script-backed:
- `pnpm --filter @emc/mobile dev` -> `node ./scripts/expo.mjs start`
- `pnpm --filter @emc/mobile build` -> `node ./scripts/expo.mjs export`

## 3) API architecture

- App bootstrap: `src/app.ts` + `src/index.ts`.
- Security middleware: `helmet`, `cors`, `compression`, rate limiting, auth middleware.
- Upload handling: `multer` with audio MIME allowlist and size limit from env.
- Route modules:
  - `/auth`
  - `/categories`
  - `/lessons`
  - `/attempts` (protected)
  - `/roleplay` (protected)
  - `/review` (protected)
  - `/me` (protected)
- Probes:
  - `/health` liveness
  - `/ready` dependency readiness (DB + optional Redis)

## 4) Shared package role

`@emc/shared` provides:
- Request schemas (`registerSchema`, `loginSchema`, `attemptSchema`, etc.).
- Shared TS interfaces for API DTOs.

API imports schemas directly for route validation.

## 5) Authentication flow

1. User registers or logs in (`/auth/register` or `/auth/login`).
2. API returns `accessToken` + `refreshToken`.
3. Mobile stores both in memory (context).
4. Protected requests send `Authorization: Bearer <accessToken>`.
5. `/auth/refresh` exchanges refresh token for new token pair.

## 6) Speech processing flow (implemented)

Attempt flow (`POST /attempts`):
1. Mobile records audio and uploads multipart form.
2. API validates body (`phraseId`, `expectedText`) and file presence.
3. STT service transcribes:
   - Mock mode: transcript is `expectedText` (or fallback mock text).
   - Real mode: delegated to configured provider interface.
4. Scoring service computes score/highlights/missing/extra.
5. API persists `Attempt` and updates mistake/review data.

## 7) Scoring algorithm overview

`scoreAttempt` implementation:
- Normalize text to lowercase tokens and remove punctuation (unicode-aware).
- Compute token Levenshtein distance.
- Similarity = `1 - distance / max(expectedLen, actualLen, 1)`.
- Score is rounded/clamped `0..100`.
- Highlights generated as `correct`, `different`, `missing`, `extra`.

## 8) Roleplay flow

1. Mobile posts audio + `context` to `/roleplay`.
2. API transcribes audio with STT service.
3. API calls LLM service:
   - Mock mode returns deterministic correction/explanation/next suggestion.
   - Real mode delegates to provider interface (not implemented provider).
4. Response includes `transcript`, `corrected`, `spanishExplanation`, `nextSuggestedResponse`.

## 9) Spaced repetition logic

Data model: `ReviewItem` with `dueDate`, `easeFactor`, `intervalDays`, `repetitions`.

Lifecycle:
- When attempts are weak (`score < 90` or missing words), API upserts due-now review item.
- `/review/today` returns due items (`dueDate <= now`).
- `/review/submit` applies `updateSrs(state, quality)`:
  - quality `< 3`: reset repetitions, interval to 1.
  - quality `>= 3`: progress intervals 1 -> 6 -> priorInterval * easeFactor.
  - ease factor lower-bounded at `1.3`.

## 10) Provider abstraction layer

Provider interfaces in `src/providers/types.ts`:
- `STTProvider.transcribeAudio`
- `TTSProvider.synthesize`
- `LLMProvider.roleplay`

Current resolver behavior:
- Only `not_configured` provider exists.
- Mock flags should stay enabled unless real providers are added.

## 11) How to add new lessons

Current source of lesson content is the Prisma seed.

1. Edit `apps/api/prisma/seed.ts`.
2. Add/modify category, lesson, and phrase entries.
3. Rerun seed:

```bash
pnpm --filter @emc/api prisma:seed
```

For full reset + reseed:

```bash
pnpm --filter @emc/api exec prisma migrate reset --force
pnpm --filter @emc/api prisma:seed
```

## 12) How to extend content

Implemented pattern is DB-driven content via Prisma models:
- `LessonCategory` -> `Lesson` -> `LessonPhrase`.

To extend:
1. Add records through seed updates or direct DB writes.
2. Keep required fields aligned with Prisma schema.
3. Consume through existing public routes (`/categories`, `/lessons`, `/lessons/:id`).

## 13) How to deploy

Current repository includes `docker-compose.prod.yml` template and API Dockerfile.

Baseline steps:
1. Set production env/secrets.
2. Run compose file:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

3. Run Prisma migration process for production DB.
4. Validate `/health` and `/ready`.

## 14) How to add a new provider

1. Implement provider class/module matching interface in `src/providers/types.ts`.
2. Add resolver branch in service (`stt.ts`, `tts.ts`, or `llm.ts`).
3. Define provider identifier via env (`STT_PROVIDER`, etc.).
4. Set corresponding `MOCK_*` to `false` only after provider works.
5. Add tests for fallback and provider path.

## 15) Known constraints

- Mobile auth tokens are in-memory only (no persistence across app restarts).
- Provider integrations are scaffold-only; mock mode is required for functional local roleplay/attempt flows without extra implementation.
- `LessonDetail` currently uses first phrase only in UI (`lesson.phrases[0]`).
- Account deletion is irreversible hard delete.
- Upload storage is local filesystem unless mounted volume is configured.

## 16) Production checklist

- [ ] `NODE_ENV=production`
- [ ] Strong JWT secrets set and managed outside git
- [ ] `DATABASE_URL` points to production Postgres
- [ ] `CORS_ORIGINS` explicitly configured
- [ ] `TRUST_PROXY=true` behind reverse proxy
- [ ] `REDIS_URL` configured for distributed rate limiting
- [ ] `UPLOAD_DIR` points to durable writable storage
- [ ] Mock provider strategy decided (`MOCK_*` values)
- [ ] Health/readiness monitored
- [ ] Backups and restore drills for Postgres
