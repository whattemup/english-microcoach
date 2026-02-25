import { Router } from 'express';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const categoryId = Number(req.query.categoryId);
  if (!categoryId) {
    res.status(400).json({ message: 'categoryId es requerido' });
    return;
  }
  const lessons = await prisma.lesson.findMany({ where: { categoryId }, orderBy: { id: 'asc' } });
  res.json(lessons);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: Number(req.params.id) },
    include: { phrases: true }
  });
  if (!lesson) {
    res.status(404).json({ message: 'Lección no encontrada' });
    return;
  }
  res.json(lesson);
}));

export default router;
