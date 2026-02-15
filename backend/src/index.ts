import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { prisma } from './prisma';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';
import adminPagesRouter from './routes/adminPages';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';

const app = express();

// CORS
app.use(
  cors({
    origin: (origin, cb) => {
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

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/auth', authRouter);
app.use('/admin', adminPagesRouter);
app.use('/admin/api', adminRouter);
app.use('/api', publicRouter);

app.get('/_health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal error' });
});

app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (e) {
    console.error('Prisma connect error', e);
  }
});
