import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../services/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: number; email: string };
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado: token faltante' });
    return;
  }
  try {
    const token = authHeader.slice(7);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'No autorizado: token inválido' });
  }
};
