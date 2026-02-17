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

const html = (res: VercelResponse, status: number, body: string) => {
  res.status(status);
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.send(body);
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
  if (req.method !== 'GET') {
    html(res, 405, '<h1>Method not allowed</h1>');
    return;
  }

  const id = getParam(req, 'id');
  const action = getParam(req, 'action');

  if (!id || (action !== 'approve' && action !== 'deny')) {
    html(res, 400, '<h1>Bad request</h1>');
    return;
  }

  const store = getStore();
  const entry = store.get(id);
  if (!entry) {
    html(res, 404, '<h1>Request not found or expired</h1>');
    return;
  }

  if (Date.now() > entry.exp) {
    store.delete(id);
    html(res, 410, '<h1>Request expired</h1>');
    return;
  }

  entry.status = action === 'approve' ? 'approved' : 'denied';
  store.set(id, entry);

  html(
    res,
    200,
    `<!doctype html><html><head><meta charset="utf-8" />
<title>Admin login</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px}code{background:#f3f3f3;padding:2px 6px;border-radius:6px}</style>
</head><body>
<h2>${action === 'approve' ? '✅ Вход разрешён' : '⛔ Вход отклонён'}</h2>
<p>Код: <code>${id}</code></p>
<p>Можно закрыть эту страницу и вернуться на сайт.</p>
</body></html>`
  );
}
