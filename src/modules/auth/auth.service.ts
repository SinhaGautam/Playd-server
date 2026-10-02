import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from '../../db/pool.js';
import { AppError } from '../../core/errors.js';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export interface AuthUser {
  id: string;
  email: string;
  status: 'active' | 'suspended' | 'deleted';
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('base64url');
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${derived.toString('base64url')}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [scheme, salt, expected] = encoded.split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;

  const actual = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const expectedBuffer = Buffer.from(expected, 'base64url');
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

export async function registerUser(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(password);

  try {
    const result = await db.query<AuthUser>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, status`,
      [normalizedEmail, passwordHash]
    );
    return result.rows[0]!;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new AppError('EMAIL_ALREADY_EXISTS', 'An account with this email already exists.', 409);
    }
    throw error;
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = normalizeEmail(email);
  const result = await db.query<AuthUser & { password_hash: string }>(
    'SELECT id, email, status, password_hash FROM users WHERE email = $1',
    [normalizedEmail]
  );
  const user = result.rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }

  if (user.status !== 'active') {
    throw new AppError('ACCOUNT_UNAVAILABLE', 'Account is not available.', 403);
  }

  return { id: user.id, email: user.email, status: user.status };
}
