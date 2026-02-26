import { Router, type Router as ExpressRouter } from 'express';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router: ExpressRouter = Router();

// Delete account (hard delete). For production, you may prefer a soft-delete + retention window.
router.delete('/', asyncHandler(async (req, res) => {
  const userId = req.user!.userId;

  await prisma.$transaction([
    prisma.attempt.deleteMany({ where: { userId } }),
    prisma.mistake.deleteMany({ where: { userId } }),
    prisma.reviewItem.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } })
  ]);

  res.status(204).send();
}));

export default router;
