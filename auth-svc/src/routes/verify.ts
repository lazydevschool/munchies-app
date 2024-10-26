// src/routes/verify.ts
import { Hono } from 'hono';
import { env } from '@/config';
import { getSignedCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

const router = new Hono();

router.post('/', async (c) => {
  // access token values from cookie
  const { auth_token, refresh_token } = await getSignedCookie(
    c,
    env.COOKIE_SECRET
  );

  console.log('auth_token', auth_token);
  console.log('refresh_token', refresh_token);

  if (!auth_token || !refresh_token) {
    return c.json({ message: 'No token provided' });
  }

  try {
    const payload = await verify(auth_token, env.ACCESS_TOKEN_SECRET);
    return c.json(payload);
  } catch (error) {
    return c.json({ message: 'Invalid token' });
  }
});

export { router as verifyRouter };
