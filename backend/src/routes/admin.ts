import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '../middleware/auth';
import { prisma } from '../prisma';

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.use(requireAdmin);

// Brands CRUD
router.get('/brands', async (_req: Request, res: Response) => {
  const items = await prisma.brand.findMany({ include: { models: true } });
  res.json(items);
});

router.post('/brands', async (req: Request, res: Response) => {
  const { slug, translations, media } = req.body;
  const item = await prisma.brand.create({ data: { slug, translations: typeof translations === 'string' ? translations : JSON.stringify(translations), media: typeof media === 'string' ? media : JSON.stringify(media) } });
  res.json(item);
});

router.put('/brands/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.translations && typeof body.translations !== 'string') data.translations = JSON.stringify(body.translations);
  if (body.media && typeof body.media !== 'string') data.media = JSON.stringify(body.media);
  const item = await prisma.brand.update({ where: { id }, data });
  res.json(item);
});

router.delete('/brands/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.brand.delete({ where: { id } });
  res.json({ ok: true });
});

// Cars: list, create, update, delete
router.get('/cars', async (_req: Request, res: Response) => {
  const items = await prisma.car.findMany({ include: { brand: true, model: true } });
  res.json(items);
});

router.post('/cars', async (req: Request, res: Response) => {
  const { brandId, modelId, year, price, mileage, translations, media } = req.body;
  const item = await prisma.car.create({ data: { brandId, modelId, year, price: price ?? undefined, mileage: mileage ?? undefined, translations: typeof translations === 'string' ? translations : JSON.stringify(translations), media: typeof media === 'string' ? media : JSON.stringify(media) } });
  res.json(item);
});

router.put('/cars/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.translations && typeof body.translations !== 'string') data.translations = JSON.stringify(body.translations);
  if (body.media && typeof body.media !== 'string') data.media = JSON.stringify(body.media);
  const item = await prisma.car.update({ where: { id }, data });
  res.json(item);
});

router.delete('/cars/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.car.delete({ where: { id } });
  res.json({ ok: true });
});

// Services
router.get('/services', async (_req: Request, res: Response) => {
  const items = await prisma.service.findMany();
  res.json(items);
});

router.post('/services', async (req: Request, res: Response) => {
  const { translations, price } = req.body;
  const item = await prisma.service.create({ data: { translations: typeof translations === 'string' ? translations : JSON.stringify(translations), price } });
  res.json(item);
});

router.put('/services/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.translations && typeof body.translations !== 'string') data.translations = JSON.stringify(body.translations);
  const item = await prisma.service.update({ where: { id }, data });
  res.json(item);
});

router.delete('/services/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.service.delete({ where: { id } });
  res.json({ ok: true });
});

// Offers
router.get('/offers', async (_req: Request, res: Response) => {
  const items = await prisma.offer.findMany();
  res.json(items);
});

router.post('/offers', async (req: Request, res: Response) => {
  const { translations, image, startAt, endAt } = req.body;
  const item = await prisma.offer.create({ data: { translations: typeof translations === 'string' ? translations : JSON.stringify(translations), image, startAt: startAt ? new Date(startAt) : undefined, endAt: endAt ? new Date(endAt) : undefined } });
  res.json(item);
});

router.put('/offers/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.translations && typeof body.translations !== 'string') data.translations = JSON.stringify(body.translations);
  const item = await prisma.offer.update({ where: { id }, data });
  res.json(item);
});

router.delete('/offers/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.offer.delete({ where: { id } });
  res.json({ ok: true });
});

// Dealers
router.get('/dealers', async (_req: Request, res: Response) => {
  const items = await prisma.dealer.findMany();
  res.json(items);
});

router.post('/dealers', async (req: Request, res: Response) => {
  const { name, address, phone, hours, coords } = req.body;
  const item = await prisma.dealer.create({ data: { name, address, phone, hours, coords: typeof coords === 'string' ? coords : JSON.stringify(coords) } });
  res.json(item);
});

router.put('/dealers/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.coords && typeof body.coords !== 'string') data.coords = JSON.stringify(body.coords);
  const item = await prisma.dealer.update({ where: { id }, data });
  res.json(item);
});

router.delete('/dealers/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.dealer.delete({ where: { id } });
  res.json({ ok: true });
});

// Requests list
router.get('/requests', async (_req: Request, res: Response) => {
  const items = await prisma.request.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

// Page content
router.get('/pages', async (_req: Request, res: Response) => {
  const items = await prisma.pageContent.findMany();
  res.json(items);
});

router.post('/pages', async (req: Request, res: Response) => {
  const { slug, translations, seo } = req.body;
  const item = await prisma.pageContent.create({ data: { slug, translations: typeof translations === 'string' ? translations : JSON.stringify(translations), seo: typeof seo === 'string' ? seo : JSON.stringify(seo) } });
  res.json(item);
});

router.put('/pages/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.translations && typeof body.translations !== 'string') data.translations = JSON.stringify(body.translations);
  if (body.seo && typeof body.seo !== 'string') data.seo = JSON.stringify(body.seo);
  const item = await prisma.pageContent.update({ where: { id }, data });
  res.json(item);
});

router.delete('/pages/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.pageContent.delete({ where: { id } });
  res.json({ ok: true });
});

// Models CRUD
router.get('/models', async (_req: Request, res: Response) => {
  const items = await prisma.model.findMany({ include: { brand: true } });
  res.json(items);
});

router.post('/models', async (req: Request, res: Response) => {
  const { brandId, slug, translations } = req.body;
  const item = await prisma.model.create({ data: { brandId, slug, translations: typeof translations === 'string' ? translations : JSON.stringify(translations) } });
  res.json(item);
});

router.put('/models/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const data: any = { ...body };
  if (body.translations && typeof body.translations !== 'string') data.translations = JSON.stringify(body.translations);
  const item = await prisma.model.update({ where: { id }, data });
  res.json(item);
});

router.delete('/models/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.model.delete({ where: { id } });
  res.json({ ok: true });
});

// Upload endpoint
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${file.filename}`, filename: file.filename });
});

export default router;
