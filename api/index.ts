import type { IncomingMessage, ServerResponse } from 'http';

import adminAuth from './_handlers/admin/auth';
import adminCars from './_handlers/admin/cars';
import adminDealers from './_handlers/admin/dealers';
import adminLeads from './_handlers/admin/leads';
import adminOffers from './_handlers/admin/offers';
import adminPing from './_handlers/admin/ping';
import adminLoginCallback from './_handlers/admin/login/callback';
import adminLoginRequest from './_handlers/admin/login/request';
import adminLoginStatus from './_handlers/admin/login/status';
import publicCars from './_handlers/public/cars';
import publicDealers from './_handlers/public/dealers';
import publicOffers from './_handlers/public/offers';
import telegramLead from './_handlers/telegram/lead';

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

const routes: Record<string, Handler> = {
  '/admin/ping': adminPing,
  '/admin/auth': adminAuth,
  '/admin/cars': adminCars,
  '/admin/dealers': adminDealers,
  '/admin/leads': adminLeads,
  '/admin/offers': adminOffers,
  '/admin/login/request': adminLoginRequest,
  '/admin/login/status': adminLoginStatus,
  '/admin/login/callback': adminLoginCallback,

  '/public/cars': publicCars,
  '/public/dealers': publicDealers,
  '/public/offers': publicOffers,

  '/telegram/lead': telegramLead,
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
  return loader(req, res);
}
