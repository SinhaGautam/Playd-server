import { jwtVerify, SignJWT } from 'jose';
import { env } from '../../config/env.js';
import { AppError } from '../../core/errors.js';
import type { AuthenticatedUser } from './auth.types.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createAccessToken(user: AuthenticatedUser): Promise<string> {
  return new SignJWT({ email: user.email, status: user.status })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AuthenticatedUser> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.status !== 'string') {
      throw new Error('Invalid claims');
    }
    if (!['active', 'suspended', 'deleted'].includes(payload.status)) {
      throw new Error('Invalid status');
    }
    return {
      id: payload.sub,
      email: payload.email,
      status: payload.status as AuthenticatedUser['status']
    };
  } catch {
    throw new AppError('UNAUTHORIZED', 'Authentication required.', 401);
  }
}
