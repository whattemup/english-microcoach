import { Router, type Router as ExpressRouter } from 'express';
import { reviewSubmitSchema } from '@emc/shared';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateSrs } from '../services/srs.js';

const router: ExpressRouter = Router();

router.get('/today', asyncHandler(async (req, res) => {
  const items = await prisma.reviewItem.findMany({
    where: { userId: req.user!.userId, dueDate: { lte: new Date() } },
    include: { phrase: { include: { lesson: true } } },
    orderBy: { dueDate: 'asc' }
  });
  res.json(items);
}));

router.post('/submit', asyncHandler(async (req, res) => {
  const parsed = reviewSubmitSchema.parse(req.body);
  const item = await prisma.reviewItem.findFirst({ where: { id: parsed.reviewItemId, userId: req.user!.userId } });
  if (!item) {
    res.status(404).json({ message: 'Elemento de repaso no encontrado' });
    return;
  }
  const updated = updateSrs(item, parsed.quality);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + updated.intervalDays);
  const saved = await prisma.reviewItem.update({
    where: { id: item.id },
    data: { ...updated, dueDate, lastReviewedAt: new Date() }
  });
  res.json(saved);
}));

export default router;
