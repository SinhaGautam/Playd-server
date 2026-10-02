import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1).default('postgres://playd:playd@localhost:5432/playd'),
  DB_POOL_MAX: z.coerce.number().int().positive().default(20),
  LOG_LEVEL: z.string().default('info')
});
export const env = schema.parse(process.env);
