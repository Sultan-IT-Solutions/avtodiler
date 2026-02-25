import type { AdminCar, DealerItem, LeadItem, OfferItem, SeoItem, ServiceItem } from '../types/admin';

type ApiResult<T> = { ok: true } & T;
type ApiError = { ok: false; error?: string };

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

export const carsApi = {
  async list(): Promise<AdminCar[]> {
    const res = await fetch('/api/admin/cars', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { id: string; data: AdminCar }[] }>;
    return (body.items ?? []).map((row) => row.data);
  },

  async upsert(car: AdminCar): Promise<void> {
    const res = await fetch('/api/admin/cars', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: car.id, data: car }),
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/cars?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },
};

export const offersApi = {
  async list(): Promise<OfferItem[]> {
    const res = await fetch('/api/admin/offers', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { id: string; data: OfferItem }[] }>;
    return (body.items ?? []).map((row) => row.data);
  },

  async upsert(item: OfferItem): Promise<void> {
    const res = await fetch('/api/admin/offers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/offers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },
};

export const servicesApi = {
  async list(): Promise<ServiceItem[]> {
    const res = await fetch('/api/admin/services', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { id: string; data: ServiceItem }[] }>;
    return (body.items ?? []).map((row) => row.data);
  },

  async upsert(item: ServiceItem): Promise<void> {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/services?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },
};

export const dealersApi = {
  async list(): Promise<DealerItem[]> {
    const res = await fetch('/api/admin/dealers', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { id: string; data: DealerItem }[] }>;
    return (body.items ?? []).map((row) => row.data);
  },

  async upsert(item: DealerItem): Promise<void> {
    const res = await fetch('/api/admin/dealers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/dealers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },
};

export const leadsApi = {
  async list(): Promise<LeadItem[]> {
    const res = await fetch('/api/admin/leads', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { id: string; data: LeadItem }[] }>;
    return (body.items ?? []).map((row) => row.data);
  },

  async upsert(item: LeadItem): Promise<void> {
    const res = await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },
};

export const seoApi = {
  async list(): Promise<SeoItem[]> {
    const res = await fetch('/api/admin/seo', { method: 'GET', cache: 'no-store' });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { id: string; data: SeoItem }[] }>;
    return (body.items ?? []).map((row) => row.data);
  },

  async upsert(item: SeoItem): Promise<void> {
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, data: item }),
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/seo?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<Record<string, never>> | ApiError;
    if (!body.ok) throw new Error(body.error ?? 'Unknown error');
  },
};
