import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { discoverUsers, recordSwipe } from './discovery.service.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sport: z.string().trim().min(1).max(80).optional()
});

const swipeSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(['like', 'pass'])
});

export async function discoveryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/discovery', { preHandler: requireAuth }, async (request) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid discovery query.', 400, parsed.error.flatten());

    return { candidates: await discoverUsers(request.user.id, parsed.data.limit, parsed.data.sport) };
  });

  app.post('/v1/discovery/swipes', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = swipeSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid swipe payload.', 400, parsed.error.flatten());

    const result = await recordSwipe(request.user.id, parsed.data.targetUserId, parsed.data.action);
    return reply.code(201).send(result);
  });
}
