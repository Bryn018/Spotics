import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { verifySession } from '../lib/jwt';
import { HttpError } from './errorHandler';

export interface AuthedRequest extends Request {
  auth?: {
    userId: string;
    email: string;
  };
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.sessionCookieName];
  if (!token) {
    throw new HttpError(401, 'Unauthenticated');
  }

  try {
    const payload = verifySession(token);
    req.auth = payload;
    next();
  } catch (error) {
    throw new HttpError(401, 'Invalid session');
  }
}
