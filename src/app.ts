import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { isAppError } from './core/errors.js';
import { registerModules } from './modules/index.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[REDACTED]'
      }
    },
    trustProxy: env.TRUST_PROXY,
    requestIdHeader: 'x-request-id',
    disableRequestLogging: false
  });

  app.register(helmet);
  app.register(sensible);
  app.register(registerModules);

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'request failed');

    if (isAppError(error)) {
      return reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
        requestId: request.id
      });
    }

    return reply.code(500).send({
      error: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
      requestId: request.id
    });
  });

  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send({
      error: 'NOT_FOUND',
      message: 'Route not found',
      requestId: request.id
    })
  );

  return app;
}
