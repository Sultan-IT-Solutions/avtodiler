import express, { Request, Response } from 'express';
import { prisma } from '../prisma';
import { sendTelegramMessage } from '../utils/telegram';

const router = express.Router();

// Homepage data
router.get('/home', async (_req: Request, res: Response) => {
  const popular = await prisma.car.findMany({ take: 8, orderBy: { createdAt: 'desc' } });
  const offers = await prisma.offer.findMany({});
  res.json({ popular, offers });
});

// Catalog
router.get('/catalog', async (req: Request, res: Response) => {
  const { brandId, q } = req.query as any;
  const where: any = {};
  if (brandId) where.brandId = Number(brandId);
  if (q) where.OR = [
    { translations: { contains: q } },
  ];
  const items = await prisma.car.findMany({ where, include: { brand: true, model: true } });
  res.json(items);
});

router.get('/cars/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await prisma.car.findUnique({ where: { id }, include: { brand: true, model: true } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.get('/brands', async (_req: Request, res: Response) => {
  const items = await prisma.brand.findMany();
  res.json(items);
});

router.get('/services', async (_req: Request, res: Response) => {
  const items = await prisma.service.findMany();
  res.json(items);
});

router.get('/offers', async (_req: Request, res: Response) => {
  const items = await prisma.offer.findMany();
  res.json(items);
});

router.get('/dealers', async (_req: Request, res: Response) => {
  const items = await prisma.dealer.findMany();
  res.json(items);
});

// Submit request (test-drive or service)
router.post('/requests', async (req: Request, res: Response) => {
  const { type, name, phone, carId, dealerId, serviceId, comment, lang } = req.body;
  if (!type || !name || !phone) return res.status(400).json({ error: 'Данные не заполнены' });
  const r = await prisma.request.create({ data: { type, name, phone, carId: carId ?? undefined, dealerId: dealerId ?? undefined, serviceId: serviceId ?? undefined, comment, lang: lang ?? 'ru' } });
  // notify Telegram
  const text = `New ${type} request\nName: ${name}\nPhone: ${phone}\nCar: ${carId ?? '-'}\nDealer: ${dealerId ?? '-'}\nService: ${serviceId ?? '-'}\nComment: ${comment ?? '-'}`;
  await sendTelegramMessage(text);
  res.json({ ok: true, message: 'Заявка отправлена. С вами свяжутся в течение рабочего времени' });
});

router.get('/pages/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const item = await prisma.pageContent.findUnique({ where: { slug } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;
