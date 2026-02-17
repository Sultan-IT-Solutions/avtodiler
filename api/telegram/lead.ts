import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
};

type LeadPayload = {
  type: string;
  name: string;
  phone: string;
  car?: string;
  service?: string;
  dealer?: string;
  comment?: string;
  createdAt?: string;
  pageUrl?: string;
};

const json = (res: VercelResponse, status: number, body: unknown) => {
  res.status(status);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
};

const normalizeOrigin = (value?: string | null) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
};

const allowCors = (req: VercelRequest, res: VercelResponse) => {
  const allowed = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = normalizeOrigin(req.headers.origin);
  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('vary', 'origin');
  }
  res.setHeader('access-control-allow-methods', 'POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
};

const getClientIp = (req: VercelRequest) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
};

const rateLimit = async (req: VercelRequest) => {
  const globalAny = globalThis as unknown as {
    __leadRate?: Map<string, { n: number; ts: number }>;
  };

  if (!globalAny.__leadRate) globalAny.__leadRate = new Map();
  const store = globalAny.__leadRate;

  const ip = getClientIp(req);
  const key = `ip:${ip}`;
  const now = Date.now();
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX ?? 10);

  const entry = store.get(key);
  if (!entry || now - entry.ts > windowMs) {
    store.set(key, { n: 1, ts: now });
    return { ok: true as const, remaining: max - 1 };
  }

  if (entry.n >= max) return { ok: false as const, retryAfterMs: windowMs - (now - entry.ts) };
  entry.n += 1;
  store.set(key, entry);
  return { ok: true as const, remaining: max - entry.n };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const buildMessage = (lead: LeadPayload) => {
  const lines: string[] = [];
  lines.push(`<b>Новая заявка</b>`);
  lines.push(`Тип: <b>${escapeHtml(lead.type || '-') }</b>`);
  lines.push(`Имя: <b>${escapeHtml(lead.name || '-')}</b>`);
  lines.push(`Телефон: <b>${escapeHtml(lead.phone || '-')}</b>`);

  if (lead.car) lines.push(`Авто: ${escapeHtml(lead.car)}`);
  if (lead.service) lines.push(`Услуга: ${escapeHtml(lead.service)}`);
  if (lead.dealer) lines.push(`Дилер: ${escapeHtml(lead.dealer)}`);
  if (lead.comment) lines.push(`Комментарий: ${escapeHtml(lead.comment)}`);
  if (lead.pageUrl) lines.push(`Страница: ${escapeHtml(lead.pageUrl)}`);

  const createdAt = lead.createdAt ? new Date(lead.createdAt) : new Date();
  lines.push(`Время: ${escapeHtml(createdAt.toISOString())}`);
  return lines.join('\n');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = normalizeOrigin(req.headers.origin);
  if (allowedOrigins.length > 0 && (!origin || !allowedOrigins.includes(origin))) {
    json(res, 403, { ok: false, error: 'Origin not allowed' });
    return;
  }

  const rl = await rateLimit(req);
  if (!rl.ok) {
    res.setHeader('retry-after', Math.ceil(rl.retryAfterMs / 1000));
    json(res, 429, { ok: false, error: 'Too many requests' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    json(res, 500, { ok: false, error: 'Server is not configured (missing TELEGRAM_ envs)' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Partial<LeadPayload>;

  if (!body?.type || !body?.name || !body?.phone) {
    json(res, 400, { ok: false, error: 'Missing required fields: type, name, phone' });
    return;
  }

  const payload: LeadPayload = {
    type: String(body.type).slice(0, 80),
    name: String(body.name).slice(0, 80),
    phone: String(body.phone).slice(0, 40),
    car: body.car ? String(body.car).slice(0, 120) : undefined,
    service: body.service ? String(body.service).slice(0, 120) : undefined,
    dealer: body.dealer ? String(body.dealer).slice(0, 120) : undefined,
    comment: body.comment ? String(body.comment).slice(0, 700) : undefined,
    createdAt: body.createdAt ? String(body.createdAt).slice(0, 64) : undefined,
    pageUrl: body.pageUrl ? String(body.pageUrl).slice(0, 300) : undefined,
  };

  const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessage(payload),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!telegramRes.ok) {
    const text = await telegramRes.text();
    json(res, 502, { ok: false, error: 'Telegram error', details: text.slice(0, 500) });
    return;
  }

  json(res, 200, { ok: true });
}
