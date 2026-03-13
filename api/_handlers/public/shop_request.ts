import { getSql } from '../_db.js';
import { json } from '../_http.js';
import { readRawBody, safeJsonParse, type VercelRequest, type VercelResponse } from '../shop/_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

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

  const sql = getSql();
  await sql`insert into shop_requests (id, data) values (${id}, ${body.data}::jsonb)`;
  json(res, 200, { ok: true });
}
