import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthRequest extends Request {
  user?: any;
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });

    const token = parts[1];
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (!payload?.adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.adminUser.findUnique({ where: { id: payload.adminUserId } });
    if (!user) return res.status(403).json({ error: 'Forbidden' });
    req.user = { id: user.id, email: user.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
