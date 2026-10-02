# PLAYD Production Operations
## PostgreSQL
Use a managed PostgreSQL 17-compatible service with TLS, automated daily snapshots, point-in-time recovery where available, connection limits, and separate credentials for migrations/runtime.
## Backup / restore
Set DATABASE_URL and run `npm run backup:postgres`. Store dumps outside the application host and encrypt them at rest. Test restore regularly in an isolated database with `BACKUP_FILE=... npm run restore:postgres`.
## Monitoring
`GET /health/live` is liveness, `GET /health/ready` checks PostgreSQL, and `GET /metrics` exposes lightweight process/request metrics. Ship structured Pino logs to the platform log service and route error events to the configured error-monitoring sink.
## Scaling
The V1 rate limiter is process-local. For multiple API replicas, move rate-limit state to Redis in V2. Sessions, idempotency keys, audit logs, and webhook events are database-backed and therefore replica-safe.
## Deployment
Build the immutable Docker image, run migrations as a release step, deploy API replicas only after readiness succeeds, and verify rollback by restoring the previous image and schema-compatible release.
