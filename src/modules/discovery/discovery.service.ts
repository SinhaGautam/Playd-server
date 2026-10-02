import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export interface DiscoveryCandidate {
  userId: string;
  displayName: string;
  bio: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  city: string | null;
  sports: Array<{ slug: string; name: string; skillLevel: string }>;
  distanceKm: number | null;
}

export async function discoverUsers(
  actorUserId: string,
  limit: number,
  sportSlug?: string
): Promise<DiscoveryCandidate[]> {
  const result = await db.query<DiscoveryCandidate & { sports: unknown; distanceKm: number | null }>(
    `WITH actor AS (
       SELECT p.latitude, p.longitude, pref.min_age, pref.max_age,
              pref.max_distance_km, pref.preferred_city
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN user_preferences pref ON pref.user_id = u.id
       WHERE u.id = $1 AND u.status = 'active'
     ),
     candidates AS (
       SELECT u.id, p.display_name, p.bio, p.date_of_birth, p.avatar_url, p.city,
              p.latitude, p.longitude,
              CASE
                WHEN a.latitude IS NULL OR a.longitude IS NULL OR p.latitude IS NULL OR p.longitude IS NULL THEN NULL
                ELSE 6371 * 2 * ASIN(SQRT(
                  POWER(SIN(RADIANS(p.latitude - a.latitude) / 2), 2) +
                  COS(RADIANS(a.latitude)) * COS(RADIANS(p.latitude)) *
                  POWER(SIN(RADIANS(p.longitude - a.longitude) / 2), 2)
                ))
              END AS distance_km
       FROM users u
       JOIN user_profiles p ON p.user_id = u.id
       CROSS JOIN actor a
       WHERE u.id <> $1
         AND u.status = 'active'
         AND NOT EXISTS (
           SELECT 1 FROM swipes s
           WHERE s.actor_user_id = $1 AND s.target_user_id = u.id
         )
         AND NOT EXISTS (
           SELECT 1 FROM blocks b
           WHERE (b.blocker_user_id = $1 AND b.blocked_user_id = u.id)
              OR (b.blocker_user_id = u.id AND b.blocked_user_id = $1)
         )
         AND (a.min_age IS NULL OR p.date_of_birth IS NULL OR EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN a.min_age AND COALESCE(a.max_age, 100))
         AND (a.max_age IS NULL OR p.date_of_birth IS NULL OR EXTRACT(YEAR FROM AGE(p.date_of_birth)) <= a.max_age)
         AND (a.preferred_city IS NULL OR p.city IS NULL OR LOWER(p.city) = LOWER(a.preferred_city))
         AND (a.max_distance_km IS NULL OR
              a.latitude IS NULL OR a.longitude IS NULL OR p.latitude IS NULL OR p.longitude IS NULL OR
              6371 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(p.latitude - a.latitude) / 2), 2) +
                COS(RADIANS(a.latitude)) * COS(RADIANS(p.latitude)) *
                POWER(SIN(RADIANS(p.longitude - a.longitude) / 2), 2)
              )) <= a.max_distance_km)
     )
     SELECT c.id AS "userId", c.display_name AS "displayName", c.bio,
            c.date_of_birth AS "dateOfBirth", c.avatar_url AS "avatarUrl", c.city,
            c.distance_km AS "distanceKm",
            COALESCE(json_agg(json_build_object(
              'slug', s.slug, 'name', s.name, 'skillLevel', us.skill_level
            ) ORDER BY s.name) FILTER (WHERE s.id IS NOT NULL), '[]') AS sports
     FROM candidates c
     LEFT JOIN user_sports us ON us.user_id = c.id
     LEFT JOIN sports s ON s.id = us.sport_id AND s.active = TRUE
     WHERE ($2::text IS NULL OR EXISTS (
       SELECT 1 FROM user_sports us2
       JOIN sports s2 ON s2.id = us2.sport_id
       WHERE us2.user_id = c.id AND s2.slug = $2
     ))
     GROUP BY c.id, c.display_name, c.bio, c.date_of_birth, c.avatar_url, c.city, c.distance_km
     ORDER BY c.distance_km NULLS LAST, c.id
     LIMIT $3`,
    [actorUserId, sportSlug ?? null, limit]
  );

  return result.rows.map((row) => ({ ...row, sports: row.sports as DiscoveryCandidate['sports'] }));
}

export async function recordSwipe(
  actorUserId: string,
  targetUserId: string,
  action: 'like' | 'pass'
): Promise<{ action: 'like' | 'pass' }> {
  if (actorUserId === targetUserId) {
    throw new AppError('INVALID_TARGET', 'You cannot swipe on yourself.', 400);
  }

  const target = await db.query<{ id: string }>(
    "SELECT id FROM users WHERE id = $1 AND status = 'active'",
    [targetUserId]
  );
  if (!target.rows[0]) throw new AppError('USER_NOT_FOUND', 'Target user not found.', 404);

  const blocked = await db.query(
    `SELECT 1 FROM blocks
     WHERE (blocker_user_id = $1 AND blocked_user_id = $2)
        OR (blocker_user_id = $2 AND blocked_user_id = $1)`,
    [actorUserId, targetUserId]
  );
  if (blocked.rowCount) throw new AppError('USER_UNAVAILABLE', 'This user is unavailable.', 403);

  await db.query(
    `INSERT INTO swipes (actor_user_id, target_user_id, action)
     VALUES ($1, $2, $3)
     ON CONFLICT (actor_user_id, target_user_id)
     DO UPDATE SET action = EXCLUDED.action, created_at = NOW()`,
    [actorUserId, targetUserId, action]
  );

  return { action };
}
