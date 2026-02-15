import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import { prisma } from '../backend/src/prisma';
import authRouter from '../backend/src/routes/auth';
import adminRouter from '../backend/src/routes/admin';
import publicRouter from '../backend/src/routes/public';
import adminPagesRouter from '../backend/src/routes/adminPages';

dotenv.config();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';

const app = express();

app.use(
  cors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return cb(null, true);
      if (!FRONTEND_ORIGIN) return cb(null, true);
      if (origin === FRONTEND_ORIGIN) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    name: 'pm_sid',
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);


app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

app.use('/auth', authRouter);
app.use('/admin', adminPagesRouter);
app.use('/admin/api', adminRouter);
app.use('/api', publicRouter);

app.get('/_health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal error' });
});

let prismaConnected = false;
async function ensurePrisma() {
  if (prismaConnected) return;
  await prisma.$connect();
  prismaConnected = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensurePrisma();
    return app(req as any, res as any);
  } catch (e: any) {
    console.error('Handler error', e);
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
