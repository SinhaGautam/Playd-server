import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url().default('postgres://playd:playd@localhost:5432/playd'),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(20),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  TRUST_PROXY: z.coerce.boolean().default(false),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
  JWT_SECRET: z.string().min(32).default('dev-only-change-this-secret-before-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),\n  BILLING_WEBHOOK_SECRET: z.string().min(16).optional()
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production' && value.JWT_SECRET === 'dev-only-change-this-secret-before-production') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_SECRET'], message: 'JWT_SECRET must be explicitly configured in production.' });
  }
});

export const env = schema.parse(process.env);