import { apiRequest } from './client';

export const login = (email: string, password: string) => apiRequest<{ accessToken: string; refreshToken: string }>('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

export const register = (name: string, email: string, password: string) => apiRequest<{ accessToken: string; refreshToken: string }>('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, password })
});

export const getCategories = (token: string) => apiRequest<Array<{ id: number; name: string; description: string }>>('/categories', {}, token);
export const getLessons = (token: string, categoryId: number) => apiRequest<Array<{ id: number; title: string; level: string }>>(`/lessons?categoryId=${categoryId}`, {}, token);
export const getLesson = (token: string, lessonId: number) =>
  apiRequest<{
    id: number;
    title: string;
    level: string;
    categoryId: number;
    phrases: Array<{ id: number; expected: string; translation: string; tags: string[]; order: number }>;
  }>(`/lessons/${lessonId}`, {}, token);

export const getReviewToday = (token: string) =>
  apiRequest<
    Array<{
      id: number;
      dueDate: string;
      phrase: { expected: string; translation: string; lesson: { title: string } };
    }>
  >('/review/today', {}, token);
