import { config } from '../config.js';

export interface RoleplayResult {
  corrected: string;
  spanishExplanation: string;
  nextSuggestedResponse: string;
}

export const runRoleplay = async (context: string, transcript: string): Promise<RoleplayResult> => {
  if (config.mockLlm) {
    return {
      corrected: transcript.trim() || 'Hello, could you help me with this?',
      spanishExplanation: `Contexto: ${context}. Te sugiero usar una estructura más natural y clara en inglés.`,
      nextSuggestedResponse: 'Could you repeat that more slowly, please?'
    };
  }
  throw new Error('LLM real no configurado. Activa MOCK_LLM=true o integra un proveedor externo.');
};
