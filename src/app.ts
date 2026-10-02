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
    bodyLimit: 64 * 1024,
    disableRequestLogging: false
  });

  app.register(helmet);
  app.register(sensible);
  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
    reply.header('x-api-version', '1');
    reply.header('cache-control', 'no-store');
  });
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

    if (error && typeof error === 'object' && 'code' in error) {
      const code = String((error as { code?: unknown }).code);
      if (code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
        return reply.code(400).send({
          error: 'INVALID_JSON',
          message: 'Request body contains invalid JSON.',
          requestId: request.id
        });
      }
      if (code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
        return reply.code(413).send({
          error: 'PAYLOAD_TOO_LARGE',
          message: 'Request body is too large.',
          requestId: request.id
        });
      }
    }

    return reply.code(500).send({
      error: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal Server Error' : error instanceof Error ? error.message : 'Unknown error',
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
