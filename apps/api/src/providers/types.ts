export type ProviderType = 'stt' | 'tts' | 'llm';

export interface STTProvider {
  transcribeAudio(filePath: string): Promise<{ text: string }>;
}

export interface TTSProvider {
  synthesize(text: string): Promise<{ url: string }>;
}

export interface LLMProvider {
  roleplay(context: string, userText: string): Promise<{ replyText: string }>;
}

export class ProviderNotConfiguredError extends Error {
  providerType: ProviderType;

  hint: string;

  constructor(providerType: ProviderType, hint: string) {
    super(`Provider not configured for ${providerType}`);
    this.name = 'ProviderNotConfiguredError';
    this.providerType = providerType;
    this.hint = hint;
  }
}
