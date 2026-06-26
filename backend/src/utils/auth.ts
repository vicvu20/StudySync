import jwt from 'jsonwebtoken';

const fallbackSecret = 'dev-only-secret-change-me';

export function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || fallbackSecret, {
    expiresIn: '7d'
  });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_SECRET || fallbackSecret) as { userId: string };
}
