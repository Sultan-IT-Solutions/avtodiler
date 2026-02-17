import type { IncomingMessage, ServerResponse } from 'node:http';
import { requireBasicAuth } from './_guard';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
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

const normalizeValue = (value?: unknown) => (typeof value === 'string' ? value.trim() : '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const guard = requireBasicAuth(req, res);
  if (!guard.ok) return;

  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const expectedUser = (process.env.ADMIN_USERNAME ?? 'admin').trim();
  const expectedPass = (process.env.ADMIN_PASSWORD ?? '').trim();

  if (!expectedPass) {
    json(res, 500, { ok: false, error: 'Server is not configured' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | { username?: unknown; password?: unknown }
    | undefined;

  const username = normalizeValue(body?.username);
  const password = normalizeValue(body?.password);

  if (username === expectedUser && password === expectedPass) {
    json(res, 200, { ok: true });
    return;
  }

  json(res, 401, { ok: false });
}
