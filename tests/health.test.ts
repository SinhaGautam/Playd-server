import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('health', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('returns liveness', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health/live' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ success: true, data: { status: 'ok' }, meta: { requestId: expect.any(String) } });
  });

  it('returns a request id', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health/live' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-request-id']).toBeTypeOf('string');
  });

  it('returns a consistent not found error', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/does-not-exist' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found.' },
      meta: { requestId: expect.any(String) }
    });
    expect(response.json().meta.requestId).toBeTypeOf('string');
  });
});
