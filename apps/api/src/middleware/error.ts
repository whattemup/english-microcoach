import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../config.js';
import { ProviderNotConfiguredError } from '../providers/types.js';

const isRecordNotFound = (e: unknown): boolean =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  const log = (req as any).log;
  if (log?.error) log.error({ err }, 'request_failed');

  // Zod validation
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Datos inválidos',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
    });
    return;
  }

  // Multer
  if (err instanceof Error && err.name === 'MulterError') {
    res.status(400).json({ message: 'Error al subir audio. Verifica el tamaño y formato.' });
    return;
  }

  // Prisma
  if (isRecordNotFound(err)) {
    res.status(404).json({ message: 'Recurso no encontrado' });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'Conflicto: ya existe' });
      return;
    }
    res.status(400).json({ message: 'Error de base de datos' });
    return;
  }


  if (err instanceof ProviderNotConfiguredError) {
    res.status(501).json({
      error: 'provider_not_configured',
      providerType: err.providerType,
      hint: err.hint
    });
    return;
  }

  // Auth errors
  if (err instanceof Error && err.message.toLowerCase().includes('jwt')) {
    res.status(401).json({ message: 'No autorizado' });
    return;
  }

  const message = err instanceof Error ? err.message : 'Error inesperado';
  res.status(500).json({
    message: config.isProd ? 'Error interno del servidor' : message
  });
};
