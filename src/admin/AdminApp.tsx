import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { LogOut, Plus, Save, Trash2 } from 'lucide-react';
import type {
  AdminCar,
  AdminData,
  AdminSectionKey,
  DealerItem,
  LeadItem,
  LocaleText,
  OfferItem,
  ServiceItem,
  SeoItem,
} from '../types/admin';
import { ShopAdminPage } from '../pages/ShopPages';
import { createId } from '../utils/adminStorage';
import { carsApi, dealersApi, leadsApi, offersApi, seoApi, servicesApi } from '../utils/adminApi';

const readAuthOk = () => false;

const localeField = (value?: LocaleText): LocaleText =>
  value ?? { ru: '', kz: '', en: '' };

type ToastPayload = {
  id: string;
  message: string;
  actionLabel: string;
  onAction?: () => void;
};

const Toast = ({ payload, onClose }: { payload: ToastPayload; onClose: () => void }) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-[92vw] sm:max-w-sm">
      <div className="bg-luxury-elevated border border-white/10 shadow-xl px-4 py-3 flex items-center gap-3">
        <p className="text-sm text-white/80 flex-1">{payload.message}</p>
        <button
          onClick={() => {
            payload.onAction?.();
            onClose();
          }}
          className="h-9 px-3 border border-white/15 text-white/80 hover:text-white hover:border-white/35 text-sm"
        >
          {payload.actionLabel}
        </button>
        <button
          onClick={onClose}
          className="h-9 w-9 border border-white/10 text-white/60 hover:text-white hover:border-white/30"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const AdminLogin = ({ onSuccess }: { onSuccess: () => void }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: login, password }),
      });

      if (!response.ok) {
        setError('Неверный логин или пароль');
        return;
      }

      const data = (await response.json()) as { ok?: boolean };
      if (!data?.ok) {
        setError('Неверный логин или пароль');
        return;
      }
      onSuccess();
    } catch {
      setError('Ошибка входа. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-luxury-elevated border border-white/10 p-10"
      >
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy mb-3">
            Админ-панель
          </p>
          <h1 className="text-2xl font-semibold text-white">Вход в систему</h1>
        </div>
        {error && (
          <div className="mb-6 text-sm text-red-300 border border-red-400/30 bg-red-500/10 px-4 py-3">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="Логин"
            className="w-full h-12 bg-luxury-surface border border-white/10 px-4 text-white"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль"
            className="w-full h-12 bg-luxury-surface border border-white/10 px-4 text-white"
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full btn-primary justify-center"
        >
          Войти
        </button>
      </form>
    </div>
  );
};

const LocaleFields = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocaleText;
  onChange: (next: LocaleText) => void;
}) => (
  <div>
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">
      {label}
    </p>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {(['ru', 'kz', 'en'] as const).map((locale) => (
        <input
          key={locale}
          value={value[locale]}
          onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
          placeholder={locale.toUpperCase()}
          className="h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
        />
      ))}
    </div>
  </div>
);

const LocaleTextAreas = ({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: LocaleText;
  onChange: (next: LocaleText) => void;
  rows?: number;
}) => (
  <div>
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">
      {label}
    </p>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {(['ru', 'kz', 'en'] as const).map((locale) => (
        <textarea
          key={locale}
          rows={rows}
          value={value[locale]}
          onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
          placeholder={locale.toUpperCase()}
          className="min-h-[90px] bg-luxury-surface border border-white/10 px-3 py-2 text-sm text-white"
        />
      ))}
    </div>
  </div>
);

const SectionLayout = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl text-white font-semibold">{title}</h2>
      {description && <p className="text-sm text-white/50 mt-2">{description}</p>}
    </div>
    {children}
  </div>
);

const EntityList = <T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  getLabel,
}: {
  items: T[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  getLabel: (item: T) => string;
}) => (
  <div className="space-y-2">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`w-full text-left px-4 py-3 border text-sm transition-all duration-300 ${
          selectedId === item.id
            ? 'border-luxury-burgundy bg-luxury-burgundy/10 text-white'
            : 'border-white/10 bg-luxury-elevated text-white/70 hover:text-white'
        }`}
      >
        {getLabel(item)}
      </button>
    ))}
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="border border-white/10 bg-luxury-elevated p-8 text-center text-white/50">
    {text}
  </div>
);

type SectionInfo = { key: AdminSectionKey; label: string };

const AdminApp = () => {
  const [data, setData] = useState<AdminData>(() => ({
    cars: [],
    services: [],
    offers: [],
    dealers: [],
    leads: [],
    seo: [],
    shop: null,
  }));
  const [activeSection, setActiveSection] = useState<AdminSectionKey>('cars');
  const [isAuthed, setIsAuthed] = useState(() => readAuthOk());
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/login/status', { method: 'GET', cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setIsAuthed(false);
          return;
        }
        const body = (await res.json()) as { ok?: boolean; authed?: boolean };
        setIsAuthed(Boolean(body?.ok && body?.authed));
      })
      .catch(() => {
        if (!cancelled) setIsAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const notify = (message: string, actionLabel = 'ОК', onAction?: () => void) => {
    setToast({ id: createId(), message, actionLabel, onAction });
  };

  useEffect(() => {
    if (!isAuthed) return;
    let cancelled = false;

    const load = async () => {
      setIsSyncing(true);
      try {
        const [cars, services, offers, dealers, leads, seo] = await Promise.all([
          carsApi.list(),
          servicesApi.list(),
          offersApi.list(),
          dealersApi.list(),
          leadsApi.list(),
          seoApi.list(),
        ]);
        if (cancelled) return;

        setData((current) => ({
          ...current,
          cars,
          services,
          offers,
          dealers,
          leads,
          seo,
        }));

        notify('Данные загружены из Neon', 'ОК');
      } catch (error) {
        if (!cancelled) {
          const msg = (error as Error).message;
          if (msg.includes('HTTP 401')) {
            setIsAuthed(false);
          } else {
            notify(`Не удалось загрузить из Neon: ${msg}`, 'ОК');
          }
        }
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const updateData = (updater: (current: AdminData) => AdminData) => {
    const next = updater(data);
    setData(next);
  };

  const sections = useMemo<SectionInfo[]>(
    () => [
      { key: 'cars', label: 'Автомобили' },
      { key: 'services', label: 'Сервисы' },
      { key: 'offers', label: 'Предложения / акции' },
      { key: 'dealers', label: 'Дилерские центры' },
      { key: 'leads', label: 'Заявки' },
      { key: 'shop', label: 'Shop / запчасти' },
      { key: 'seo', label: 'SEO' },
    ],
    []
  );

  if (!isAuthed) {
    return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  }

  const logout = () => {
    if (!window.confirm('Выйти из админ-панели?')) return;
    setIsAuthed(false);
    notify('Вы вышли из админ-панели', 'ОК');
  };

  const activeLabel = sections.find((section) => section.key === activeSection)?.label ?? '';

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      {toast ? <Toast payload={toast} onClose={() => setToast(null)} /> : null}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-luxury-elevated p-6 space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">Админ-панель</p>
            <h1 className="text-lg font-semibold mt-2">HONGQI AUTO</h1>
          </div>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-4 py-2 border text-sm transition-all duration-300 ${
                  activeSection === section.key
                    ? 'border-luxury-burgundy bg-luxury-burgundy/10 text-white'
                    : 'border-white/10 bg-transparent text-white/60 hover:text-white'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </aside>
        <main className="p-6 lg:p-10">
          {activeSection === 'cars' && (
            <CarsSection
              title={activeLabel}
              items={data.cars}
              onChange={(items) => updateData((current) => ({ ...current, cars: items }))}
              onPersist={async (car, mode) => {
                try {
                  if (mode === 'delete') await carsApi.remove(car.id);
                  else await carsApi.upsert(car);
                } catch (error) {
                  notify(`Neon sync failed: ${(error as Error).message}`, 'ОК');
                }
              }}
              notify={notify}
              syncing={isSyncing}
            />
          )}
          {activeSection === 'offers' && (
            <OffersSection
              title={activeLabel}
              items={data.offers}
              onChange={(items) => updateData((current) => ({ ...current, offers: items }))}
              onPersist={async (item, mode) => {
                try {
                  if (mode === 'delete') await offersApi.remove(item.id);
                  else await offersApi.upsert(item);
                } catch (error) {
                  notify(`Neon sync failed: ${(error as Error).message}`, 'ОК');
                }
              }}
              notify={notify}
              syncing={isSyncing}
            />
          )}
          {activeSection === 'services' && (
            <ServicesSection
              title={activeLabel}
              items={data.services}
              onChange={(items) => updateData((current) => ({ ...current, services: items }))}
              onPersist={async (item, mode) => {
                try {
                  if (mode === 'delete') await servicesApi.remove(item.id);
                  else await servicesApi.upsert(item);
                } catch (error) {
                  notify(`Neon sync failed: ${(error as Error).message}`, 'ОК');
                }
              }}
              notify={notify}
              syncing={isSyncing}
            />
          )}
          {activeSection === 'dealers' && (
            <DealersSection
              title={activeLabel}
              items={data.dealers}
              onChange={(items) => updateData((current) => ({ ...current, dealers: items }))}
              onPersist={async (item, mode) => {
                try {
                  if (mode === 'delete') await dealersApi.remove(item.id);
                  else await dealersApi.upsert(item);
                } catch (error) {
                  notify(`Neon sync failed: ${(error as Error).message}`, 'ОК');
                }
              }}
              notify={notify}
              syncing={isSyncing}
            />
          )}
          {activeSection === 'leads' && (
            <LeadsSection
              title={activeLabel}
              items={data.leads}
              onDelete={(id) =>
                updateData((current) => ({
                  ...current,
                  leads: current.leads.filter((lead) => lead.id !== id),
                }))
              }
              onPersistDelete={async (id) => {
                try {
                  await leadsApi.remove(id);
                } catch (error) {
                  notify(`Neon sync failed: ${(error as Error).message}`, 'ОК');
                }
              }}
              notify={notify}
              syncing={isSyncing}
            />
          )}
          {activeSection === 'seo' && (
            <SeoSection
              title={activeLabel}
              items={data.seo}
              onChange={(items) => updateData((current) => ({ ...current, seo: items }))}
              onPersist={async (item, mode) => {
                try {
                  if (mode === 'delete') await seoApi.remove(item.id);
                  else await seoApi.upsert(item);
                } catch (error) {
                  notify(`Neon sync failed: ${(error as Error).message}`, 'ОК');
                }
              }}
              notify={notify}
              syncing={isSyncing}
            />
          )}
          {activeSection === 'shop' && <ShopAdminPage embedded />}
        </main>
      </div>
    </div>
  );
};

const useEntityState = <T extends { id: string }>(items: T[], createItem: () => T) => {
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [draft, setDraft] = useState<T | null>(items[0] ?? null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (!items.length) {
      if (isNew && draft) return;
      setSelectedId(null);
      setDraft(null);
      setIsNew(false);
      return;
    }
    if (selectedId) {
      const found = items.find((entry) => entry.id === selectedId);
      if (found) setDraft(found);
      return;
    }
    if (!draft) {
      setSelectedId(items[0].id);
      setDraft(items[0]);
    }
  }, [items]);

  const selectItem = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    setSelectedId(id);
    setDraft(item);
    setIsNew(false);
  };

  const createNew = () => {
    const item = createItem();
    setSelectedId(null);
    setDraft(item);
    setIsNew(true);
  };

  return { selectedId, draft, setDraft, isNew, selectItem, createNew, setIsNew, setSelectedId };
};

const CarsSection = ({
  title,
  items,
  onChange,
  onPersist,
  notify,
  syncing,
}: {
  title: string;
  items: AdminCar[];
  onChange: (items: AdminCar[]) => void;
  onPersist: (car: AdminCar, mode: 'upsert' | 'delete') => Promise<void>;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  syncing: boolean;
}) => {
  const ensureCarShape = (car: AdminCar): AdminCar => {
    return {
      ...car,
      title: car.title ?? localeField(),
      images: Array.isArray(car.images) ? car.images : [],
      image360: Array.isArray(car.image360) ? car.image360 : [],
      specifications: {
        engine: car.specifications?.engine ?? '',
        power: car.specifications?.power ?? '',
        acceleration: car.specifications?.acceleration ?? '',
        topSpeed: car.specifications?.topSpeed ?? '',
        transmission: car.specifications?.transmission ?? '',
        drivetrain: car.specifications?.drivetrain ?? '',
        fuelType: car.specifications?.fuelType ?? '',
        consumption: car.specifications?.consumption ?? '',
        seats: car.specifications?.seats ?? 5,
      },
      colors: Array.isArray(car.colors) ? car.colors : [],
      interiors: Array.isArray(car.interiors) ? car.interiors : [],
      wheels: Array.isArray(car.wheels) ? car.wheels : [],
      description: car.description ?? localeField(),
    };
  };

  const normalizedItems = useMemo(() => items.map(ensureCarShape), [items]);

  const state = useEntityState(normalizedItems, () => ({
    id: createId(),
    brand: 'Hongqi',
    makeId: 'hongqi',
    model: '',
    modelId: '',
    modelDisplay: '',
    title: localeField(),
    year: new Date().getFullYear(),
    price: 0,
  availability: 'inStock',
    mileage: 0,
    featured: false,
    images: [],
    image360: [],
    specifications: {
      engine: '',
      power: '',
      acceleration: '',
      topSpeed: '',
      transmission: '',
      drivetrain: '',
      fuelType: '',
      consumption: '',
      seats: 5,
    },
    colors: [],
    interiors: [],
    wheels: [],
    description: localeField(),
  }));

  const didNormalizeDraftOnce = useRef(false);

  useEffect(() => {
    if (didNormalizeDraftOnce.current) return;
    if (!state.draft) return;
    didNormalizeDraftOnce.current = true;
    const normalized = ensureCarShape(state.draft);
    if (JSON.stringify(normalized) !== JSON.stringify(state.draft)) {
      state.setDraft(normalized);
    }
  }, [state.draft]);

  const handleSave = () => {
    if (!state.draft) return;
    if (!window.confirm('Сохранить изменения?')) return;
    const draft = ensureCarShape(state.draft);
    const next = state.isNew
      ? [...normalizedItems, draft]
      : normalizedItems.map((item) => (item.id === draft.id ? draft : item));
    onChange(next);
    void onPersist(draft, 'upsert');
    notify(state.isNew ? 'Автомобиль добавлен' : 'Изменения сохранены', 'ОК');
    state.setIsNew(false);
    state.setSelectedId(draft.id);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить запись?')) return;
    const next = normalizedItems.filter((item) => item.id !== id);
    onChange(next);
    const deleted = normalizedItems.find((item) => item.id === id);
    if (deleted) void onPersist(deleted, 'delete');
    notify('Автомобиль удалён', 'ОК');
    state.setSelectedId(next[0]?.id ?? null);
    state.setDraft(next[0] ?? null);
    state.setIsNew(false);
  };

  const [imagesInput, setImagesInput] = useState('');
  const [image360Input, setImage360Input] = useState('');
  const [imageChecks, setImageChecks] = useState<
    Record<string, 'idle' | 'checking' | 'ok' | 'error'>
  >({});

  const isValidUrl = (value: string) => {
    if (!value.trim()) return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const splitUrls = (value: string) =>
    value
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

  const dedupeUrls = (urls: string[]) => Array.from(new Set(urls));

  const parseUrls = (value: string) => dedupeUrls(splitUrls(value));

  const validUrls = (value: string) => parseUrls(value).filter(isValidUrl);

  const invalidImages = useMemo(
    () => parseUrls(imagesInput).filter((url) => !isValidUrl(url)),
    [imagesInput]
  );

  const invalidImage360 = useMemo(
    () => parseUrls(image360Input).filter((url) => !isValidUrl(url)),
    [image360Input]
  );

  useEffect(() => {
    if (!state.draft) return;
    setImagesInput(state.draft.images.join(', '));
    setImage360Input((state.draft.image360 ?? []).join(', '));
    setImageChecks({});
  }, [state.draft?.id]);

  const checkAvailability = async (urls: string[]) => {
    if (!urls.length) return;
    setImageChecks((current) => {
      const next = { ...current };
      urls.forEach((url) => {
        next[url] = 'checking';
      });
      return next;
    });

    await Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            const timer = window.setTimeout(() => {
              img.src = '';
              setImageChecks((current) => ({
                ...current,
                [url]: 'error',
              }));
              resolve();
            }, 8000);

            img.onload = () => {
              window.clearTimeout(timer);
              setImageChecks((current) => ({
                ...current,
                [url]: 'ok',
              }));
              resolve();
            };

            img.onerror = () => {
              window.clearTimeout(timer);
              setImageChecks((current) => ({
                ...current,
                [url]: 'error',
              }));
              resolve();
            };

            img.referrerPolicy = 'no-referrer';
            img.src = url;
          })
      )
    );
  };

  const imageFallback =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#101010"/><text x="150" y="105" font-size="14" fill="#777" text-anchor="middle" font-family="Arial">no image</text></svg>'
    );

  return (
    <SectionLayout title={title} description="Полный список автомобилей с ценами и доступностью.">
      {syncing ? (
        <div className="border border-white/10 bg-luxury-elevated px-4 py-3 text-sm text-white/70">
          Синхронизация с Neon…
        </div>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <button
            onClick={state.createNew}
            className="btn-primary w-full justify-center"
          >
            <Plus size={16} />
            Добавить автомобиль
          </button>
          <EntityList
            items={items}
            selectedId={state.selectedId}
            onSelect={state.selectItem}
            getLabel={(item) => item.title.ru || 'Без названия'}
          />
        </div>
        {state.draft ? (
          <div className="bg-luxury-elevated border border-white/10 p-6 space-y-5">
            <LocaleFields
              label="Название"
              value={state.draft.title}
              onChange={(titleValue) => state.setDraft({ ...state.draft!, title: titleValue })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Бренд</p>
                <input
                  value={state.draft.brand}
                  onChange={(event) => state.setDraft({ ...state.draft!, brand: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Модель (ID)</p>
                <input
                  value={state.draft.id}
                  onChange={(event) => state.setDraft({ ...state.draft!, id: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Модель</p>
                <input
                  value={state.draft.model}
                  onChange={(event) =>
                    state.setDraft({
                      ...state.draft!,
                      model: event.target.value,
                      modelId: event.target.value.toLowerCase(),
                    })
                  }
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Отображаемое название</p>
                <input
                  value={state.draft.modelDisplay ?? ''}
                  onChange={(event) => state.setDraft({ ...state.draft!, modelDisplay: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Название на карточке</p>
                <input
                  value={state.draft.title.ru}
                  onChange={(event) =>
                    state.setDraft({
                      ...state.draft!,
                      title: { ...state.draft!.title, ru: event.target.value },
                    })
                  }
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Год</p>
                <input
                  type="number"
                  value={state.draft.year}
                  onChange={(event) => state.setDraft({ ...state.draft!, year: Number(event.target.value) })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Цена</p>
                <input
                  type="number"
                  value={state.draft.price}
                  onChange={(event) => state.setDraft({ ...state.draft!, price: Number(event.target.value) })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Пробег</p>
                <input
                  type="number"
                  value={state.draft.mileage}
                  onChange={(event) => state.setDraft({ ...state.draft!, mileage: Number(event.target.value) })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Статус</p>
                <select
                  value={state.draft.availability ?? 'inStock'}
                  onChange={(event) =>
                    state.setDraft({
                      ...state.draft!,
                      availability: event.target.value as AdminCar['availability'],
                    })
                  }
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                >
                  <option value="inStock">В наличии</option>
                  <option value="incoming">Ожидается</option>
                  <option value="preOrder">Предзаказ</option>
                </select>
              </div>
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={state.draft.featured}
                  onChange={(event) => state.setDraft({ ...state.draft!, featured: event.target.checked })}
                />
                Отображать в избранном
              </label>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Изображения (URL через запятую)</p>
              <textarea
                value={imagesInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  const nextValid = validUrls(nextValue);
                  setImagesInput(nextValue);
                  setImageChecks((current) => {
                    const next: Record<string, 'idle' | 'checking' | 'ok' | 'error'> = {};
                    nextValid.forEach((url) => {
                      if (current[url]) next[url] = current[url];
                    });
                    return next;
                  });
                  state.setDraft({
                    ...state.draft!,
                    images: nextValid,
                  });
                }}
                className={`w-full min-h-[90px] bg-luxury-surface border px-3 py-2 text-sm text-white ${
                  invalidImages.length ? 'border-luxury-burgundy/70' : 'border-white/10'
                }`}
              />
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-[11px] text-white/40">Только http/https ссылки. Превью появится ниже.</p>
                <button
                  type="button"
                  onClick={() => checkAvailability(state.draft!.images)}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/70 border border-white/20 px-3 py-1 hover:border-white/40"
                >
                  Проверить доступность
                </button>
              </div>
              {invalidImages.length ? (
                <p className="text-[11px] text-luxury-burgundy mt-2">
                  Невалидные ссылки: {invalidImages.join(', ')}
                </p>
              ) : null}
              {state.draft.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {state.draft.images.map((url) => (
                    <div key={url} className="border border-white/10 bg-luxury-surface overflow-hidden">
                      <div className="aspect-[4/3] bg-black/50">
                        <img
                          src={url}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = imageFallback;
                          }}
                        />
                      </div>
                      <div className="px-2 py-2 text-[10px] text-white/50 break-all">{url}</div>
                      {imageChecks[url] ? (
                        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                          {imageChecks[url] === 'checking'
                            ? 'Проверка…'
                            : imageChecks[url] === 'ok'
                              ? 'OK'
                              : 'Ошибка'}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Фото 360 (URL через запятую)</p>
              <textarea
                value={image360Input}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  const nextValid = validUrls(nextValue);
                  setImage360Input(nextValue);
                  setImageChecks((current) => {
                    const next: Record<string, 'idle' | 'checking' | 'ok' | 'error'> = {};
                    nextValid.forEach((url) => {
                      if (current[url]) next[url] = current[url];
                    });
                    return next;
                  });
                  state.setDraft({
                    ...state.draft!,
                    image360: nextValid,
                  });
                }}
                className={`w-full min-h-[70px] bg-luxury-surface border px-3 py-2 text-sm text-white ${
                  invalidImage360.length ? 'border-luxury-burgundy/70' : 'border-white/10'
                }`}
              />
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-[11px] text-white/40">Только http/https ссылки. Превью появится ниже.</p>
                <button
                  type="button"
                  onClick={() => checkAvailability(state.draft!.image360 ?? [])}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/70 border border-white/20 px-3 py-1 hover:border-white/40"
                >
                  Проверить доступность
                </button>
              </div>
              {invalidImage360.length ? (
                <p className="text-[11px] text-luxury-burgundy mt-2">
                  Невалидные ссылки: {invalidImage360.join(', ')}
                </p>
              ) : null}
              {(state.draft.image360 ?? []).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {(state.draft.image360 ?? []).map((url) => (
                    <div key={url} className="border border-white/10 bg-luxury-surface overflow-hidden">
                      <div className="aspect-[4/3] bg-black/50">
                        <img
                          src={url}
                          alt="360 preview"
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = imageFallback;
                          }}
                        />
                      </div>
                      <div className="px-2 py-2 text-[10px] text-white/50 break-all">{url}</div>
                      {imageChecks[url] ? (
                        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                          {imageChecks[url] === 'checking'
                            ? 'Проверка…'
                            : imageChecks[url] === 'ok'
                              ? 'OK'
                              : 'Ошибка'}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Характеристики</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Двигатель</p>
                  <input
                    value={state.draft.specifications.engine}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, engine: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Мощность</p>
                  <input
                    value={state.draft.specifications.power}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, power: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Разгон</p>
                  <input
                    value={state.draft.specifications.acceleration}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, acceleration: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Скорость</p>
                  <input
                    value={state.draft.specifications.topSpeed}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, topSpeed: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Мест</p>
                  <input
                    type="number"
                    value={state.draft.specifications.seats}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: {
                          ...state.draft!.specifications,
                          seats: event.target.value ? Number(event.target.value) : 0,
                        },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Трансмиссия</p>
                  <input
                    value={state.draft.specifications.transmission}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, transmission: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Привод</p>
                  <input
                    value={state.draft.specifications.drivetrain}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, drivetrain: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Топливо</p>
                  <input
                    value={state.draft.specifications.fuelType}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, fuelType: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">Расход</p>
                  <input
                    value={state.draft.specifications.consumption}
                    onChange={(event) =>
                      state.setDraft({
                        ...state.draft!,
                        specifications: { ...state.draft!.specifications, consumption: event.target.value },
                      })
                    }
                    className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                  />
                </div>
              </div>
            </div>
            <LocaleFields
              label="Описание"
              value={state.draft.description}
              onChange={(description) => state.setDraft({ ...state.draft!, description })}
            />
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                Сохранить
              </button>
              {!state.isNew && (
                <button
                  onClick={() => handleDelete(state.draft!.id)}
                  className="btn-outline text-white/70 border-white/20"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState text="Добавьте автомобиль." />
        )}
      </div>
    </SectionLayout>
  );
};

const OffersSection = ({
  title,
  items,
  onChange,
  onPersist,
  notify,
  syncing,
}: {
  title: string;
  items: OfferItem[];
  onChange: (items: OfferItem[]) => void;
  onPersist: (item: OfferItem, mode: 'upsert' | 'delete') => Promise<void>;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  syncing: boolean;
}) => {
  const state = useEntityState(items, () => ({
    id: createId(),
    title: localeField(),
    description: localeField(),
    badge: localeField(),
    validUntil: '',
    image: '',
  }));

  const handleSave = () => {
    if (!state.draft) return;
    if (!window.confirm('Сохранить изменения?')) return;
    const next = state.isNew
      ? [...items, state.draft]
      : items.map((item) => (item.id === state.draft?.id ? state.draft : item));
    onChange(next);
  void onPersist(state.draft, 'upsert');
    notify(state.isNew ? 'Предложение добавлено' : 'Изменения сохранены', 'ОК');
    state.setIsNew(false);
    state.setSelectedId(state.draft.id);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить запись?')) return;
    const next = items.filter((item) => item.id !== id);
    onChange(next);
  const deleted = items.find((item) => item.id === id);
  if (deleted) void onPersist(deleted, 'delete');
    notify('Предложение удалено', 'ОК');
    state.setSelectedId(next[0]?.id ?? null);
    state.setDraft(next[0] ?? null);
    state.setIsNew(false);
  };

  return (
    <SectionLayout title={title} description="Акции и специальные предложения.">
      {syncing ? (
        <div className="border border-white/10 bg-luxury-elevated px-4 py-3 text-sm text-white/70">
          Синхронизация с Neon…
        </div>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <button
            onClick={state.createNew}
            className="btn-primary w-full justify-center"
          >
            <Plus size={16} />
            Добавить предложение
          </button>
          <EntityList
            items={items}
            selectedId={state.selectedId}
            onSelect={state.selectItem}
            getLabel={(item) => item.title.ru || 'Без названия'}
          />
        </div>
        {state.draft ? (
          <div className="bg-luxury-elevated border border-white/10 p-6 space-y-5">
            <LocaleFields
              label="Название"
              value={state.draft.title}
              onChange={(titleValue) => state.setDraft({ ...state.draft!, title: titleValue })}
            />
            <LocaleFields
              label="Описание"
              value={state.draft.description}
              onChange={(description) => state.setDraft({ ...state.draft!, description })}
            />
            <LocaleFields
              label="Бейдж"
              value={state.draft.badge}
              onChange={(badge) => state.setDraft({ ...state.draft!, badge })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Дата окончания</p>
                <input
                  value={state.draft.validUntil}
                  onChange={(event) => state.setDraft({ ...state.draft!, validUntil: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Изображение (URL)</p>
                <input
                  value={state.draft.image}
                  onChange={(event) => state.setDraft({ ...state.draft!, image: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                Сохранить
              </button>
              {!state.isNew && (
                <button
                  onClick={() => handleDelete(state.draft!.id)}
                  className="btn-outline text-white/70 border-white/20"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState text="Добавьте предложение." />
        )}
      </div>
    </SectionLayout>
  );
};

const ServicesSection = ({
  title,
  items,
  onChange,
  onPersist,
  notify,
  syncing,
}: {
  title: string;
  items: ServiceItem[];
  onChange: (items: ServiceItem[]) => void;
  onPersist: (item: ServiceItem, mode: 'upsert' | 'delete') => Promise<void>;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  syncing: boolean;
}) => {
  const state = useEntityState(items, () => ({
    id: createId(),
    title: localeField(),
    description: localeField(),
    price: '',
  }));

  const handleSave = () => {
    if (!state.draft) return;
    if (!window.confirm('Сохранить изменения?')) return;
    const next = state.isNew
      ? [...items, state.draft]
      : items.map((item) => (item.id === state.draft?.id ? state.draft : item));
    onChange(next);
    void onPersist(state.draft, 'upsert');
    notify(state.isNew ? 'Услуга добавлена' : 'Изменения сохранены', 'ОК');
    state.setIsNew(false);
    state.setSelectedId(state.draft.id);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить запись?')) return;
    const next = items.filter((item) => item.id !== id);
    onChange(next);
    const deleted = items.find((item) => item.id === id);
    if (deleted) void onPersist(deleted, 'delete');
    notify('Услуга удалена', 'ОК');
    state.setSelectedId(next[0]?.id ?? null);
    state.setDraft(next[0] ?? null);
    state.setIsNew(false);
  };

  return (
    <SectionLayout title={title} description="Услуги сервиса для страницы /service.">
      {syncing ? (
        <div className="border border-white/10 bg-luxury-elevated px-4 py-3 text-sm text-white/70">
          Синхронизация с Neon…
        </div>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <button onClick={state.createNew} className="btn-primary w-full justify-center">
            <Plus size={16} />
            Добавить услугу
          </button>
          <EntityList
            items={items}
            selectedId={state.selectedId}
            onSelect={state.selectItem}
            getLabel={(item) => item.title.ru || 'Без названия'}
          />
        </div>
        {state.draft ? (
          <div className="bg-luxury-elevated border border-white/10 p-6 space-y-5">
            <LocaleFields
              label="Название"
              value={state.draft.title}
              onChange={(titleValue) => state.setDraft({ ...state.draft!, title: titleValue })}
            />
            <LocaleTextAreas
              label="Описание"
              value={state.draft.description}
              onChange={(description) => state.setDraft({ ...state.draft!, description })}
              rows={4}
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Цена (опционально)</p>
              <input
                value={state.draft.price ?? ''}
                onChange={(event) => state.setDraft({ ...state.draft!, price: event.target.value })}
                placeholder="от 45 000 ₸"
                className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                Сохранить
              </button>
              {!state.isNew && (
                <button
                  onClick={() => handleDelete(state.draft!.id)}
                  className="btn-outline text-white/70 border-white/20"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState text="Добавьте услугу." />
        )}
      </div>
    </SectionLayout>
  );
};

const DealersSection = ({
  title,
  items,
  onChange,
  onPersist,
  notify,
  syncing,
}: {
  title: string;
  items: DealerItem[];
  onChange: (items: DealerItem[]) => void;
  onPersist: (item: DealerItem, mode: 'upsert' | 'delete') => Promise<void>;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  syncing: boolean;
}) => {
  const state = useEntityState(items, () => ({
    id: createId(),
    name: localeField(),
    address: localeField(),
    phone: '',
    hours: '',
    lat: undefined,
    lng: undefined,
    services: [],
  }));

  const handleSave = () => {
    if (!state.draft) return;
    if (!window.confirm('Сохранить изменения?')) return;
    const next = state.isNew
      ? [...items, state.draft]
      : items.map((item) => (item.id === state.draft?.id ? state.draft : item));
    onChange(next);
  void onPersist(state.draft, 'upsert');
    notify(state.isNew ? 'Дилер добавлен' : 'Изменения сохранены', 'ОК');
    state.setIsNew(false);
    state.setSelectedId(state.draft.id);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить запись?')) return;
    const next = items.filter((item) => item.id !== id);
    onChange(next);
  const deleted = items.find((item) => item.id === id);
  if (deleted) void onPersist(deleted, 'delete');
    notify('Дилер удалён', 'ОК');
    state.setSelectedId(next[0]?.id ?? null);
    state.setDraft(next[0] ?? null);
    state.setIsNew(false);
  };

  return (
    <SectionLayout title={title} description="Дилерские центры и контакты.">
      {syncing ? (
        <div className="border border-white/10 bg-luxury-elevated px-4 py-3 text-sm text-white/70">
          Синхронизация с Neon…
        </div>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <button
            onClick={state.createNew}
            className="btn-primary w-full justify-center"
          >
            <Plus size={16} />
            Добавить дилера
          </button>
          <EntityList
            items={items}
            selectedId={state.selectedId}
            onSelect={state.selectItem}
            getLabel={(item) => item.name.ru || 'Без названия'}
          />
        </div>
        {state.draft ? (
          <div className="bg-luxury-elevated border border-white/10 p-6 space-y-5">
            <LocaleFields
              label="Название"
              value={state.draft.name}
              onChange={(name) => state.setDraft({ ...state.draft!, name })}
            />
            <LocaleFields
              label="Адрес"
              value={state.draft.address}
              onChange={(address) => state.setDraft({ ...state.draft!, address })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Телефон</p>
                <input
                  value={state.draft.phone}
                  onChange={(event) => state.setDraft({ ...state.draft!, phone: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Часы работы</p>
                <input
                  value={state.draft.hours}
                  onChange={(event) => state.setDraft({ ...state.draft!, hours: event.target.value })}
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Широта</p>
                <input
                  type="number"
                  value={state.draft.lat ?? ''}
                  onChange={(event) =>
                    state.setDraft({
                      ...state.draft!,
                      lat: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Долгота</p>
                <input
                  type="number"
                  value={state.draft.lng ?? ''}
                  onChange={(event) =>
                    state.setDraft({
                      ...state.draft!,
                      lng: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                  className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Услуги (через запятую)</p>
              <input
                value={state.draft.services.join(', ')}
                onChange={(event) =>
                  state.setDraft({
                    ...state.draft!,
                    services: event.target.value
                      .split(',')
                      .map((entry) => entry.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                Сохранить
              </button>
              {!state.isNew && (
                <button
                  onClick={() => handleDelete(state.draft!.id)}
                  className="btn-outline text-white/70 border-white/20"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState text="Добавьте дилерский центр." />
        )}
      </div>
    </SectionLayout>
  );
};

const SeoSection = ({
  title,
  items,
  onChange,
  onPersist,
  notify,
  syncing,
}: {
  title: string;
  items: SeoItem[];
  onChange: (items: SeoItem[]) => void;
  onPersist: (item: SeoItem, mode: 'upsert' | 'delete') => Promise<void>;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  syncing: boolean;
}) => {
  const ensureSeoShape = (item: SeoItem): SeoItem => ({
    ...item,
    slug: item.slug ?? '',
    title: item.title ?? localeField(),
    description: item.description ?? localeField(),
    keywords: item.keywords ?? localeField(),
    image: item.image ?? '',
    favicon: item.favicon ?? '',
  });

  const normalizedItems = useMemo(() => items.map(ensureSeoShape), [items]);

  const state = useEntityState(normalizedItems, () => ({
    id: createId(),
    slug: '/',
    title: localeField(),
    description: localeField(),
    keywords: localeField(),
    image: '',
    favicon: '',
  }));

  const isValidUrl = (value: string) => {
    if (!value.trim()) return true;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!state.draft) return;
    if (!isValidUrl(state.draft.image ?? '')) {
      notify('Укажите корректный URL изображения (http/https)', 'ОК');
      return;
    }
    if (!isValidUrl(state.draft.favicon ?? '')) {
      notify('Укажите корректный URL favicon (http/https)', 'ОК');
      return;
    }
    if (!window.confirm('Сохранить изменения?')) return;
    const draft = ensureSeoShape(state.draft);
    const next = state.isNew
      ? [...normalizedItems, draft]
      : normalizedItems.map((item) => (item.id === draft.id ? draft : item));
    onChange(next);
    void onPersist(draft, 'upsert');
    notify(state.isNew ? 'SEO запись добавлена' : 'Изменения сохранены', 'ОК');
    state.setIsNew(false);
    state.setSelectedId(draft.id);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить запись?')) return;
    const next = normalizedItems.filter((item) => item.id !== id);
    onChange(next);
    const deleted = normalizedItems.find((item) => item.id === id);
    if (deleted) void onPersist(deleted, 'delete');
    notify('SEO запись удалена', 'ОК');
    state.setSelectedId(next[0]?.id ?? null);
    state.setDraft(next[0] ?? null);
    state.setIsNew(false);
  };

  return (
    <SectionLayout
      title={title}
      description="Поиск по ключевым словам и meta-теги. Используйте slug страницы (например, /catalog, /offers, /car/* или * для общего)."
    >
      {syncing ? (
        <div className="border border-white/10 bg-luxury-elevated px-4 py-3 text-sm text-white/70">
          Синхронизация с Neon…
        </div>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <button onClick={state.createNew} className="btn-primary w-full justify-center">
            <Plus size={16} />
            Добавить SEO
          </button>
          <EntityList
            items={normalizedItems}
            selectedId={state.selectedId}
            onSelect={state.selectItem}
            getLabel={(item) => item.slug || item.title.ru || 'Без названия'}
          />
        </div>
        {state.draft ? (
          <div className="bg-luxury-elevated border border-white/10 p-6 space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Slug / путь страницы</p>
              <input
                value={state.draft.slug}
                onChange={(event) => state.setDraft({ ...state.draft!, slug: event.target.value })}
                placeholder="/catalog"
                className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
              />
            </div>
            <LocaleFields
              label="Title"
              value={state.draft.title}
              onChange={(titleValue) => state.setDraft({ ...state.draft!, title: titleValue })}
            />
            <LocaleTextAreas
              label="Description"
              value={state.draft.description}
              onChange={(description) => state.setDraft({ ...state.draft!, description })}
              rows={3}
            />
            <LocaleTextAreas
              label="Keywords (через запятую)"
              value={state.draft.keywords}
              onChange={(keywords) => state.setDraft({ ...state.draft!, keywords })}
              rows={2}
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">
                Изображение для превью в социальных сетях (OG/Twitter URL)
              </p>
              <input
                value={state.draft.image ?? ''}
                onChange={(event) => state.setDraft({ ...state.draft!, image: event.target.value })}
                placeholder="https://example.com/preview.jpg"
                className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
              />
              {!isValidUrl(state.draft.image ?? '') && (
                <p className="mt-2 text-xs text-red-300">Введите корректный URL (http/https).</p>
              )}
              {isValidUrl(state.draft.image ?? '') && state.draft.image?.trim() ? (
                <div className="mt-4 border border-white/10 bg-luxury-surface p-3">
                  <img
                    src={state.draft.image}
                    alt="SEO preview"
                    className="w-full max-w-[480px] aspect-[1.91/1] object-cover"
                  />
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">
                Иконка вкладки (favicon URL)
              </p>
              <input
                value={state.draft.favicon ?? ''}
                onChange={(event) => state.setDraft({ ...state.draft!, favicon: event.target.value })}
                placeholder="https://example.com/favicon.png"
                className="w-full h-11 bg-luxury-surface border border-white/10 px-3 text-sm text-white"
              />
              {!isValidUrl(state.draft.favicon ?? '') && (
                <p className="mt-2 text-xs text-red-300">Введите корректный URL (http/https).</p>
              )}
              {isValidUrl(state.draft.favicon ?? '') && state.draft.favicon?.trim() ? (
                <div className="mt-4 border border-white/10 bg-luxury-surface p-3 inline-flex items-center gap-3">
                  <img
                    src={state.draft.favicon}
                    alt="Favicon preview"
                    className="w-10 h-10 object-contain bg-black/40"
                  />
                  <span className="text-xs text-white/60">Превью иконки</span>
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                Сохранить
              </button>
              {!state.isNew && (
                <button
                  onClick={() => handleDelete(state.draft!.id)}
                  className="btn-outline text-white/70 border-white/20"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState text="Добавьте SEO запись." />
        )}
      </div>
    </SectionLayout>
  );
};

const LeadsSection = ({
  title,
  items,
  onDelete,
  onPersistDelete,
  notify,
  syncing,
}: {
  title: string;
  items: LeadItem[];
  onDelete: (id: string) => void;
  onPersistDelete: (id: string) => Promise<void>;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  syncing: boolean;
}) => (
  <SectionLayout title={title} description="Все заявки с форм сайта.">
    {syncing ? (
      <div className="border border-white/10 bg-luxury-elevated px-4 py-3 text-sm text-white/70">
        Синхронизация с Neon…
      </div>
    ) : null}
    {items.length === 0 ? (
      <EmptyState text="Пока нет заявок." />
    ) : (
      <div className="space-y-4">
        {items.map((lead) => (
          <div
            key={lead.id}
            className="bg-luxury-elevated border border-white/10 p-5 flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white">{lead.name}</p>
                <p className="text-xs text-white/50">{lead.phone}</p>
              </div>
              <div className="text-xs text-white/50">{new Date(lead.createdAt).toLocaleString('ru-RU')}</div>
            </div>
            <div className="text-xs text-white/60">
              <p>Тип: {lead.type}</p>
              {lead.car && <p>Авто: {lead.car}</p>}
              {lead.service && <p>Услуга: {lead.service}</p>}
              {lead.dealer && <p>Дилер: {lead.dealer}</p>}
              {lead.comment && <p>Комментарий: {lead.comment}</p>}
            </div>
            <button
              onClick={() => {
                if (!window.confirm('Удалить запись?')) return;
                onDelete(lead.id);
                void onPersistDelete(lead.id);
                notify('Заявка удалена', 'ОК');
              }}
              className="self-start text-xs text-white/50 hover:text-white"
            >
              Удалить заявку
            </button>
          </div>
        ))}
      </div>
    )}
  </SectionLayout>
);

export default AdminApp;
