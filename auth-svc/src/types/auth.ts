interface JWTPayload {
  id: string;
  username: string;
  tokenOrigin: string;
  exp: number;
}

interface UserContext {
  id: string;
  username: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: UserContext;
  }
}
