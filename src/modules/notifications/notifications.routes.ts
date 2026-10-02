import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { listNotifications, markNotificationRead, unreadNotificationCount } from './notifications.service.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  beforeId: z.coerce.bigint().positive().optional()
});
const paramsSchema = z.object({ notificationId: z.coerce.bigint().positive() });

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/notifications', { preHandler: requireAuth }, async (request) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid notification query.', 400, parsed.error.flatten());

    return {
      notifications: await listNotifications(request.user.id, parsed.data.limit, parsed.data.beforeId?.toString()),
      unreadCount: await unreadNotificationCount(request.user.id)
    };
  });

  app.post('/v1/notifications/:notificationId/read', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid notification ID.', 400, parsed.error.flatten());

    await markNotificationRead(request.user.id, parsed.data.notificationId.toString());
    return reply.code(204).send();
  });
}
