import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

let store: unknown | undefined;

// Optional Redis-backed rate limit for production.
// Avoids memory-store resets on restarts and works across multiple API replicas.
if (config.redisUrl) {
  // Lazy import to keep local dev light.
  const { default: RedisStore } = await import('rate-limit-redis');
  const mod = await import('ioredis');
  const Redis = (mod as any).default ?? (mod as any);
  const client = new Redis(config.redisUrl, { maxRetriesPerRequest: 2 });
  store = new RedisStore({
    // rate-limit-redis expects a "sendCommand" client.
    // ioredis already matches that shape.
    sendCommand: (...args: string[]) => client.call(...args)
  });
}

export const apiRateLimit = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: store as any,
  keyGenerator: (req) => {
    // Prefer authenticated user id, fall back to IP.
    const userId = (req as any).user?.userId;
    const ip = req.ip;
    return userId ? `u:${userId}` : `ip:${ip}`;
  },
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' }
});
