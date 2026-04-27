import { requireBasicAuth } from './_guard.js';
import { requireAdminSession } from './_session.js';
import { getSql } from '../_db.js';
import { json } from '../_http.js';
import { readRawBody, safeJsonParse, type VercelRequest, type VercelResponse } from '../shop/_shared.js';

const collectionMap = {
  models: { table: 'shop_models', createdOnly: false },
  categories: { table: 'shop_categories', createdOnly: false },
  products: { table: 'shop_products', createdOnly: false },
  stores: { table: 'shop_stores', createdOnly: false },
  reviews: { table: 'shop_reviews', createdOnly: false },
  requests: { table: 'shop_requests', createdOnly: true },
  orders: { table: 'shop_orders', createdOnly: false },
  inventoryMovements: { table: 'shop_inventory_movements', createdOnly: true },
  seoPages: { table: 'shop_seo_pages', createdOnly: false },
} as const;

type CollectionKey = keyof typeof collectionMap;

const getCollection = (value: unknown): CollectionKey | null => {
  return typeof value === 'string' && value in collectionMap ? (value as CollectionKey) : null;
};

const listRows = async (sql: ReturnType<typeof getSql>, collection: CollectionKey) => {
  switch (collection) {
    case 'models':
      return sql`select id, data, updated_at from shop_models order by updated_at desc`;
    case 'categories':
      return sql`select id, data, updated_at from shop_categories order by updated_at desc`;
    case 'products':
      return sql`select id, data, updated_at from shop_products order by updated_at desc`;
    case 'stores':
      return sql`select id, data, updated_at from shop_stores order by updated_at desc`;
    case 'reviews':
      return sql`select id, data, updated_at from shop_reviews order by updated_at desc`;
    case 'requests':
      return sql`select id, data, created_at from shop_requests order by created_at desc`;
    case 'orders':
      return sql`select id, data, updated_at from shop_orders order by updated_at desc`;
    case 'inventoryMovements':
      return sql`select id, data, created_at from shop_inventory_movements order by created_at desc`;
    case 'seoPages':
      return sql`select id, data, updated_at from shop_seo_pages order by updated_at desc`;
  }
};

const upsertRow = async (sql: ReturnType<typeof getSql>, collection: CollectionKey, id: string, data: unknown) => {
  switch (collection) {
    case 'models':
      return sql`insert into shop_models (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
    case 'categories':
      return sql`insert into shop_categories (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
    case 'products':
      return sql`insert into shop_products (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
    case 'stores':
      return sql`insert into shop_stores (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
    case 'reviews':
      return sql`insert into shop_reviews (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
    case 'requests':
      return sql`insert into shop_requests (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data`;
    case 'orders':
      return sql`insert into shop_orders (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
    case 'inventoryMovements':
      return sql`insert into shop_inventory_movements (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data`;
    case 'seoPages':
      return sql`insert into shop_seo_pages (id, data) values (${id}, ${data}::jsonb) on conflict (id) do update set data = excluded.data, updated_at = now()`;
  }
};

const deleteRow = async (sql: ReturnType<typeof getSql>, collection: CollectionKey, id: string) => {
  switch (collection) {
    case 'models':
      return sql`delete from shop_models where id = ${id}`;
    case 'categories':
      return sql`delete from shop_categories where id = ${id}`;
    case 'products':
      return sql`delete from shop_products where id = ${id}`;
    case 'stores':
      return sql`delete from shop_stores where id = ${id}`;
    case 'reviews':
      return sql`delete from shop_reviews where id = ${id}`;
    case 'requests':
      return sql`delete from shop_requests where id = ${id}`;
    case 'orders':
      return sql`delete from shop_orders where id = ${id}`;
    case 'inventoryMovements':
      return sql`delete from shop_inventory_movements where id = ${id}`;
    case 'seoPages':
      return sql`delete from shop_seo_pages where id = ${id}`;
  }
};

const getCollectionFromQuery = (req: VercelRequest) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  return {
    collection: getCollection(url.searchParams.get('collection')),
    id: url.searchParams.get('id'),
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const guard = requireBasicAuth(req, res);
  if (!guard.ok) return;

  const session = requireAdminSession(req, res);
  if (!session.ok) return;

  const sql = getSql();

  if (req.method === 'GET') {
    const { collection } = getCollectionFromQuery(req);
    if (!collection) {
      json(res, 400, { ok: false, error: 'Missing or invalid query param: collection' });
      return;
    }

    const rows = await listRows(sql, collection);
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
    const body = parsed.value as { collection?: unknown; id?: unknown; data?: unknown };
    const collection = getCollection(body.collection);
    const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null;
    if (!collection || !id || !body.data || typeof body.data !== 'object') {
      json(res, 400, { ok: false, error: 'Missing fields: collection, id, data' });
      return;
    }

    await upsertRow(sql, collection, id, body.data);
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    const { collection, id } = getCollectionFromQuery(req);
    if (!collection || !id) {
      json(res, 400, { ok: false, error: 'Missing query params: collection, id' });
      return;
    }

    await deleteRow(sql, collection, id);
    json(res, 200, { ok: true });
    return;
  }

  json(res, 405, { ok: false, error: 'Method not allowed' });
}
