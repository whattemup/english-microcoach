import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Contraseña inválida')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido')
});

export const attemptSchema = z.object({
  lessonPhraseId: z.coerce.number().int().positive(),
  expectedText: z.string().min(1, 'Texto esperado requerido')
});

export const roleplaySchema = z.object({
  context: z.string().min(1, 'Contexto requerido')
});

export const reviewSubmitSchema = z.object({
  reviewItemId: z.number().int().positive(),
  quality: z.number().int().min(0).max(5)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type AttemptInput = z.infer<typeof attemptSchema>;
export type RoleplayInput = z.infer<typeof roleplaySchema>;
export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
