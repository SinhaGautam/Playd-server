import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('billing', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it('requires authentication for subscription state', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: 'GET', url: '/v1/billing/subscription' });
    expect(response.statusCode).toBe(401);
  });

  it('requires authentication for coupon redemption', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({
      method: 'POST',
      url: '/v1/billing/coupons/redeem',
      payload: { code: 'WELCOME30' }
    });
    expect(response.statusCode).toBe(401);
  });
});
