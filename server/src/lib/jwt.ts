import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface SessionPayload {
  userId: string;
  email: string;
}

const SESSION_EXPIRATION = '12h';

export const signSession = (payload: SessionPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: SESSION_EXPIRATION });

export const verifySession = (token: string) => jwt.verify(token, env.jwtSecret) as SessionPayload;
