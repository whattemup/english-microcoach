import { Router, type Router as ExpressRouter } from 'express';
import { roleplaySchema } from '@emc/shared';
import { upload } from '../utils/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { transcribeAudio } from '../services/stt.js';
import { runRoleplay } from '../services/llm.js';

const router: ExpressRouter = Router();

type RoleplayContextInput = {
  category?: string;
  tags?: string[];
  expected?: string;
};

const PROMPT_BY_TAG: Record<string, { promptQuestion: string; spanishHint: string; suggestedAnswer: string }> = {
  greeting: {
    promptQuestion: 'Nice to meet you. What do you do?',
    spanishHint: 'Preséntate y di a qué te dedicas.',
    suggestedAnswer: "I'm a designer. Nice to meet you too."
  },
  restaurant: {
    promptQuestion: 'What would you like to drink?',
    spanishHint: 'Pide una bebida de forma cortés.',
    suggestedAnswer: "I'd like a glass of water, please."
  },
  meetings: {
    promptQuestion: 'What’s your top priority today?',
    spanishHint: 'Comenta tu objetivo principal para hoy.',
    suggestedAnswer: 'My top priority is finishing the client report.'
  },
  directions: {
    promptQuestion: 'Could you repeat the directions, please?',
    spanishHint: 'Pide que repitan las indicaciones.',
    suggestedAnswer: 'Sure, go straight and turn left at the bank.'
  }
};

const PROMPT_BY_CATEGORY: Record<string, { promptQuestion: string; spanishHint: string; suggestedAnswer: string }> = {
  travel: {
    promptQuestion: 'Where are you traveling today?',
    spanishHint: 'Di a dónde viajas y por qué.',
    suggestedAnswer: "I'm traveling to Madrid for a short business trip."
  },
  work: {
    promptQuestion: 'How can I support your work today?',
    spanishHint: 'Explica qué ayuda necesitas en el trabajo.',
    suggestedAnswer: 'Could you help me prepare for the afternoon meeting?'
  }
};

const normalizeTag = (value: string): string => value.trim().toLowerCase();

const parseRoleplayContext = (rawContext: string): RoleplayContextInput => {
  try {
    const parsed = JSON.parse(rawContext) as RoleplayContextInput;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return { expected: rawContext };
  }
};

const buildPrompt = (rawContext: string) => {
  const parsed = parseRoleplayContext(rawContext);
  const tags = (parsed.tags ?? []).map(normalizeTag);

  for (const tag of tags) {
    if (PROMPT_BY_TAG[tag]) return PROMPT_BY_TAG[tag];
  }

  const normalizedCategory = (parsed.category ?? '').trim().toLowerCase();
  if (normalizedCategory && PROMPT_BY_CATEGORY[normalizedCategory]) {
    return PROMPT_BY_CATEGORY[normalizedCategory];
  }

  return {
    promptQuestion: `Can you answer naturally in this situation: ${parsed.expected ?? rawContext}?`,
    spanishHint: 'Responde en inglés con una frase corta y natural.',
    suggestedAnswer: "Sure, I'd be happy to help."
  };
};

router.post('/', upload.single('audio'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Audio requerido' });
    return;
  }
  const parsed = roleplaySchema.parse(req.body);
  const prompt = buildPrompt(parsed.context);
  const stt = await transcribeAudio(req.file.path);
  const roleplay = await runRoleplay(prompt.promptQuestion, stt.transcript);
  res.json({ transcript: stt.transcript, ...prompt, ...roleplay });
}));

export default router;
