// src/routes/refresh.ts
import { Hono } from 'hono';
import { env } from '@/config';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { verify, sign } from 'hono/jwt';
import { getRedisClient } from '@/lib/redis';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Get the refresh token from the cookie
    const refresh_token = await getSignedCookie(
      c,
      env.COOKIE_SECRET,
      'refresh_token'
    );

    if (!refresh_token) {
      return c.json({ message: 'No refresh token provided' }, 401);
    }

    // Verify the refresh token
    const payload = await verify(refresh_token, env.REFRESH_TOKEN_SECRET);
    const username = payload.username;

    // Check if the refresh token exists in Redis
    const redisClient = getRedisClient();
    const storedToken = await redisClient.get(`refresh_token:${username}`);

    if (!storedToken || storedToken !== refresh_token) {
      // Token doesn't exist or doesn't match - possible reuse detected
      await redisClient.del(`refresh_token:${username}`);
      return c.json({ message: 'Invalid refresh token' }, 401);
    }

    // Create new access token
    const newAccessToken = await sign(
      {
        username,
        tokenOrigin: '/auth/refresh',
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      },
      env.ACCESS_TOKEN_SECRET
    );

    // Create new refresh token
    const newRefreshToken = await sign(
      {
        username,
        tokenOrigin: '/auth/refresh',
        exp: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // 15 days
      },
      env.REFRESH_TOKEN_SECRET
    );

    // Store new refresh token in Redis
    await redisClient.set(`refresh_token:${username}`, newRefreshToken, {
      EX: 15 * 24 * 60 * 60, // 15 days
    });

    // Set new tokens in cookies
    await setSignedCookie(c, 'auth_token', newAccessToken, env.COOKIE_SECRET, {
      path: '/',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      //maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'Strict',
    });

    await setSignedCookie(
      c,
      'refresh_token',
      newRefreshToken,
      env.COOKIE_SECRET,
      {
        path: '/',
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        //maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'Strict',
      }
    );

    return c.json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return c.json({ message: 'Error refreshing tokens' }, 500);
  }
});

export { router as refreshRouter };
