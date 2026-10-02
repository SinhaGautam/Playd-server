import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export interface SubscriptionSummary {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

export async function getSubscription(userId: string): Promise<SubscriptionSummary | null> {
  const result = await db.query<SubscriptionSummary>(
    `SELECT id, status::text, current_period_start AS "currentPeriodStart",
            current_period_end AS "currentPeriodEnd"
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function redeemCoupon(userId: string, rawCode: string): Promise<SubscriptionSummary> {
  const code = rawCode.trim().toUpperCase();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT 1 FROM subscriptions
       WHERE user_id = $1 AND status IN ('trial', 'active') AND
             (current_period_end IS NULL OR current_period_end > NOW())`,
      [userId]
    );
    if (existing.rowCount) {
      throw new AppError('SUBSCRIPTION_ALREADY_ACTIVE', 'An active subscription already exists.', 409);
    }

    const coupon = await client.query<{
      id: string;
      durationDays: number;
    }>(
      `SELECT id, duration_days AS "durationDays"
       FROM coupons
       WHERE code = $1
         AND active = TRUE
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_redemptions IS NULL OR redemption_count < max_redemptions)
       FOR UPDATE`,
      [code]
    );

    if (!coupon.rows[0]) {
      throw new AppError('COUPON_INVALID', 'Coupon is invalid, expired, or unavailable.', 400);
    }

    const alreadyRedeemed = await client.query(
      'SELECT 1 FROM user_coupons WHERE user_id = $1 AND coupon_id = $2',
      [userId, coupon.rows[0].id]
    );
    if (alreadyRedeemed.rowCount) {
      throw new AppError('COUPON_ALREADY_REDEEMED', 'Coupon has already been redeemed by this user.', 409);
    }

    const periodStart = new Date();
    const periodEnd = new Date(periodStart.getTime() + coupon.rows[0].durationDays * 24 * 60 * 60 * 1000);

    await client.query(
      'INSERT INTO user_coupons (user_id, coupon_id) VALUES ($1, $2)',
      [userId, coupon.rows[0].id]
    );
    await client.query(
      'UPDATE coupons SET redemption_count = redemption_count + 1 WHERE id = $1',
      [coupon.rows[0].id]
    );

    const subscription = await client.query<SubscriptionSummary>(
      `INSERT INTO subscriptions (
         user_id, status, current_period_start, current_period_end
       ) VALUES ($1, 'trial', $2, $3)
       RETURNING id, status::text, current_period_start AS "currentPeriodStart",
                 current_period_end AS "currentPeriodEnd"`,
      [userId, periodStart, periodEnd]
    );

    await client.query('COMMIT');
    return subscription.rows[0]!;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
