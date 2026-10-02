import { buildApp } from './app.js';
import { env } from './config/env.js';
import { db } from './db/pool.js';

const app = buildApp();
let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;

  app.log.info({ signal }, 'shutting down');

  const timeout = setTimeout(() => {
    app.log.error('graceful shutdown timed out');
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);

  timeout.unref();

  try {
    await app.close();
    await db.end();
    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    app.log.error({ err: error }, 'graceful shutdown failed');
    clearTimeout(timeout);
    process.exit(1);
  }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error({ err: error }, 'server startup failed');
  await db.end();
  process.exit(1);
}
