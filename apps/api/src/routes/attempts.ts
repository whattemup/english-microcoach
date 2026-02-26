import { Router, type Router as ExpressRouter } from 'express';
import { attemptSchema } from '@emc/shared';
import { upload } from '../utils/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { transcribeAudio } from '../services/stt.js';
import { scoreAttempt } from '../services/scoring.js';
import { prisma } from '../prisma.js';

const router: ExpressRouter = Router();

router.post('/', upload.single('audio'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Audio requerido' });
    return;
  }
  const parsed = attemptSchema.parse(req.body);
  const phrase = await prisma.lessonPhrase.findUnique({ where: { id: parsed.phraseId }, include: { lesson: true } });
  if (!phrase) {
    res.status(404).json({ message: 'Frase no encontrada' });
    return;
  }

  const stt = await transcribeAudio(req.file.path, parsed.expectedText);
  const result = scoreAttempt(parsed.expectedText, stt.transcript);

  const attempt = await prisma.attempt.create({
    data: {
      userId: req.user!.userId,
      lessonId: phrase.lessonId,
      phraseId: phrase.id,
      expectedText: parsed.expectedText,
      transcript: stt.transcript,
      confidence: stt.confidence,
      score: result.score,
      missing: result.missing,
      extra: result.extra
    }
  });

  // Track mistakes (aggregate per user + phrase + word). We count only missing words as "mistakes" for SRS.
  const now = new Date();
  await Promise.all(
    result.missing.map((word) =>
      prisma.mistake.upsert({
        where: { userId_phraseId_word: { userId: req.user!.userId, phraseId: phrase.id, word } },
        update: { count: { increment: 1 }, lastSeen: now },
        create: { userId: req.user!.userId, phraseId: phrase.id, word, count: 1, lastSeen: now }
      })
    )
  );

  // Ensure review item exists when the user struggled.
  if (result.score < 90 || result.missing.length > 0) {
    await prisma.reviewItem.upsert({
      where: { userId_phraseId: { userId: req.user!.userId, phraseId: phrase.id } },
      update: { dueDate: new Date(), intervalDays: 1 },
      create: { userId: req.user!.userId, phraseId: phrase.id, dueDate: new Date(), intervalDays: 1 }
    });
  }

  res.json({ ...result, transcript: stt.transcript, confidence: stt.confidence, attemptId: attempt.id });
}));

export default router;
