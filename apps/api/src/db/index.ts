import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

const envCandidates = [
  resolve(process.cwd(), 'apps/api/.env'),
  resolve(process.cwd(), '.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.trim() === '') {
  throw new Error(
    'DATABASE_URL belum terbaca. Pastikan file apps/api/.env ada dan berisi DATABASE_URL.'
  );
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export async function withTransaction<T>(
  callback: (client: import('pg').PoolClient) => Promise<T>,
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}