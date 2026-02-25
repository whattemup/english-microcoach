import { config } from '../config.js';

export const synthesizeSpeech = async (text: string): Promise<{ audioUrl: string }> => {
  if (config.mockTts) {
    return { audioUrl: `/uploads/mock-tts-${encodeURIComponent(text.slice(0, 20))}.mp3` };
  }
  throw new Error('TTS real no configurado. Activa MOCK_TTS=true o integra un proveedor externo.');
};
