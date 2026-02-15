import express, { Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { prisma } from '../prisma';

const router = express.Router();

router.use(requireAdmin);

router.get('/me', async (req: any, res: Response) => {
  const id = req.user?.id;
  if (!id) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: user.id, email: user.email });
});

router.get('/leads', async (_req: Request, res: Response) => {
  const items = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { car: true, service: true, dealer: true }
  });
  res.json(items);
});

export default router;
