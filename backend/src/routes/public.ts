import express, { Request, Response } from 'express';
import { prisma } from '../prisma';
import { sendTelegramMessage } from '../utils/telegram';

const router = express.Router();

router.get('/home', async (_req: Request, res: Response) => {
  const popular = await prisma.car.findMany({ take: 8, orderBy: { createdAt: 'desc' } });
  const offers = await prisma.offer.findMany({});
  res.json({ popular, offers });
});

router.get('/catalog', async (req: Request, res: Response) => {
  const { makeId, modelId, q } = req.query as any;
  const where: any = {};
  if (makeId) where.makeId = Number(makeId);
  if (modelId) where.modelId = Number(modelId);
  if (q) {
    where.OR = [
      { titleRu: { contains: String(q) } },
      { titleKz: { contains: String(q) } },
      { titleEn: { contains: String(q) } }
    ];
  }
  const items = await prisma.car.findMany({ where, include: { make: true, model: true } });
  res.json(items);
});

router.get('/cars/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await prisma.car.findUnique({ where: { id }, include: { make: true, model: true } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.get('/makes', async (_req: Request, res: Response) => {
  const items = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' } });
  res.json(items);
});

router.get('/models', async (req: Request, res: Response) => {
  const { makeId } = req.query as any;
  const where: any = {};
  if (makeId) where.makeId = Number(makeId);
  const items = await prisma.carModel.findMany({ where, orderBy: { nameRu: 'asc' } });
  res.json(items);
});

router.get('/brands', async (_req: Request, res: Response) => {
  const items = await prisma.brand.findMany({ orderBy: { titleRu: 'asc' } });
  res.json(items);
});

router.get('/services', async (_req: Request, res: Response) => {
  const items = await prisma.serviceItem.findMany({ orderBy: { id: 'asc' } });
  res.json(items);
});

router.get('/offers', async (_req: Request, res: Response) => {
  const items = await prisma.offer.findMany();
  res.json(items);
});

router.get('/dealers', async (_req: Request, res: Response) => {
  const items = await prisma.dealerCenter.findMany({ orderBy: { id: 'asc' } });
  res.json(items);
});

router.post('/leads', async (req: Request, res: Response) => {
  const { type, name, phone, carId, dealerId, serviceId, comment, lang } = req.body as any;
  if (!type || !name || !phone) return res.status(400).json({ error: 'Данные не заполнены' });

  await prisma.lead.create({
    data: {
      type: String(type),
      name: String(name),
      phone: String(phone),
      comment: comment ? String(comment) : undefined,
      lang: lang ? String(lang) : 'ru',
      carId: carId ? Number(carId) : undefined,
      dealerId: dealerId ? Number(dealerId) : undefined,
      serviceId: serviceId ? Number(serviceId) : undefined
    }
  });

  const text = `New lead: ${type}\nName: ${name}\nPhone: ${phone}\nCar: ${carId ?? '-'}\nDealer: ${dealerId ?? '-'}\nService: ${serviceId ?? '-'}\nComment: ${comment ?? '-'}`;
  await sendTelegramMessage(text);
  res.json({ ok: true, message: 'Заявка отправлена. С вами свяжутся в течение рабочего времени' });
});

router.get('/pages/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const item = await prisma.seoPage.findUnique({ where: { slug } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;
