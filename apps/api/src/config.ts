import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'access_secret_dev',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret_dev',
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  mockStt: process.env.MOCK_STT !== 'false',
  mockTts: process.env.MOCK_TTS !== 'false',
  mockLlm: process.env.MOCK_LLM !== 'false'
};
