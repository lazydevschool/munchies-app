// src/routes/verify.ts
import { Hono } from 'hono';
import { env } from '@/config';
import { getSignedCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

const router = new Hono();

// TODO: how to handle scenario where refresh token is expired?  that means we need to clean up redis

router.post('/', async (c) => {
  // access token values from cookie
  const { auth_token, refresh_token } = await getSignedCookie(
    c,
    env.COOKIE_SECRET
  );

  if (!auth_token || !refresh_token) {
    return c.json(
      {
        valid: false,
        message: 'No token provided',
      },
      401 // Unauthorized
    );
  }

  try {
    const payload = await verify(auth_token, env.ACCESS_TOKEN_SECRET);
    return c.json(
      {
        username: payload.username,
      },
      200 // OK
    );
  } catch (error) {
    return c.json(
      {
        message: 'Invalid token',
      },
      401 // Unauthorized
    );
  }
});

export { router as verifyRouter };
