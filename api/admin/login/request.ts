import crypto from 'node:crypto';
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

const json = (res: VercelResponse, status: number, body: unknown) => {
  res.status(status);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
};

const safeJsonParse = (value: unknown) => {
  if (value && typeof value === 'object') return { ok: true as const, value };
  if (typeof value !== 'string') return { ok: false as const };
  try {
    return { ok: true as const, value: JSON.parse(value) as unknown };
  } catch {
    return { ok: false as const };
  }
};

const allowCors = (req: VercelRequest, res: VercelResponse) => {
  const allowed = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = (() => {
    const value = req.headers.origin;
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return null;
    try {
      const url = new URL(raw);
      return url.origin;
    } catch {
      return null;
    }
  })();

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
    __adminLoginRate?: Map<string, { n: number; ts: number }>;
  };

  if (!globalAny.__adminLoginRate) globalAny.__adminLoginRate = new Map();
  const store = globalAny.__adminLoginRate;

  const ip = getClientIp(req);
  const key = `ip:${ip}`;
  const now = Date.now();
  const windowMs = Number(process.env.ADMIN_LOGIN_RATE_WINDOW_MS ?? 60_000);
  const max = Number(process.env.ADMIN_LOGIN_RATE_MAX ?? 10);

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

const readRawBody = async (req: IncomingMessage) => {
  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as Uint8Array);
  }
  return raw;
};

const getStore = () => {
  const globalAny = globalThis as unknown as {
    __adminLoginStore?: Map<string, { status: 'pending' | 'approved' | 'denied'; exp: number }>;
  };
  if (!globalAny.__adminLoginStore) globalAny.__adminLoginStore = new Map();
  return globalAny.__adminLoginStore;
};

const getBotToken = () => process.env.TELEGRAM_BOT_TOKEN ?? process.env.VITE_TELEGRAM_BOT_TOKEN;
const getChatId = () => process.env.ADMIN_TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;

const sendTelegramApproval = async (requestId: string, label: string) => {
  const token = getBotToken();
  const chatId = getChatId();
  if (!token || !chatId) return { ok: false as const, error: 'missing telegram envs' };

  const baseUrl = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '');
  if (!baseUrl) return { ok: false as const, error: 'missing APP_BASE_URL' };

  const approveUrl = `${baseUrl}/api/admin/login/callback?action=approve&id=${encodeURIComponent(
    requestId
  )}`;
  const denyUrl = `${baseUrl}/api/admin/login/callback?action=deny&id=${encodeURIComponent(requestId)}`;

  const text = [
    '<b>Запрос входа в админ-панель</b>',
    `Код: <code>${requestId}</code>`,
    `Кто: <b>${label}</b>`,
    `Время: ${new Date().toISOString()}`,
  ].join('\n');

  const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Разрешить', url: approveUrl },
            { text: '⛔ Отклонить', url: denyUrl },
          ],
        ],
      },
    }),
  });

  if (!telegramRes.ok) {
    const details = await telegramRes.text();
    return { ok: false as const, error: 'telegram error', details: details.slice(0, 500) };
  }

  return { ok: true as const };
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

  const rl = await rateLimit(req);
  if (!rl.ok) {
    res.setHeader('retry-after', Math.ceil(rl.retryAfterMs / 1000));
    json(res, 429, { ok: false, error: 'Too many requests' });
    return;
  }

  const raw = typeof req.body === 'undefined' ? await readRawBody(req) : req.body;
  const parsed = safeJsonParse(raw);
  if (!parsed.ok) {
    json(res, 400, { ok: false, error: 'Invalid JSON body' });
    return;
  }

  const body = parsed.value as { label?: unknown };
  const label = typeof body.label === 'string' ? body.label.trim().slice(0, 60) : '';
  if (!label) {
    json(res, 400, { ok: false, error: 'Missing label' });
    return;
  }

  const requestId = crypto.randomBytes(3).toString('hex'); // 6 chars
  const ttlMs = Number(process.env.ADMIN_LOGIN_TTL_MS ?? 5 * 60_000);
  const exp = Date.now() + ttlMs;

  const store = getStore();
  store.set(requestId, { status: 'pending', exp });

  const telegram = await sendTelegramApproval(requestId, label);
  if (!telegram.ok) {
    store.delete(requestId);
    json(res, 500, {
      ok: false,
      error: 'Telegram error',
      details: telegram.error,
      hint:
        'Check TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (or ADMIN_TELEGRAM_CHAT_ID) and APP_BASE_URL environment variables.',
    });
    return;
  }

  json(res, 200, { ok: true, requestId, expiresAt: exp });
}
