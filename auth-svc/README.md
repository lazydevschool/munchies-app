# Munchies App - Auth Service

## TODOS

### Update Context / Routes with User binding where applicable make typescript hapy

- similar to how the profile route is setup

### Rate Limiting

Create a middleware to prevent brute force attacks and update config

```config.ts
const envSchema = z.object({
  // ... existing config
  FRONTEND_URL: z.string().url().optional(),
  MAX_REQUEST_SIZE: z.number().default(1024 * 1024), // 1MB
  RATE_LIMIT_WINDOW: z.number().default(3600),
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
});
```

```rateLimit.ts
import { Context, Next } from 'hono';
import { getRedisClient } from '@/lib/redis';

export async function rateLimitMiddleware(
  requests: number,
  seconds: number
) {
  return async function(c: Context, next: Next) {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const redis = getRedisClient();
    const key = `rate-limit:${ip}:${c.req.path}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, seconds);
    }

    if (current > requests) {
      return c.json(
        { message: 'Too many requests' },
        429
      );
    }

    await next();
  };
}
```

Follow up question: where should this go?

### Security Headers

Add security headers middleware:

```security.ts
import { Context, Next } from 'hono';

export async function securityHeadersMiddleware(c: Context, next: Next) {
  // Set security headers
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Content-Security-Policy', "default-src 'self'");
  c.header('X-XSS-Protection', '1; mode=block');
  await next();
}
```

### Error Handling

Create a centralized error handler:

```ts
import { Context, Next } from 'hono';
import { ZodError } from 'zod';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    if (error instanceof ZodError) {
      return c.json({
        message: 'Validation error',
        errors: error.errors
      }, 400);
    }

    return c.json({
      message: 'Internal server error'
    }, 500);
  }
}
```

### Request Logging

Add detailed request logging:

```ts
import { Context, Next } from 'hono';

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const { method, url } = c.req;

  await next();

  const ms = Date.now() - start;
  console.log(`${method} ${url} - ${c.res.status} ${ms}ms`);
}
```

### Apply Middlewares

```ts
import { securityHeadersMiddleware } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { rateLimitMiddleware } from './middleware/rateLimit';

const app = new Hono();

// Global middlewares
app.use('*', errorHandler);
app.use('*', requestLogger);
app.use('*', securityHeadersMiddleware);

// Rate limiting for auth routes
app.use('/auth/*', rateLimitMiddleware(100, 3600)); // 100 requests per hour
app.use('/profile', rateLimitMiddleware(300, 3600)); // 300 requests per hour

// CORS configuration
app.use('*', cors({
  origin: env.NODE_ENV === 'production'
    ? env.FRONTEND_URL
    : '*',
  credentials: true,
  exposeHeaders: ['x-csrf-token'],
  maxAge: 3600,
}));

// ... rest of your routes
```

### Refresh Token Payload Inconsistency

```ts
    const newAccessToken = await sign(
      {
        username,
        tokenOrigin: '/auth/refresh',
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      },
      env.ACCESS_TOKEN_SECRET
    );
```

Followup question: should redis be storing the refresh token using id or username?  or does it matter?

### Access Token Payload Inconsistency

In your auth middleware and login route, there's a mismatch in what data is being stored in the JWT payload. The login route only includes:

```ts
  const accessTokenPayload = {
    username,
    tokenOrigin: '/auth/login',
    // exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
    exp: Math.floor(Date.now() / 1000) + 15, // 15 seconds from now
  };
```

### Profile Service Layer

Move profile logic to a service:

```ts
import { db, profiles } from '@/database';
import { eq } from 'drizzle-orm';
import { UpdateProfileInput } from '@/schemas/profile.schema';

export class ProfileService {
  static async getProfile(userId: string) {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    return profile[0];
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    const updated = await db
      .update(profiles)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(profiles.user_id, userId))
      .returning();

    return updated[0];
  }
}
```

### Missing Transaction in User Creation

Your user creation should use a transaction to ensure both user and profile are created atomically.
To fix these issues:
Run database migrations
Update the login flow to include user ID
Add proper types
Implement input validation
Move business logic to service layer
Add proper error handling
Update the auth middleware to properly type the user context

## Testing New User Registration and Profile Read/Update

```bash
curl -X POST http://localhost:3333/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com","full_name":"Test User"}'

curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt

# View Profile Data
curl http://localhost:3333/profile \
  -b cookies.txt

# register, login, update profile, view profile

curl -X POST http://localhost:3333/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com","full_name":"Test User"}'

curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt

curl -X PUT http://localhost:3333/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"bio":"Hello world","favorite_color":"#FF0000"}'

curl http://localhost:3333/profile \
  -b cookies.txt
```
