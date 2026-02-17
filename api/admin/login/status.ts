import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
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

  res.setHeader('access-control-allow-methods', 'GET,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
};

const getStore = () => {
  const globalAny = globalThis as unknown as {
    __adminLoginStore?: Map<string, { status: 'pending' | 'approved' | 'denied'; exp: number }>;
  };
  if (!globalAny.__adminLoginStore) globalAny.__adminLoginStore = new Map();
  return globalAny.__adminLoginStore;
};

const getParam = (req: VercelRequest, name: string) => {
  if (req.query && name in req.query) {
    const v = req.query[name];
    return Array.isArray(v) ? v[0] : v;
  }
  if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      return url.searchParams.get(name) ?? undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const id = getParam(req, 'id');
  if (!id) {
    json(res, 400, { ok: false, error: 'Missing id' });
    return;
  }

  const store = getStore();
  const entry = store.get(id);
  if (!entry) {
    json(res, 404, { ok: false, status: 'expired' });
    return;
  }

  if (Date.now() > entry.exp) {
    store.delete(id);
    json(res, 410, { ok: false, status: 'expired' });
    return;
  }

  json(res, 200, { ok: true, status: entry.status, expiresAt: entry.exp });
}
