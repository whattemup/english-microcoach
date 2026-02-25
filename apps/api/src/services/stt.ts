import { config } from '../config.js';

export interface SttResult {
  transcript: string;
  confidence: number;
}

export const transcribeAudio = async (_filePath: string, expectedText?: string): Promise<SttResult> => {
  if (config.mockStt) {
    return {
      transcript: expectedText ?? 'this is a mock transcript',
      confidence: 0.93
    };
  }
  throw new Error('STT real no configurado. Activa MOCK_STT=true o integra un proveedor externo.');
};
