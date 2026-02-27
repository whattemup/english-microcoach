import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

let store: unknown | undefined;
let redisWarningLogged = false;

const REDIS_INIT_TIMEOUT_MS = 1500;

const logRedisFallbackWarning = (reason: unknown) => {
  if (redisWarningLogged) return;
  redisWarningLogged = true;
  console.warn('[rate-limit] Redis unavailable, falling back to in-memory rate limiting.', reason);
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timed out while connecting to Redis')), timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const createRedisStore = async (): Promise<unknown | undefined> => {
  if (!config.redisUrl) return undefined;

  try {
    // Lazy import to keep local dev light.
    const { default: RedisStore } = await import('rate-limit-redis');
    const mod = await import('ioredis');
    const Redis = (mod as any).default ?? (mod as any);
    const client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      lazyConnect: true
    });

    client.on('error', (error: unknown) => {
      // Prevent unhandled error events from crashing the API process.
      logRedisFallbackWarning(error);
    });

    await withTimeout(client.connect(), REDIS_INIT_TIMEOUT_MS);
    await withTimeout(client.ping(), REDIS_INIT_TIMEOUT_MS);

    return new RedisStore({
      // rate-limit-redis expects a "sendCommand" client.
      // ioredis already matches that shape.
      sendCommand: (...args: string[]) => client.call(...args)
    });
  } catch (error) {
    logRedisFallbackWarning(error);
    return undefined;
  }
};

// Optional Redis-backed rate limit for production.
// Avoids memory-store resets on restarts and works across multiple API replicas.
store = await createRedisStore();

const limiter = rateLimit({
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

let runtimeFailOpenWarningLogged = false;

const logRuntimeFailOpenWarning = (reason: unknown) => {
  if (runtimeFailOpenWarningLogged) return;
  runtimeFailOpenWarningLogged = true;
  console.warn('[rate-limit] Runtime limiter failure; allowing request without rate limiting.', reason);
};

export const apiRateLimit = (req: Parameters<typeof limiter>[0], res: Parameters<typeof limiter>[1], next: Parameters<typeof limiter>[2]) => {
  try {
    const maybePromise = (limiter as unknown as (...args: unknown[]) => unknown)(req, res, (err?: unknown) => {
      if (err) {
        logRuntimeFailOpenWarning(err);
        return next();
      }
      return next();
    });

    if (typeof (maybePromise as Promise<unknown> | undefined)?.catch === 'function') {
      (maybePromise as Promise<unknown>).catch((error) => {
        logRuntimeFailOpenWarning(error);
        next();
      });
    }
  } catch (error) {
    logRuntimeFailOpenWarning(error);
    next();
  }
};
