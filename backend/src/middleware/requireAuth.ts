import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { verifyToken } from '../utils/auth.js';

export type AuthRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token.' });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid user.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
