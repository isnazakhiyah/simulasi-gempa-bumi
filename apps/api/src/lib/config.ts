import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT ?? 3001),

  DATABASE_URL: process.env.DATABASE_URL ?? '',

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    'https://simulasi-gempa-bumi-web.vercel.app',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',

  // =========================================
  // FIX: missing properties (WAJIB UNTUK BUILD)
  // =========================================
  DEFAULT_CATALOG_LIMIT: Number(
    process.env.DEFAULT_CATALOG_LIMIT ?? 8,
  ),

  MAX_CATALOG_LIMIT: Number(
    process.env.MAX_CATALOG_LIMIT ?? 50,
  ),

  OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
};