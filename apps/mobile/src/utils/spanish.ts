export const humanizeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};
