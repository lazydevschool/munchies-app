# Readme.md

```bash
npm install
npm run dev
```

docker build -t auth-svc:latest -f dev.Dockerfile .
docker run -it --rm auth-svc:latest /bin/sh

## Implement refresh token

- login
- logout
- refresh

Receive the refresh token from the client.
Verify the refresh token against the one stored in Redis.
If valid, generate a new access token and optionally a new refresh token.
Update the Redis store with the new refresh token if generated.
Return the new access token (and new refresh token if applicable) to the client.

## TODO

- register user
- cookies, tokens, redis lifespan strategy
- CSRF Protection: Ensure your application is protected against Cross-Site Request Forgery attacks.
- Rate Limiting: Apply rate limiting to sensitive endpoints like login and refresh to prevent abuse.
- automatic handle of expired access token with refresh
  - potentially use middleware
- implement a blacklist for revoked tokens in redis + endpoint for revoke token + change password (password reset flow)
- Concurrent Requests: Handle scenarios where multiple requests might try to refresh the token simultaneously.
- Security Headers: Implement security headers like HSTS, X-Frame-Options, and Content-Security-Policy.
- Monitoring and Logging: Implement comprehensive logging for authentication events to detect suspicious activities. Morgan library
- Multi-Factor Authentication: Integrate MFA for enhanced security, especially for sensitive operations.
- Device Management: Allow users to view and manage their active sessions and devices.
