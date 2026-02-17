import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '../config';

export async function runMigrations(): Promise<void> {
  const migrationPool = new Pool({ connectionString: config.databaseUrl });
  const client = await migrationPool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file],
      );

      if (rows.length > 0) continue;

      console.log(`[migrate] apply ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file],
      );
    }
  } finally {
    client.release();
    await migrationPool.end();
  }
}
