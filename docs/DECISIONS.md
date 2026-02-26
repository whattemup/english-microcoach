# Architecture Decisions

## 2026-02-26 — pnpm monorepo + shared package export-from-source

**Context**
Mobile and API share request/response schemas and types.

**Decision**
Use a pnpm workspace monorepo with `packages/shared` imported by both `apps/mobile` and `apps/api` from source.

**Consequences**
- Single source for shared validation contracts.
- Faster iteration across API and mobile.
- Requires workspace-aware tooling and consistent TS config.

## 2026-02-26 — JWT access + refresh tokens

**Context**
The app needs authenticated operations without server sessions.

**Decision**
Use JWT access tokens for API calls and refresh tokens for token renewal via `/auth/refresh`.

**Consequences**
- Stateless API auth flow.
- Mobile must manage token lifecycle.
- Requires secure secret management per environment.

## 2026-02-26 — Public browsing endpoints

**Context**
Lesson discovery should work before deep authenticated activity.

**Decision**
Keep category and lesson browsing public (`/categories`, `/lessons`, `/lessons/:id`).

**Consequences**
- Lower friction to explore content.
- Clear boundary between browse vs progress-tracking actions.

## 2026-02-26 — Deterministic scoring

**Context**
Speaking feedback should be fast, explainable, and testable.

**Decision**
Use normalized token comparison + edit distance for score/missing/extra/highlights.

**Consequences**
- Predictable outputs and easy unit testing.
- Does not capture nuanced pronunciation quality beyond transcript quality.

## 2026-02-26 — Mock external providers via env flags

**Context**
Local development should work without external STT/TTS/LLM credentials.

**Decision**
Control provider integrations with `MOCK_STT`, `MOCK_TTS`, and `MOCK_LLM` flags.

**Consequences**
- Developer onboarding is simpler and offline-friendly.
- Production-like behavior requires explicitly disabling mocks and configuring provider keys.
