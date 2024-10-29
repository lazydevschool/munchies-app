// src/routes/signup.ts
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { UserService } from '@/services/user.service';

const router = new Hono();

// create user in database with signup
router.post('/', async (c) => {
  const { username, password, email, full_name } = await c.req.json();

  // check if password is more than 8 characters
  if (password.length < 8) return c.json({ message: 'invalid pass' }, 400);

  try {
    // Check if user exists
    const existingUser = await UserService.getUserByUsername(username);
    if (existingUser.length > 0) {
      return c.json({ message: 'User already exists' }, 409);
    }

    // Create user and profile
    await UserService.createUser({
      username,
      password,
      email,
      full_name,
    });

    return c.json({ message: 'User created successfully' }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ message: 'Error creating user' }, 500);
  }
});

export { router as signupRouter };
