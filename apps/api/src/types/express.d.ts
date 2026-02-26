import type { AccessTokenPayload } from '../services/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export type AccessTokenPayload = {
  userId: string;
  email: string;
};