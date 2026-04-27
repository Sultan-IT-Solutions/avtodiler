import { getSql } from '../_db.js';
import { json } from '../_http.js';
import { getPublicShopBootstrapMemory, isShopMemoryMode } from '../shop/_memory.js';
import { ensureShopSeed } from '../shop/_seed.js';
import type { VercelRequest, VercelResponse } from '../shop/_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    json(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  if (isShopMemoryMode()) {
    json(res, 200, { ok: true, ...getPublicShopBootstrapMemory() });
    return;
  }

  await ensureShopSeed();
  const sql = getSql();
  const [models, categories, products, stores, reviews, seoPages] = await Promise.all([
    sql`select id, data, updated_at from shop_models order by updated_at desc`,
    sql`select id, data, updated_at from shop_categories order by updated_at desc`,
    sql`select id, data, updated_at from shop_products order by updated_at desc`,
    sql`select id, data, updated_at from shop_stores order by updated_at desc`,
    sql`select id, data, updated_at from shop_reviews order by updated_at desc`,
    sql`select id, data, updated_at from shop_seo_pages order by updated_at desc`,
  ]);

  json(res, 200, { ok: true, models, categories, products, stores, reviews, seoPages });
}
