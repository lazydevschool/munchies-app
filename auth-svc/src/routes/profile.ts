import { Hono } from 'hono';
import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { db, profiles } from '@/database';
import { authMiddleware } from '@/middleware/auth';
import { updateProfileSchema } from '@/database/profile.schema';
import { z } from 'zod';

// Define the binding type
type UserBinding = {
  Variables: {
    user: {
      id: string;
      username: string;
    };
  };
};

// Create router with type
const router = new Hono<UserBinding>();

router.use('*', authMiddleware);

// Add proper typing to the context
router.get('/', async (c: Context<UserBinding>) => {
  const user = c.var.user;

  const userProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.user_id, user.id))
    .limit(1);

  if (!userProfile.length) {
    return c.json({ message: 'Profile not found' }, 404);
  }

  return c.json(userProfile[0]);
});

router.put('/', async (c: Context<UserBinding>) => {
  const user = c.var.user;
  const body = await c.req.json();

  try {
    const validatedData = updateProfileSchema.parse(body);

    const updatedProfile = await db
      .update(profiles)
      .set({
        ...validatedData,
        updated_at: new Date(),
      })
      .where(eq(profiles.user_id, user.id))
      .returning();

    if (!updatedProfile.length) {
      return c.json({ message: 'Profile not found' }, 404);
    }

    return c.json(updatedProfile[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          message: 'Validation error',
          errors: error.errors,
        },
        400
      );
    }

    console.error('Profile update error:', error);
    return c.json({ message: 'Failed to update profile' }, 500);
  }
});

export { router as profileRouter };
