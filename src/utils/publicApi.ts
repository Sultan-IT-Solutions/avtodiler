import type { Car } from '../types/car';
import type { DealerItem, OfferItem } from '../types/admin';

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

export const publicApi = {
  async cars(): Promise<Car[]> {
    const res = await fetch('/api/public/cars');
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { data: Car }[] }>;
    return (body.items ?? []).map((x) => x.data);
  },

  async offers(): Promise<OfferItem[]> {
    const res = await fetch('/api/public/offers');
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { data: OfferItem }[] }>;
    return (body.items ?? []).map((x) => x.data);
  },

  async dealers(): Promise<DealerItem[]> {
    const res = await fetch('/api/public/dealers');
    await ensureOk(res);
    const body = (await res.json()) as ApiResult<{ items: { data: DealerItem }[] }>;
    return (body.items ?? []).map((x) => x.data);
  },
};
