import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { blockUser, listBlocks, reportUser, unblockUser } from './safety.service.js';

const userParams = z.object({ userId: z.string().uuid() });
const reportBody = z.object({
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'fake_profile', 'other']),
  details: z.string().trim().max(2000).optional()
});

export async function safetyRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/safety/blocks', { preHandler: requireAuth }, async (request) => ({
    blocks: await listBlocks(request.user.id)
  }));

  app.post('/v1/safety/blocks/:userId', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = userParams.safeParse(request.params);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid user ID.', 400, parsed.error.flatten());

    await blockUser(request.user.id, parsed.data.userId);
    return reply.code(204).send();
  });

  app.delete('/v1/safety/blocks/:userId', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = userParams.safeParse(request.params);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid user ID.', 400, parsed.error.flatten());

    await unblockUser(request.user.id, parsed.data.userId);
    return reply.code(204).send();
  });

  app.post('/v1/safety/reports/:userId', { preHandler: requireAuth }, async (request, reply) => {
    const params = userParams.safeParse(request.params);
    const body = reportBody.safeParse(request.body);
    if (!params.success || !body.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid report request.', 400, {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten()
      });
    }

    const report = await reportUser(request.user.id, params.data.userId, body.data.reason, body.data.details);
    return reply.code(201).send({ report });
  });
}
