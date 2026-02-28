# API Reference

Base URL local: `http://localhost:3001`

## Probes

### `GET /health`
- Auth: no.
- Body: none.
- `200`: `{ "ok": true }`.

### `GET /ready`
- Auth: no.
- Body: none.
- `200`: `{ "ok": true, "ready": true, "status": { "database": true, "redis": true|false } }`.
- `503`: same shape with `ok: false` when DB/Redis readiness fails.

## Auth

### `POST /auth/register`
- Auth: no.
- Body: `{ email, password, name? }`.
- `201`: `{ accessToken, refreshToken }`.
- Common errors:
  - `409` `{ message: "El correo ya está registrado" }`
  - `400` `{ message: "Datos inválidos", details[] }`

### `POST /auth/login`
- Auth: no.
- Body: `{ email, password }`.
- `200`: `{ accessToken, refreshToken }`.
- Common errors:
  - `401` `{ message: "Credenciales inválidas" }`
  - `400` `{ message: "Datos inválidos", details[] }`

### `POST /auth/refresh`
- Auth: no.
- Body: `{ refreshToken }`.
- `200`: `{ accessToken, refreshToken }`.
- Common errors:
  - `400` `{ message: "Datos inválidos", details[] }`
  - `401` `{ message: "No autorizado" }` (JWT invalid)

## Catalog

### `GET /categories`
- Auth: no.
- Body: none.
- `200`: `Category[]` where `Category = { id, name, description, createdAt }`.

### `GET /lessons?categoryId=<number>`
- Auth: no.
- Body: none.
- `200`: `Lesson[]` where `Lesson = { id, categoryId, title, level, createdAt, updatedAt }`.
- Common errors:
  - `400` `{ message: "categoryId es requerido" }`

### `GET /lessons/:id`
- Auth: no.
- Body: none.
- `200`: `LessonDetail` including `phrases[]`.
- Common errors:
  - `404` `{ message: "Lección no encontrada" }`

## Protected routes

All routes below require `Authorization: Bearer <accessToken>`.

### `POST /attempts` (multipart)
- Auth: yes.
- Content-Type: `multipart/form-data`.
- Fields:
  - `audio` (required file)
  - `phraseId` (number)
  - `expectedText` (string)
- `200`:
  - `{ score, highlights, missing, extra, spanishTip, transcript, confidence, attemptId }`
- Common errors:
  - `400` `{ message: "Audio requerido" }`
  - `404` `{ message: "Frase no encontrada" }`
  - `400` `{ message: "Datos inválidos", details[] }`
  - `400` `{ message: "Error al subir audio. Verifica el tamaño y formato." }`
  - `501` `{ error: "provider_not_configured", providerType, hint }`

### `POST /roleplay` (multipart)
- Auth: yes.
- Content-Type: `multipart/form-data`.
- Fields:
  - `audio` (required file)
  - `context` (string)
- `200`:
  - `{ transcript, corrected, spanishExplanation, nextSuggestedResponse }`
- Common errors:
  - `400` `{ message: "Audio requerido" }`
  - `400` `{ message: "Datos inválidos", details[] }`
  - `501` `{ error: "provider_not_configured", providerType, hint }`

### `GET /review/today`
- Auth: yes.
- Body: none.
- `200`: `ReviewItem[]` with `phrase` + nested `lesson` included.

### `POST /review/submit`
- Auth: yes.
- Body: `{ reviewItemId, quality }` where `quality` is integer `0..5`.
- `200`: updated `ReviewItem`.
- Common errors:
  - `404` `{ message: "Elemento de repaso no encontrado" }`
  - `400` `{ message: "Datos inválidos", details[] }`

### `DELETE /me`
- Auth: yes.
- Body: none.
- `204`: empty response.

## Global/common errors

- `401` `{ message: "No autorizado: token faltante" }`
- `401` `{ message: "No autorizado: token inválido" }`
- `429` `{ message: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." }`
- `500` `{ message: "Error interno del servidor" }` (production)
