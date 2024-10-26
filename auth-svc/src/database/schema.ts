// src/database/schema.ts
import { text, pgTable, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 20 }).primaryKey(),
  username: varchar('username', { length: 20 }).unique().notNull(),
  hashed_pass: text().notNull(),
});
