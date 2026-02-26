import express, { type Express } from 'express';
import path from 'node:path';
import cors from 'cors';
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

app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    credentials: true
  })
);

app.use(apiRateLimit);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsAbsolute, { maxAge: config.isProd ? '7d' : 0 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Readiness: verifies DB connectivity (for orchestration / load balancers).
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
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
