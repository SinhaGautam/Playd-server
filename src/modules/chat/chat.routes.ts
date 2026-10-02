import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { getOrCreateConversation, listMessages, sendMessage } from './chat.service.js';

const matchParams = z.object({ matchId: z.string().uuid() });
const conversationParams = z.object({ conversationId: z.string().uuid() });
const messageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  beforeId: z.coerce.bigint().positive().optional()
});
const messageBody = z.object({ body: z.string().trim().min(1).max(2000) });

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/matches/:matchId/conversation', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = matchParams.safeParse(request.params);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid match ID.', 400, parsed.error.flatten());

    const conversation = await getOrCreateConversation(request.user.id, parsed.data.matchId);
    return reply.code(200).send({ conversation });
  });

  app.get('/v1/conversations/:conversationId/messages', { preHandler: requireAuth }, async (request) => {
    const params = conversationParams.safeParse(request.params);
    const query = messageQuery.safeParse(request.query);
    if (!params.success || !query.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid message request.', 400, {
        params: params.success ? undefined : params.error.flatten(),
        query: query.success ? undefined : query.error.flatten()
      });
    }

    return {
      messages: await listMessages(request.user.id, params.data.conversationId, query.data.limit, query.data.beforeId?.toString())
    };
  });

  app.post('/v1/conversations/:conversationId/messages', { preHandler: requireAuth }, async (request, reply) => {
    const params = conversationParams.safeParse(request.params);
    const body = messageBody.safeParse(request.body);
    if (!params.success || !body.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid message request.', 400, {
        params: params.success ? undefined : params.error.flatten(),
        body: body.success ? undefined : body.error.flatten()
      });
    }

    const message = await sendMessage(request.user.id, params.data.conversationId, body.data.body);
    return reply.code(201).send({ message });
  });
}
