import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

export interface UserProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const result = await db.query<UserProfile>(
    `SELECT
       user_id AS "userId",
       display_name AS "displayName",
       bio,
       date_of_birth AS "dateOfBirth",
       avatar_url AS "avatarUrl",
       latitude::float8 AS latitude,
       longitude::float8 AS longitude,
       city
     FROM user_profiles
     WHERE user_id = $1`,
    [userId]
  );

  const profile = result.rows[0];
  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'User profile not found.', 404);
  }
  return profile;
}

export async function upsertUserProfile(userId: string, profile: Omit<UserProfile, 'userId'>): Promise<UserProfile> {
  const result = await db.query<UserProfile>(
    `INSERT INTO user_profiles (
       user_id, display_name, bio, date_of_birth, avatar_url, latitude, longitude, city
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       bio = EXCLUDED.bio,
       date_of_birth = EXCLUDED.date_of_birth,
       avatar_url = EXCLUDED.avatar_url,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       city = EXCLUDED.city
     RETURNING
       user_id AS "userId",
       display_name AS "displayName",
       bio,
       date_of_birth AS "dateOfBirth",
       avatar_url AS "avatarUrl",
       latitude::float8 AS latitude,
       longitude::float8 AS longitude,
       city`,
    [userId, profile.displayName, profile.bio, profile.dateOfBirth, profile.avatarUrl, profile.latitude, profile.longitude, profile.city]
  );
  return result.rows[0]!;
}
