import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    disableRequestLogging: false
  });
  app.register(helmet);
  app.register(sensible);
  app.register(healthRoutes);
  app.register(usersRoutes);
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'request failed');
    return reply.code(error.statusCode ?? 500).send({
      error: error.name,
      message: env.NODE_ENV === 'production' && !error.statusCode ? 'Internal Server Error' : error.message,
      requestId: request.id
    });
  });
  return app;
}
