import { sign, verify, SignOptions } from 'jsonwebtoken';
import { env } from '@fbk/config';

export interface TokenPayload {
  sub: string;
  scope: string;
  iss: string;
  exp: number;
}

export function generateToken(
  subject: string,
  scope: string,
  expiresIn: string | number = '48h',
): string {
  return sign(
    {
      sub: subject,
      scope,
      iss: 'board',
    },
    env.JWT_SECRET,
    { expiresIn } as SignOptions,
  );
}

export function verifyToken(token: string): TokenPayload {
  try {
    return verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
