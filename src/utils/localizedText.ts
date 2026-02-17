type Localized = { ru?: string; kz?: string; en?: string };

type Options = {
  lng?: string;
  fallbackLng?: string;
  emptyFallback?: string;
};

export function localizedText(value: unknown, options: Options = {}): string {
  const { lng = 'ru', fallbackLng = 'en', emptyFallback = '' } = options;

  if (value == null) return emptyFallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (typeof value === 'object') {
    const v = value as Localized;
    const direct = v[lng as keyof Localized];
    if (typeof direct === 'string' && direct.trim()) return direct;
    const fb = v[fallbackLng as keyof Localized];
    if (typeof fb === 'string' && fb.trim()) return fb;

    for (const key of ['ru', 'kz', 'en'] as const) {
      const candidate = v[key];
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }
  }

  return emptyFallback;
}
