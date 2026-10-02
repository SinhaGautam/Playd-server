import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('matching', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('requires authentication for matches', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'GET', url: '/v1/matches' });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: 'UNAUTHORIZED' });
  });

  it('requires authentication for match creation', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({
      method: 'POST',
      url: '/v1/matches/not-a-uuid'
    });
    expect(response.statusCode).toBe(401);
  });
});
