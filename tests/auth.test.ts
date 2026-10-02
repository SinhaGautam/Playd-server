import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('authentication', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('rejects protected endpoints without a bearer token', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/v1/users/me' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
    });
  });

  it('validates registration payloads before database access', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: { email: 'not-an-email', password: 'short' }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('validates login payloads before database access', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email: 'not-an-email', password: 'short' }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });
});
