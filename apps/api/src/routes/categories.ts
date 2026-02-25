import { Router } from 'express';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const categories = await prisma.lessonCategory.findMany({ orderBy: { id: 'asc' } });
  res.json(categories);
}));

export default router;
