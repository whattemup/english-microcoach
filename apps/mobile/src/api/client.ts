import { getApiBaseUrl } from './baseUrl';

let hasLoggedBaseUrl = false;

export const apiRequest = async <T>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  const baseUrl = getApiBaseUrl();

  if (!hasLoggedBaseUrl) {
    console.log(`[api] baseUrl=${baseUrl}`);
    hasLoggedBaseUrl = true;
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error');
  }
  return response.json() as Promise<T>;
};
