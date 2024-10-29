// src/database/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '@/config';

import { users, profiles } from '@/database/schema';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool);

export { db, users, profiles };
