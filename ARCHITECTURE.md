# PLAYD Backend Architecture Principles

## V1
Modular monolith, one deployable API, one PostgreSQL cluster. Keep domain boundaries strict and make each module independently testable.

## V2
Introduce asynchronous messaging for notifications, analytics, matching/index refreshes, and background jobs. Add Redis where justified by latency/load measurements. Keep the API stateless and horizontally scalable.

## V3
Extract only domains that demonstrate independent scaling/deployment needs (for example chat, notifications, discovery/matching). Establish stable contracts around domain events and APIs before extraction.

## Non-negotiables
- No business logic in route handlers.
- No direct cross-module repository access.
- No secrets committed to git.
- Database access is pooled and bounded.
- Every request is traceable with a request ID.
- Readiness checks dependencies; liveness does not.
- Schema/index changes are migration-driven.
