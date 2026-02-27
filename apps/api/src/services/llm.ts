import { config } from '../config.js';
import { createNotConfiguredLlmProvider } from '../providers/notConfigured.js';
import { LLMProvider } from '../providers/types.js';

export interface RoleplayResult {
  corrected: string;
  spanishExplanation: string;
  nextSuggestedResponse: string;
}

const resolveLlmProvider = (): LLMProvider => {
  switch (config.llmProvider) {
    case 'not_configured':
    default:
      return createNotConfiguredLlmProvider();
  }
};

export const runRoleplay = async (context: string, transcript: string): Promise<RoleplayResult> => {
  if (config.mockLlm) {
    return {
      corrected: transcript.trim() || 'Hello, could you help me with this?',
      spanishExplanation: `Contexto: ${context}. Te sugiero usar una estructura más natural y clara en inglés.`,
      nextSuggestedResponse: 'Could you repeat that more slowly, please?'
    };
  }

  const provider = resolveLlmProvider();
  const result = await provider.roleplay(context, transcript);
  return {
    corrected: result.replyText,
    spanishExplanation: '',
    nextSuggestedResponse: result.replyText
  };
};
