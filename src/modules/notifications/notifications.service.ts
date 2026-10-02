import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'system';
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export async function listNotifications(userId: string, limit: number, beforeId?: string): Promise<Notification[]> {
  const result = await db.query<Notification>(
    `SELECT id::text, type::text, title, body, read_at AS "readAt", created_at AS "createdAt"
     FROM notifications
     WHERE user_id = $1
       AND ($2::bigint IS NULL OR id < $2::bigint)
     ORDER BY id DESC
     LIMIT $3`,
    [userId, beforeId ?? null, limit]
  );
  return result.rows;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const result = await db.query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
  if (!result.rowCount) throw new AppError('NOTIFICATION_NOT_FOUND', 'Notification not found.', 404);
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  const result = await db.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
  return Number(result.rows[0]!.count);
}
