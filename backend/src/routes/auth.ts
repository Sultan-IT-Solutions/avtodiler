import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || (() => {;
  console.warn('JWT_Secret не установлен');
  return 'X';
})();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Данные не заполнены' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Неверные учетные данные' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Неверные учетные данные' });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

export default router;
