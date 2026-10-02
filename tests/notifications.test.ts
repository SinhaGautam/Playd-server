import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('notifications', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('requires authentication for notifications', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'GET', url: '/v1/notifications' });
    expect(response.statusCode).toBe(401);
  });

  it('requires authentication for marking notifications read', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'POST', url: '/v1/notifications/not-a-number/read' });
    expect(response.statusCode).toBe(401);
  });
}
});
