import type { FastifyInstance } from 'fastify';
import { checkDatabase } from '../../db/pool.js';
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/health/ready', async (_request, reply) => {
    try { await checkDatabase(); return { status: 'ok', database: 'ok' }; }
    catch (error) {
      app.log.error(error, 'readiness database check failed');
      return reply.code(503).send({ status: 'unavailable', database: 'unavailable' });
    }
  });
}
