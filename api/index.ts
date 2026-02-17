import type { IncomingMessage, ServerResponse } from 'http';

type ApiRequest = IncomingMessage & {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  send: (body: string) => void;
};

type Handler = (req: ApiRequest, res: ApiResponse) => unknown | Promise<unknown>;

const notFound: Handler = (req, res) => {
  res.status(404);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Not found', path: req.url }));
};

const methodNotAllowed: Handler = (req, res) => {
  res.status(405);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Method not allowed', method: req.method }));
};

const isMethodAllowed = (req: ApiRequest, methods: string[]) =>
  !!req.method && methods.includes(req.method.toUpperCase());

const routes: Record<string, () => Promise<{ default: Handler }>> = {
  '/admin/ping': () => import('./_handlers/admin/ping'),
  '/admin/auth': () => import('./_handlers/admin/auth'),
  '/admin/cars': () => import('./_handlers/admin/cars'),
  '/admin/dealers': () => import('./_handlers/admin/dealers'),
  '/admin/leads': () => import('./_handlers/admin/leads'),
  '/admin/offers': () => import('./_handlers/admin/offers'),
  '/admin/login/request': () => import('./_handlers/admin/login/request'),
  '/admin/login/status': () => import('./_handlers/admin/login/status'),
  '/admin/login/callback': () => import('./_handlers/admin/login/callback'),

  '/public/cars': () => import('./_handlers/public/cars'),
  '/public/dealers': () => import('./_handlers/public/dealers'),
  '/public/offers': () => import('./_handlers/public/offers'),

  '/telegram/lead': () => import('./_handlers/telegram/lead'),
};

function getPath(req: ApiRequest) {
  const raw = req.url ?? '';
  const withoutQuery = raw.split('?')[0] ?? '';
  return withoutQuery.startsWith('/api/')
    ? withoutQuery.slice('/api'.length)
    : withoutQuery;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const path = getPath(req);

  if (path === '' || path === '/' || path === '/health') {
    if (!isMethodAllowed(req, ['GET'])) return methodNotAllowed(req, res);
    res.status(200);
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const loader = routes[path];
  if (!loader) return notFound(req, res);

  const mod = await loader();
  return mod.default(req, res);
}
