import { getSql } from '../_db.js';
import { json } from '../_http.js';
import { readRawBody, safeJsonParse, type VercelRequest, type VercelResponse } from '../shop/_shared.js';

type OrderPayload = {
  id: string;
  data: {
    items: Array<{ productId: string; quantity: number; price: number }>;
  } & Record<string, unknown>;
};

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

  const body = parsed.value as OrderPayload;
  const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null;
  const data = body.data;
  if (!id || !data || typeof data !== 'object' || !Array.isArray(data.items)) {
    json(res, 400, { ok: false, error: 'Missing fields: id, data.items' });
    return;
  }

  const sql = getSql();
  await sql`insert into shop_orders (id, data) values (${id}, ${data}::jsonb)`;

  for (const item of data.items) {
    const rows = await sql`select data from shop_products where id = ${item.productId} limit 1`;
    const current = rows[0]?.data as { stock?: number } | undefined;
    if (!current) continue;
    const next = { ...current, stock: Math.max(0, Number(current.stock ?? 0) - item.quantity) };
    await sql`update shop_products set data = ${next}::jsonb, updated_at = now() where id = ${item.productId}`;

    const movement = {
      id: `mv-${Math.random().toString(36).slice(2, 10)}`,
      productId: item.productId,
      date: new Date().toISOString(),
      operation: 'expense',
      quantity: item.quantity,
      comment: `Order ${id}`,
    };
    await sql`insert into shop_inventory_movements (id, data) values (${movement.id}, ${movement}::jsonb)`;
  }

  json(res, 200, { ok: true });
}
