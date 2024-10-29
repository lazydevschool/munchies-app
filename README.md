# README

## Getting Started

```bash
# Build images and startup postgresql / redis / api
docker compose up -d --build
# Migrate database so users can register
docker compose exec -it auth-svc pnpm db:update
```

## Reference

- Generate a random string

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Auth Service

- Handles user authentication tasks (registration, login, logout and token refresh)
- Uses Drizzle ORM to interact with Postgres to manage user data
- Manage user sessions with JWT tokens wrapped in http-only cookies
- Stores refresh tokens in Redis
- Uses Argon2 for secure password hashing
- environment variable validation using Zod

## Features / Bugs (TODO Items)

- CSRF protection
- rate limit (login / signup) to prevent abuse
- logging and monitoring for failed login attempts
- central error handling
- `auth-svc` automated tests
- document api endpoints

## Client

- [Setup Tailwind CSS](https://tailwindcss.com/docs/guides/sveltekit)

### Features

- create profile crud functionality as a protected route, handle protected route logic from server side
- refresh token logic

1. Add refreshToken method to ApiClient
2. Implement refresh token flow
3. Add refresh state management
4. Test scenarios:
    - Short-lived token expiration
    - Automatic refresh
    - Failed refresh handling
    - Concurrent request handling

- enhance auth service
  - email verification
  - password reset

- enhance user profile page
  - allow editing of user information

### Refactor Ideas

- show signup option on login page / login option on signup page
- build docker cache so pnpm will work right
- setting auth api endpoint as env.meta....AUTH_SERVICE_URL
- code cleanup / audit the workflow for simplicity
- Signup success or fail toast
- format signup form to match similar to login theme
- refactor forms to usesuper forms
- automated tests
- RBAC (customers vs restaurant owners)

### Completed

- setup tailwind
- docker compose setup
- basic pages / basic nav
- santity check that client can hit auth-service by showing the debug route
- signup
- login page w/ cookies being set
- logout page (destroy cookies)
- Show different navigation options based on authentication state
- Impement basic protected routes (UX based not server side based)

## Cursor TODO:

- cursor context ignore