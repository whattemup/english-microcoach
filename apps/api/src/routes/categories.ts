import { Router, type Router as ExpressRouter } from 'express';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router: ExpressRouter = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const categories = await prisma.lessonCategory.findMany({ orderBy: { id: 'asc' } });
  res.json(categories);
}));

export default router;
