import { defineConfig } from 'drizzle-kit';
import { env } from './src/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
