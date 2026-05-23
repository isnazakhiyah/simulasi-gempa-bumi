import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().default('postgres://simulasi_app:simulasi123@localhost:5432/simulasi_gempa'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DEFAULT_CATALOG_LIMIT: z.coerce.number().default(12),
  MAX_CATALOG_LIMIT: z.coerce.number().default(50),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-5-mini'),
});

export const config = ConfigSchema.parse(process.env);