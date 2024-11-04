# README

## Getting Started

```bash
# Build images and startup postgresql / redis / api
docker compose up -d --build
# Migrate database so users can register
docker compose exec -it auth-svc pnpm db:update
```

## Todos

- [https://trello.com/b/Ay4MkAPN/munchies-app](https://trello.com/b/Ay4MkAPN/munchies-app)

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

## Client Service

- SvelteKit app using Svelte 4
- Tailwind CSS
- JWT token refresh logic
- Routes
  - Auth / Login
  - Auth / Signup
  - Auth / Logout
  - Profile
