import { Platform } from 'react-native';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const getEnvApiUrl = (): string | undefined => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.EXPO_PUBLIC_API_URL;
};

export const getApiBaseUrl = (): string => {
  const fallbackUrl = 'http://localhost:3001';
  const configuredUrl = getEnvApiUrl() ?? fallbackUrl;

  try {
    const parsedUrl = new URL(configuredUrl);
    const isLocalHost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

    if (isLocalHost && Platform.OS === 'android') {
      parsedUrl.hostname = '10.0.2.2';
    }

    return trimTrailingSlash(parsedUrl.toString());
  } catch {
    return trimTrailingSlash(configuredUrl);
  }
};
