import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

declare module 'express-session' {
  interface SessionData {
    adminUserId?: number;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function layout(title: string, body: string, opts?: { active?: string; userEmail?: string }) {
  const nav = opts?.active
    ? `<nav class="nav"><a class="${opts.active === 'dashboard' ? 'on' : ''}" href="/admin">Dashboard</a><a class="${opts.active === 'leads' ? 'on' : ''}" href="/admin/leads">Leads</a><a class="${opts.active === 'offers' ? 'on' : ''}" href="/admin/offers">Offers</a><a class="${opts.active === 'cars' ? 'on' : ''}" href="/admin/cars">Cars</a><a class="${opts.active === 'makes' ? 'on' : ''}" href="/admin/makes">Makes</a><a class="${opts.active === 'models' ? 'on' : ''}" href="/admin/models">Models</a><a class="${opts.active === 'services' ? 'on' : ''}" href="/admin/services">Services</a><a class="${opts.active === 'brands' ? 'on' : ''}" href="/admin/brands">Brands</a><a class="${opts.active === 'dealers' ? 'on' : ''}" href="/admin/dealers">Dealers</a><a class="${opts.active === 'pages' ? 'on' : ''}" href="/admin/pages">SEO</a><form method="post" action="/admin/logout" class="logout"><span class="who">${escapeHtml(opts.userEmail || '')}</span><button type="submit" class="link">Logout</button></form></nav>`
    : '';
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b0b0c;color:#fff;margin:0}a{color:#fff;text-decoration:none}main{max-width:1080px;margin:56px auto;padding:24px}input,button,select{padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#141417;color:#fff}button{cursor:pointer;background:#e53935;border:none}button:hover{opacity:.92}.card{background:#111115;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px}.muted{opacity:.8;font-size:14px}.nav{display:flex;gap:14px;align-items:center;margin-bottom:18px}.nav a{padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#111115}.nav a.on{background:#1a1a1f;border-color:rgba(255,255,255,.16)}.logout{margin-left:auto;display:flex;gap:10px;align-items:center}.who{opacity:.75;font-size:13px}.link{background:transparent;border:1px solid rgba(255,255,255,.14);padding:10px 12px;border-radius:10px}.table{width:100%;border-collapse:collapse;margin-top:12px}.table th,.table td{padding:10px 10px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;vertical-align:top}.pill{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);font-size:12px;opacity:.9}.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.row input{min-width:240px;flex:1}</style></head><body><main>${nav}${body}</main></body></html>`;
}

function requireAdminPage(req: Request, res: Response, next: NextFunction) {
  const id = (req.session as any)?.adminUserId;
  if (!id) return res.redirect('/admin/login');
  next();
}

const router = express.Router();

router.get('/login', (req: Request, res: Response) => {
  const error = typeof req.query.error === 'string' ? req.query.error : '';
  const body = `<div class="card"><h1 style="margin:0 0 14px">Admin</h1>${error ? `<div style="color:#ff8a80;margin-bottom:12px">${escapeHtml(error)}</div>` : ''}<form method="post" action="/admin/login"><label class="muted">Email</label><input name="email" type="email" autocomplete="username" required/><div style="height:10px"></div><label class="muted">Password</label><input name="password" type="password" autocomplete="current-password" required/><button type="submit">Login</button></form></div>`;
  res.type('html').send(layout('Admin login', `<div style="max-width:520px;margin:0 auto">${body}</div>`));
});

router.post('/login', async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return res.redirect('/admin/login?error=' + encodeURIComponent('Данные не заполнены'));
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return res.redirect('/admin/login?error=' + encodeURIComponent('Неверные учетные данные'));
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.redirect('/admin/login?error=' + encodeURIComponent('Неверные учетные данные'));
  (req.session as any).adminUserId = user.id;
  res.redirect('/admin');
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie('pm_sid');
    res.redirect('/admin/login');
  });
});

router.get('/', requireAdminPage, async (req: Request, res: Response) => {
  const id = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  const leads = await prisma.lead.count();
  const cars = await prisma.car.count();
  const offers = await prisma.offer.count();
  const services = await prisma.serviceItem.count();
  const dealers = await prisma.dealerCenter.count();
  const body = `<div class="card"><h1 style="margin:0 0 14px">Dashboard</h1><div class="row"><span class="pill">Leads: ${leads}</span><span class="pill">Cars: ${cars}</span><span class="pill">Offers: ${offers}</span><span class="pill">Services: ${services}</span><span class="pill">Dealers: ${dealers}</span></div><div style="height:14px"></div><a href="/admin/leads" class="pill">Open leads</a></div>`;
  res.type('html').send(layout('Admin', body, { active: 'dashboard', userEmail: user?.email || '' }));
});

router.get('/leads', requireAdminPage, async (req: Request, res: Response) => {
  const id = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const where: any = {};
  if (q) {
    where.OR = [{ name: { contains: q } }, { phone: { contains: q } }, { type: { contains: q } }];
  }

  const items = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { car: true, service: true, dealer: true }
  });

  const rows = items
    .map((x) => {
      const rel = [x.car ? `Car #${x.car.id}` : '', x.service ? `Service #${x.service.id}` : '', x.dealer ? `Dealer #${x.dealer.id}` : ''].filter(Boolean).join(' ');
      return `<tr><td>${escapeHtml(new Date(x.createdAt).toLocaleString())}</td><td><span class="pill">${escapeHtml(x.type)}</span></td><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.lang || '')}</td><td>${escapeHtml(rel)}</td><td>${escapeHtml(x.comment || '')}</td></tr>`;
    })
    .join('');

  const body = `<div class="card"><h1 style="margin:0 0 14px">Leads</h1><form method="get" action="/admin/leads" class="row"><input name="q" value="${escapeHtml(q)}" placeholder="Search name/phone/type"/><button type="submit">Search</button></form><table class="table"><thead><tr><th>Time</th><th>Type</th><th>Name</th><th>Phone</th><th>Lang</th><th>Ref</th><th>Comment</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Leads', body, { active: 'leads', userEmail: user?.email || '' }));
});

router.get('/offers', requireAdminPage, async (req: Request, res: Response) => {
  const id = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  const items = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  const rows = items
    .map((x) => {
      return `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.titleRu)}</td><td>${escapeHtml(x.titleKz)}</td><td>${escapeHtml(x.titleEn)}</td><td>${escapeHtml(x.startAt ? new Date(x.startAt).toISOString().slice(0, 10) : '')}</td><td>${escapeHtml(x.endAt ? new Date(x.endAt).toISOString().slice(0, 10) : '')}</td><td><a class="pill" href="/admin/offers/${x.id}">Edit</a></td></tr>`;
    })
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Offers</h1><a class="pill" href="/admin/offers/new">New</a></div><table class="table"><thead><tr><th>ID</th><th>Slug</th><th>RU</th><th>KZ</th><th>EN</th><th>Start</th><th>End</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Offers', body, { active: 'offers', userEmail: user?.email || '' }));
});

router.get('/offers/new', requireAdminPage, async (req: Request, res: Response) => {
  const id = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  const body = `<div class="card"><h1 style="margin:0 0 14px">New offer</h1><form method="post" action="/admin/offers/save" class="row" style="flex-direction:column;align-items:stretch"><input name="slug" placeholder="slug" required/><input name="titleRu" placeholder="titleRu" required/><input name="titleKz" placeholder="titleKz" required/><input name="titleEn" placeholder="titleEn" required/><input name="descRu" placeholder="descRu"/><input name="descKz" placeholder="descKz"/><input name="descEn" placeholder="descEn"/><input name="imageUrl" placeholder="imageUrl"/><div class="row"><input name="startAt" type="date"/><input name="endAt" type="date"/></div><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New offer', body, { active: 'offers', userEmail: user?.email || '' }));
});

router.get('/offers/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.offer.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/offers');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit offer</h1><div class="row"><a class="pill" href="/admin/offers">Back</a><form method="post" action="/admin/offers/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/offers/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input name="slug" value="${escapeHtml(item.slug)}" required/><input name="titleRu" value="${escapeHtml(item.titleRu)}" required/><input name="titleKz" value="${escapeHtml(item.titleKz)}" required/><input name="titleEn" value="${escapeHtml(item.titleEn)}" required/><input name="descRu" value="${escapeHtml(item.descRu || '')}"/><input name="descKz" value="${escapeHtml(item.descKz || '')}"/><input name="descEn" value="${escapeHtml(item.descEn || '')}"/><input name="imageUrl" value="${escapeHtml(item.imageUrl || '')}"/><div class="row"><input name="startAt" type="date" value="${escapeHtml(item.startAt ? new Date(item.startAt).toISOString().slice(0, 10) : '')}"/><input name="endAt" type="date" value="${escapeHtml(item.endAt ? new Date(item.endAt).toISOString().slice(0, 10) : '')}"/></div><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit offer', body, { active: 'offers', userEmail: user?.email || '' }));
});

router.post('/offers/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.offer.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/offers');
});

router.post('/offers/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const slug = String(req.body?.slug || '').trim();
  const titleRu = String(req.body?.titleRu || '').trim();
  const titleKz = String(req.body?.titleKz || '').trim();
  const titleEn = String(req.body?.titleEn || '').trim();
  if (!slug || !titleRu || !titleKz || !titleEn) return res.redirect('/admin/offers');
  const data = {
    slug,
    titleRu,
    titleKz,
    titleEn,
    descRu: req.body?.descRu ? String(req.body.descRu) : null,
    descKz: req.body?.descKz ? String(req.body.descKz) : null,
    descEn: req.body?.descEn ? String(req.body.descEn) : null,
    imageUrl: req.body?.imageUrl ? String(req.body.imageUrl) : null,
    startAt: req.body?.startAt ? new Date(String(req.body.startAt)) : null,
    endAt: req.body?.endAt ? new Date(String(req.body.endAt)) : null
  };
  if (id) await prisma.offer.update({ where: { id }, data });
  else await prisma.offer.create({ data });
  res.redirect('/admin/offers');
});

router.get('/cars', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const where: any = {};
  if (q) {
    where.OR = [{ slug: { contains: q } }, { titleRu: { contains: q } }, { titleKz: { contains: q } }, { titleEn: { contains: q } }];
  }
  const items = await prisma.car.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { make: true, model: true } });
  const rows = items
    .map((x) => {
      return `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.make.nameRu)} / ${escapeHtml(x.model.nameRu)}</td><td>${escapeHtml(String(x.year))}</td><td>${escapeHtml(x.priceKzt != null ? String(x.priceKzt) : '')}</td><td>${escapeHtml(x.isNew ? 'new' : '')}</td><td><a class="pill" href="/admin/cars/${x.id}">Edit</a></td></tr>`;
    })
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Cars</h1><a class="pill" href="/admin/cars/new">New</a></div><form method="get" action="/admin/cars" class="row" style="margin-top:12px"><input name="q" value="${escapeHtml(q)}" placeholder="Search slug/title"/><button type="submit">Search</button></form><table class="table"><thead><tr><th>ID</th><th>Slug</th><th>Make/Model</th><th>Year</th><th>PriceKzt</th><th></th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Cars', body, { active: 'cars', userEmail: user?.email || '' }));
});

function optionList(items: Array<{ id: number; label: string }>, selected?: number) {
  return items
    .map((x) => `<option value="${x.id}" ${selected === x.id ? 'selected' : ''}>${escapeHtml(x.label)}</option>`)
    .join('');
}

router.get('/cars/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const makes = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' } });
  const selectedMakeId = typeof req.query.makeId === 'string' && req.query.makeId ? Number(req.query.makeId) : makes[0]?.id;
  const models = selectedMakeId
    ? await prisma.carModel.findMany({ where: { makeId: selectedMakeId }, orderBy: { nameRu: 'asc' }, take: 1000 })
    : await prisma.carModel.findMany({ orderBy: { nameRu: 'asc' }, take: 1000 });
  const makeOpts = optionList(makes.map((m) => ({ id: m.id, label: m.nameRu })), selectedMakeId);
  const modelOpts = optionList(models.map((m) => ({ id: m.id, label: m.nameRu })), models[0]?.id);
  const body = `<div class="card"><h1 style="margin:0 0 14px">New car</h1><form method="get" action="/admin/cars/new" class="row" style="margin-bottom:12px"><select name="makeId" onchange="this.form.submit()">${makeOpts}</select></form><form method="post" action="/admin/cars/save" class="row" style="flex-direction:column;align-items:stretch"><input name="slug" placeholder="slug" required/><input type="hidden" name="makeId" value="${escapeHtml(String(selectedMakeId || ''))}"/><div class="row"><select name="modelId" required>${modelOpts}</select></div><div class="row"><input name="year" type="number" placeholder="year" required/><input name="priceKzt" type="number" placeholder="priceKzt"/></div><div class="row"><input name="engine" placeholder="engine"/><input name="mileageKm" type="number" placeholder="mileageKm"/></div><div class="row"><label class="muted" style="display:flex;gap:10px;align-items:center"><input name="isNew" type="checkbox" value="1" style="width:auto"/>New</label></div><input name="imagesJson" placeholder="imagesJson"/><input name="videoUrl" placeholder="videoUrl"/><input name="hoverMediaUrl" placeholder="hoverMediaUrl"/><input name="titleRu" placeholder="titleRu" required/><input name="titleKz" placeholder="titleKz" required/><input name="titleEn" placeholder="titleEn" required/><input name="descRu" placeholder="descRu"/><input name="descKz" placeholder="descKz"/><input name="descEn" placeholder="descEn"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New car', body, { active: 'cars', userEmail: user?.email || '' }));
});

router.get('/cars/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.car.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/cars');
  const makes = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' } });
  const selectedMakeId = typeof req.query.makeId === 'string' && req.query.makeId ? Number(req.query.makeId) : item.makeId;
  const models = await prisma.carModel.findMany({ where: { makeId: selectedMakeId }, orderBy: { nameRu: 'asc' }, take: 1000 });
  const makeOpts = optionList(makes.map((m) => ({ id: m.id, label: m.nameRu })), selectedMakeId);
  const modelOpts = optionList(models.map((m) => ({ id: m.id, label: m.nameRu })), item.modelId);
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit car</h1><div class="row"><a class="pill" href="/admin/cars">Back</a><form method="post" action="/admin/cars/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="get" action="/admin/cars/${escapeHtml(String(item.id))}" class="row" style="margin-top:12px"><select name="makeId" onchange="this.form.submit()">${makeOpts}</select></form><form method="post" action="/admin/cars/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input type="hidden" name="makeId" value="${escapeHtml(String(selectedMakeId))}"/><input name="slug" value="${escapeHtml(item.slug)}" required/><div class="row"><select name="modelId" required>${modelOpts}</select></div><div class="row"><input name="year" type="number" value="${escapeHtml(String(item.year))}" required/><input name="priceKzt" type="number" value="${escapeHtml(item.priceKzt != null ? String(item.priceKzt) : '')}"/></div><div class="row"><input name="engine" value="${escapeHtml(item.engine || '')}"/><input name="mileageKm" type="number" value="${escapeHtml(item.mileageKm != null ? String(item.mileageKm) : '')}"/></div><div class="row"><label class="muted" style="display:flex;gap:10px;align-items:center"><input name="isNew" type="checkbox" value="1" ${item.isNew ? 'checked' : ''} style="width:auto"/>New</label></div><input name="imagesJson" value="${escapeHtml(item.imagesJson || '')}"/><input name="videoUrl" value="${escapeHtml(item.videoUrl || '')}"/><input name="hoverMediaUrl" value="${escapeHtml(item.hoverMediaUrl || '')}"/><input name="titleRu" value="${escapeHtml(item.titleRu)}" required/><input name="titleKz" value="${escapeHtml(item.titleKz)}" required/><input name="titleEn" value="${escapeHtml(item.titleEn)}" required/><input name="descRu" value="${escapeHtml(item.descRu || '')}"/><input name="descKz" value="${escapeHtml(item.descKz || '')}"/><input name="descEn" value="${escapeHtml(item.descEn || '')}"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit car', body, { active: 'cars', userEmail: user?.email || '' }));
});

router.post('/cars/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.car.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/cars');
});

router.post('/cars/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const slug = String(req.body?.slug || '').trim();
  const makeId = Number(req.body?.makeId);
  const modelId = Number(req.body?.modelId);
  const year = Number(req.body?.year);
  const titleRu = String(req.body?.titleRu || '').trim();
  const titleKz = String(req.body?.titleKz || '').trim();
  const titleEn = String(req.body?.titleEn || '').trim();
  if (!slug || !makeId || !modelId || !year || !titleRu || !titleKz || !titleEn) return res.redirect('/admin/cars');
  const data = {
    slug,
    makeId,
    modelId,
    year,
    engine: req.body?.engine ? String(req.body.engine) : null,
    mileageKm: req.body?.mileageKm ? Number(req.body.mileageKm) : null,
    priceKzt: req.body?.priceKzt ? Number(req.body.priceKzt) : null,
    isNew: Boolean(req.body?.isNew),
    imagesJson: req.body?.imagesJson ? String(req.body.imagesJson) : null,
    videoUrl: req.body?.videoUrl ? String(req.body.videoUrl) : null,
    hoverMediaUrl: req.body?.hoverMediaUrl ? String(req.body.hoverMediaUrl) : null,
    titleRu,
    titleKz,
    titleEn,
    descRu: req.body?.descRu ? String(req.body.descRu) : null,
    descKz: req.body?.descKz ? String(req.body.descKz) : null,
    descEn: req.body?.descEn ? String(req.body.descEn) : null
  };
  if (id) await prisma.car.update({ where: { id }, data });
  else await prisma.car.create({ data });
  res.redirect('/admin/cars');
});

router.get('/services', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const items = await prisma.serviceItem.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  const rows = items
    .map((x) => `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.titleRu)}</td><td>${escapeHtml(x.titleKz)}</td><td>${escapeHtml(x.titleEn)}</td><td>${escapeHtml(x.priceKzt != null ? String(x.priceKzt) : '')}</td><td><a class="pill" href="/admin/services/${x.id}">Edit</a></td></tr>`)
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Services</h1><a class="pill" href="/admin/services/new">New</a></div><table class="table"><thead><tr><th>ID</th><th>RU</th><th>KZ</th><th>EN</th><th>PriceKzt</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Services', body, { active: 'services', userEmail: user?.email || '' }));
});

router.get('/services/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const body = `<div class="card"><h1 style="margin:0 0 14px">New service</h1><form method="post" action="/admin/services/save" class="row" style="flex-direction:column;align-items:stretch"><input name="titleRu" placeholder="titleRu" required/><input name="titleKz" placeholder="titleKz" required/><input name="titleEn" placeholder="titleEn" required/><input name="descRu" placeholder="descRu"/><input name="descKz" placeholder="descKz"/><input name="descEn" placeholder="descEn"/><input name="priceKzt" type="number" placeholder="priceKzt"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New service', body, { active: 'services', userEmail: user?.email || '' }));
});

router.get('/services/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.serviceItem.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/services');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit service</h1><div class="row"><a class="pill" href="/admin/services">Back</a><form method="post" action="/admin/services/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/services/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input name="titleRu" value="${escapeHtml(item.titleRu)}" required/><input name="titleKz" value="${escapeHtml(item.titleKz)}" required/><input name="titleEn" value="${escapeHtml(item.titleEn)}" required/><input name="descRu" value="${escapeHtml(item.descRu || '')}"/><input name="descKz" value="${escapeHtml(item.descKz || '')}"/><input name="descEn" value="${escapeHtml(item.descEn || '')}"/><input name="priceKzt" type="number" value="${escapeHtml(item.priceKzt != null ? String(item.priceKzt) : '')}"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit service', body, { active: 'services', userEmail: user?.email || '' }));
});

router.post('/services/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.serviceItem.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/services');
});

router.post('/services/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const titleRu = String(req.body?.titleRu || '').trim();
  const titleKz = String(req.body?.titleKz || '').trim();
  const titleEn = String(req.body?.titleEn || '').trim();
  if (!titleRu || !titleKz || !titleEn) return res.redirect('/admin/services');
  const data = {
    titleRu,
    titleKz,
    titleEn,
    descRu: req.body?.descRu ? String(req.body.descRu) : null,
    descKz: req.body?.descKz ? String(req.body.descKz) : null,
    descEn: req.body?.descEn ? String(req.body.descEn) : null,
    priceKzt: req.body?.priceKzt ? Number(req.body.priceKzt) : null
  };
  if (id) await prisma.serviceItem.update({ where: { id }, data });
  else await prisma.serviceItem.create({ data });
  res.redirect('/admin/services');
});

router.get('/brands', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const items = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  const rows = items
    .map((x) => `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.titleRu)}</td><td>${escapeHtml(x.titleKz)}</td><td>${escapeHtml(x.titleEn)}</td><td><a class="pill" href="/admin/brands/${x.id}">Edit</a></td></tr>`)
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Brands</h1><a class="pill" href="/admin/brands/new">New</a></div><table class="table"><thead><tr><th>ID</th><th>Slug</th><th>RU</th><th>KZ</th><th>EN</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Brands', body, { active: 'brands', userEmail: user?.email || '' }));
});

router.get('/brands/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const body = `<div class="card"><h1 style="margin:0 0 14px">New brand</h1><form method="post" action="/admin/brands/save" class="row" style="flex-direction:column;align-items:stretch"><input name="slug" placeholder="slug" required/><input name="titleRu" placeholder="titleRu" required/><input name="titleKz" placeholder="titleKz" required/><input name="titleEn" placeholder="titleEn" required/><input name="descRu" placeholder="descRu"/><input name="descKz" placeholder="descKz"/><input name="descEn" placeholder="descEn"/><input name="historyRu" placeholder="historyRu"/><input name="historyKz" placeholder="historyKz"/><input name="historyEn" placeholder="historyEn"/><input name="philosophyRu" placeholder="philosophyRu"/><input name="philosophyKz" placeholder="philosophyKz"/><input name="philosophyEn" placeholder="philosophyEn"/><input name="mediaJson" placeholder="mediaJson"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New brand', body, { active: 'brands', userEmail: user?.email || '' }));
});

router.get('/brands/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.brand.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/brands');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit brand</h1><div class="row"><a class="pill" href="/admin/brands">Back</a><form method="post" action="/admin/brands/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/brands/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input name="slug" value="${escapeHtml(item.slug)}" required/><input name="titleRu" value="${escapeHtml(item.titleRu)}" required/><input name="titleKz" value="${escapeHtml(item.titleKz)}" required/><input name="titleEn" value="${escapeHtml(item.titleEn)}" required/><input name="descRu" value="${escapeHtml(item.descRu || '')}"/><input name="descKz" value="${escapeHtml(item.descKz || '')}"/><input name="descEn" value="${escapeHtml(item.descEn || '')}"/><input name="historyRu" value="${escapeHtml(item.historyRu || '')}"/><input name="historyKz" value="${escapeHtml(item.historyKz || '')}"/><input name="historyEn" value="${escapeHtml(item.historyEn || '')}"/><input name="philosophyRu" value="${escapeHtml(item.philosophyRu || '')}"/><input name="philosophyKz" value="${escapeHtml(item.philosophyKz || '')}"/><input name="philosophyEn" value="${escapeHtml(item.philosophyEn || '')}"/><input name="mediaJson" value="${escapeHtml(item.mediaJson || '')}"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit brand', body, { active: 'brands', userEmail: user?.email || '' }));
});

router.post('/brands/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.brand.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/brands');
});

router.post('/brands/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const slug = String(req.body?.slug || '').trim();
  const titleRu = String(req.body?.titleRu || '').trim();
  const titleKz = String(req.body?.titleKz || '').trim();
  const titleEn = String(req.body?.titleEn || '').trim();
  if (!slug || !titleRu || !titleKz || !titleEn) return res.redirect('/admin/brands');
  const data = {
    slug,
    titleRu,
    titleKz,
    titleEn,
    descRu: req.body?.descRu ? String(req.body.descRu) : null,
    descKz: req.body?.descKz ? String(req.body.descKz) : null,
    descEn: req.body?.descEn ? String(req.body.descEn) : null,
    historyRu: req.body?.historyRu ? String(req.body.historyRu) : null,
    historyKz: req.body?.historyKz ? String(req.body.historyKz) : null,
    historyEn: req.body?.historyEn ? String(req.body.historyEn) : null,
    philosophyRu: req.body?.philosophyRu ? String(req.body.philosophyRu) : null,
    philosophyKz: req.body?.philosophyKz ? String(req.body.philosophyKz) : null,
    philosophyEn: req.body?.philosophyEn ? String(req.body.philosophyEn) : null,
    mediaJson: req.body?.mediaJson ? String(req.body.mediaJson) : null
  };
  if (id) await prisma.brand.update({ where: { id }, data });
  else await prisma.brand.create({ data });
  res.redirect('/admin/brands');
});

router.get('/dealers', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const items = await prisma.dealerCenter.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  const rows = items
    .map((x) => `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.nameRu)}</td><td>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.lat != null ? String(x.lat) : '')}</td><td>${escapeHtml(x.lng != null ? String(x.lng) : '')}</td><td><a class="pill" href="/admin/dealers/${x.id}">Edit</a></td></tr>`)
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Dealers</h1><a class="pill" href="/admin/dealers/new">New</a></div><table class="table"><thead><tr><th>ID</th><th>Slug</th><th>NameRu</th><th>Phone</th><th>Lat</th><th>Lng</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Dealers', body, { active: 'dealers', userEmail: user?.email || '' }));
});

router.get('/dealers/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const body = `<div class="card"><h1 style="margin:0 0 14px">New dealer</h1><form method="post" action="/admin/dealers/save" class="row" style="flex-direction:column;align-items:stretch"><input name="slug" placeholder="slug" required/><input name="nameRu" placeholder="nameRu" required/><input name="nameKz" placeholder="nameKz" required/><input name="nameEn" placeholder="nameEn" required/><input name="addressRu" placeholder="addressRu" required/><input name="addressKz" placeholder="addressKz" required/><input name="addressEn" placeholder="addressEn" required/><input name="phone" placeholder="phone" required/><input name="hoursRu" placeholder="hoursRu"/><input name="hoursKz" placeholder="hoursKz"/><input name="hoursEn" placeholder="hoursEn"/><div class="row"><input name="lat" type="number" step="any" placeholder="lat"/><input name="lng" type="number" step="any" placeholder="lng"/></div><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New dealer', body, { active: 'dealers', userEmail: user?.email || '' }));
});

router.get('/dealers/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.dealerCenter.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/dealers');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit dealer</h1><div class="row"><a class="pill" href="/admin/dealers">Back</a><form method="post" action="/admin/dealers/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/dealers/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input name="slug" value="${escapeHtml(item.slug)}" required/><input name="nameRu" value="${escapeHtml(item.nameRu)}" required/><input name="nameKz" value="${escapeHtml(item.nameKz)}" required/><input name="nameEn" value="${escapeHtml(item.nameEn)}" required/><input name="addressRu" value="${escapeHtml(item.addressRu)}" required/><input name="addressKz" value="${escapeHtml(item.addressKz)}" required/><input name="addressEn" value="${escapeHtml(item.addressEn)}" required/><input name="phone" value="${escapeHtml(item.phone)}" required/><input name="hoursRu" value="${escapeHtml(item.hoursRu || '')}"/><input name="hoursKz" value="${escapeHtml(item.hoursKz || '')}"/><input name="hoursEn" value="${escapeHtml(item.hoursEn || '')}"/><div class="row"><input name="lat" type="number" step="any" value="${escapeHtml(item.lat != null ? String(item.lat) : '')}"/><input name="lng" type="number" step="any" value="${escapeHtml(item.lng != null ? String(item.lng) : '')}"/></div><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit dealer', body, { active: 'dealers', userEmail: user?.email || '' }));
});

router.post('/dealers/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.dealerCenter.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/dealers');
});

router.post('/dealers/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const slug = String(req.body?.slug || '').trim();
  const nameRu = String(req.body?.nameRu || '').trim();
  const nameKz = String(req.body?.nameKz || '').trim();
  const nameEn = String(req.body?.nameEn || '').trim();
  const addressRu = String(req.body?.addressRu || '').trim();
  const addressKz = String(req.body?.addressKz || '').trim();
  const addressEn = String(req.body?.addressEn || '').trim();
  const phone = String(req.body?.phone || '').trim();
  if (!slug || !nameRu || !nameKz || !nameEn || !addressRu || !addressKz || !addressEn || !phone) return res.redirect('/admin/dealers');
  const data = {
    slug,
    nameRu,
    nameKz,
    nameEn,
    addressRu,
    addressKz,
    addressEn,
    phone,
    hoursRu: req.body?.hoursRu ? String(req.body.hoursRu) : null,
    hoursKz: req.body?.hoursKz ? String(req.body.hoursKz) : null,
    hoursEn: req.body?.hoursEn ? String(req.body.hoursEn) : null,
    lat: req.body?.lat ? Number(req.body.lat) : null,
    lng: req.body?.lng ? Number(req.body.lng) : null
  };
  if (id) await prisma.dealerCenter.update({ where: { id }, data });
  else await prisma.dealerCenter.create({ data });
  res.redirect('/admin/dealers');
});

router.get('/pages', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const items = await prisma.seoPage.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
  const rows = items
    .map((x) => `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.titleRu || '')}</td><td>${escapeHtml(x.titleKz || '')}</td><td>${escapeHtml(x.titleEn || '')}</td><td><a class="pill" href="/admin/pages/${x.id}">Edit</a></td></tr>`)
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">SEO pages</h1><a class="pill" href="/admin/pages/new">New</a></div><table class="table"><thead><tr><th>ID</th><th>Slug</th><th>TitleRu</th><th>TitleKz</th><th>TitleEn</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('SEO pages', body, { active: 'pages', userEmail: user?.email || '' }));
});

router.get('/pages/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const body = `<div class="card"><h1 style="margin:0 0 14px">New SEO page</h1><form method="post" action="/admin/pages/save" class="row" style="flex-direction:column;align-items:stretch"><input name="slug" placeholder="slug" required/><input name="titleRu" placeholder="titleRu"/><input name="titleKz" placeholder="titleKz"/><input name="titleEn" placeholder="titleEn"/><input name="descriptionRu" placeholder="descriptionRu"/><input name="descriptionKz" placeholder="descriptionKz"/><input name="descriptionEn" placeholder="descriptionEn"/><input name="h1Ru" placeholder="h1Ru"/><input name="h1Kz" placeholder="h1Kz"/><input name="h1En" placeholder="h1En"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New SEO page', body, { active: 'pages', userEmail: user?.email || '' }));
});

router.get('/pages/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.seoPage.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/pages');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit SEO page</h1><div class="row"><a class="pill" href="/admin/pages">Back</a><form method="post" action="/admin/pages/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/pages/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input name="slug" value="${escapeHtml(item.slug)}" required/><input name="titleRu" value="${escapeHtml(item.titleRu || '')}"/><input name="titleKz" value="${escapeHtml(item.titleKz || '')}"/><input name="titleEn" value="${escapeHtml(item.titleEn || '')}"/><input name="descriptionRu" value="${escapeHtml(item.descriptionRu || '')}"/><input name="descriptionKz" value="${escapeHtml(item.descriptionKz || '')}"/><input name="descriptionEn" value="${escapeHtml(item.descriptionEn || '')}"/><input name="h1Ru" value="${escapeHtml(item.h1Ru || '')}"/><input name="h1Kz" value="${escapeHtml(item.h1Kz || '')}"/><input name="h1En" value="${escapeHtml(item.h1En || '')}"/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit SEO page', body, { active: 'pages', userEmail: user?.email || '' }));
});

router.post('/pages/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.seoPage.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/pages');
});

router.post('/pages/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const slug = String(req.body?.slug || '').trim();
  if (!slug) return res.redirect('/admin/pages');
  const data = {
    slug,
    titleRu: req.body?.titleRu ? String(req.body.titleRu) : null,
    titleKz: req.body?.titleKz ? String(req.body.titleKz) : null,
    titleEn: req.body?.titleEn ? String(req.body.titleEn) : null,
    descriptionRu: req.body?.descriptionRu ? String(req.body.descriptionRu) : null,
    descriptionKz: req.body?.descriptionKz ? String(req.body.descriptionKz) : null,
    descriptionEn: req.body?.descriptionEn ? String(req.body.descriptionEn) : null,
    h1Ru: req.body?.h1Ru ? String(req.body.h1Ru) : null,
    h1Kz: req.body?.h1Kz ? String(req.body.h1Kz) : null,
    h1En: req.body?.h1En ? String(req.body.h1En) : null
  };
  if (id) await prisma.seoPage.update({ where: { id }, data });
  else await prisma.seoPage.create({ data });
  res.redirect('/admin/pages');
});

router.get('/makes', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const items = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' }, take: 500 });
  const rows = items
    .map((x) => `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.nameRu)}</td><td>${escapeHtml(x.nameKz)}</td><td>${escapeHtml(x.nameEn)}</td><td><a class="pill" href="/admin/makes/${x.id}">Edit</a></td></tr>`)
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Makes</h1><a class="pill" href="/admin/makes/new">New</a></div><table class="table"><thead><tr><th>ID</th><th>Slug</th><th>RU</th><th>KZ</th><th>EN</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Makes', body, { active: 'makes', userEmail: user?.email || '' }));
});

router.get('/makes/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const body = `<div class="card"><h1 style="margin:0 0 14px">New make</h1><form method="post" action="/admin/makes/save" class="row" style="flex-direction:column;align-items:stretch"><input name="slug" placeholder="slug" required/><input name="nameRu" placeholder="nameRu" required/><input name="nameKz" placeholder="nameKz" required/><input name="nameEn" placeholder="nameEn" required/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New make', body, { active: 'makes', userEmail: user?.email || '' }));
});

router.get('/makes/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.carMake.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/makes');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit make</h1><div class="row"><a class="pill" href="/admin/makes">Back</a><form method="post" action="/admin/makes/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/makes/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><input name="slug" value="${escapeHtml(item.slug)}" required/><input name="nameRu" value="${escapeHtml(item.nameRu)}" required/><input name="nameKz" value="${escapeHtml(item.nameKz)}" required/><input name="nameEn" value="${escapeHtml(item.nameEn)}" required/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit make', body, { active: 'makes', userEmail: user?.email || '' }));
});

router.post('/makes/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (id) await prisma.carMake.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/makes');
});

router.post('/makes/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const slug = String(req.body?.slug || '').trim();
  const nameRu = String(req.body?.nameRu || '').trim();
  const nameKz = String(req.body?.nameKz || '').trim();
  const nameEn = String(req.body?.nameEn || '').trim();
  if (!slug || !nameRu || !nameKz || !nameEn) return res.redirect('/admin/makes');
  const data = { slug, nameRu, nameKz, nameEn };
  if (id) await prisma.carMake.update({ where: { id }, data });
  else await prisma.carMake.create({ data });
  res.redirect('/admin/makes');
});

router.get('/models', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const makeId = typeof req.query.makeId === 'string' && req.query.makeId ? Number(req.query.makeId) : undefined;
  const where: any = {};
  if (makeId) where.makeId = makeId;
  const makes = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' } });
  const items = await prisma.carModel.findMany({ where, orderBy: { nameRu: 'asc' }, take: 1000 });
  const makeOpts = `<option value="">All makes</option>` + optionList(makes.map((m) => ({ id: m.id, label: m.nameRu })), makeId);
  const rows = items
    .map((x) => `<tr><td>${escapeHtml(String(x.id))}</td><td>${escapeHtml(String(x.makeId))}</td><td>${escapeHtml(x.slug)}</td><td>${escapeHtml(x.nameRu)}</td><td>${escapeHtml(x.nameKz)}</td><td>${escapeHtml(x.nameEn)}</td><td><a class="pill" href="/admin/models/${x.id}">Edit</a></td></tr>`)
    .join('');
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Models</h1><a class="pill" href="/admin/models/new">New</a></div><form method="get" action="/admin/models" class="row" style="margin-top:12px"><select name="makeId">${makeOpts}</select><button type="submit">Filter</button></form><table class="table"><thead><tr><th>ID</th><th>Make</th><th>Slug</th><th>RU</th><th>KZ</th><th>EN</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  res.type('html').send(layout('Models', body, { active: 'models', userEmail: user?.email || '' }));
});

router.get('/models/new', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const makes = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' } });
  const makeId = typeof req.query.makeId === 'string' && req.query.makeId ? Number(req.query.makeId) : undefined;
  const makeOpts = optionList(makes.map((m) => ({ id: m.id, label: m.nameRu })), makeId);
  const body = `<div class="card"><h1 style="margin:0 0 14px">New model</h1><form method="post" action="/admin/models/save" class="row" style="flex-direction:column;align-items:stretch"><select name="makeId" required>${makeOpts}</select><input name="slug" placeholder="slug" required/><input name="nameRu" placeholder="nameRu" required/><input name="nameKz" placeholder="nameKz" required/><input name="nameEn" placeholder="nameEn" required/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('New model', body, { active: 'models', userEmail: user?.email || '' }));
});

router.get('/models/:id', requireAdminPage, async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminUserId as number;
  const user = await prisma.adminUser.findUnique({ where: { id: adminId } });
  const id = Number(req.params.id);
  const item = await prisma.carModel.findUnique({ where: { id } });
  if (!item) return res.redirect('/admin/models');
  const makes = await prisma.carMake.findMany({ orderBy: { nameRu: 'asc' } });
  const makeOpts = optionList(makes.map((m) => ({ id: m.id, label: m.nameRu })), item.makeId);
  const body = `<div class="card"><div class="row" style="justify-content:space-between"><h1 style="margin:0">Edit model</h1><div class="row"><a class="pill" href="/admin/models">Back</a><form method="post" action="/admin/models/${item.id}/delete" onsubmit="return confirm('Delete?')"><button type="submit" class="link">Delete</button></form></div></div><form method="post" action="/admin/models/save" class="row" style="flex-direction:column;align-items:stretch"><input type="hidden" name="id" value="${escapeHtml(String(item.id))}"/><select name="makeId" required>${makeOpts}</select><input name="slug" value="${escapeHtml(item.slug)}" required/><input name="nameRu" value="${escapeHtml(item.nameRu)}" required/><input name="nameKz" value="${escapeHtml(item.nameKz)}" required/><input name="nameEn" value="${escapeHtml(item.nameEn)}" required/><button type="submit">Save</button></form></div>`;
  res.type('html').send(layout('Edit model', body, { active: 'models', userEmail: user?.email || '' }));
});

router.post('/models/:id/delete', requireAdminPage, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await prisma.carModel.findUnique({ where: { id } });
  if (id) await prisma.carModel.delete({ where: { id } }).catch(() => undefined);
  res.redirect('/admin/models' + (item?.makeId ? '?makeId=' + encodeURIComponent(String(item.makeId)) : ''));
});

router.post('/models/save', requireAdminPage, async (req: Request, res: Response) => {
  const id = req.body?.id ? Number(req.body.id) : undefined;
  const makeId = Number(req.body?.makeId);
  const slug = String(req.body?.slug || '').trim();
  const nameRu = String(req.body?.nameRu || '').trim();
  const nameKz = String(req.body?.nameKz || '').trim();
  const nameEn = String(req.body?.nameEn || '').trim();
  if (!makeId || !slug || !nameRu || !nameKz || !nameEn) return res.redirect('/admin/models');
  const data = { makeId, slug, nameRu, nameKz, nameEn };
  if (id) await prisma.carModel.update({ where: { id }, data });
  else await prisma.carModel.create({ data });
  res.redirect('/admin/models?makeId=' + encodeURIComponent(String(makeId)));
});

export default router;
