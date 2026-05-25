import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT ?? 3001),

  DATABASE_URL: process.env.DATABASE_URL ?? '',

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    'https://simulasi-gempa-bumi-web.vercel.app',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
};