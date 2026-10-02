# PLAYD Server

Backend API for the PLAYD sports matching application.

## Stack

- Node.js 22+
- TypeScript
- Fastify
- PostgreSQL
- Docker / Docker Compose
- Vitest

## Local development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Install dependencies with `npm install`.
4. Build with `npm run build`.
5. Apply database migrations with `npm run migrate`.
6. Start the API with `npm run dev`.

The API listens on port 3000 by default.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Authentication

V1 authentication uses scrypt password hashing and signed JWT access tokens. Password hashes and JWT secrets are never returned by API responses. Protected endpoints require `Authorization: Bearer <token>`.

Implemented endpoints:
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/users/me`
- `PUT /v1/users/me/profile`

## Database

Database schema is managed by ordered SQL migrations under `src/db/migrations`.
Run `npm run migrate` after building. Migrations are applied transactionally and protected by a PostgreSQL advisory lock.

V1 includes users/profiles, sports and preferences, discovery swipes, matches, chat, moderation, coupons, subscriptions, and notifications.

## Health endpoints

- `GET /health/live` — process/liveness check.
- `GET /health/ready` — PostgreSQL readiness check.

## API documentation\n\n- OpenAPI specification: [docs/openapi.yaml](./docs/openapi.yaml)\n- API guide: [docs/API.md](./docs/API.md)\n\n## Architecture

V1 uses a modular-monolith structure designed for later extraction of independently scaling domains. See [ARCHITECTURE.md](./ARCHITECTURE.md).
