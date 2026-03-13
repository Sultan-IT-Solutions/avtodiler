import type { CategoryItem, HongqiModel, InventoryMovement, OrderItem, PartRequestItem, ProductItem, ReviewItem, SeoPage, StoreItem } from '../types/shop';

type ApiResult<T> = { ok: true } & T;

const ensureOk = async (res: Response) => {
  if (res.ok) return;
  let message = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) message = body.error;
  } catch {
    // ignore
  }
  throw new Error(message);
};

const unwrap = <T,>(items: Array<{ data: T }> | undefined): T[] => (items ?? []).map((item) => item.data);

export const shopPublicApi = {
  async bootstrap() {
    const res = await fetch('/api/public/shop/bootstrap', { cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{
      models: Array<{ data: HongqiModel }>;
      categories: Array<{ data: CategoryItem }>;
      products: Array<{ data: ProductItem }>;
      stores: Array<{ data: StoreItem }>;
      reviews: Array<{ data: ReviewItem }>;
      seoPages: Array<{ data: SeoPage }>;
    }>;
    return {
      models: unwrap(body.models),
      categories: unwrap(body.categories),
      products: unwrap(body.products),
      stores: unwrap(body.stores),
      reviews: unwrap(body.reviews),
      seoPages: unwrap(body.seoPages),
    };
  },

  async createRequest(item: PartRequestItem) {
    const res = await fetch('/api/public/shop/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
  },

  async createOrder(item: OrderItem) {
    const res = await fetch('/api/public/shop/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
  },
};

export const shopAdminApi = {
  async bootstrap() {
    const res = await fetch('/api/admin/shop/bootstrap', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{
      models: Array<{ data: HongqiModel }>;
      categories: Array<{ data: CategoryItem }>;
      products: Array<{ data: ProductItem }>;
      stores: Array<{ data: StoreItem }>;
      reviews: Array<{ data: ReviewItem }>;
      requests: Array<{ data: PartRequestItem }>;
      orders: Array<{ data: OrderItem }>;
      inventoryMovements: Array<{ data: InventoryMovement }>;
      seoPages: Array<{ data: SeoPage }>;
    }>;
    return {
      models: unwrap(body.models),
      categories: unwrap(body.categories),
      products: unwrap(body.products),
      stores: unwrap(body.stores),
      reviews: unwrap(body.reviews),
      requests: unwrap(body.requests),
      orders: unwrap(body.orders),
      inventoryMovements: unwrap(body.inventoryMovements),
      seoPages: unwrap(body.seoPages),
    };
  },

  async upsert(collection: 'models' | 'categories' | 'products' | 'stores' | 'reviews' | 'requests' | 'orders' | 'inventoryMovements' | 'seoPages', id: string, data: unknown) {
    const res = await fetch('/api/admin/shop/documents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ collection, id, data }),
    });
    await ensureOk(res);
  },

  async remove(collection: 'models' | 'categories' | 'products' | 'stores' | 'reviews' | 'requests' | 'orders' | 'inventoryMovements' | 'seoPages', id: string) {
    const res = await fetch(`/api/admin/shop/documents?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
  },
};
