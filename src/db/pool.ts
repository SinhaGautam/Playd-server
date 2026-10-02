import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  allowExitOnIdle: env.NODE_ENV === 'test'
});

db.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});

export async function checkDatabase(): Promise<void> {
  await db.query('SELECT 1');
}
