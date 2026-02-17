import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

type ApiRequest = IncomingMessage & {
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  send: (body: string) => void;
};

const COOKIE_NAME = 'admin_session';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const getSecret = () => (process.env.ADMIN_SESSION_SECRET ?? process.env.DATABASE_URL ?? 'dev-secret').trim();

const base64url = (buf: Buffer) =>
  buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const hmac = (payload: string) => {
  const secret = getSecret();
  return base64url(crypto.createHmac('sha256', secret).update(payload).digest());
};

export function createSessionToken() {
  const exp = Date.now() + TTL_MS;
  const nonce = base64url(crypto.randomBytes(16));
  const payload = `v1.${exp}.${nonce}`;
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

function parseCookies(header: string) {
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = value;
  }
  return out;
}

export function readSessionToken(req: ApiRequest): string | null {
  const raw = req.headers.cookie;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header) return null;
  const cookies = parseCookies(header);
  return cookies[COOKIE_NAME] ?? null;
}

export function verifySessionToken(token: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 4 && parts.length !== 5) return false;
  const [v, expRaw, nonce, sig] = parts.length === 4 ? parts : [parts[0], parts[1], parts[2], parts[4]];
  if (v !== 'v1') return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  if (!nonce || !sig) return false;
  const payload = `v1.${exp}.${nonce}`;
  const expected = hmac(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function setSessionCookie(res: ApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(TTL_MS / 1000)}`,
  ];
  if (isProd) attrs.push('Secure');
  res.setHeader('set-cookie', attrs.join('; '));
}

export function clearSessionCookie(res: ApiResponse) {
  const isProd = process.env.NODE_ENV === 'production';
  const attrs = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isProd) attrs.push('Secure');
  res.setHeader('set-cookie', attrs.join('; '));
}

export function requireAdminSession(req: ApiRequest, res: ApiResponse) {
  const token = readSessionToken(req);
  if (verifySessionToken(token)) return { ok: true as const };
  res.status(401);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.send(JSON.stringify({ ok: false, error: 'Unauthorized' }));
  return { ok: false as const };
}
