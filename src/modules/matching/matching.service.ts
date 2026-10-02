import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export interface MatchSummary {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  matchedAt: string;
}

export async function createMatchIfMutualLike(actorUserId: string, targetUserId: string): Promise<MatchSummary | null> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const mutual = await client.query<{ target_id: string }>(
      `SELECT s.target_user_id AS target_id
       FROM swipes s
       JOIN swipes reverse_swipe
         ON reverse_swipe.actor_user_id = s.target_user_id
        AND reverse_swipe.target_user_id = s.actor_user_id
       WHERE s.actor_user_id = $1
         AND s.target_user_id = $2
         AND s.action = 'like'
         AND reverse_swipe.action = 'like'
       FOR UPDATE OF s, reverse_swipe`,
      [actorUserId, targetUserId]
    );

    if (!mutual.rows[0]) {
      await client.query('COMMIT');
      return null;
    }

    const userA = actorUserId < targetUserId ? actorUserId : targetUserId;
    const userB = actorUserId < targetUserId ? targetUserId : actorUserId;

    const match = await client.query<{ id: string; created_at: string }>(
      `INSERT INTO matches (user_a_id, user_b_id, status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (user_a_id, user_b_id)
       DO UPDATE SET status = 'active', unmatched_at = NULL
       RETURNING id, created_at`,
      [userA, userB]
    );

    const profile = await client.query<{ userId: string; displayName: string; avatarUrl: string | null }>(
      `SELECT user_id AS "userId", display_name AS "displayName", avatar_url AS "avatarUrl"
       FROM user_profiles WHERE user_id = $1`,
      [targetUserId]
    );

    await client.query('COMMIT');

    if (!profile.rows[0]) throw new AppError('PROFILE_NOT_FOUND', 'Matched user profile not found.', 404);

    return {
      id: match.rows[0]!.id,
      userId: profile.rows[0].userId,
      displayName: profile.rows[0].displayName,
      avatarUrl: profile.rows[0].avatarUrl,
      matchedAt: match.rows[0]!.created_at
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listMatches(userId: string): Promise<MatchSummary[]> {
  const result = await db.query<MatchSummary>(
    `SELECT m.id,
            CASE WHEN m.user_a_id = $1 THEN m.user_b_id ELSE m.user_a_id END AS "userId",
            p.display_name AS "displayName",
            p.avatar_url AS "avatarUrl",
            m.created_at AS "matchedAt"
     FROM matches m
     JOIN user_profiles p
       ON p.user_id = CASE WHEN m.user_a_id = $1 THEN m.user_b_id ELSE m.user_a_id END
     WHERE (m.user_a_id = $1 OR m.user_b_id = $1)
       AND m.status = 'active'
     ORDER BY m.created_at DESC`,
    [userId]
  );
  return result.rows;
}
