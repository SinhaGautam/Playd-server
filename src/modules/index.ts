import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health/health.routes.js';
import { usersRoutes } from './users/users.routes.js';

export async function registerModules(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes);
  await app.register(usersRoutes);
}
