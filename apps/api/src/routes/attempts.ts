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
  const stt = await transcribeAudio(req.file.path, parsed.expectedText);
  const result = scoreAttempt(parsed.expectedText, stt.transcript);

  const attempt = await prisma.attempt.create({
    data: {
      userId: req.user!.userId,
      lessonPhraseId: parsed.lessonPhraseId,
      expectedText: parsed.expectedText,
      transcript: stt.transcript,
      confidence: stt.confidence,
      score: result.score,
      mistakes: {
        create: [
          ...result.missing.map((word) => ({ word, type: 'missing' })),
          ...result.extra.map((word) => ({ word, type: 'extra' }))
        ]
      }
    }
  });

  res.json({ ...result, transcript: stt.transcript, confidence: stt.confidence, attemptId: attempt.id });
}));

export default router;
