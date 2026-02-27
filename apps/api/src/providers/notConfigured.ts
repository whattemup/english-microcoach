import { LLMProvider, ProviderNotConfiguredError, STTProvider, TTSProvider } from './types.js';

export const createNotConfiguredSttProvider = (): STTProvider => ({
  async transcribeAudio() {
    throw new ProviderNotConfiguredError('stt', 'Set STT_PROVIDER to a real provider or enable MOCK_STT=true.');
  }
});

export const createNotConfiguredTtsProvider = (): TTSProvider => ({
  async synthesize() {
    throw new ProviderNotConfiguredError('tts', 'Set TTS_PROVIDER to a real provider or enable MOCK_TTS=true.');
  }
});

export const createNotConfiguredLlmProvider = (): LLMProvider => ({
  async roleplay() {
    throw new ProviderNotConfiguredError('llm', 'Set LLM_PROVIDER to a real provider or enable MOCK_LLM=true.');
  }
});
