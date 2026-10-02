import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationsDir = join(
  fileURLToPath(new URL('../src/db/migrations/', import.meta.url))
);

describe('database migrations', () => {
  it('contains ordered SQL migrations', async () => {
    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    expect(files.length).toBeGreaterThan(0);
    expect(files).toEqual([...files].sort());
    expect(files.every((file) => /^\d{3}_[a-z0-9_]+\.sql$/.test(file))).toBe(true);
  });

  it('initial schema includes required V1 domains and constraints', async () => {
    const sql = await readFile(join(migrationsDir, '001_initial_schema.sql'), 'utf8');

    for (const table of [
      'users',
      'user_profiles',
      'sports',
      'user_sports',
      'user_preferences',
      'swipes',
      'matches',
      'conversations',
      'messages',
      'blocks',
      'reports',
      'coupons',
      'user_coupons',
      'subscriptions',
      'notifications'
    ]) {
      expect(sql).toContain(`CREATE TABLE ${table}`);
    }

    expect(sql).toContain('CHECK (actor_user_id <> target_user_id)');
    expect(sql).toContain('UNIQUE (actor_user_id, target_user_id)');
    expect(sql).toContain('CHECK (user_a_id < user_b_id)');
  });
});
