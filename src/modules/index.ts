import type { FastifyInstance } from 'fastify';
import { discoveryRoutes } from './discovery/discovery.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import { healthRoutes } from './health/health.routes.js';
import { usersRoutes } from './users/users.routes.js';

export async function registerModules(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(discoveryRoutes);
  await app.register(usersRoutes);
}
