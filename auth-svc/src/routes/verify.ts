import { Hono } from 'hono';
import { env } from '@/config';
import { getSignedCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Get tokens individually
    const auth_token = await getSignedCookie(
      c,
      env.COOKIE_SECRET,
      'auth_token'
    );
    const refresh_token = await getSignedCookie(
      c,
      env.COOKIE_SECRET,
      'refresh_token'
    );

    console.log('Verify endpoint received tokens:', {
      auth_token: auth_token ? 'present' : 'missing',
      refresh_token: refresh_token ? 'present' : 'missing',
    });

    if (!auth_token || !refresh_token) {
      return c.json(
        {
          valid: false,
          message: 'No token provided',
        },
        401
      );
    }

    try {
      const payload = await verify(auth_token, env.ACCESS_TOKEN_SECRET);
      console.log('Token verified successfully for user:', payload.username);

      return c.json(
        {
          username: payload.username,
        },
        200
      );
    } catch (error) {
      console.error('Token verification failed:', error);
      return c.json(
        {
          message: 'Invalid token',
        },
        401
      );
    }
  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return c.json(
      {
        message: 'Error processing request',
      },
      500
    );
  }
});

export { router as verifyRouter };
