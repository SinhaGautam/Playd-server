import { buildApp } from './app.js';
import { env } from './config/env.js';
import { db } from './db/pool.js';
const app = buildApp();
const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'shutting down');
  await app.close();
  await db.end();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
try { await app.listen({ host: env.HOST, port: env.PORT }); }
catch (error) {
  app.log.error(error, 'server startup failed');
  await db.end();
  process.exit(1);
}
