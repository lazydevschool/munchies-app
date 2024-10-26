// src/config.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  PORT: z.number().default(3000),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SECRET_NOTE: z.string(),
});

export const env = envSchema.parse(process.env);
