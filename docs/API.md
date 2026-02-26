# API Reference

## Base URL

- Local default: `http://localhost:3001`

## Auth header

For protected endpoints, send:

```http
Authorization: Bearer <accessToken>
```

## Endpoints

### Health

#### `GET /health`
- Auth required: **No**

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

#### `GET /lessons?categoryId=1`
- Auth required: **No**

#### `GET /lessons/:id`
- Auth required: **No**

### Attempts (protected)

#### `POST /attempts`
- Auth required: **Yes**
- Content type: `multipart/form-data`
- Fields read by handler:
  - `audio` (file, required)
  - `lessonPhraseId` (form field, number)
  - `expectedText` (form field, string)


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
- Fields read by handler:
  - `audio` (file, required)
  - `context` (form field, string)


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

#### `POST /review/submit`
- Auth required: **Yes**

Request:

```json
{ "reviewItemId": 5, "quality": 4 }
```