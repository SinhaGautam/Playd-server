import { access, readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './pool.js';

const distMigrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
const sourceMigrationsDir = join(process.cwd(), 'src/db/migrations');

async function getMigrationsDir(): Promise<string> {
  try {
    await access(distMigrationsDir);
    return distMigrationsDir;
  } catch {
    await access(sourceMigrationsDir);
    return sourceMigrationsDir;
  }
}

async function ensureMigrationsTable(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function migrate(): Promise<void> {
  await ensureMigrationsTable();
  await db.query('SELECT pg_advisory_lock(hashtext($1))', ['playd:migrations']);

  try {
    const migrationsDir = await getMigrationsDir();
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const appliedResult = await db.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations ORDER BY filename'
    );
    const applied = new Set(appliedResult.rows.map((row) => row.filename));

    for (const filename of files) {
      if (applied.has(filename)) {
        continue;
      }

      const sql = await readFile(join(migrationsDir, filename), 'utf8');
      const client = await db.connect();

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
  } finally {
    await db.query('SELECT pg_advisory_unlock(hashtext($1))', ['playd:migrations']);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(async () => {
      console.log('Database migrations applied successfully.');
      await db.end();
    })
    .catch(async (error: unknown) => {
      console.error('Database migration failed.', error);
      await db.end();
      process.exitCode = 1;
    });
}
