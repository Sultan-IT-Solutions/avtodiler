import { getSql } from '../_db.js';
import { json } from '../_http.js';
import { createMemoryRequest, isShopMemoryMode } from '../shop/_memory.js';
import { readRawBody, safeJsonParse, type VercelRequest, type VercelResponse } from '../shop/_shared.js';
import type { PartRequestItem } from '../../../src/types/shop.js';

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

  if (isShopMemoryMode()) {
    createMemoryRequest(body.data as PartRequestItem);
    json(res, 200, { ok: true });
    return;
  }

  const sql = getSql();
  await sql`insert into shop_requests (id, data) values (${id}, ${body.data}::jsonb)`;
  const request = body.data as {
    name?: string;
    phone?: string;
    vin?: string;
    comment?: string;
    createdAt?: string;
  };
  const managerLead = {
    id: `lead-request-${id}`,
    type: 'callback',
    name: typeof request.name === 'string' ? request.name : `Shop request ${id}`,
    phone: typeof request.phone === 'string' ? request.phone : 'not-provided',
    car: typeof request.vin === 'string' ? request.vin : undefined,
    comment: [
      `Parts request ${id}`,
      typeof request.vin === 'string' && request.vin ? `VIN: ${request.vin}` : null,
      typeof request.comment === 'string' && request.comment ? `Comment: ${request.comment}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
    createdAt:
      typeof request.createdAt === 'string' && request.createdAt
        ? request.createdAt
        : new Date().toISOString(),
  };
  await sql`insert into leads (id, data, created_at) values (${managerLead.id}, ${managerLead}::jsonb, ${managerLead.createdAt}::timestamptz)`;
  json(res, 200, { ok: true });
}
