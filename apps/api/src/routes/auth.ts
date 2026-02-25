import { Router } from 'express';
import { loginSchema, refreshSchema, registerSchema } from '@emc/shared';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { comparePassword, hashPassword } from '../services/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/jwt.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (exists) {
    res.status(409).json({ message: 'El correo ya está registrado' });
    return;
  }
  const user = await prisma.user.create({
    data: { email: parsed.email, name: parsed.name, passwordHash: await hashPassword(parsed.password) }
  });
  const payload = { userId: user.id, email: user.email };
  res.status(201).json({ accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (!user || !(await comparePassword(parsed.password, user.passwordHash))) {
    res.status(401).json({ message: 'Credenciales inválidas' });
    return;
  }
  const payload = { userId: user.id, email: user.email };
  res.json({ accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  const payload = verifyRefreshToken(refreshToken);
  res.json({
    accessToken: signAccessToken({ userId: payload.userId, email: payload.email }),
    refreshToken: signRefreshToken({ userId: payload.userId, email: payload.email })
  });
}));

export default router;
