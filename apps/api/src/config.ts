import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const boolFromEnv = (v: string | undefined, defaultValue: boolean): boolean => {
  if (v === undefined) return defaultValue;
  if (['true', '1', 'yes', 'y', 'on'].includes(v.toLowerCase())) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(v.toLowerCase())) return false;
  return defaultValue;
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL requerido'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres').default('access_secret_dev__change_me'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres').default('refresh_secret_dev__change_me'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Flags: default to true in dev, false in production unless explicitly enabled.
  MOCK_STT: z.string().optional(),
  MOCK_TTS: z.string().optional(),
  MOCK_LLM: z.string().optional(),

  // Uploads
  UPLOAD_DIR: z.string().default('apps/api/apps/api/uploads'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(12),

  // CORS
  CORS_ORIGINS: z.string().optional(),
  TRUST_PROXY: z.string().optional(),

  // Rate limit
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  REDIS_URL: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail-fast in production. In dev/test, the error is still actionable.
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

const env = parsed.data;
const isProd = env.NODE_ENV === 'production';

export const config = {
  nodeEnv: env.NODE_ENV,
  isProd,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,

  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtAccessExpires: env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: env.JWT_REFRESH_EXPIRES,

  mockStt: boolFromEnv(env.MOCK_STT, !isProd),
  mockTts: boolFromEnv(env.MOCK_TTS, !isProd),
  mockLlm: boolFromEnv(env.MOCK_LLM, !isProd),

  uploadDir: env.UPLOAD_DIR,
  maxUploadBytes: env.MAX_UPLOAD_MB * 1024 * 1024,

  corsOrigins: (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  trustProxy: boolFromEnv(env.TRUST_PROXY, isProd),

  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,
  redisUrl: env.REDIS_URL,

  logLevel: env.LOG_LEVEL
} as const;
