import { Router, type Router as ExpressRouter } from 'express';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computeProgress } from '../services/progression.js';

const router: ExpressRouter = Router();

router.get('/', asyncHandler(async (req, res) => {
  const attempts = await prisma.attempt.findMany({
    where: { userId: req.user!.userId },
    select: { score: true },
    orderBy: { createdAt: 'desc' },
    take: 15
  });

  const progress = computeProgress(attempts.map((attempt: { score: number }) => attempt.score));
  res.json(progress);
}));

export default router;
