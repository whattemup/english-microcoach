# API Reference

Base URL (local default): `http://localhost:3001`

Auth for protected routes:

```http
Authorization: Bearer <accessToken>
```

## Health / readiness

### `GET /health`
- Auth: no
- Response: `{ "ok": true }`

### `GET /ready`
- Auth: no
- Checks DB and (optionally) Redis connectivity.
- Returns `503` when dependencies are not ready.

## Auth

### `POST /auth/register`
- Auth: no
- Body: `{ "email": string, "password": string, "name"?: string }`
- Response: `{ "accessToken": string, "refreshToken": string }`

### `POST /auth/login`
- Auth: no
- Body: `{ "email": string, "password": string }`
- Response: `{ "accessToken": string, "refreshToken": string }`

### `POST /auth/refresh`
- Auth: no
- Body: `{ "refreshToken": string }`
- Response: `{ "accessToken": string, "refreshToken": string }`

## Catalog (public)

### `GET /categories`
- Auth: no
- Response: lesson categories.

### `GET /lessons?categoryId=<number>`
- Auth: no
- `categoryId` is required.

### `GET /lessons/:id`
- Auth: no
- Returns lesson + phrases.

## Attempts (protected)

### `POST /attempts`
- Auth: yes
- Content type: `multipart/form-data`
- Fields:
  - `audio` (file, required)
  - `phraseId` (number, required)
  - `expectedText` (string, required)
- Response includes scoring output:
  - `score`, `highlights`, `missing`, `extra`, `spanishTip`, `transcript`, `confidence`, `attemptId`

## Roleplay (protected)

### `POST /roleplay`
- Auth: yes
- Content type: `multipart/form-data`
- Fields:
  - `audio` (file, required)
  - `context` (string, required)
- Response:
  - `transcript`
  - `corrected`
  - `spanishExplanation`
  - `nextSuggestedResponse`

## Review (protected)

### `GET /review/today`
- Auth: yes
- Returns review items with related phrase/lesson.

### `POST /review/submit`
- Auth: yes
- Body: `{ "reviewItemId": number, "quality": 0..5 }`
- Updates SRS state and `dueDate`.

## Account (protected)

### `DELETE /me`
- Auth: yes
- Hard-deletes current user and related attempts/mistakes/review items.
- Response: `204 No Content`
