import { Router } from 'express';
import { roleplaySchema } from '@emc/shared';
import { upload } from '../utils/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { transcribeAudio } from '../services/stt.js';
import { runRoleplay } from '../services/llm.js';

const router = Router();

router.post('/', upload.single('audio'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Audio requerido' });
    return;
  }
  const parsed = roleplaySchema.parse(req.body);
  const stt = await transcribeAudio(req.file.path);
  const roleplay = await runRoleplay(parsed.context, stt.transcript);
  res.json({ transcript: stt.transcript, ...roleplay });
}));

export default router;
