import { getSql } from '../_db.js';
import { seedShopState } from '../../../src/data/shopSeed.js';

export const ensureShopSeed = async () => {
  const sql = getSql();
  const rows = await sql`select count(*)::int as count from shop_products`;
  const count = Number(rows[0]?.count ?? 0);
  if (count > 0) return;

  for (const item of seedShopState.models) {
    await sql`insert into shop_models (id, data) values (${item.id}, ${item}::jsonb) on conflict (id) do nothing`;
  }
  for (const item of seedShopState.categories) {
    await sql`insert into shop_categories (id, data) values (${item.id}, ${item}::jsonb) on conflict (id) do nothing`;
  }
  for (const item of seedShopState.products) {
    await sql`insert into shop_products (id, data) values (${item.id}, ${item}::jsonb) on conflict (id) do nothing`;
  }
  for (const item of seedShopState.stores) {
    await sql`insert into shop_stores (id, data) values (${item.id}, ${item}::jsonb) on conflict (id) do nothing`;
  }
  for (const item of seedShopState.reviews) {
    await sql`insert into shop_reviews (id, data) values (${item.id}, ${item}::jsonb) on conflict (id) do nothing`;
  }
  for (const item of seedShopState.seoPages) {
    await sql`insert into shop_seo_pages (id, data) values (${item.id}, ${item}::jsonb) on conflict (id) do nothing`;
  }
};
