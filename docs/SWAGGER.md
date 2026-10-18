# PLAYD API Documentation

- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs.json
- OpenAPI YAML source: docs/openapi.yaml

Swagger UI is enabled by default outside production. Set `SWAGGER_UI_ENABLED=true` to enable it explicitly in a non-production environment. Production startup rejects enabling it, so internal API documentation is not accidentally exposed.

## Use it

1. Start the API with `npm run dev`.
2. Open http://localhost:3000/api-docs.
3. Call public register/login endpoints first to obtain an access token.
4. Click **Authorize**, paste the JWT access token, and try protected routes.

The API serves its maintained `docs/openapi.yaml` file directly, so Swagger UI uses the same specification as the repository documentation. Keep it updated whenever API routes or request/response contracts change.
