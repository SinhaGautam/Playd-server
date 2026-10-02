# PLAYD API Documentation

The machine-readable contract is [OpenAPI 3.0](./openapi.yaml).

## Base URL

Local development: `http://localhost:3000`

All versioned endpoints use the `/v1` prefix. Protected endpoints require:

```
Authorization: Bearer <JWT>
```

## Response envelope

Successful responses:

```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "..." }
}
```

Errors:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Validation failed." },
  "meta": { "requestId": "..." }
}
```

## Endpoint groups

- Auth: register and login
- Users: current user and profile
- Discovery: candidates and swipes
- Matches: list/create matches
- Chat: conversations and messages
- Safety: blocks and reports
- Billing: subscription and coupon redemption
- Notifications: list and mark read
- Health: liveness and readiness

The OpenAPI file is the source of truth for request parameters, authentication requirements, response envelopes, and validation constraints.
