// src/routes/login.ts
import { Hono } from 'hono';
import { env } from '@/config';
import { setSignedCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { db, users } from '@/database';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/password';
import { getRedisClient } from '@/lib/redis';

const router = new Hono();

router.post('/', async (c) => {
  const { username, password } = await c.req.json();

  // lookup username in database
  const userFromDb = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  // handle username not found
  if (userFromDb.length === 0)
    return c.json({ message: 'invalid username or password' });

  // handle invalid password
  const verifyResult = await verifyPassword(
    userFromDb[0].hashed_pass,
    password
  );

  if (!verifyResult) return c.json({ message: 'invalid username or password' });

  // create payload for access token
  const accessTokenPayload = {
    username,
    tokenOrigin: '/auth/login',
    // exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
    exp: Math.floor(Date.now() / 1000) + 15, // 15 seconds from now
  };

  // create payload for refresh token
  const refreshTokenPayload = {
    username,
    tokenOrign: '/auth/login',
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 15 days from now
  };

  // create access token
  const token = await sign(accessTokenPayload, env.ACCESS_TOKEN_SECRET);

  // create refresh token
  const refreshToken = await sign(
    refreshTokenPayload,
    env.REFRESH_TOKEN_SECRET
  );

  // create http only cookie containing the access token
  // TODO: set domain to environment variable
  await setSignedCookie(c, 'auth_token', token, env.COOKIE_SECRET, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    domain: env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    httpOnly: true,
    maxAge: 1000,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    sameSite: 'Strict',
  });

  // create http only cookie containing refresh token
  // TODO: set domain to environment variable
  await setSignedCookie(c, 'refresh_token', refreshToken, env.COOKIE_SECRET, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    domain: env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    httpOnly: true,
    maxAge: 1000,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    // expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    sameSite: 'Strict',
  });

  // store the refresh token in Redis with an expiration time
  const redisClient = getRedisClient();
  try {
    await redisClient.set(`refresh_token:${username}`, refreshToken, {
      EX: 15 * 24 * 60 * 60, // 15 days expiration
    });
  } catch (error) {
    console.error('Error storing refresh token in Redis:', error);
    return c.json({ message: 'An error occurred during login' }, 500);
  }

  return c.json({ message: 'login successful' });
});

export { router as loginRouter };
