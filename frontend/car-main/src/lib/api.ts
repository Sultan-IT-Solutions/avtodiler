type Json = Record<string, any>;

export type ApiErrorShape = { error?: string };

export type CarMakeDto = {
  id: number;
  nameRu: string;
  nameKz?: string | null;
  nameEn?: string | null;
};

export type CarModelDto = {
  id: number;
  makeId: number;
  nameRu: string;
  nameKz?: string | null;
  nameEn?: string | null;
};

export type CarDto = {
  id: number;

  // Titles
  titleRu?: string | null;
  titleKz?: string | null;
  titleEn?: string | null;

  descriptionRu?: string | null;
  descriptionKz?: string | null;
  descriptionEn?: string | null;

  price?: number | null;
  year?: number | null;
  featured?: boolean | null;

  images?: string[] | null;

  makeId?: number | null;
  modelId?: number | null;
  make?: CarMakeDto | null;
  model?: CarModelDto | null;

  [k: string]: any;
};

export type OfferDto = {
  id: number;
  titleRu?: string | null;
  titleKz?: string | null;
  titleEn?: string | null;
  descriptionRu?: string | null;
  descriptionKz?: string | null;
  descriptionEn?: string | null;
  image?: string | null;
  validUntil?: string | null;
  badge?: string | null;
  [k: string]: any;
};

export type ServiceItemDto = {
  id: number;
  titleRu?: string | null;
  titleKz?: string | null;
  titleEn?: string | null;
  descriptionRu?: string | null;
  descriptionKz?: string | null;
  descriptionEn?: string | null;
  priceRu?: string | null;
  priceKz?: string | null;
  priceEn?: string | null;
  icon?: string | null;
  [k: string]: any;
};

export type DealerCenterDto = {
  id: number;
  titleRu?: string | null;
  titleKz?: string | null;
  titleEn?: string | null;
  addressRu?: string | null;
  addressKz?: string | null;
  addressEn?: string | null;
  phone?: string | null;
  hoursRu?: string | null;
  hoursKz?: string | null;
  hoursEn?: string | null;
  lat?: number | null;
  lng?: number | null;
  [k: string]: any;
};

export type HomeDto = {
  popular: CarDto[];
  offers: OfferDto[];
};

export type SeoPageDto = {
  id: number;
  slug: string;
  titleRu?: string | null;
  titleKz?: string | null;
  titleEn?: string | null;
  descriptionRu?: string | null;
  descriptionKz?: string | null;
  descriptionEn?: string | null;
  keywordsRu?: string | null;
  keywordsKz?: string | null;
  keywordsEn?: string | null;
  image?: string | null;
  [k: string]: any;
};

function normalizeBase(base: string) {
  return String(base || '').trim().replace(/\/+$/, '');
}

export function getApiBase() {
  const envBase = (import.meta as any).env?.VITE_API_BASE;
  if (typeof envBase === 'string' && envBase.trim()) return normalizeBase(envBase);

  try {
    const host = window.location?.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:4000';
  } catch (_) {
    // ignore
  }

  return '';
}

export function apiUrl(path: string) {
  const p = String(path || '');
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const base = getApiBase();
  if (!p.startsWith('/')) return `${base}/${p}`;
  return `${base}${p}`;
}

export function uploadUrl(path: string) {
  return apiUrl(path);
}

export function withQuery(path: string, query?: Record<string, any>) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiJson<T = Json>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init && init.headers ? init.headers : {})
    }
  });

  const data = await resp.json().catch(() => ({} as any));
  if (!resp.ok) {
    const msg = data && data.error ? String(data.error) : `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function getHome() {
  return apiJson<HomeDto>('/api/home');
}

export async function getCatalog(params?: { makeId?: number; modelId?: number; q?: string }) {
  return apiJson<CarDto[]>(withQuery('/api/catalog', params));
}

export async function getCar(id: number) {
  return apiJson<CarDto>(`/api/cars/${id}`);
}

export async function getMakes() {
  return apiJson<CarMakeDto[]>('/api/makes');
}

export async function getModels(params?: { makeId?: number }) {
  return apiJson<CarModelDto[]>(withQuery('/api/models', params));
}

export async function getBrands() {
  return apiJson<any[]>('/api/brands');
}

export async function getServices() {
  return apiJson<ServiceItemDto[]>('/api/services');
}

export async function getOffers() {
  return apiJson<OfferDto[]>('/api/offers');
}

export async function getDealers() {
  return apiJson<DealerCenterDto[]>('/api/dealers');
}

export async function getPage(slug: string) {
  return apiJson<SeoPageDto>(`/api/pages/${encodeURIComponent(slug)}`);
}

export type LeadPayload = {
  type: string;
  name: string;
  phone: string;
  comment?: string;
  lang?: string;
  carId?: number;
  dealerId?: number;
  serviceId?: number;
};

export async function createLead(payload: LeadPayload) {
  return apiJson<{ ok: boolean; message?: string }>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
