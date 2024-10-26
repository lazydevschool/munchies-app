// src/lib/redis.ts
import { createClient, type RedisClientType } from 'redis';
import { env } from '@/config';

let client: RedisClientType | null = null;

export async function initRedis() {
  if (!client) {
    client = createClient({ url: env.REDIS_URL });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

export function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return client;
}
