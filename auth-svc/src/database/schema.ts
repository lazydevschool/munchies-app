// src/database/schema.ts
import { text, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 20 }).primaryKey(),
  username: varchar('username', { length: 20 }).unique().notNull(),
  hashed_pass: text().notNull(),
});

// New profiles table
export const profiles = pgTable('profiles', {
  user_id: varchar('user_id', { length: 20 })
    .primaryKey()
    .references(() => users.id),
  email: varchar('email', { length: 255 }),
  full_name: varchar('full_name', { length: 100 }),
  bio: text(),
  favorite_color: varchar('favorite_color', { length: 7 }), // Hex code format #RRGGBB
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
