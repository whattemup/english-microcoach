import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import path from 'node:path';
import { apiRateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/error.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import lessonsRoutes from './routes/lessons.js';
import attemptsRoutes from './routes/attempts.js';
import roleplayRoutes from './routes/roleplay.js';
import reviewRoutes from './routes/review.js';

export const app = express();

app.use(pinoHttp());
app.use(helmet());
app.use(cors());
app.use(apiRateLimit);
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'apps/api/uploads')));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/categories', authMiddleware, categoriesRoutes);
app.use('/lessons', authMiddleware, lessonsRoutes);
app.use('/attempts', authMiddleware, attemptsRoutes);
app.use('/roleplay', authMiddleware, roleplayRoutes);
app.use('/review', authMiddleware, reviewRoutes);

app.use(errorHandler);
