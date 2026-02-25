import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const message = err instanceof Error ? err.message : 'Error inesperado';
  res.status(400).json({ message });
};
