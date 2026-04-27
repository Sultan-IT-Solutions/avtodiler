import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  Filter,
  GitMerge,
  HeadphonesIcon,
  LayoutGrid,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SITE_IMAGES } from '../data/siteImages';
import { useShop } from '../context/ShopContext';
import type { CategoryItem, OrderItem, ProductItem, SeoPage } from '../types/shop';
import { localizedText } from '../utils/localizedText';
import { isValidPhone } from '../utils/phone';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=760&q=80';
const CTA_IMAGE = 'https://media.base44.com/images/public/69ca1a642818c75fadda2000/cb39385ca_HONGQIHS3png.jpg';
const displayFont = 'parts-serif';

const formatPrice = (value: number) => `${new Intl.NumberFormat('en-US').format(value)} ₸`;

const useShopSeo = (path: string, fallback?: SeoPage['h1']) => {
  const { state } = useShop();
  const { i18n } = useTranslation();
  const page = state.seoPages.find((item) => item.slug === path);

  useEffect(() => {
    const titleText = page?.title ?? fallback;
    const descriptionText = page?.description;

    if (titleText) {
      document.title = localizedText(titleText, { lng: i18n.language, fallbackLng: 'ru' });
    }

    if (descriptionText) {
      const meta =
        document.querySelector('meta[name="description"]') ?? document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute(
        'content',
        localizedText(descriptionText, { lng: i18n.language, fallbackLng: 'ru' })
      );
      if (!meta.parentElement) document.head.appendChild(meta);
    }
  }, [fallback, i18n.language, page]);

  return page;
};

const categoryIcons: Record<string, typeof Settings> = {
  engine: Settings,
  transmission: GitMerge,
  suspension: Wrench,
  brakes: CircleDot,
  body: Car,
  electronics: Zap,
  interior: LayoutGrid,
  consumables: Filter,
  optics: Lightbulb,
};

const fallbackImages = [HERO_IMAGE, SITE_IMAGES.secondary, SITE_IMAGES.cta];

const SmartImage = ({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) => {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const sources = useMemo(
    () => [src, ...fallbackImages].filter((item): item is string => Boolean(item)),
    [src]
  );

  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [src]);

  if (!sources.length || failed) {
    return (
      <div className={`flex items-center justify-center bg-[#f8f8f8] ${className ?? ''}`.trim()}>
        <span className={`${displayFont} text-5xl font-semibold text-black/10`}>H</span>
      </div>
    );
  }

  return (
    <img
      src={sources[Math.min(index, sources.length - 1)]}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        setIndex((current) => {
          const next = current + 1;
          if (next >= sources.length) {
            setFailed(true);
            return current;
          }
          return next;
        });
      }}
    />
  );
};

const DarkGrid = () => (
  <div className="pointer-events-none absolute inset-0">
    <svg className="h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="parts-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#parts-grid)" />
    </svg>
  </div>
);

const ProductCard = ({ product, index = 0 }: { product: ProductItem; index?: number }) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useShop();
  const name = localizedText(product.name, { lng: i18n.language });
  const inStock = product.stock > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.34, delay: index * 0.035 }}
      className="group h-full"
    >
      <Link
        to={`/hongqi-parts/${product.slug}`}
        className="group block h-full overflow-hidden rounded-2xl border border-black/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-50 to-white">
          <SmartImage
            src={product.images[0]}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {product.popular ? (
              <span className="rounded-md bg-[#e7282d] px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                -12%
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-black shadow-sm backdrop-blur-sm">
              <BadgeCheck className="h-3 w-3 text-[#e7282d]" />
              OEM
            </span>
          </div>
          {!inStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
              <span className="rounded-xl border border-black/8 bg-white px-4 py-2 text-xs font-semibold text-black/55 shadow-sm">
                {t('shop.stock.outOfStock')}
              </span>
            </div>
          ) : null}
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-black/35">
            {product.article} · {product.models[0] ?? 'Hongqi'}
          </p>
          <h3 className="min-h-[2.5rem] text-sm font-medium leading-snug text-black transition-colors duration-200 group-hover:text-[#e7282d]">
            {name}
          </h3>
          <div className="mt-4 flex items-end justify-between gap-2">
            <p className="text-base font-semibold leading-none text-black">{formatPrice(product.price)}</p>
            {inStock ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  addToCart(product.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f6f6f6] px-3 py-2 text-xs font-medium text-black transition-all hover:bg-black hover:text-white hover:shadow-md"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {t('shop.actions.addToCart')}
              </button>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

const CategorySidebar = ({
  categories,
  activeCategory,
  activeSubcategory,
  model,
  setModel,
  setCategorySlug,
  setSubcategorySlug,
}: {
  categories: CategoryItem[];
  activeCategory?: CategoryItem;
  activeSubcategory?: CategoryItem['subcategories'][number];
  model: string;
  setModel: (value: string) => void;
  setCategorySlug: (value: string) => void;
  setSubcategorySlug: (value: string) => void;
}) => {
  const { state } = useShop();
  const { t, i18n } = useTranslation();

  return (
    <aside className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/45">
        Категория
      </p>
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => {
            setCategorySlug('');
            setSubcategorySlug('');
          }}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
            !activeCategory ? 'bg-[#111] text-white' : 'text-black/45 hover:bg-[#f6f6f6] hover:text-black'
          }`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0 opacity-70" />
          <span className="flex-1 font-medium">Все категории</span>
        </button>
        {categories.map((category) => {
          const Icon = categoryIcons[category.slug] ?? LayoutGrid;
          const active = activeCategory?.id === category.id;
          return (
            <div key={category.id}>
              <button
                type="button"
                onClick={() => {
                  setCategorySlug(category.slug);
                  setSubcategorySlug('');
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  active && !activeSubcategory
                    ? 'bg-[#111] text-white'
                    : 'text-black/45 hover:bg-[#f6f6f6] hover:text-black'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1 font-medium">
                  {localizedText(category.name, { lng: i18n.language })}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-30" />
              </button>
              {active ? (
                <div className="mb-1 ml-4 mt-0.5 border-l-2 border-black/10 pl-3">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      onClick={() => {
                        setCategorySlug(category.slug);
                        setSubcategorySlug(
                          activeSubcategory?.id === subcategory.id ? '' : subcategory.slug
                        );
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-all ${
                        activeSubcategory?.id === subcategory.id
                          ? 'bg-[#e7282d]/10 text-[#e7282d]'
                          : 'text-black/45 hover:bg-[#f6f6f6] hover:text-black'
                      }`}
                    >
                      {localizedText(subcategory.name, { lng: i18n.language })}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/45">
          Модель авто
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModel('')}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              !model
                ? 'border-[#111] bg-[#111] text-white'
                : 'border-black/10 bg-white text-black/45 hover:border-black/30 hover:text-black'
            }`}
          >
            {t('shop.catalog.allModels')}
          </button>
          {state.models.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setModel(item.code)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                model === item.code
                  ? 'border-[#111] bg-[#111] text-white'
                  : 'border-black/10 bg-white text-black/45 hover:border-black/30 hover:text-black'
              }`}
            >
              {item.code}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

const CatalogBlock = ({
  title = 'Каталог запчастей',
  showTopPadding = true,
}: {
  title?: string;
  showTopPadding?: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const { state } = useShop();
  const location = useLocation();
  const { categorySlug: routeCategorySlug, subcategorySlug: routeSubcategorySlug } = useParams();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [model, setModel] = useState(params.get('model') ?? '');
  const [sort, setSort] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(routeCategorySlug ?? '');
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState(routeSubcategorySlug ?? '');
  const deferredQuery = useDeferredValue(query);
  const category = state.categories.find((item) => item.slug === selectedCategorySlug);
  const subcategory = category?.subcategories.find((item) => item.slug === selectedSubcategorySlug);

  useEffect(() => {
    setQuery(params.get('q') ?? '');
    setModel(params.get('model') ?? '');
  }, [params]);

  useEffect(() => {
    setSelectedCategorySlug(routeCategorySlug ?? '');
    setSelectedSubcategorySlug(routeSubcategorySlug ?? '');
  }, [routeCategorySlug, routeSubcategorySlug]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const items = state.products.filter((product) => {
      const queryMatch =
        !q ||
        localizedText(product.name, { lng: i18n.language }).toLowerCase().includes(q) ||
        product.article.toLowerCase().includes(q) ||
        product.oem.toLowerCase().includes(q);
      const modelMatch = !model || product.models.includes(model);
      const categoryMatch = !selectedCategorySlug || product.categorySlug === selectedCategorySlug;
      const subcategoryMatch =
        !selectedSubcategorySlug || product.subcategorySlug === selectedSubcategorySlug;
      return queryMatch && modelMatch && categoryMatch && subcategoryMatch;
    });

    if (sort === 'priceAsc') items.sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') items.sort((a, b) => b.price - a.price);
    if (sort === 'default') items.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
    return items;
  }, [
    deferredQuery,
    i18n.language,
    model,
    selectedCategorySlug,
    selectedSubcategorySlug,
    sort,
    state.products,
  ]);

  const pageTitle = subcategory
    ? localizedText(subcategory.name, { lng: i18n.language })
    : category
      ? localizedText(category.name, { lng: i18n.language })
      : title;

  return (
    <section
      id="catalog"
      className={`bg-white text-black ${showTopPadding ? 'py-16' : 'pb-16'}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`${displayFont} text-2xl font-semibold leading-tight md:text-3xl`}>
              {pageTitle}
            </h2>
            <p className="mt-0.5 text-sm text-black/45">
              {t('shop.catalog.found', { count: filtered.length }).replace('Найдено: ', '')} товаров
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Артикул или название..."
                className="w-56 rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-8 text-sm text-black outline-none transition-all placeholder:text-black/35 focus:border-[#e7282d]/40 focus:ring-2 focus:ring-[#e7282d]/20 sm:w-72"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <div className="relative hidden sm:block">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as 'default' | 'priceAsc' | 'priceDesc')}
                className="appearance-none rounded-xl border border-black/10 bg-white py-2.5 pl-3 pr-8 text-sm text-black/45 outline-none transition-all focus:border-[#e7282d]/40 focus:ring-2 focus:ring-[#e7282d]/20"
              >
                <option value="default">По умолчанию</option>
                <option value="priceAsc">{t('shop.catalog.sortPriceAsc')}</option>
                <option value="priceDesc">{t('shop.catalog.sortPriceDesc')}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40" />
            </div>
            <button
              type="button"
              onClick={() => setMobileFilters((value) => !value)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-black/55 transition-colors hover:bg-[#f6f6f6] lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Фильтры
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileFilters ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden lg:hidden"
            >
              <CategorySidebar
                categories={state.categories}
                activeCategory={category}
                activeSubcategory={subcategory}
                model={model}
                setModel={setModel}
                setCategorySlug={setSelectedCategorySlug}
                setSubcategorySlug={setSelectedSubcategorySlug}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">
              <CategorySidebar
                categories={state.categories}
                activeCategory={category}
                activeSubcategory={subcategory}
                model={model}
                setModel={setModel}
                setCategorySlug={setSelectedCategorySlug}
                setSubcategorySlug={setSelectedSubcategorySlug}
              />
            </div>
          </aside>
          <div className="min-w-0 flex-1">
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                {filtered.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/6 bg-white p-12 text-center">
                <Search className="mx-auto h-8 w-8 text-black/20" />
                <h3 className="mt-5 text-xl font-semibold">
                  {state.products.length ? 'Ничего не найдено' : 'Каталог пока пуст'}
                </h3>
                <p className="mt-2 text-sm text-black/45">
                  {state.products.length
                    ? 'Попробуйте изменить параметры поиска.'
                    : 'Товары и категории появятся здесь после добавления через админ-панель.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const RequestForm = ({ dark = true }: { dark?: boolean }) => {
  const { t } = useTranslation();
  const { submitPartRequest } = useShop();
  const [form, setForm] = useState({ name: '', phone: '', vin: '', comment: '' });
  const [sent, setSent] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = phoneTouched && !isValidPhone(form.phone);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhoneTouched(true);
    if (!isValidPhone(form.phone)) return;
    submitPartRequest(form);
    setSent(true);
    setForm({ name: '', phone: '', vin: '', comment: '' });
    setPhoneTouched(false);
  };

  const fieldClass = dark
    ? 'border-white/10 bg-white/[0.06] text-white placeholder:text-white/20 focus:border-[#e7282d]/60'
    : 'border-black/8 bg-white text-black placeholder:text-black/25 focus:border-[#e7282d]/60';

  if (sent) {
    return (
      <div className={`rounded-2xl border p-8 text-center ${dark ? 'border-white/10 bg-white/[0.04] text-white' : 'border-black/10 bg-white text-black'}`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#e7282d]/30">
          <CheckCircle2 className="h-7 w-7 text-[#e7282d]" />
        </div>
        <p className={`${displayFont} mb-2 text-xl font-semibold`}>Заявка отправлена!</p>
        <p className="text-sm opacity-55">Мы свяжемся с вами в течение 15 минут.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border p-8 ${dark ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`}
    >
      <p className={`mb-6 text-sm font-semibold ${dark ? 'text-white' : 'text-black'}`}>Форма обратной связи</p>
      <div className="space-y-4">
        {[
          { key: 'name', label: 'Ваше имя', placeholder: 'Иванов Иван', required: true },
          { key: 'phone', label: 'Телефон', placeholder: '+7 700 000 00 00', required: true },
          { key: 'vin', label: 'VIN-номер (необязательно)', placeholder: 'LSGKB52E3EA...' },
        ].map((field) => (
          <label key={field.key} className="block">
            <span className={`mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] ${dark ? 'text-white/35' : 'text-black/40'}`}>
              {field.label}
            </span>
            <input
              required={field.required}
              value={form[field.key as keyof typeof form]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [field.key]: event.target.value }))
              }
              onBlur={() => {
                if (field.key === 'phone') setPhoneTouched(true);
              }}
              placeholder={field.placeholder}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${fieldClass}`}
            />
          </label>
        ))}
        {phoneError ? <p className="text-sm text-[#e7282d]">{t('shop.forms.phoneError')}</p> : null}
        <label className="block">
          <span className={`mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] ${dark ? 'text-white/35' : 'text-black/40'}`}>
            Комментарий
          </span>
          <textarea
            value={form.comment}
            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            placeholder="Опишите нужную запчасть..."
            rows={3}
            className={`w-full resize-none rounded-xl border px-4 py-4 text-sm outline-none transition ${fieldClass}`}
          />
        </label>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-[#e7282d] py-3.5 text-sm font-medium text-white transition-all hover:bg-[#e7282d]/90 hover:shadow-lg hover:shadow-[#e7282d]/30"
        >
          {t('shop.actions.sendRequest')}
        </button>
      </div>
    </form>
  );
};

export const ShopHomePage = () => {
  useShopSeo('/hongqi-parts', {
    ru: 'Запчасти Hongqi в Казахстане',
    en: 'Hongqi parts in Kazakhstan',
    kz: 'Kazakhstan Hongqi bolshekteri',
  });

  const advantages = [
    { icon: BadgeCheck, title: '100% оригинал', text: 'Прямые поставки с завода FAW - Hongqi. Каждая деталь имеет серийный номер и сертификат.' },
    { icon: ShieldCheck, title: 'Гарантия 12 мес.', text: 'На все запчасти предоставляется гарантия производителя сроком 12 месяцев.' },
    { icon: Truck, title: 'Доставка по РК', text: 'Быстрая доставка во все города Казахстана. Алматы - в день заказа.' },
    { icon: HeadphonesIcon, title: 'Сервис 24/7', text: 'Наши специалисты готовы помочь с подбором запчастей для любой модели Hongqi.' },
    { icon: Clock, title: 'Экспресс-заказ', text: 'Оформите заявку онлайн - мы перезвоним в течение 15 минут и подтвердим наличие.' },
    { icon: Wrench, title: 'Установка', text: 'Собственный сервисный центр с сертифицированными мастерами Hongqi в Алматы.' },
  ];
  const steps = [
    ['01', 'Выберите запчасть', 'Найдите нужную деталь в каталоге по модели или категории. Или опишите - мы подберем сами.'],
    ['02', 'Оформите заказ', 'Добавьте в корзину и оставьте заявку. Укажите имя и телефон - больше ничего не нужно.'],
    ['03', 'Подтверждение', 'Менеджер свяжется с вами в течение 15 минут, подтвердит наличие и стоимость доставки.'],
    ['04', 'Доставка', 'Доставим курьером по Алматы или отправим транспортной компанией в любой город РК.'],
  ];
  const faqs = [
    {
      q: 'Как убедиться, что запчасть подойдёт моему Hongqi?',
      a: 'Укажите VIN-номер автомобиля при оформлении заказа или при звонке менеджеру. Мы проверим совместимость по официальной базе данных Hongqi.',
    },
    {
      q: 'Каков срок доставки в регионы Казахстана?',
      a: 'По Алматы - в день заказа или на следующий. В другие города: Астана, Шымкент, Актобе - 2-3 дня. В отдалённые регионы - до 5 рабочих дней.',
    },
    {
      q: 'Можно ли вернуть запчасть если она не подошла?',
      a: 'Да, в течение 14 дней с момента получения. Запчасть должна быть в оригинальной упаковке и без следов установки.',
    },
    {
      q: 'Есть ли у вас запчасти для электромобилей Hongqi E-HS9 и E-QM5?',
      a: 'Да, у нас представлены оригинальные запчасти для всех электрических моделей Hongqi, включая высоковольтные компоненты и системы управления батареей.',
    },
    {
      q: 'Как оплатить заказ?',
      a: 'Принимаем оплату наличными, банковскими картами Kaspi, Visa, Mastercard и банковским переводом для юридических лиц.',
    },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="parts-scope bg-[#050505] text-white">
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-red-900/20 blur-3xl" />
          <div className="absolute right-1/4 top-20 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="parts-hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#parts-hero-grid)" />
          </svg>
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-0">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#e7282d]" />
                <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                  Официальный дилер · Алматы
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`${displayFont} text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl`}
              >
                Запчасти
                <br />
                <span className="text-[#e7282d]">Hongqi</span>
                <br />
                <span className="text-white/20">в Казахстане</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-8 max-w-md text-base leading-relaxed text-white/40"
              >
                Оригинальные запасные части для H5, H9, HS5, HS7, E-HS9 и всех моделей Hongqi. Прямые поставки с завода.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-10 flex flex-wrap gap-3"
              >
                <a
                  href="#catalog"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[#e7282d] px-8 py-4 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#e7282d]/90 hover:shadow-lg hover:shadow-[#e7282d]/30"
                >
                  Перейти в каталог
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="tel:+77001234567"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-4 text-sm font-medium text-white/70 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
                >
                  Позвонить
                </a>
              </motion.div>
            </div>

            <div className="relative hidden h-[480px] lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="absolute right-0 top-8 h-[300px] w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              >
                <img src={HERO_IMAGE} alt="Hongqi Parts" className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 text-white">
                  <p className="text-xs uppercase tracking-wider text-white/70">Каталог 2026</p>
                  <p className={`${displayFont} text-lg font-semibold`}>Оригинальные запчасти</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="absolute bottom-20 left-0 w-52 rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl"
              >
                <p className={`${displayFont} text-3xl font-semibold text-white`}>500+</p>
                <p className="mt-1 text-sm text-white/40">позиций в наличии</p>
                <div className="mt-3 flex gap-1">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <div key={item} className={`h-0.5 flex-1 rounded-full ${item < 4 ? 'bg-[#e7282d]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="absolute left-8 top-0 w-44 rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#e7282d]" />
                  <span className="text-xs font-medium text-white/70">Гарантия</span>
                </div>
                <p className={`${displayFont} text-2xl font-semibold text-white`}>12 мес.</p>
                <p className="text-xs text-white/30">на все запчасти</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10, x: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="absolute bottom-8 right-4 rounded-2xl bg-[#e7282d] px-5 py-4 text-white shadow-lg shadow-[#e7282d]/30"
              >
                <p className="text-xs opacity-80">Доставка</p>
                <p className={`${displayFont} text-lg font-semibold`}>2–5 дней</p>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs uppercase tracking-widest">Каталог</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </section>

      <CatalogBlock showTopPadding />

      <section className="bg-[#0a0a0a] py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/40">Почему мы</p>
              <h2 className={`${displayFont} text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl`}>
                Официальный дилер
                <br />
                <span className="text-[#e7282d]">Hongqi</span> в Казахстане
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/40">
              Более 8 лет на рынке. Свыше 10 000 довольных клиентов по всему Казахстану.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="group bg-[#0a0a0a] p-8 transition-colors hover:bg-white/[0.03]"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 transition-colors group-hover:border-[#e7282d]/50">
                  <item.icon className="h-5 w-5 text-[#e7282d]" />
                </div>
                <h3 className="mb-2 font-medium text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{item.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-px grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4">
            {[
              ['500+', 'Позиций в наличии'],
              ['8', 'Лет на рынке'],
              ['10 000+', 'Клиентов'],
              ['12 мес.', 'Гарантия'],
            ].map(([num, label]) => (
              <div key={label} className="bg-[#0a0a0a] px-8 py-8">
                <p className={`${displayFont} text-3xl font-semibold text-[#e7282d]`}>{num}</p>
                <p className="mt-1 text-xs tracking-wide text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 text-black lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/45">Процесс</p>
            <h2 className={`${displayFont} mb-6 text-3xl font-semibold leading-tight md:text-4xl`}>Как сделать заказ</h2>
            <p className="mb-10 max-w-md leading-relaxed text-black/45">
              Весь процесс занимает не более 5 минут. От выбора до подтверждения - быстро и удобно.
            </p>
            <a
              href="#catalog"
              className="group inline-flex items-center gap-2 rounded-xl bg-black px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-black/90 hover:shadow-lg hover:shadow-black/10"
            >
              Перейти в каталог
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          <div className="divide-y divide-black/10">
            {steps.map(([number, stepTitle, text], index) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-6 py-6"
              >
                <span className={`${displayFont} mt-1 w-10 shrink-0 text-4xl font-semibold leading-none text-black/10`}>
                  {number}
                </span>
                <div>
                  <h3 className="mb-1 font-medium">{stepTitle}</h3>
                  <p className="text-sm leading-relaxed text-black/45">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0d0d0d] py-24 text-white lg:py-32">
        <img src={CTA_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent" />
        <DarkGrid />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-white/40">Оригинальные запчасти</p>
            <h2 className={`${displayFont} mb-8 text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl`}>
              Не знаете
              <br />
              нужную деталь?
            </h2>
            <p className="mb-10 max-w-md text-base leading-relaxed text-white/50">
              Оставьте заявку - наш специалист бесплатно подберёт подходящую запчасть по VIN-номеру вашего Hongqi.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+77001234567" className="inline-flex items-center gap-2.5 rounded-xl bg-[#e7282d] px-8 py-4 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#e7282d]/90 hover:shadow-lg hover:shadow-[#e7282d]/30">
                <Phone className="h-4 w-4" />
                Позвонить сейчас
              </a>
              <a href="#request" className="inline-flex items-center rounded-xl border border-white/20 px-8 py-4 text-sm font-medium text-white transition-all hover:border-white/50 hover:bg-white/5">
                Оставить заявку
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-24 text-black lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/45">FAQ</p>
            <h2 className={`${displayFont} mb-4 text-3xl font-semibold leading-tight md:text-4xl`}>Частые вопросы</h2>
            <p className="text-sm leading-relaxed text-black/45">
              Не нашли ответ? Свяжитесь с нами - мы ответим в течение нескольких минут.
            </p>
            <a href="tel:+77001234567" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#e7282d] hover:underline">
              <Phone className="h-4 w-4" />
              +7 700 123 45 67
            </a>
          </div>
          <div className="divide-y divide-black/10 lg:col-span-2">
            {faqs.map((faq, index) => (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="group flex w-full items-start justify-between gap-4 py-5 text-left"
                >
                  <span className={`pr-4 text-sm font-medium transition-colors group-hover:text-[#e7282d] ${index === 3 ? 'text-[#e7282d]' : 'text-black'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-black/45 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-8 text-sm leading-relaxed text-black/45">{faq.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section id="request" className="bg-[#0a0a0a] py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/40">Связаться с нами</p>
            <h2 className={`${displayFont} mb-6 text-3xl font-semibold leading-tight md:text-4xl`}>
              Оставьте заявку -
              <br />
              мы все найдем
            </h2>
            <p className="mb-12 text-sm leading-relaxed text-white/40">
              Если нужной запчасти нет в каталоге - не беда. Оставьте заявку с VIN-номером, и мы закажем деталь напрямую с завода.
            </p>
            <div className="space-y-6">
              {[
                { icon: Phone, label: 'Телефон', value: '+7 700 123 45 67' },
                { icon: Mail, label: 'Email', value: 'parts@hongqi-almaty.kz' },
                { icon: MapPin, label: 'Адрес', value: 'г. Алматы, ул. Тимирязева 42' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10">
                    <item.icon className="h-4 w-4 text-[#e7282d]" />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-widest text-white/30">
                      {item.label}
                    </span>
                    <span className="block text-sm text-white/80">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <RequestForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export const ShopCatalogPage = () => {
  const { t } = useTranslation();
  useShopSeo('/hongqi-parts/catalog', {
    ru: t('shop.catalog.title'),
    en: t('shop.catalog.title'),
    kz: t('shop.catalog.title'),
  });

  return (
    <div className="bg-white pt-32">
      <CatalogBlock showTopPadding={false} />
    </div>
  );
};

export const ShopProductPage = () => {
  const { t, i18n } = useTranslation();
  const { state, addToCart, submitPartRequest } = useShop();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', phone: '', comment: '' });
  const [requestSent, setRequestSent] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const product = state.products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-36 text-center text-black">
        <p>{t('shop.product.notFound')}</p>
        <Link to="/hongqi-parts/catalog" className="mt-6 inline-block text-[#e7282d]">
          {t('shop.actions.goCatalog')}
        </Link>
      </div>
    );
  }

  const productName = localizedText(product.name, { lng: i18n.language });
  const category = state.categories.find((item) => item.slug === product.categorySlug);
  const categoryName = category ? localizedText(category.name, { lng: i18n.language }) : product.categorySlug;
  const description = localizedText(product.description, { lng: i18n.language });
  const total = product.price * quantity;
  const inStock = product.stock > 0;
  const requestPhoneError = phoneTouched && !isValidPhone(requestForm.phone);
  const related = state.products
    .filter((item) => item.id !== product.id && item.categorySlug === product.categorySlug)
    .slice(0, 4);
  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const handleProductRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhoneTouched(true);
    if (!isValidPhone(requestForm.phone)) return;
    submitPartRequest({
      name: requestForm.name,
      phone: requestForm.phone,
      vin: '',
      comment: `Запрос по товару: ${productName} (${product.article}). ${requestForm.comment}`.trim(),
    });
    setRequestSent(true);
    setRequestForm({ name: '', phone: '', comment: '' });
    setPhoneTouched(false);
  };

  return (
    <div className="parts-scope bg-[#fbfbfb] pt-32 text-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-black/45 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад в каталог
        </button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="aspect-square bg-[#f6f6f6]">
              <SmartImage src={product.images[0]} alt={productName} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="py-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e7282d]/10 px-3 py-1 text-xs font-medium text-[#e7282d]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Оригинальная запчасть
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${inStock ? 'bg-green-50 text-green-700' : 'bg-[#f1f1f1] text-black/45'}`}>
                {inStock ? t('shop.stock.inStock') : t('shop.stock.outOfStock')}
              </span>
            </div>
            <p className="mb-2 text-xs tracking-wider text-black/45">
              Артикул: {product.article} · Модель: {product.models.join(', ')} · {categoryName}
            </p>
            <h1 className={`${displayFont} mb-6 text-2xl font-semibold leading-tight md:text-3xl`}>
              {productName}
            </h1>

            <div className="mb-6 rounded-xl border border-black/10 bg-white p-6">
              <div className="mb-6 flex items-end gap-3">
                <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
              </div>
              <div className="mb-6 flex items-center gap-4">
                <span className="text-sm text-black/45">Количество:</span>
                <div className="flex items-center overflow-hidden rounded-lg border border-black/10">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="p-2 transition-colors hover:bg-[#f6f6f6]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-12 px-4 py-2 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="p-2 transition-colors hover:bg-[#f6f6f6]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-medium transition-all disabled:opacity-50 ${
                  added ? 'bg-green-600 text-white' : 'bg-[#111] text-white hover:bg-[#222]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Добавлено в корзину
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    В корзину · {formatPrice(total)}
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <a
                href="#product-request"
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#e7282d] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#e7282d]/90 hover:shadow-lg hover:shadow-[#e7282d]/25"
              >
                <ShoppingBag className="h-4 w-4" />
                Быстрый заказ
              </a>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all disabled:opacity-50 ${
                  added
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-black/10 bg-white hover:border-black/30 hover:bg-[#f6f6f6]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    В корзине
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    В корзину
                  </>
                )}
              </button>
              <a
                href={`https://wa.me/77001234567?text=${encodeURIComponent(`Здравствуйте! Меня интересует запчасть: ${productName}, арт. ${product.article}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-3 text-sm font-medium text-black transition-all hover:border-green-400 hover:bg-green-50"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </a>
              <a
                href={product.kaspiUrl ?? 'https://kaspi.kz/shop/search/?text=hongqi+запчасти'}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-3 text-sm font-medium text-black transition-all hover:border-[#f14635]/40 hover:bg-[#f14635]/5"
              >
                <span className="text-base font-bold leading-none text-[#f14635]">K</span>
                Найти в Kaspi магазине
              </a>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4">
                <Truck className="h-5 w-5 text-black/45" />
                <div>
                  <p className="text-xs font-medium">Доставка</p>
                  <p className="text-xs text-black/45">2-5 дней по РК</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4">
                <Shield className="h-5 w-5 text-black/45" />
                <div>
                  <p className="text-xs font-medium">Гарантия</p>
                  <p className="text-xs text-black/45">12 месяцев</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {description ? (
          <section className="mt-10">
            <h2 className={`${displayFont} mb-4 text-xl font-semibold`}>Описание</h2>
            <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-stone-50 to-white p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#e7282d]/5" />
              <p className="relative leading-relaxed text-black/45">{description}</p>
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className={`${displayFont} mb-5 text-xl font-semibold`}>Характеристики</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: 'Артикул', value: product.article, highlight: true },
              { label: 'Модель', value: product.models.join(', ') },
              { label: 'Категория', value: categoryName },
              { label: 'Тип', value: 'Оригинал (OEM)' },
              { label: 'Наличие', value: inStock ? 'В наличии' : 'Под заказ', green: inStock },
              { label: 'Гарантия', value: '12 месяцев' },
              { label: 'Доставка', value: '2-5 дней по РК' },
              { label: 'Цена', value: formatPrice(product.price), highlight: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${
                  item.highlight
                    ? 'border-[#111] bg-[#111] text-white'
                    : item.green
                      ? 'border-green-200 bg-green-50'
                      : 'border-black/10 bg-white'
                }`}
              >
                <p
                  className={`mb-1.5 text-[10px] font-medium uppercase tracking-widest ${
                    item.highlight ? 'text-white/60' : item.green ? 'text-green-600' : 'text-black/45'
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    item.highlight ? 'text-white' : item.green ? 'text-green-700' : 'text-black'
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {related.length ? (
          <section className="mt-16">
            <h2 className={`${displayFont} mb-6 text-xl font-semibold`}>{t('shop.product.related')}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <section id="product-request" className="mt-20 bg-[#0a0a0a] py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {requestSent ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#e7282d]/30">
                <CheckCircle2 className="h-7 w-7 text-[#e7282d]" />
              </div>
              <p className={`${displayFont} mb-2 text-xl font-semibold text-white`}>Заявка отправлена!</p>
              <p className="text-sm text-white/40">Мы свяжемся с вами в течение 15 минут.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-center text-[10px] uppercase tracking-[0.3em] text-white/40">Заявка</p>
              <h2 className={`${displayFont} mb-2 text-center text-2xl font-semibold text-white md:text-3xl`}>
                Интересует этот товар?
              </h2>
              <p className="mb-10 text-center text-sm text-white/40">
                Оставьте заявку - мы перезвоним и уточним детали заказа
              </p>
              <form
                onSubmit={handleProductRequest}
                className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8"
              >
                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                  Товар: <span className="text-white">{productName}</span>
                  <span className="ml-3 text-white/30">Арт. {product.article}</span>
                </div>
                {[
                  { key: 'name', label: 'Ваше имя', placeholder: 'Иванов Иван', required: true },
                  { key: 'phone', label: 'Телефон', placeholder: '+7 700 000 00 00', required: true },
                ].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/40">
                      {field.label}
                    </span>
                    <input
                      required={field.required}
                      value={requestForm[field.key as 'name' | 'phone']}
                      onChange={(event) =>
                        setRequestForm((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      onBlur={() => {
                        if (field.key === 'phone') setPhoneTouched(true);
                      }}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#e7282d]/50"
                    />
                  </label>
                ))}
                {requestPhoneError ? <p className="text-sm text-[#e7282d]">{t('shop.forms.phoneError')}</p> : null}
                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-white/40">
                    Комментарий
                  </span>
                  <textarea
                    value={requestForm.comment}
                    onChange={(event) =>
                      setRequestForm((current) => ({ ...current, comment: event.target.value }))
                    }
                    placeholder="Дополнительные пожелания..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#e7282d]/50"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#e7282d] py-3.5 text-sm font-medium text-white transition-all hover:bg-[#e7282d]/90"
                >
                  Отправить заявку
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export const ShopCartPage = () => {
  const { t, i18n } = useTranslation();
  const { cart, getProduct, removeFromCart, updateCartQuantity, cartTotal, cartCount } = useShop();

  return (
    <div className="min-h-screen bg-white pt-32 text-black">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <h1 className={`${displayFont} text-5xl font-semibold`}>{t('shop.cart.title')}</h1>
        {cart.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-black/6 bg-white p-12 text-center">
            <p className="text-xl font-semibold">{t('shop.cart.empty')}</p>
            <Link to="/hongqi-parts/catalog" className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#111] px-6 text-sm font-bold text-white">
              {t('shop.actions.goCatalog')}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                const name = localizedText(product.name, { lng: i18n.language });
                return (
                  <div key={item.productId} className="grid gap-5 rounded-2xl border border-black/6 bg-white p-5 sm:grid-cols-[140px_1fr_auto]">
                    <SmartImage src={product.images[0]} alt={name} className="h-32 w-full rounded-xl object-cover" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">{product.article}</p>
                      <Link to={`/hongqi-parts/${product.slug}`} className="mt-2 block text-xl font-bold">
                        {name}
                      </Link>
                      <p className="mt-3 text-sm font-semibold text-black/45">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex flex-col items-start gap-4 sm:items-end">
                      <div className="flex overflow-hidden rounded-xl border border-black/8">
                        <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="h-10 w-10">
                          <Minus className="mx-auto h-4 w-4" />
                        </button>
                        <span className="flex h-10 min-w-12 items-center justify-center text-sm font-bold">{item.quantity}</span>
                        <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="h-10 w-10">
                          <Plus className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xl font-bold">{formatPrice(product.price * item.quantity)}</p>
                      <button type="button" onClick={() => removeFromCart(item.productId)} className="text-sm font-semibold text-[#e7282d]">
                        {t('shop.actions.remove')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-fit rounded-2xl border border-black/6 bg-white p-6 shadow-sm lg:sticky lg:top-32">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">{t('shop.cart.summary')}</p>
              <div className="mt-6 space-y-4 border-b border-black/8 pb-6 text-sm font-semibold text-black/50">
                <div className="flex justify-between">
                  <span>{t('shop.cart.headerCount', { count: cartCount })}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shop.cart.delivery')}</span>
                  <span>{t('shop.cart.deliveryHint')}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold">{t('shop.cart.total')}</span>
                <span className="text-3xl font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <Link to="/checkout" className="mt-8 flex h-14 items-center justify-center rounded-xl bg-[#111] text-sm font-bold text-white">
                {t('shop.actions.checkout')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ShopCheckoutPage = () => {
  const { t } = useTranslation();
  const { cart, cartTotal, createOrder } = useShop();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    comment: '',
    paymentMethod: 'card' as OrderItem['paymentMethod'],
    bank: 'Kaspi Bank',
  });
  const [orderId, setOrderId] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = phoneTouched && !isValidPhone(form.phone);

  if (cart.length === 0 && !orderId) {
    return <div className="min-h-screen bg-white pt-40 text-center text-black/55">{t('shop.checkout.empty')}</div>;
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-white pt-40 text-center text-black">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#e7282d]" />
        <h1 className={`${displayFont} mt-6 text-4xl font-semibold`}>{t('shop.checkout.successTitle')}</h1>
        <p className="mt-4 text-black/55">{t('shop.checkout.successSubtitle', { orderId })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 text-black">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
        <form
          className="rounded-2xl border border-black/6 bg-white p-6 shadow-sm lg:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            setPhoneTouched(true);
            if (!isValidPhone(form.phone)) return;
            setOrderId(
              createOrder({
                name: form.name,
                phone: form.phone,
                city: form.city,
                comment: form.comment,
                paymentMethod: form.paymentMethod,
                bank: form.bank,
              })
            );
          }}
        >
          <h1 className={`${displayFont} text-4xl font-semibold`}>{t('shop.checkout.title')}</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['name', t('shop.forms.name')],
              ['phone', t('shop.forms.phone')],
              ['city', t('shop.forms.city')],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                required
                value={String(form[key as keyof typeof form])}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                onBlur={() => {
                  if (key === 'phone') setPhoneTouched(true);
                }}
                placeholder={placeholder}
                className="h-14 rounded-xl border border-black/8 px-4 text-sm outline-none focus:border-[#e7282d]/50"
              />
            ))}
            {phoneError ? <p className="-mt-2 text-sm text-[#e7282d] sm:col-start-2">{t('shop.forms.phoneError')}</p> : null}
            <select
              value={form.paymentMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  paymentMethod: event.target.value as OrderItem['paymentMethod'],
                }))
              }
              className="h-14 rounded-xl border border-black/8 px-4 text-sm outline-none focus:border-[#e7282d]/50"
            >
              <option value="card">{t('shop.checkout.card')}</option>
              <option value="kaspi">{t('shop.checkout.kaspi')}</option>
              <option value="manager">{t('shop.checkout.manager')}</option>
            </select>
            <select
              value={form.bank}
              onChange={(event) => setForm((current) => ({ ...current, bank: event.target.value }))}
              className="h-14 rounded-xl border border-black/8 px-4 text-sm outline-none focus:border-[#e7282d]/50"
            >
              <option>Kaspi Bank</option>
              <option>Halyk Bank</option>
              <option>Freedom Bank Kazakhstan</option>
            </select>
            <textarea
              value={form.comment}
              onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
              placeholder={t('shop.forms.comment')}
              className="min-h-36 rounded-xl border border-black/8 px-4 py-4 text-sm outline-none focus:border-[#e7282d]/50 sm:col-span-2"
            />
          </div>
          <button type="submit" className="mt-8 h-14 rounded-xl bg-[#111] px-8 text-sm font-bold text-white">
            {t('shop.actions.checkout')}
          </button>
        </form>
        <div className="h-fit rounded-2xl border border-black/6 bg-white p-6 shadow-sm lg:sticky lg:top-32">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">{t('shop.cart.summary')}</p>
          <p className="mt-6 text-4xl font-bold">{formatPrice(cartTotal)}</p>
          <p className="mt-4 text-sm font-semibold leading-7 text-black/45">{t('shop.checkout.statusHint')}</p>
        </div>
      </div>
    </div>
  );
};

export const ShopRequestPage = () => (
  <div className="bg-[#080808] pt-32 text-white">
    <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Связаться с нами</p>
        <h1 className={`${displayFont} mt-6 text-5xl font-semibold leading-tight lg:text-6xl`}>
          Оставьте заявку -
          <br />
          мы все найдем
        </h1>
        <p className="mt-8 max-w-xl text-base font-semibold leading-8 text-white/35">
          Если нужной запчасти нет в каталоге - отправьте VIN и комментарий.
        </p>
      </div>
      <RequestForm />
    </section>
  </div>
);

export const ShopCatalogResolverPage = () => {
  const { slug } = useParams();
  const { state } = useShop();
  const isCategory = state.categories.some((item) => item.slug === slug);

  return isCategory ? <ShopCatalogPage /> : <ShopProductPage />;
};
