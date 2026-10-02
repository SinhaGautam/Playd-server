import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { getSubscription, redeemCoupon } from './billing.service.js';

const couponSchema = z.object({
  code: z.string().trim().min(1).max(100)
});

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/billing/subscription', { preHandler: requireAuth }, async (request) => ({
    subscription: await getSubscription(request.user.id)
  }));

  app.post('/v1/billing/coupons/redeem', { preHandler: requireAuth }, async (request) => {
    const parsed = couponSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid coupon payload.', 400, parsed.error.flatten());
    }

    return { subscription: await redeemCoupon(request.user.id, parsed.data.code) };
  });
}
