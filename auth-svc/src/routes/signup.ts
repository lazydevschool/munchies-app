// src/routes/signup.ts
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

import { db } from '@/database';
import { users } from '@/database/schema';
import { hashPassword } from '@/lib/password';

const router = new Hono();

// create user in database with signup
router.post('/', async (c) => {
  const { username, password } = await c.req.json();

  // check if user already exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user.length > 0) return c.json({ message: 'User already exists' }, 409);

  // check if password is more than 8 characters
  if (password.length < 8) return c.json({ message: 'invalid pass' }, 400);

  const payload = {
    id: nanoid(20),
    username,
    hashed_pass: await hashPassword(password),
  };

  // create user in database
  await db.insert(users).values(payload);

  // create new user if validation pass
  return c.json({ message: 'new user created' }, 201);
});

export { router as signupRouter };
