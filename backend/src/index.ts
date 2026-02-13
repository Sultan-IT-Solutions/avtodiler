import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './prisma';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/api', publicRouter);

app.get('/_health', (_req: Request, res: Response) => res.json({ ok: true }));

// global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal error' });
});

app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  // try connecting to DB
  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (e) {
    console.error('Prisma connect error', e);
  }
});
