import { requireBasicAuth } from './_guard.js';
import { requireAdminSession } from './_session.js';
import { getSql } from '../_db.js';
import { json } from '../_http.js';
import type { VercelRequest, VercelResponse } from '../shop/_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const guard = requireBasicAuth(req, res);
  if (!guard.ok) return;

  const session = requireAdminSession(req, res);
  if (!session.ok) return;

  if (req.method !== 'GET') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  const sql = getSql();
  const [models, categories, products, stores, reviews, requests, orders, inventoryMovements, seoPages] = await Promise.all([
    sql`select id, data, updated_at from shop_models order by updated_at desc`,
    sql`select id, data, updated_at from shop_categories order by updated_at desc`,
    sql`select id, data, updated_at from shop_products order by updated_at desc`,
    sql`select id, data, updated_at from shop_stores order by updated_at desc`,
    sql`select id, data, updated_at from shop_reviews order by updated_at desc`,
    sql`select id, data, created_at from shop_requests order by created_at desc`,
    sql`select id, data, updated_at from shop_orders order by updated_at desc`,
    sql`select id, data, created_at from shop_inventory_movements order by created_at desc`,
    sql`select id, data, updated_at from shop_seo_pages order by updated_at desc`,
  ]);

  json(res, 200, { ok: true, models, categories, products, stores, reviews, requests, orders, inventoryMovements, seoPages });
}
