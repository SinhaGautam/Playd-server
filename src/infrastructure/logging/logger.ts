import pino, { type Logger } from 'pino';
import { env } from '../../config/env.js';

export const logger: Logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'playd-api' },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'passwordHash', 'accessToken'],
    censor: '[REDACTED]'
  }
});