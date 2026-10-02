import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('discovery', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('requires authentication for discovery', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/v1/discovery' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: 'UNAUTHORIZED' });
  });

  it('validates swipe payloads before database access', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({
      method: 'POST',
      url: '/v1/discovery/swipes',
      headers: { authorization: 'Bearer invalid' },
      payload: { targetUserId: 'not-a-uuid', action: 'like' }
    });

    expect(response.statusCode).toBe(401);
  });
});
