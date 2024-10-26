// src/routes/logout.ts
import { Hono } from 'hono';
import { env } from '@/config';
import { deleteCookie, getSignedCookie } from 'hono/cookie';
import { getRedisClient } from '@/lib/redis';
import { verify } from 'hono/jwt';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Get the refresh token from the cookie
    const refreshToken = await getSignedCookie(
      c,
      'refresh_token',
      env.COOKIE_SECRET
    );

    if (refreshToken) {
      // Verify the refresh token to get the username
      const payload = await verify(refreshToken, env.REFRESH_TOKEN_SECRET);
      const username = payload.username;

      // Remove refresh token from Redis
      const redisClient = getRedisClient();
      await redisClient.del(`refresh_token:${username}`);
    }

    // Delete cookies
    await deleteCookie(c, 'auth_token', {
      path: '/',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
    });
    await deleteCookie(c, 'refresh_token', {
      path: '/',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return c.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ message: 'Error during logout' }, 500);
  }
});

export { router as logoutRouter };
