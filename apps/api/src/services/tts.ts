import { config } from '../config.js';
import { createNotConfiguredTtsProvider } from '../providers/notConfigured.js';
import { TTSProvider } from '../providers/types.js';

const resolveTtsProvider = (): TTSProvider => {
  switch (config.ttsProvider) {
    case 'not_configured':
    default:
      return createNotConfiguredTtsProvider();
  }
};

export const synthesizeSpeech = async (text: string): Promise<{ audioUrl: string }> => {
  if (config.mockTts) {
    return { audioUrl: `/uploads/mock-tts-${encodeURIComponent(text.slice(0, 20))}.mp3` };
  }

  const provider = resolveTtsProvider();
  const result = await provider.synthesize(text);
  return { audioUrl: result.url };
};
