import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { createMatchIfMutualLike, listMatches } from './matching.service.js';

const paramsSchema = z.object({ targetUserId: z.string().uuid() });

export async function matchingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/matches', { preHandler: requireAuth }, async (request) => ({
    matches: await listMatches(request.user.id)
  }));

  app.post('/v1/matches/:targetUserId', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid target user ID.', 400, parsed.error.flatten());

    const match = await createMatchIfMutualLike(request.user.id, parsed.data.targetUserId);
    return reply.code(match ? 201 : 204).send(match ?? undefined);
  });
}
