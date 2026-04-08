import type { IncomingMessage, ServerResponse } from 'node:http';
import { requireBasicAuth } from './_guard.js';
import { clearSessionCookie, createSessionToken, setSessionCookie } from './_session.js';

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

const safeJsonParse = (value: unknown) => {
  if (value && typeof value === 'object') return { ok: true as const, value };
  if (typeof value !== 'string') return { ok: false as const };
  try {
    return { ok: true as const, value: JSON.parse(value) as unknown };
  } catch {
    return { ok: false as const };
  }
};

const readRawBody = async (req: IncomingMessage) => {
  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk as Uint8Array);
  }
  return raw;
};

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
    json(res, 503, { ok: false, error: 'Service unavailable', code: 'ADMIN_PASSWORD_NOT_CONFIGURED' });
    return;
  }

  const raw = typeof req.body === 'undefined' ? await readRawBody(req) : req.body;
  const parsed = safeJsonParse(raw);
  if (!parsed.ok) {
    json(res, 400, { ok: false, error: 'Invalid JSON body' });
    return;
  }

  const body = parsed.value as { username?: unknown; password?: unknown };

  const username = normalizeValue(body?.username);
  const password = normalizeValue(body?.password);

  if (username === expectedUser && password === expectedPass) {
    setSessionCookie(res, createSessionToken());
    json(res, 200, { ok: true });
    return;
  }

  clearSessionCookie(res);
  json(res, 401, { ok: false });
}
