const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiRequest = async <T>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error');
  }
  return response.json() as Promise<T>;
};
