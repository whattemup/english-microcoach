# API Reference

## Base URL

- Local default: `http://localhost:3001`

## Auth header

For protected endpoints, send:

```http
Authorization: Bearer <accessToken>
```

## Endpoints

### Auth

#### `POST /auth/register`
- Auth required: **No**

Request:

```json
{ "name": "Ana", "email": "ana@example.com", "password": "StrongPass123" }
```

Response:

```json
{ "accessToken": "...", "refreshToken": "..." }
```

#### `POST /auth/login`
- Auth required: **No**

Request:

```json
{ "email": "ana@example.com", "password": "StrongPass123" }
```

Response:

```json
{ "accessToken": "...", "refreshToken": "..." }
```

#### `POST /auth/refresh`
- Auth required: **No**

Request:

```json
{ "refreshToken": "..." }
```

Response:

```json
{ "accessToken": "...", "refreshToken": "..." }
```

### Public catalog

#### `GET /categories`
- Auth required: **No**

Response:

```json
[{ "id": 1, "name": "Conversación diaria", "description": "..." }]
```

#### `GET /lessons?categoryId=1`
- Auth required: **No**

Response:

```json
[{ "id": 1, "title": "Daily Talk 1", "level": "A1", "categoryId": 1 }]
```

#### `GET /lessons/:id`
- Auth required: **No**

Response:

```json
{
  "id": 1,
  "title": "Daily Talk 1",
  "level": "A1",
  "phrases": [{ "id": 1, "text": "Sample phrase 1A", "translation": "Frase ejemplo 1A" }]
}
```

### Attempts (protected)

#### `POST /attempts`
- Auth required: **Yes**
- Content type: `multipart/form-data`
- Fields: `audio` (file), `lessonPhraseId`, `expectedText`

Response:

```json
{
  "score": 90,
  "highlights": [{ "word": "hello", "status": "correct" }],
  "missing": [],
  "extra": [],
  "spanishTip": "¡Muy bien! Tu pronunciación y precisión son sólidas.",
  "transcript": "hello",
  "confidence": 0.92,
  "attemptId": 12
}
```

### Roleplay (protected)

#### `POST /roleplay`
- Auth required: **Yes**
- Content type: `multipart/form-data`
- Fields: `audio` (file), `context`

Response:

```json
{
  "transcript": "i need to reschedule my meeting",
  "reply": "Sure, what day works best for you?",
  "feedbackEs": "Buen inicio; añade una hora específica.",
  "suggestedReply": "Could we move it to Thursday at 3 PM?"
}
```

### Review (protected)

#### `GET /review/today`
- Auth required: **Yes**

Response:

```json
[{ "id": 5, "lesson": { "title": "Daily Talk 2" }, "dueDate": "2026-02-26T00:00:00.000Z" }]
```

#### `POST /review/submit`
- Auth required: **Yes**

Request:

```json
{ "reviewItemId": 5, "quality": 4 }
```

Response:

```json
{ "id": 5, "intervalDays": 6, "repetitions": 2, "easeFactor": 2.6, "dueDate": "2026-03-03T00:00:00.000Z" }
```
