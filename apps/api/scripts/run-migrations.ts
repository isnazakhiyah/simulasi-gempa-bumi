import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../sql/migrations');

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query<{ filename: string }>(`
    SELECT filename
    FROM schema_migrations
    ORDER BY filename ASC;
  `);

  return new Set(result.rows.map((row) => row.filename));
}

async function main() {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('Tidak ada migration SQL yang ditemukan.');
    return;
  }

  await ensureMigrationTable();
  const applied = await getAppliedMigrations();
  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log('Semua migration sudah pernah dijalankan. Tidak ada yang perlu diproses.');
    return;
  }

  const client = await pool.connect();

  try {
    for (const file of pending) {
      const sql = await readFile(path.join(migrationsDir, file), 'utf8');

      console.log(`Menjalankan migration ${file} ...`);
      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query(
          `
            INSERT INTO schema_migrations (filename)
            VALUES ($1)
            ON CONFLICT (filename) DO NOTHING;
          `,
          [file],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log(`Selesai. ${pending.length} migration baru berhasil dijalankan.`);
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error('Migration gagal:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });