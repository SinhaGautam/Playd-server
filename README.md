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
4. Start the API with `npm run dev`.

The API listens on port 3000 by default.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Health endpoints

- `GET /health/live` — process/liveness check.
- `GET /health/ready` — PostgreSQL readiness check.

## Architecture

V1 uses a modular-monolith structure designed for later extraction of independently scaling domains. See [ARCHITECTURE.md](./ARCHITECTURE.md).
