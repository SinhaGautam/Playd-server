import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('chat', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('requires authentication for conversation creation', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'POST', url: '/v1/matches/not-a-uuid/conversation' });
    expect(response.statusCode).toBe(401);
  });

  it('requires authentication for messages', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'GET', url: '/v1/conversations/not-a-uuid/messages' });
    expect(response.statusCode).toBe(401);
  });
});
