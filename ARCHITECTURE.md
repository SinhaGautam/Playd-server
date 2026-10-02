# PLAYD Backend Architecture Principles

## V1

PLAYD V1 is a modular monolith: one deployable API and one PostgreSQL cluster.

Each domain owns its routes, application/service logic, and persistence code. Modules communicate through explicit application interfaces rather than importing another module's repository directly.

Core request flow:

`HTTP -> route/controller -> application service -> repository -> PostgreSQL`

Cross-cutting concerns such as configuration, errors, logging, database access, and authentication infrastructure live outside domain modules.

## Module boundaries

Planned V1 modules:

- auth
- users
- discovery
- matching
- chat
- moderation
- coupons/subscriptions
- notifications

A module should be independently testable and should not depend on another module's database tables through ad-hoc queries.

## Operational foundation

- Environment configuration is validated at startup.
- PostgreSQL access uses a bounded connection pool.
- Every request has a request ID.
- Sensitive request headers are redacted from logs.
- Liveness reports process health only.
- Readiness verifies required dependencies.
- HTTP errors use stable machine-readable error codes.
- Graceful shutdown closes HTTP and database resources.
- CI runs lint, tests, and TypeScript build.

## V2

Introduce asynchronous messaging for notifications, analytics, matching/index refreshes, and background jobs where measured workload justifies it. Add Redis only for a concrete caching, rate-limiting, presence, or coordination requirement.

Keep the API stateless and horizontally scalable.

## V3

Extract only domains that demonstrate independent scaling or deployment needs, for example chat, notifications, or discovery/matching.

Before extraction, establish stable API and domain-event contracts.

## Non-negotiables

- No business logic in route handlers.
- No direct cross-module repository access.
- No secrets committed to git.
- Database access is pooled and bounded.
- Every request is traceable with a request ID.
- Readiness checks dependencies; liveness does not.
- Schema/index changes are migration-driven.
- Do not introduce distributed infrastructure without a measured V1 need.
