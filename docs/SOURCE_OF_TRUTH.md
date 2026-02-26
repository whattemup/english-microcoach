# Source of Truth

## Product goals

English MicroCoach focuses on:
- Micro-lessons for practical spoken English.
- Speaking practice via short audio attempts.
- Instant feedback after each attempt.
- One-turn roleplay practice.
- Spaced repetition to revisit weak content.

## Tech stack

- **Mobile**: Expo + React Native + TypeScript (`apps/mobile`).
- **API**: Express + TypeScript (`apps/api`).
- **Database**: PostgreSQL + Prisma.
- **Auth**: JWT access + refresh tokens.
- **Shared package**: `@emc/shared` for schemas/types used by both apps.

## System overview

```text
Mobile app (Expo)
  -> API (Express routes + services)
    -> PostgreSQL (Prisma)
    -> Optional external providers (STT / TTS / LLM), with mock fallback
```

The app is expected to run without external provider keys by using mock mode flags.

## API access model

### Public
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /categories`
- `GET /lessons?categoryId=...`
- `GET /lessons/:id`

### Protected (Bearer token required)
- `POST /attempts`
- `POST /roleplay`
- `GET /review/today`
- `POST /review/submit`

## Mock mode design

API behavior is controlled by environment flags:
- `MOCK_STT`
- `MOCK_TTS`
- `MOCK_LLM`

Default behavior in current config treats these as enabled unless explicitly set to `false`, so local development works without external API keys.

## Data model summary

Core Prisma models:
- `User`
- `LessonCategory`
- `Lesson`
- `LessonPhrase`
- `Attempt`
- `Mistake`
- `ReviewItem`

These models cover user identity, lesson catalog, attempt tracking, mistake extraction, and spaced repetition scheduling.

## Scoring model

Attempt scoring is deterministic and local:
- Normalize expected text and transcript into tokens.
- Compute token-level Levenshtein edit distance.
- Derive score from similarity percentage.
- Return:
  - `score`
  - `missing` words
  - `extra` words
  - `highlights` (correct/missing/extra/different)

This gives fast, explainable feedback without requiring an external model call.
