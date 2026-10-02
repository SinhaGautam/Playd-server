import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('safety', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('requires authentication for block list', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'GET', url: '/v1/safety/blocks' });
    expect(response.statusCode).toBe(401);
  });

  it('requires authentication for reports', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'POST', url: '/v1/safety/reports/not-a-uuid', payload: {} });
    expect(response.statusCode).toBe(401);
  });
});
