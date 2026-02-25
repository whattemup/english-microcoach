import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtPayload {
  userId: number;
  email: string;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwtAccessSecret, { expiresIn: config.jwtAccessExpires as jwt.SignOptions['expiresIn'] });

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpires as jwt.SignOptions['expiresIn'] });

export const verifyAccessToken = (token: string): JwtPayload => jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
export const verifyRefreshToken = (token: string): JwtPayload => jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
