import { Hono } from 'hono';
import { env } from '@/config';
import { getRedisClient } from '@/lib/redis';
const router = new Hono();

router.get('/', (c) => {
  return c.json(env);
});

router.post('/redis', async (c) => {
  const { username } = await c.req.json();
  const redisClient = getRedisClient();
  const storedToken = await redisClient.get(`refresh_token:${username}`);
  return c.json({ storedToken: storedToken || '' });
});

router.get('/greeting', (c) => {
  return c.text('Hello Munchies APP!');
});

export { router as debugRouter };
