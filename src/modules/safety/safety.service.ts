import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'fake_profile' | 'other';

export async function blockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
  if (blockerUserId === blockedUserId) throw new AppError('INVALID_TARGET', 'You cannot block yourself.', 400);

  const target = await db.query("SELECT 1 FROM users WHERE id = $1 AND status <> 'deleted'", [blockedUserId]);
  if (!target.rowCount) throw new AppError('USER_NOT_FOUND', 'User not found.', 404);

  await db.query(
    `INSERT INTO blocks (blocker_user_id, blocked_user_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [blockerUserId, blockedUserId]
  );

  await db.query(
    `UPDATE matches
     SET status = 'unmatched', unmatched_at = NOW()
     WHERE status = 'active'
       AND ((user_a_id = $1 AND user_b_id = $2) OR (user_a_id = $2 AND user_b_id = $1))`,
    [blockerUserId, blockedUserId]
  );
}

export async function unblockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
  const result = await db.query(
    'DELETE FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2',
    [blockerUserId, blockedUserId]
  );
  if (!result.rowCount) throw new AppError('BLOCK_NOT_FOUND', 'Block not found.', 404);
}

export async function reportUser(
  reporterUserId: string,
  reportedUserId: string,
  reason: ReportReason,
  details?: string
): Promise<{ id: string; status: string }> {
  if (reporterUserId === reportedUserId) throw new AppError('INVALID_TARGET', 'You cannot report yourself.', 400);

  const target = await db.query("SELECT 1 FROM users WHERE id = $1 AND status <> 'deleted'", [reportedUserId]);
  if (!target.rowCount) throw new AppError('USER_NOT_FOUND', 'User not found.', 404);

  const result = await db.query<{ id: string; status: string }>(
    `INSERT INTO reports (reporter_user_id, reported_user_id, reason, details)
     VALUES ($1, $2, $3, $4)
     RETURNING id::text, status::text`,
    [reporterUserId, reportedUserId, reason, details?.trim() || null]
  );

  return result.rows[0]!;
}

export async function listBlocks(userId: string): Promise<Array<{ userId: string; blockedAt: string }>> {
  const result = await db.query(
    `SELECT blocked_user_id AS "userId", created_at AS "blockedAt"
     FROM blocks WHERE blocker_user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}
