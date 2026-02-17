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
  '/admin/ping': () => import('./admin/ping'),
  '/admin/auth': () => import('./admin/auth'),
  '/admin/cars': () => import('./admin/cars'),
  '/admin/dealers': () => import('./admin/dealers'),
  '/admin/leads': () => import('./admin/leads'),
  '/admin/offers': () => import('./admin/offers'),
  '/admin/login/request': () => import('./admin/login/request'),
  '/admin/login/status': () => import('./admin/login/status'),
  '/admin/login/callback': () => import('./admin/login/callback'),

  '/public/cars': () => import('./public/cars'),
  '/public/dealers': () => import('./public/dealers'),
  '/public/offers': () => import('./public/offers'),

  '/telegram/lead': () => import('./telegram/lead'),
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
