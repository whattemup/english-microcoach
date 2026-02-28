# Source of Truth

## Product scope currently implemented

- Email/password auth with JWT access + refresh tokens.
- Public lesson browsing by category.
- Audio attempt submission with deterministic transcript-vs-expected scoring.
- Roleplay endpoint that returns correction/explanation/suggested next response.
- Review queue using spaced repetition updates.
- Account delete endpoint.

## Stack

- Mobile: Expo + React Native + TypeScript
- API: Express + TypeScript
- Data: PostgreSQL + Prisma
- Shared contracts: `@emc/shared` (Zod + types)

## Runtime shape

```text
Mobile app -> API -> PostgreSQL
                \-> Redis (optional for rate-limit store and readiness check)
                \-> STT/TTS/LLM provider abstraction (mock-first)
```

## Auth boundary

Public routes:
- `/health`, `/ready`
- `/auth/register`, `/auth/login`, `/auth/refresh`
- `/categories`, `/lessons`, `/lessons/:id`

Protected routes:
- `/attempts`
- `/roleplay`
- `/review/today`, `/review/submit`
- `/me`

## Provider behavior

- `MOCK_STT`, `MOCK_TTS`, `MOCK_LLM` control mock behavior.
- In production (`NODE_ENV=production`), mocks default to off unless explicitly enabled.
- Real providers are not implemented beyond the `not_configured` fallback.
