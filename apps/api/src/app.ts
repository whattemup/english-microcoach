import express, { type Express } from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import lessonsRoutes from './routes/lessons.js';
import attemptsRoutes from './routes/attempts.js';
import roleplayRoutes from './routes/roleplay.js';
import reviewRoutes from './routes/review.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';


export const app: Express = express();

app.use(pinoHttp());
app.use(helmet());
app.use(cors());
app.use(apiRateLimit);
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'apps/api/uploads')));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);

// Public browsing routes
app.use('/categories', categoriesRoutes);
app.use('/lessons', lessonsRoutes);

// Protected routes
app.use('/attempts', authMiddleware, attemptsRoutes);
app.use('/roleplay', authMiddleware, roleplayRoutes);
app.use('/review', authMiddleware, reviewRoutes);

app.use(errorHandler);
