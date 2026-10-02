import type { FastifyRequest } from 'fastify';
import { AppError } from '../../core/errors.js';
import { verifyAccessToken } from './auth.jwt.js';
import type { AuthenticatedUser } from './auth.types.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}

export async function requireAuth(request: FastifyRequest): Promise<void> {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Authentication required.', 401);
  }
  request.user = await verifyAccessToken(authorization.slice(7).trim());
}
