import { config } from '../config.js';
import { createNotConfiguredSttProvider } from '../providers/notConfigured.js';
import { STTProvider } from '../providers/types.js';

export interface SttResult {
  transcript: string;
  confidence: number;
}

const resolveSttProvider = (): STTProvider => {
  switch (config.sttProvider) {
    case 'not_configured':
    default:
      return createNotConfiguredSttProvider();
  }
};

export const transcribeAudio = async (_filePath: string, expectedText?: string): Promise<SttResult> => {
  if (config.mockStt) {
    return {
      transcript: expectedText ?? 'this is a mock transcript',
      confidence: 0.93
    };
  }

  const provider = resolveSttProvider();
  const result = await provider.transcribeAudio(_filePath);
  return {
    transcript: result.text,
    confidence: 0
  };
};
