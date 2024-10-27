// src/index.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from '@/config';
import { showRoutes } from 'hono/dev';
import { initRedis } from '@/lib/redis';

// routers
import { debugRouter } from '@/routes/debug';
import { logoutRouter } from '@/routes/logout';
import { verifyRouter } from '@/routes/verify';
import { loginRouter } from '@/routes/login';
import { signupRouter } from '@/routes/signup';
import { refreshRouter } from '@/routes/refresh';

const app = new Hono();
app.use(logger());
app.use(
  '*',
  cors({
    origin: '*', // In production, set this to your frontend's origin
    credentials: true,
  })
);

// Hook up debugRouter to the main Hono app
app.route('/debug', debugRouter);
app.route('/auth/logout', logoutRouter);
app.route('/auth/verify', verifyRouter);
app.route('/auth/login', loginRouter);
app.route('/auth/signup', signupRouter);
app.route('/auth/refresh', refreshRouter);

async function startServer() {
  try {
    // Initialize Redis
    await initRedis();
    console.log('Redis connected successfully');

    // Start the server
    serve({
      fetch: app.fetch,
      port: env.PORT,
    });

    console.log(`Server is running on port ${env.PORT}`);
    console.log(`NODE_ENV: ${env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode!!!');
      showRoutes(app);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Call the async function to start the server
startServer();
