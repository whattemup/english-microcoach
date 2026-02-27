import express, { type Express, type Request } from 'express';
import path from 'node:path';
import cors, { type CorsOptionsDelegate } from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import compression from 'compression';

import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import lessonsRoutes from './routes/lessons.js';
import attemptsRoutes from './routes/attempts.js';
import roleplayRoutes from './routes/roleplay.js';
import reviewRoutes from './routes/review.js';
import meRoutes from './routes/me.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { config } from './config.js';
import { prisma } from './prisma.js';

const uploadsAbsolute = path.resolve(process.cwd(), config.uploadDir);


export const app: Express = express();

app.set('trust proxy', config.trustProxy);

app.use(
  pinoHttp({
    // Redact auth headers + cookies.
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[REDACTED]'
    }
  })
);

app.use(
  helmet({
    // In production you'll typically terminate TLS at a proxy.
    // If you serve HTTPS directly, enable HSTS here.
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

const corsOptions: CorsOptionsDelegate<Request> = (req, callback) => {
  const requestOrigin = req.header('Origin');

  if (!config.isProd) {
    return callback(null, { origin: true, credentials: true });
  }

  // Server-to-server/curl requests typically have no Origin header.
  if (!requestOrigin) {
    return callback(null, { origin: false });
  }

  if (config.corsOrigins.length === 0) {
    return callback(null, { origin: false });
  }

  if (config.corsOrigins.includes(requestOrigin)) {
    return callback(null, { origin: requestOrigin, credentials: true });
  }

  return callback(null, { origin: false });
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/ready') return next();
  return apiRateLimit(req, res, next);
});
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsAbsolute, { maxAge: config.isProd ? '7d' : 0 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

const REDIS_READY_TIMEOUT_MS = 1000;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Redis readiness timed out')), timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const checkRedisReady = async (): Promise<boolean> => {
  if (!config.redisUrl) return true;

  const mod = await import('ioredis');
  const Redis = (mod as any).default ?? (mod as any);
  const client = new Redis(config.redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1
  });

  client.on('error', () => {
    // Swallow to avoid unhandled error events during readiness probes.
  });

  try {
    await withTimeout(client.connect(), REDIS_READY_TIMEOUT_MS);
    const pong = await withTimeout(client.ping(), REDIS_READY_TIMEOUT_MS);
    return pong === 'PONG';
  } catch {
    return false;
  } finally {
    client.disconnect();
  }
};

// Readiness: verifies dependencies (for orchestration / load balancers).
app.get('/ready', async (_req, res) => {
  const status = {
    database: false,
    redis: config.redisUrl ? false : true
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = true;
  } catch {
    status.database = false;
  }

  if (config.redisUrl) {
    status.redis = await checkRedisReady();
  }

  const ready = status.database && status.redis;
  if (!ready) {
    return res.status(503).json({ ok: false, ready, status });
  }

  return res.json({ ok: true, ready, status });
});
app.use('/auth', authRoutes);

// Public browsing routes
app.use('/categories', categoriesRoutes);
app.use('/lessons', lessonsRoutes);

// Protected routes
app.use('/attempts', authMiddleware, attemptsRoutes);
app.use('/roleplay', authMiddleware, roleplayRoutes);
app.use('/review', authMiddleware, reviewRoutes);
app.use('/me', authMiddleware, meRoutes);

app.use(errorHandler);
