import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { env } from '@/config';
import { getSignedCookie } from 'hono/cookie';

// does hono have a built in middleware for this?
export async function authMiddleware(c: Context, next: Next) {
  try {
    const auth_token = await getSignedCookie(
      c,
      env.COOKIE_SECRET,
      'auth_token'
    );

    if (!auth_token) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const payload = await verify(auth_token, env.ACCESS_TOKEN_SECRET);
    // is the payload we are actually getting in the expected format?
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ message: 'Invalid token' }, 401);
  }
}
