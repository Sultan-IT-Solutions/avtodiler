import type { IncomingMessage, ServerResponse } from 'node:http';
import { requireBasicAuth } from './_guard.js';
import { requireAdminSession } from './_session.js';
import { getSql } from '../_db.js';
import { json } from '../_http.js';

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => void;
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

  const session = requireAdminSession(req, res);
  if (!session.ok) return;

  const sql = getSql();

  if (req.method === 'GET') {
    const rows = await sql`select id, data, updated_at from seo order by updated_at desc`;
    json(res, 200, { ok: true, items: rows });
    return;
  }

  if (req.method === 'POST') {
    const raw = typeof req.body === 'undefined' ? await readRawBody(req) : req.body;
    const parsed = safeJsonParse(raw);
    if (!parsed.ok) {
      json(res, 400, { ok: false, error: 'Invalid JSON body' });
      return;
    }
    const body = parsed.value as { id?: unknown; data?: unknown };
    const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null;
    if (!id || !body.data || typeof body.data !== 'object') {
      json(res, 400, { ok: false, error: 'Missing fields: id, data' });
      return;
    }

    await sql`insert into seo (id, data) values (${id}, ${body.data}::jsonb)
      on conflict (id) do update set data = excluded.data, updated_at = now()`;
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url ?? '', 'http://localhost');
    const id = url.searchParams.get('id');
    if (!id) {
      json(res, 400, { ok: false, error: 'Missing query param: id' });
      return;
    }
    await sql`delete from seo where id = ${id}`;
    json(res, 200, { ok: true });
    return;
  }

  json(res, 405, { ok: false, error: 'Method not allowed' });
}
