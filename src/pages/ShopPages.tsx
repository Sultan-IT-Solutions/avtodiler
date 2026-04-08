import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CarFront,
  ChevronRight,
  Disc3,
  Filter,
  Grid2X2,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  MessageCircle,
  Minus,
  Plus,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { SITE_IMAGES } from '../data/siteImages';
import { useShop } from '../context/ShopContext';
import type { CategoryItem, HongqiModel, OrderItem, ProductItem, SeoPage, StoreItem } from '../types/shop';
import { localizedText } from '../utils/localizedText';
import { isValidPhone } from '../utils/phone';
import { shopAdminApi } from '../utils/shopApi';
import { parseShopWorkbook, summarizeImportPayload } from '../utils/shopImport';
import {
  findCategoryByProduct,
  findCategoryByRouteSlug,
  normalizeCategoryForSave,
  slugifyPathSegment,
} from '../utils/shopNormalization';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(value);

const shopFallbackImages = [SITE_IMAGES.secondary, SITE_IMAGES.cta, SITE_IMAGES.hero];

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`input-luxury ${props.className ?? ''}`.trim()} />
);

const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`input-luxury min-h-[140px] resize-y py-4 ${props.className ?? ''}`.trim()}
  />
);

const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`input-luxury appearance-none ${props.className ?? ''}`.trim()} />
);

const ChevronDownIcon = ({ open = false }: { open?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className={`h-5 w-5 text-white/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M5 7.5 10 12.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const useShopSeo = (path: string) => {
  const { state } = useShop();
  const { i18n } = useTranslation();
  const page = state.seoPages.find((item) => item.slug === path);

  useEffect(() => {
    if (!page) return;

    document.title = localizedText(page.title, { lng: i18n.language, fallbackLng: 'en' });
    const meta = document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      localizedText(page.description, { lng: i18n.language, fallbackLng: 'en' })
    );

    if (!meta.parentElement) {
      document.head.appendChild(meta);
    }
  }, [i18n.language, page]);

  return page;
};

const stockLabel = (stock: number, t: (key: string) => string) =>
  stock > 0 ? t('shop.stock.inStock') : t('shop.stock.outOfStock');

const ShopSectionIntro = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="max-w-3xl">
    {eyebrow ? (
      <p className="text-[11px] uppercase tracking-[0.3em] text-luxury-burgundy">{eyebrow}</p>
    ) : null}
    <h1 className="mt-4 text-[clamp(32px,5vw,56px)] font-display font-light leading-[1.05] text-white">
      {title}
    </h1>
    {subtitle ? <p className="mt-4 text-base leading-7 text-white/60">{subtitle}</p> : null}
  </div>
);

const MobileModelPicker = ({ models }: { models: HongqiModel[] }) => {
  const { t, i18n } = useTranslation();
  const [selectedId, setSelectedId] = useState(models[0]?.id ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedModel = models.find((model) => model.id === selectedId) ?? models[0];

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!selectedModel) {
    return null;
  }

  return (
    <div className="md:hidden">
      <div ref={dropdownRef} className="card-luxury overflow-hidden p-4">
        <label className="block text-[10px] uppercase tracking-[0.28em] text-white/35">
          {t('shop.home.models.mobileSelectLabel')}
        </label>
        <div className="relative mt-3">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onClick={() => setIsOpen((value) => !value)}
            className="group flex min-h-15 w-full items-center justify-between gap-4 border border-white/10 bg-white/[0.02] px-4 py-4 text-left transition-colors duration-300 hover:border-white/20"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">
                {localizedText(selectedModel.name, { lng: i18n.language })}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/40">
                {selectedModel.code}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="border border-luxury-burgundy/35 bg-luxury-burgundy/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-luxury-burgundy">
                {models.length}
              </span>
              <ChevronDownIcon open={isOpen} />
            </div>
          </button>

          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 overflow-hidden border border-white/10 bg-luxury-black/95 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              >
                <div
                  role="listbox"
                  aria-label={t('shop.home.models.mobileSelectLabel')}
                  className="max-h-[320px] overflow-y-auto p-2"
                >
                  {models.map((model) => {
                    const isSelected = model.id === selectedModel.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSelectedId(model.id);
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-200 ${
                          isSelected
                            ? 'bg-luxury-burgundy/12 text-white'
                            : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-base font-semibold leading-tight">
                            {localizedText(model.name, { lng: i18n.language })}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/35">
                            {model.code}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${
                            isSelected
                              ? 'border-luxury-burgundy/50 bg-luxury-burgundy/10 text-luxury-burgundy'
                              : 'border-white/10 text-white/35'
                          }`}
                        >
                          {model.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedModel.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 overflow-hidden border border-white/10 bg-white/[0.02] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold leading-tight text-white">
                  {localizedText(selectedModel.name, { lng: i18n.language })}
                </p>
                <p className="mt-3 max-w-[20rem] text-sm leading-7 text-white/55">
                  {t('shop.home.models.link')}
                </p>
              </div>
              <span className="shrink-0 border border-luxury-burgundy/35 bg-luxury-burgundy/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-luxury-burgundy">
                {selectedModel.code}
              </span>
            </div>
            <Link
              to={`/hongqi-parts/catalog?model=${encodeURIComponent(selectedModel.code)}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center border border-luxury-burgundy/40 px-4 text-[11px] uppercase tracking-[0.24em] text-white transition-colors duration-300 hover:border-luxury-burgundy hover:bg-luxury-burgundy/10"
            >
              {t('shop.home.models.mobileCta')}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const MobileCategoryAccordion = ({ categories }: { categories: CategoryItem[] }) => {
  const { t, i18n } = useTranslation();
  const [openId, setOpenId] = useState(categories[0]?.id ?? '');

  if (!categories.length) {
    return null;
  }

  return (
    <div className="md:hidden">
      <div className="space-y-3">
        {categories.map((category) => {
          const isOpen = openId === category.id;
          return (
            <div key={category.id} className="card-luxury overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? '' : category.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                    {t('shop.home.categories.mobileLabel')}
                  </p>
                  <p className="mt-2 text-xl font-semibold leading-tight text-white">
                    {localizedText(category.name, { lng: i18n.language })}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {localizedText(category.description, { lng: i18n.language })}
                  </p>
                </div>
                <ChevronDownIcon open={isOpen} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="space-y-3 px-4 py-4">
                      <p className="text-sm leading-6 text-white/55">
                        {t('shop.catalog.subtitle')}
                      </p>
                      <Link
                        to={`/hongqi-parts/catalog/${category.slug}`}
                        className="mt-2 inline-flex min-h-11 items-center justify-center border border-luxury-burgundy/40 px-4 text-[11px] uppercase tracking-[0.24em] text-white transition-colors duration-300 hover:border-luxury-burgundy hover:bg-luxury-burgundy/10"
                      >
                        {t('shop.home.categories.mobileCta')}
                      </Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ShopAsyncState = ({
  embedded = false,
  tone = 'dark',
}: {
  embedded?: boolean;
  tone?: 'dark' | 'light';
}) => {
  const { t } = useTranslation();
  const { isLoading, loadError } = useShop();

  if (!isLoading && !loadError) {
    return null;
  }

  const className =
    tone === 'light'
      ? 'border border-black/10 bg-white text-black/60 shadow-[0_24px_70px_rgba(15,23,42,0.06)]'
      : 'card-luxury text-white/65';

  return (
    <div
      className={`${className} ${embedded ? '' : 'mt-8'} p-6`}
      role={loadError ? 'alert' : 'status'}
    >
      {isLoading ? t('common.loading', 'Загрузка...') : loadError}
    </div>
  );
};

const SmartImage = ({
  src,
  alt,
  className,
  fallbackLabel,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) => {
  const [index, setIndex] = useState(0);
  const [showFallbackCard, setShowFallbackCard] = useState(false);
  const sources = useMemo(
    () => [src, ...shopFallbackImages].filter((item): item is string => Boolean(item)),
    [src]
  );

  useEffect(() => {
    setIndex(0);
    setShowFallbackCard(false);
  }, [src]);

  if (!sources.length || showFallbackCard) {
    return (
      <div
        className={`relative overflow-hidden bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] ${className ?? ''}`.trim()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,18,52,0.16),transparent_30%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative flex h-full w-full flex-col justify-between p-6">
          <span className="text-[10px] uppercase tracking-[0.28em] text-luxury-burgundy">
            Hongqi Parts
          </span>
          <div>
            <div className="h-px w-20 bg-luxury-burgundy/60" />
            <p className="mt-4 text-lg font-semibold text-white">
              {fallbackLabel || alt}
            </p>
          </div>
        </div>
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
          const nextIndex = current + 1;
          if (nextIndex >= sources.length) {
            setShowFallbackCard(true);
            return current;
          }
          return nextIndex;
        });
      }}
    />
  );
};

const QuickRequestForm = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useTranslation();
  const { submitPartRequest } = useShop();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vin, setVin] = useState('');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = phoneTouched && !isValidPhone(phone);

  return (
    <form
      className={`mt-8 grid gap-5 ${compact ? '' : 'lg:grid-cols-2'}`}
      onSubmit={(event) => {
        event.preventDefault();
        setPhoneTouched(true);
        if (!isValidPhone(phone)) return;
        submitPartRequest({ name, phone, vin, comment });
        setSent(true);
        setName('');
        setPhone('');
        setVin('');
        setComment('');
        setPhoneTouched(false);
      }}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('shop.forms.name')}
        required
      />
      <Input
        value={phone}
        onChange={(event) => {
          if (!phoneTouched) setPhoneTouched(true);
          setPhone(event.target.value);
        }}
        onBlur={() => setPhoneTouched(true)}
        placeholder={t('shop.forms.phone')}
        className={phoneError ? 'border-luxury-burgundy/70 focus:border-luxury-burgundy/80' : ''}
        required
      />
      {phoneError ? (
        <p className={`${compact ? '' : 'lg:col-start-2'} -mt-2 text-[11px] text-luxury-burgundy`}>
          {t('shop.forms.phoneError')}
        </p>
      ) : null}
      <Input
        value={vin}
        onChange={(event) => setVin(event.target.value)}
        placeholder={t('shop.forms.vin')}
        required
      />
      <Input
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t('shop.forms.comment')}
      />
      <div className={`${compact ? '' : 'lg:col-span-2'} flex flex-wrap items-center gap-4`}>
        <button className="btn-primary" type="submit">
          {t('shop.actions.sendRequest')}
        </button>
        {sent ? <span className="text-sm text-white/60">{t('shop.forms.success')}</span> : null}
      </div>
    </form>
  );
};

const shopCategoryIcons: Record<string, LucideIcon> = {
  engine: Wrench,
  transmission: Settings2,
  suspension: CarFront,
  brakes: Disc3,
  body: CarFront,
  electronics: Zap,
  interior: Sparkles,
  consumables: Package,
};

const lightInputClass =
  'h-14 w-full rounded-full border border-black/10 bg-white px-5 text-base text-[#18181b] outline-none transition-colors placeholder:text-black/30 focus:border-black/30';

const ShopShowcaseHeader = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { cartCount } = useShop();

  const links = [
    {
      label: t('nav.parts'),
      to: '/hongqi-parts',
      active: location.pathname.startsWith('/hongqi-parts'),
    },
    {
      label: t('shop.shell.modelsTab'),
      to: '/hongqi-parts#shop-models',
      active: location.pathname === '/hongqi-parts' && location.hash === '#shop-models',
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070707]/95 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4 py-3 text-[10px] uppercase tracking-[0.32em] text-white/25">
          <span>{t('shop.shell.eyebrow')}</span>
          <a href="tel:+77753813839" className="transition-colors hover:text-white/60">
            +7 775 381 38 39
          </a>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/hongqi-parts" className="flex items-end gap-3">
            <div>
              <div className="text-[22px] font-semibold uppercase tracking-[0.2em] text-white">Hongqi</div>
              <div className="mt-1 h-px w-10 bg-luxury-red" />
            </div>
            <span className="pb-0.5 text-[10px] uppercase tracking-[0.32em] text-white/45">
              {t('nav.parts')}
            </span>
          </Link>

          <nav className="flex items-center gap-3 overflow-x-auto pb-1 lg:justify-center">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`relative whitespace-nowrap px-5 py-3 text-[12px] uppercase tracking-[0.24em] transition-colors ${
                  link.active ? 'text-white' : 'text-white/35 hover:text-white/75'
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-5 bottom-0 h-px bg-luxury-red transition-opacity ${
                    link.active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <Link
            to="/cart"
            className="inline-flex w-fit items-center gap-3 rounded-[18px] border border-white/10 px-5 py-3 text-white/80 transition-colors hover:text-white"
          >
            <ShoppingCart size={18} />
            <span className="text-sm">{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

const ShopPublicLayout = ({
  children,
  tone = 'dark',
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
}) => (
  <div className={tone === 'light' ? 'min-h-screen bg-[#f4f1eb] text-[#18181b]' : 'min-h-screen bg-[#050505] text-white'}>
    <ShopShowcaseHeader />
    {children}
  </div>
);

const ShopLightProductCard = ({ product }: { product: ProductItem }) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useShop();
  const name = localizedText(product.name, { lng: i18n.language });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-black/8 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.06)]">
      <div className="relative overflow-hidden bg-[#f6f4ef]">
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-red-500/15 bg-white/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#1f1f1f] shadow-sm">
          <ShieldCheck size={14} className="text-luxury-red" />
          <span>OEM</span>
        </div>
        {product.stock <= 0 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <span className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-black/65 shadow-sm">
              {t('shop.stock.outOfStock')}
            </span>
          </div>
        ) : null}
        <Link to={`/hongqi-parts/${product.slug}`} className="block overflow-hidden">
          <SmartImage
            src={product.images[0]}
            alt={name}
            fallbackLabel={product.article}
            className="h-[300px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-[12px] uppercase tracking-[0.18em] text-black/35">
          {product.article} • {product.models[0] ?? 'Hongqi'}
        </div>
        <Link
          to={`/hongqi-parts/${product.slug}`}
          className="mt-4 line-clamp-3 text-[clamp(22px,2vw,36px)] font-semibold leading-[1.08] text-[#171717]"
        >
          {name}
        </Link>
        <p className="mt-4 text-base leading-7 text-black/52">{product.oem}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/28">
              {stockLabel(product.stock, t)}
            </p>
            <p className="mt-2 text-[clamp(28px,2vw,40px)] font-semibold text-[#171717]">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={() => addToCart(product.id)}
            className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1e1e1e] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35"
            disabled={product.stock <= 0}
          >
            <ShoppingCart size={16} />
            <span>{t('shop.actions.addToCart')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

const Breadcrumbs = ({
  category,
}: {
  category?: CategoryItem;
}) => {
  const { t } = useTranslation();
  const backHref = category ? `/hongqi-parts/catalog/${category.slug}` : '/hongqi-parts/catalog';

  return (
    <Link
      to={backHref}
      className="inline-flex items-center gap-3 text-base font-medium text-black/55 transition hover:text-black"
    >
      <ArrowLeft size={20} className="shrink-0" />
      <span>{t('shop.product.backToCatalog')}</span>
    </Link>
  );
};

export const ShopHomePage = () => {
  const { t, i18n } = useTranslation();
  const { state } = useShop();
  useShopSeo('/hongqi-parts');
  const featuredProducts = state.products.filter((product) => product.popular).slice(0, 6);

  return (
    <ShopPublicLayout>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050505]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
          }}
        />
        <div className="absolute left-[-18%] top-[45%] h-[28rem] w-[28rem] rounded-full bg-luxury-burgundy/18 blur-[140px]" />
        <div className="absolute right-[10%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-white/[0.04] blur-[170px]" />

        <div className="relative mx-auto max-w-[1680px] px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pb-24 lg:pt-16">
          <div className="grid gap-12 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-[12px] uppercase tracking-[0.22em] text-white/55">
                <span className="h-2.5 w-2.5 rounded-full bg-luxury-red" />
                <span>{t('shop.home.hero.badge')}</span>
              </div>
              <h1 className="mt-10 font-display text-[clamp(66px,9vw,138px)] font-semibold leading-[0.86] tracking-[-0.06em]">
                <span className="block text-white">{t('shop.home.hero.line1')}</span>
                <span className="block text-luxury-red">{t('shop.home.hero.line2')}</span>
                <span className="block text-white/16">{t('shop.home.hero.line3')}</span>
              </h1>
              <p className="mt-10 max-w-2xl text-[18px] leading-8 text-white/40">
                {t('shop.home.hero.subtitle')}
              </p>
              <div className="mt-12 flex flex-wrap gap-4">
                <Link to="/hongqi-parts/catalog" className="rounded-[20px] bg-luxury-red px-10 py-5 text-lg font-medium text-white transition hover:bg-[#ff3243]">
                  <span className="inline-flex items-center gap-3">
                    {t('shop.actions.goCatalog')}
                    <ArrowRight size={18} />
                  </span>
                </Link>
                <a
                  href="tel:+77753813839"
                  className="rounded-[20px] border border-white/14 px-10 py-5 text-lg font-medium text-white/80 transition hover:border-white/25 hover:text-white"
                >
                  {t('shop.home.hero.call')}
                </a>
              </div>
              <ShopAsyncState embedded />
            </div>

            <div className="relative min-h-[420px] lg:min-h-[560px]">
              <div className="absolute inset-y-10 left-[10%] right-0 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03]">
                <SmartImage
                  src={SITE_IMAGES.hero}
                  alt="Hongqi Parts"
                  className="h-full w-full object-cover opacity-68"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.78)_0%,rgba(5,5,5,0.18)_44%,rgba(5,5,5,0.55)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 z-10 sm:bottom-8 sm:left-8 sm:right-8 lg:right-[20%]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/55 sm:text-[12px]">
                    {t('shop.home.hero.previewEyebrow')}
                  </p>
                  <p className="mt-3 max-w-[12ch] text-[clamp(22px,6vw,40px)] font-semibold leading-[0.95] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] sm:max-w-[13ch]">
                    {t('shop.home.hero.previewTitle')}
                  </p>
                </div>
              </div>
              <div className="absolute right-[14%] top-0 rounded-[28px] border border-white/10 bg-[#111111] px-6 py-5 shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
                <p className="text-sm text-white/55">{t('shop.home.hero.warrantyLabel')}</p>
                <p className="mt-3 text-5xl font-display font-semibold text-white">12 мес.</p>
                <p className="mt-2 text-sm text-white/40">{t('shop.home.hero.warrantyText')}</p>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-[28px] border border-white/10 bg-[#121212] px-8 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
                <p className="text-5xl font-display font-semibold text-white">500+</p>
                <p className="mt-3 text-sm text-white/42">{t('shop.home.hero.stockText')}</p>
                <div className="mt-5 flex gap-2">
                  <span className="h-1 w-10 rounded-full bg-luxury-red" />
                  <span className="h-1 w-10 rounded-full bg-luxury-red/70" />
                  <span className="h-1 w-10 rounded-full bg-luxury-red/50" />
                  <span className="h-1 w-10 rounded-full bg-white/14" />
                </div>
              </div>
              <div className="absolute right-2 top-1/2 z-10 w-[132px] -translate-y-1/2 rounded-[28px] bg-luxury-red px-5 py-6 text-white shadow-[0_26px_60px_rgba(200,16,46,0.38)] sm:right-4 sm:w-[148px] sm:px-6 lg:right-2 lg:w-[176px] lg:px-7">
                <p className="text-sm">{t('shop.home.hero.deliveryLabel')}</p>
                <p className="mt-2 text-[clamp(28px,2.6vw,44px)] font-display font-semibold">2-5</p>
                <p className="text-lg font-medium">{t('shop.home.hero.deliveryDays')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shop-models" className="bg-[#f4f1eb] text-[#18181b]">
        <div className="mx-auto max-w-[1680px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <ShopAsyncState embedded tone="light" />

          <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <p className="text-[12px] uppercase tracking-[0.24em] text-black/45">
                {t('shop.home.categories.eyebrow')}
              </p>
              <h2 className="mt-4 text-[clamp(28px,3vw,46px)] font-display font-semibold leading-[1.02] text-[#151515]">
                {t('shop.home.categories.title')}
              </h2>

              <div className="mt-8 md:hidden">
                <MobileCategoryAccordion categories={state.categories} />
              </div>

              <div className="mt-8 hidden space-y-2 md:block">
                {state.categories.map((category) => {
                  const Icon = shopCategoryIcons[category.slug] ?? Boxes;
                  return (
                    <Link
                      key={category.id}
                      to={`/hongqi-parts/catalog/${category.slug}`}
                      className="group flex items-center justify-between rounded-[20px] px-4 py-4 text-[#18181b] transition hover:bg-[#111111] hover:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-black/35 transition group-hover:text-white/70" />
                        <span className="text-lg font-medium">
                          {localizedText(category.name, { lng: i18n.language })}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-black/25 transition group-hover:text-white/55" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[24px] bg-[#111111] p-6 text-white">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  {t('shop.stores.title')}
                </p>
                <p className="mt-3 text-lg leading-7 text-white/70">{t('shop.stores.subtitle')}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/hongqi-parts/stores" className="rounded-full border border-white/12 px-5 py-3 text-sm text-white/85 transition hover:border-white/25">
                    {t('shop.stores.title')}
                  </Link>
                  <Link to="/hongqi-parts/request" className="rounded-full border border-luxury-red/30 bg-luxury-red/10 px-5 py-3 text-sm text-white transition hover:bg-luxury-red/20">
                    {t('shop.actions.sendRequest')}
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.24em] text-black/45">
                      {t('shop.home.models.eyebrow')}
                    </p>
                    <h2 className="mt-4 text-[clamp(28px,3vw,46px)] font-display font-semibold leading-[1.02] text-[#151515]">
                      {t('shop.home.models.title')}
                    </h2>
                  </div>
                  <Link
                    to="/hongqi-parts/catalog"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-[#18181b] transition hover:border-black/20"
                  >
                    {t('shop.actions.goCatalog')}
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="mt-8 md:hidden">
                  <MobileModelPicker models={state.models} />
                </div>
                <div className="mt-8 hidden flex-wrap gap-3 md:flex">
                  {state.models.map((model) => (
                    <Link
                      key={model.id}
                      to={`/hongqi-parts/catalog?model=${encodeURIComponent(model.code)}`}
                      className="rounded-full border border-black/10 bg-[#f5f1ea] px-5 py-3 text-sm font-medium text-[#18181b] transition hover:border-black/20 hover:bg-[#ebe6dd]"
                    >
                      {model.code}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.24em] text-black/45">
                      {t('shop.home.popular.eyebrow')}
                    </p>
                    <h2 className="mt-4 text-[clamp(28px,3vw,46px)] font-display font-semibold leading-[1.02] text-[#151515]">
                      {t('shop.home.popular.title')}
                    </h2>
                  </div>
                  <p className="max-w-xl text-base leading-7 text-black/48">
                    {t('shop.home.hero.catalogLead')}
                  </p>
                </div>
                {featuredProducts.length ? (
                  <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {featuredProducts.map((product) => (
                      <ShopLightProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-black/8 bg-white p-8 text-black/55 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                    {t('shop.catalog.empty')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0d0d0d]">
        <div className="mx-auto max-w-[1680px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="rounded-[34px] border border-white/10 bg-[#111111] p-8 lg:p-10">
            <div className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr] xl:items-start">
              <div>
                <p className="text-[12px] uppercase tracking-[0.24em] text-luxury-red">
                  {t('shop.home.request.eyebrow')}
                </p>
                <h2 className="mt-4 text-[clamp(30px,3vw,48px)] font-display font-semibold leading-[1.02] text-white">
                  {t('shop.home.request.title')}
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
                  {t('shop.home.request.subtitle')}
                </p>
                <div className="mt-8 grid gap-3">
                  {['original', 'china', 'delivery', 'guarantee'].map((key) => (
                    <div key={key} className="flex items-start gap-3 text-white/70">
                      <span className="mt-1 rounded-full bg-luxury-red/12 p-1.5 text-luxury-red">
                        <ShieldCheck size={14} />
                      </span>
                      <span>{t(`shop.home.advantages.items.${key}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <QuickRequestForm />
            </div>
          </div>
        </div>
      </section>
    </ShopPublicLayout>
  );
};

export const ShopCatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { state } = useShop();
  const location = useLocation();
  const { categorySlug } = useParams();
  const seoPage = useShopSeo('/hongqi-parts/catalog');

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [model, setModel] = useState(params.get('model') ?? '');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '');
  const [availability, setAvailability] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [sort, setSort] = useState<'popular' | 'priceAsc' | 'priceDesc'>('popular');
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(params.get('q') ?? '');
    setModel(params.get('model') ?? '');
    setMinPrice(params.get('minPrice') ?? '');
    setMaxPrice(params.get('maxPrice') ?? '');
  }, [params]);

  const category = findCategoryByRouteSlug(categorySlug, state.categories);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const items = state.products.filter((product) => {
      const queryMatch =
        !q ||
        localizedText(product.name, { lng: i18n.language }).toLowerCase().includes(q) ||
        product.article.toLowerCase().includes(q) ||
        product.oem.toLowerCase().includes(q);
      const modelMatch = !model || product.models.includes(model);
      const categoryMatch = !categorySlug || (category ? product.categoryId === category.id : false);
      const availabilityMatch =
        availability === 'all' ||
        (availability === 'inStock' ? product.stock > 0 : product.stock === 0);
      const minPriceMatch = !minPrice || product.price >= Number(minPrice);
      const maxPriceMatch = !maxPrice || product.price <= Number(maxPrice);

      return (
        queryMatch &&
        modelMatch &&
        categoryMatch &&
        availabilityMatch &&
        minPriceMatch &&
        maxPriceMatch
      );
    });

    switch (sort) {
      case 'priceAsc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        items.sort((a, b) => b.price - a.price);
        break;
      default:
        items.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
        break;
    }

    return items;
  }, [
    availability,
    category,
    categorySlug,
    deferredQuery,
    i18n.language,
    maxPrice,
    model,
    minPrice,
    sort,
    state.products,
  ]);

  useEffect(() => {
    setPage(1);
  }, [availability, categorySlug, deferredQuery, maxPrice, minPrice, model, sort]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const currentTitle = category
    ? localizedText(category.name, { lng: i18n.language })
    : localizedText(
        seoPage?.h1 ?? {
          ru: t('shop.catalog.title'),
          en: t('shop.catalog.title'),
          kz: t('shop.catalog.title'),
        },
        { lng: i18n.language }
      );

  return (
    <ShopPublicLayout tone="light">
      <section className="mx-auto max-w-[1680px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-black/35">
              {t('shop.catalog.eyebrow')}
            </p>
            <h1 className="mt-4 text-[clamp(34px,4vw,62px)] font-display font-semibold leading-[1.02] text-[#171717]">
              {currentTitle}
            </h1>
            <p className="mt-3 text-xl text-black/45">{t('shop.catalog.found', { count: filtered.length })}</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,420px)_280px] lg:items-center">
            <label className="relative block">
              <Search size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('shop.catalog.searchPlaceholder')}
                className={`${lightInputClass} pl-14`}
              />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'popular' | 'priceAsc' | 'priceDesc')}
              className={lightInputClass}
            >
              <option value="popular">{t('shop.catalog.sortPopular')}</option>
              <option value="priceAsc">{t('shop.catalog.sortPriceAsc')}</option>
              <option value="priceDesc">{t('shop.catalog.sortPriceDesc')}</option>
            </select>
          </div>
        </div>

        <ShopAsyncState embedded tone="light" />

        <div className="mt-10 grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <p className="text-[12px] uppercase tracking-[0.24em] text-black/38">
                {t('shop.catalog.categoryTitle')}
              </p>
              <div className="mt-6 space-y-2">
                <Link
                  to="/hongqi-parts/catalog"
                  className={`flex items-center justify-between rounded-[20px] px-4 py-4 transition ${
                    !categorySlug ? 'bg-[#111111] text-white' : 'text-[#18181b] hover:bg-[#f1ede5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Grid2X2 size={18} className={!categorySlug ? 'text-white/75' : 'text-black/35'} />
                    <span className="text-lg font-medium">{t('shop.catalog.allCategories')}</span>
                  </div>
                </Link>
                {state.categories.map((item) => {
                  const Icon = shopCategoryIcons[item.slug] ?? Boxes;
                  const isActive = item.slug === categorySlug;
                  return (
                    <Link
                      key={item.id}
                      to={`/hongqi-parts/catalog/${item.slug}`}
                      className={`flex items-center justify-between rounded-[20px] px-4 py-4 transition ${
                        isActive ? 'bg-[#111111] text-white' : 'text-[#18181b] hover:bg-[#f1ede5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-white/75' : 'text-black/35'} />
                        <span className="text-lg font-medium">
                          {localizedText(item.name, { lng: i18n.language })}
                        </span>
                      </div>
                      <ChevronRight size={17} className={isActive ? 'text-white/50' : 'text-black/20'} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <CarFront size={18} className="text-black/35" />
                <p className="text-[12px] uppercase tracking-[0.24em] text-black/38">
                  {t('shop.catalog.modelTitle')}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setModel('')}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    !model ? 'bg-[#111111] text-white' : 'border border-black/10 bg-[#f5f1ea] text-black/65'
                  }`}
                >
                  {t('shop.catalog.allModels')}
                </button>
                {state.models.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setModel(item.code)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      model === item.code
                        ? 'bg-[#111111] text-white'
                        : 'border border-black/10 bg-[#f5f1ea] text-black/65'
                    }`}
                  >
                    {item.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-black/35" />
                <p className="text-[12px] uppercase tracking-[0.24em] text-black/38">
                  {t('shop.catalog.filtersTitle')}
                </p>
              </div>
              <div className="mt-6 grid gap-4">
                <select
                  value={availability}
                  onChange={(event) =>
                    setAvailability(event.target.value as 'all' | 'inStock' | 'outOfStock')
                  }
                  className={lightInputClass}
                >
                  <option value="all">{t('shop.catalog.allAvailability')}</option>
                  <option value="inStock">{t('shop.stock.inStock')}</option>
                  <option value="outOfStock">{t('shop.stock.outOfStock')}</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder={t('shop.catalog.priceFrom')}
                    className={lightInputClass}
                  />
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder={t('shop.catalog.priceTo')}
                    className={lightInputClass}
                  />
                </div>
                {(query || model || minPrice || maxPrice || availability !== 'all' || sort !== 'popular') ? (
                  <button
                    type="button"
                    className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black"
                    onClick={() => {
                      setQuery('');
                      setModel('');
                      setMinPrice('');
                      setMaxPrice('');
                      setAvailability('all');
                      setSort('popular');
                    }}
                  >
                    {t('catalog.reset', 'Сбросить фильтры')}
                  </button>
                ) : null}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {items.map((product) => (
                <ShopLightProductCard key={product.id} product={product} />
              ))}
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-black/8 bg-white p-8 text-black/55 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                {t('shop.catalog.empty')}
              </div>
            ) : null}

            {pageCount > 1 ? (
              <div className="mt-10 flex flex-wrap gap-3">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
                  <button
                    key={value}
                    onClick={() => setPage(value)}
                    className={`h-11 min-w-11 rounded-full border px-4 text-sm transition ${
                      safePage === value
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-black/10 bg-white text-black/65'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </ShopPublicLayout>
  );
};

export const ShopLegacyCatalogRedirectPage = () => {
  const { categorySlug = '' } = useParams();
  return <Navigate replace to={`/hongqi-parts/catalog/${categorySlug}`} />;
};

export const ShopProductPage = () => {
  const { t, i18n } = useTranslation();
  const { state, addToCart } = useShop();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const product = state.products.find((item) => item.slug === slug);
  const category = findCategoryByProduct(product, state.categories);
  const sameCategoryProducts = state.products
    .filter((item) => item.id !== product?.id && item.categoryId === product?.categoryId)
    .slice(0, 4);
  const similarProducts = state.products
    .filter((item) => {
      if (!product || item.id === product.id) return false;
      if (item.categoryId === product.categoryId) return false;
      return item.models.some((model) => product.models.includes(model));
    })
    .slice(0, 4);

  useEffect(() => {
    setActiveImage(0);
    setIsZoomOpen(false);
    setPurchaseQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.shopSchema = product.id;
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: localizedText(product.name, { lng: i18n.language, fallbackLng: 'en' }),
      sku: product.article,
      mpn: product.oem,
      image: product.images,
      description: localizedText(product.description, { lng: i18n.language, fallbackLng: 'en' }),
      brand: {
        '@type': 'Brand',
        name: product.manufacturer,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'KZT',
        price: product.price,
        availability:
          product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    });
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [i18n.language, product]);

  if (!product) {
    return (
      <ShopPublicLayout tone="light">
        <div className="container mx-auto px-6 py-20 text-black/60 lg:px-16">
          {t('shop.product.notFound')}
        </div>
      </ShopPublicLayout>
    );
  }

  const productName = localizedText(product.name, { lng: i18n.language });
  const productDescription = localizedText(product.description, { lng: i18n.language });
  const productSeoText = localizedText(product.seoText, { lng: i18n.language });
  const categoryName = category ? localizedText(category.name, { lng: i18n.language }) : null;
  const galleryImages = product.images.length ? product.images : shopFallbackImages;
  const maxQuantity = Math.max(product.stock, 1);
  const quantityTotal = formatPrice(product.price * purchaseQuantity);
  const kaspiSearchQuery = product.name.ru || productName;
  const kaspiSearchUrl = `https://kaspi.kz/shop/search/?text=${encodeURIComponent(kaspiSearchQuery)}`;
  const quickOrderMessage = encodeURIComponent(
    `Здравствуйте! Хочу быстро оформить заказ на ${productName} (${product.article}).`
  );
  const whatsappLink = `https://wa.me/77753813839?text=${quickOrderMessage}`;
  const metaLine = [categoryName, product.models[0] ?? 'Hongqi'].filter(Boolean).join(' • ');

  const handleAddToCart = () => {
    addToCart(product.id, purchaseQuantity);
  };

  const handleQuickOrder = () => {
    addToCart(product.id, purchaseQuantity);
    navigate('/checkout');
  };

  return (
    <ShopPublicLayout tone="light">
      <div className="mx-auto max-w-[1680px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <Breadcrumbs category={category} />

        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.78fr)] xl:items-start">
          <div className="space-y-4">
            <button
              type="button"
              className="group block w-full overflow-hidden rounded-[36px] border border-black/8 bg-white p-3 text-left shadow-[0_28px_90px_rgba(15,23,42,0.08)]"
              onClick={() => setIsZoomOpen(true)}
            >
              <div className="overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(241,237,229,0.92))]">
                <SmartImage
                  src={galleryImages[activeImage]}
                  alt={productName}
                  className="aspect-[1/1] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  fallbackLabel={productName}
                />
              </div>
            </button>
            {galleryImages.length > 1 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-[24px] border bg-white p-2 transition ${
                      activeImage === index
                        ? 'border-luxury-red shadow-[0_18px_50px_rgba(200,16,46,0.12)]'
                        : 'border-black/8 hover:border-black/18'
                    }`}
                  >
                    <div className="overflow-hidden rounded-[18px] bg-[#f6f4ef]">
                      <SmartImage
                        src={image}
                        alt={`${productName} ${index + 1}`}
                        className="h-24 w-full object-cover sm:h-28"
                        fallbackLabel={product.article}
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 xl:sticky xl:top-28">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-50 px-4 py-2 text-sm font-medium text-luxury-red">
                <ShieldCheck size={16} />
                {t('shop.product.originalBadge')}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  product.stock > 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-black/5 text-black/50'
                }`}
              >
                {stockLabel(product.stock, t)}
              </span>
            </div>

            <div className="text-[15px] leading-7 text-black/45">{metaLine}</div>

            <h1 className="text-[clamp(34px,4.8vw,62px)] font-display font-semibold leading-[0.96] tracking-[-0.04em] text-[#171717]">
              {productName}
            </h1>

            <div className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.07)] sm:p-7">
              <div className="flex flex-wrap items-start gap-4">
                <div>
                  <p className="text-[clamp(34px,4vw,54px)] font-semibold leading-none text-[#171717]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-3 text-base text-black/48">{product.manufacturer}</p>
                  <p className="mt-2 text-sm text-black/34">
                    {t('shop.product.article')}: {product.article}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 rounded-[24px] bg-[#faf7f1] px-5 py-4">
                <span className="text-lg font-medium text-[#171717]">{t('shop.product.quantity')}</span>
                <div className="inline-flex items-center rounded-full border border-black/8 bg-white">
                  <button
                    type="button"
                    aria-label={t('shop.cart.decrease')}
                    onClick={() => setPurchaseQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-12 w-12 items-center justify-center text-black/65 transition hover:text-black disabled:cursor-not-allowed disabled:text-black/20"
                    disabled={purchaseQuantity <= 1 || product.stock <= 0}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="min-w-[52px] text-center text-xl font-medium text-[#171717]">
                    {purchaseQuantity}
                  </span>
                  <button
                    type="button"
                    aria-label={t('shop.cart.increase')}
                    onClick={() =>
                      setPurchaseQuantity((current) => Math.min(maxQuantity, current + 1))
                    }
                    className="flex h-12 w-12 items-center justify-center text-black/65 transition hover:text-black disabled:cursor-not-allowed disabled:text-black/20"
                    disabled={purchaseQuantity >= maxQuantity || product.stock <= 0}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-[22px] bg-[#111111] px-6 py-5 text-lg font-medium text-white transition hover:bg-[#1e1e1e] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35"
              >
                <ShoppingCart size={20} />
                <span>
                  {t('shop.actions.addToCart')} · {quantityTotal}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleQuickOrder}
              disabled={product.stock <= 0}
              className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] bg-luxury-red px-6 py-5 text-lg font-medium text-white transition hover:bg-[#ff3243] disabled:cursor-not-allowed disabled:bg-red-200"
            >
              {t('shop.product.quickOrder')}
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-black/10 bg-white px-6 py-5 text-lg font-medium text-[#171717] transition hover:border-black/20"
              >
                <MessageCircle size={20} className="text-[#25D366]" />
                <span>{t('carDetail.whatsapp')}</span>
              </a>

              <a
                href={kaspiSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-black/10 bg-white px-6 py-5 text-lg font-medium text-[#171717] transition hover:border-black/20"
              >
                <span className="text-2xl font-semibold text-luxury-red">K</span>
                <span>{t('shop.actions.buyKaspi')}</span>
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-black/5 p-2 text-black/60">
                    <Package size={18} />
                  </span>
                  <div>
                    <p className="text-base font-medium text-[#171717]">{t('shop.home.hero.deliveryLabel')}</p>
                    <p className="mt-1 text-sm leading-6 text-black/48">{t('shop.product.deliveryDetail')}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-black/5 p-2 text-black/60">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="text-base font-medium text-[#171717]">{t('shop.home.hero.warrantyLabel')}</p>
                    <p className="mt-1 text-sm leading-6 text-black/48">{t('shop.product.warrantyDetail')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <section className="rounded-[36px] border border-black/8 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8">
            <p className="text-[12px] uppercase tracking-[0.24em] text-black/35">
              {t('shop.product.descriptionTitle')}
            </p>
            <p className="mt-5 text-lg leading-8 text-black/62">
              {productDescription || productSeoText}
            </p>
          </section>

          <div className="grid gap-8">
            {product.specs.length ? (
              <section className="rounded-[36px] border border-black/8 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8">
                <p className="text-[12px] uppercase tracking-[0.24em] text-black/35">
                  {t('shop.product.characteristicsEyebrow')}
                </p>
                <h2 className="mt-4 text-[clamp(24px,2.2vw,32px)] font-display font-semibold leading-[1.08] text-[#171717]">
                  {t('shop.product.characteristics')}
                </h2>
                <div className="mt-8 overflow-hidden rounded-[24px] border border-black/8">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.id}
                      className="grid grid-cols-1 border-b border-black/8 last:border-b-0 sm:grid-cols-2"
                    >
                      <div className="bg-[#faf7f1] px-5 py-4 text-black/52">
                        {localizedText(spec.label, { lng: i18n.language })}
                      </div>
                      <div className="px-5 py-4 text-[#171717]">
                        {localizedText(spec.value, { lng: i18n.language })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {product.compatibility.length ? (
              <section className="rounded-[36px] border border-black/8 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8">
                <p className="text-[12px] uppercase tracking-[0.24em] text-black/35">
                  {t('shop.product.compatibilityEyebrow')}
                </p>
                <h2 className="mt-4 text-[clamp(24px,2.2vw,32px)] font-display font-semibold leading-[1.08] text-[#171717]">
                  {t('shop.product.compatibility')}
                </h2>
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[540px] text-left text-sm">
                    <thead className="text-black/38">
                      <tr>
                        <th className="pb-4">{t('shop.product.table.model')}</th>
                        <th className="pb-4">{t('shop.product.table.year')}</th>
                        <th className="pb-4">{t('shop.product.table.engine')}</th>
                        <th className="pb-4">{t('shop.product.table.note')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.compatibility.map((item, index) => (
                        <tr
                          key={`${item.modelCode}-${index}`}
                          className="border-t border-black/8 text-black/68"
                        >
                          <td className="py-4">{item.modelCode}</td>
                          <td className="py-4">{item.year}</td>
                          <td className="py-4">{item.engine}</td>
                          <td className="py-4">{localizedText(item.note, { lng: i18n.language })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
          </div>
        </div>

        {sameCategoryProducts.length ? (
          <section className="mt-16">
            <h2 className="text-[clamp(30px,3vw,48px)] font-display font-semibold leading-[1.02] text-[#171717]">
              {t('shop.product.related')}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {sameCategoryProducts.map((item) => (
                <ShopLightProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}

        {similarProducts.length ? (
          <section className="mt-16">
            <h2 className="text-[clamp(30px,3vw,48px)] font-display font-semibold leading-[1.02] text-[#171717]">
              {t('shop.product.similar')}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <ShopLightProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {isZoomOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 px-4 py-8"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-6xl">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-xl text-white"
              onClick={() => setIsZoomOpen(false)}
              aria-label={t('common.close', 'Закрыть')}
            >
              ×
            </button>
            <SmartImage
              src={product.images[activeImage]}
              alt={productName}
              className="max-h-[82vh] w-full object-contain"
              fallbackLabel={productName}
            />
          </div>
        </div>
      ) : null}
    </ShopPublicLayout>
  );
};

export const ShopCartPage = () => {
  const { t, i18n } = useTranslation();
  const { cart, getProduct, removeFromCart, updateCartQuantity, cartTotal, cartCount } = useShop();
  const subtotal = cartTotal;

  return (
    <ShopPublicLayout>
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <ShopSectionIntro
          eyebrow={t('shop.cart.eyebrow', 'Shop cart')}
          title={t('shop.cart.title')}
          subtitle={t('shop.cart.subtitle', 'Проверьте состав заказа перед оформлением.')}
        />
        {cart.length === 0 ? (
          <div className="card-luxury mt-8 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-luxury-burgundy">
              {t('shop.cart.emptyEyebrow', 'Cart')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">{t('shop.cart.empty')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              {t('shop.cart.emptySubtitle', 'Добавьте нужные позиции из каталога, чтобы оформить заказ онлайн.')}
            </p>
            <Link to="/hongqi-parts/catalog" className="btn-primary mt-8 inline-flex">
              {t('shop.actions.goCatalog')}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              <div className="card-luxury flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-luxury-burgundy">
                    {t('shop.cart.title')}
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    {t('shop.cart.headerCount', { count: cartCount })}
                  </p>
                </div>
                <Link to="/hongqi-parts/catalog" className="btn-outline px-5 py-3 text-[11px]">
                  {t('shop.cart.continueShopping', 'Продолжить покупки')}
                </Link>
              </div>
              {cart.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                const productName = localizedText(product.name, { lng: i18n.language });
                const lineTotal = product.price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="card-luxury grid gap-5 p-5 lg:grid-cols-[170px_minmax(0,1fr)_220px] lg:items-center"
                  >
                    <Link to={`/hongqi-parts/${product.slug}`} className="block overflow-hidden">
                      <SmartImage
                        src={product.images[0]}
                        alt={productName}
                        className="h-36 w-full object-cover"
                        fallbackLabel={product.article}
                      />
                    </Link>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link to={`/hongqi-parts/${product.slug}`} className="text-xl font-semibold text-white">
                          {productName}
                        </Link>
                        <span className={product.stock > 0 ? 'text-sm text-white/60' : 'text-sm text-luxury-burgundy'}>
                          {stockLabel(product.stock, t)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-white/45">
                        <p>{t('shop.product.article')}: {product.article}</p>
                        <p>{t('shop.product.oem')}: {product.oem}</p>
                        <p>{t('shop.product.manufacturer')}: {product.manufacturer}</p>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <span className="text-sm text-white/45">{t('shop.cart.unitPrice', 'Цена за единицу')}</span>
                        <span className="text-base text-white">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-4 lg:items-end">
                      <div className="flex items-center overflow-hidden border border-white/15">
                        <button
                          type="button"
                          className="h-11 w-11 border-r border-white/15 text-white/70 transition hover:text-white"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          aria-label={t('shop.cart.decrease', 'Уменьшить')}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            updateCartQuantity(item.productId, Number(event.target.value))
                          }
                          className="h-11 w-20 border-0 bg-transparent px-3 text-center text-white"
                        />
                        <button
                          type="button"
                          className="h-11 w-11 border-l border-white/15 text-white/70 transition hover:text-white"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          aria-label={t('shop.cart.increase', 'Увеличить')}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                          {t('shop.cart.lineTotal', 'Сумма')}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">{formatPrice(lineTotal)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-sm text-luxury-burgundy"
                      >
                        {t('shop.actions.remove')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card-luxury h-fit p-6 xl:sticky xl:top-28">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">{t('shop.cart.summary')}</p>
              <div className="mt-6 space-y-4 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between gap-4 text-sm text-white/60">
                  <span>{t('shop.cart.headerCount', { count: cartCount })}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-white/60">
                  <span>{t('shop.cart.delivery', 'Доставка')}</span>
                  <span>{t('shop.cart.deliveryHint', 'Уточняется менеджером')}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-sm uppercase tracking-[0.2em] text-white/45">
                  {t('shop.cart.total', 'Итого')}
                </span>
                <p className="text-3xl font-semibold text-white">{formatPrice(cartTotal)}</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/55">
                {t('shop.cart.secureHint', 'После оформления менеджер подтвердит наличие, доставку и детали оплаты.')}
              </p>
              <Link
                to="/checkout"
                className="btn-primary mt-8 inline-flex w-full justify-center"
              >
                {t('shop.actions.checkout')}
              </Link>
              <Link
                to="/hongqi-parts/catalog"
                className="btn-outline mt-3 inline-flex w-full justify-center"
              >
                {t('shop.cart.continueShopping', 'Продолжить покупки')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </ShopPublicLayout>
  );
};

export const ShopCheckoutPage = () => {
  const { t } = useTranslation();
  const { cart, cartTotal, createOrder } = useShop();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderItem['paymentMethod']>('card');
  const [bank, setBank] = useState('Kaspi Bank');
  const [orderId, setOrderId] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = phoneTouched && !isValidPhone(phone);

  if (cart.length === 0 && !orderId) {
    return (
      <ShopPublicLayout>
        <div className="container mx-auto px-6 py-20 text-white/70 lg:px-16">
          {t('shop.checkout.empty')}
        </div>
      </ShopPublicLayout>
    );
  }

  if (orderId) {
    return (
      <ShopPublicLayout>
        <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
          <div className="card-luxury max-w-3xl p-8">
            <h1 className="text-3xl font-semibold text-white">{t('shop.checkout.successTitle')}</h1>
            <p className="mt-4 text-white/65">{t('shop.checkout.successSubtitle', { orderId })}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/hongqi-parts/catalog" className="btn-primary">
                {t('shop.actions.goCatalog')}
              </Link>
            </div>
          </div>
        </div>
      </ShopPublicLayout>
    );
  }

  return (
    <ShopPublicLayout>
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <form
            className="card-luxury p-8"
            onSubmit={(event) => {
              event.preventDefault();
              setPhoneTouched(true);
              if (!isValidPhone(phone)) return;
              const created = createOrder({ name, phone, city, comment, paymentMethod, bank });
              setOrderId(created);
            }}
          >
            <h1 className="text-h2 text-white">{t('shop.checkout.title')}</h1>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('shop.forms.name')}
                required
              />
              <Input
                value={phone}
                onChange={(event) => {
                  if (!phoneTouched) setPhoneTouched(true);
                  setPhone(event.target.value);
                }}
                onBlur={() => setPhoneTouched(true)}
                placeholder={t('shop.forms.phone')}
                className={phoneError ? 'border-luxury-burgundy/70 focus:border-luxury-burgundy/80' : ''}
                required
              />
              {phoneError ? (
                <p className="-mt-2 text-[11px] text-luxury-burgundy lg:col-start-2">
                  {t('shop.forms.phoneError')}
                </p>
              ) : null}
              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t('shop.forms.city')}
                required
              />
              <Select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as OrderItem['paymentMethod'])}
              >
                <option value="card">{t('shop.checkout.card')}</option>
                <option value="kaspi">{t('shop.checkout.kaspi')}</option>
                <option value="manager">{t('shop.checkout.manager')}</option>
              </Select>
              <div className="lg:col-span-2">
                <Select value={bank} onChange={(event) => setBank(event.target.value)}>
                  <option>Kaspi Bank</option>
                  <option>Halyk Bank</option>
                  <option>Freedom Bank Kazakhstan</option>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={t('shop.forms.comment')}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-8">
              {t('shop.actions.payCard')}
            </button>
          </form>
          <div className="card-luxury h-fit p-6 xl:sticky xl:top-28">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">
              {t('shop.cart.summary')}
            </p>
            <p className="mt-6 text-3xl font-semibold text-white">{formatPrice(cartTotal)}</p>
            <p className="mt-4 text-sm leading-6 text-white/60">{t('shop.checkout.statusHint')}</p>
          </div>
        </div>
      </div>
    </ShopPublicLayout>
  );
};

export const ShopStoresPage = () => {
  const { t, i18n } = useTranslation();
  const { state } = useShop();
  const seoPage = useShopSeo('/hongqi-parts/stores');

  return (
    <ShopPublicLayout>
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <ShopSectionIntro
          title={localizedText(
            seoPage?.h1 ?? {
              ru: t('shop.stores.title'),
              en: t('shop.stores.title'),
              kz: t('shop.stores.title'),
            },
            { lng: i18n.language }
          )}
          subtitle={t('shop.stores.subtitle')}
        />
        <ShopAsyncState />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {state.stores.map((store) => (
            <article key={store.id} className="card-luxury p-6">
              <h2 className="text-2xl font-semibold text-white">
                {localizedText(store.name, { lng: i18n.language })}
              </h2>
              <p className="mt-4 text-white/70">{localizedText(store.address, { lng: i18n.language })}</p>
              <p className="mt-3 text-white/60">{store.phone}</p>
              <p className="mt-3 text-white/60">{localizedText(store.hours, { lng: i18n.language })}</p>
              <p className="mt-6 text-sm uppercase tracking-[0.2em] text-luxury-burgundy">
                {store.city}
              </p>
            </article>
          ))}
        </div>
      </div>
    </ShopPublicLayout>
  );
};

export const ShopRequestPage = () => {
  const { t, i18n } = useTranslation();
  const seoPage = useShopSeo('/hongqi-parts/request');

  return (
    <ShopPublicLayout>
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <div className="card-luxury max-w-4xl p-8 lg:p-10">
          <ShopSectionIntro
            title={localizedText(
              seoPage?.h1 ?? {
                ru: t('shop.request.title'),
                en: t('shop.request.title'),
                kz: t('shop.request.title'),
              },
              { lng: i18n.language }
            )}
            subtitle={t('shop.request.subtitle')}
          />
          <QuickRequestForm />
        </div>
      </div>
    </ShopPublicLayout>
  );
};

const emptyLocale = () => ({ ru: '', en: '', kz: '' });

const normalizeCategoryDraft = (category: CategoryItem): CategoryItem => normalizeCategoryForSave(category);

const CategoryEditor = ({
  category,
  onSave,
  onDelete,
}: {
  category: CategoryItem;
  onSave: (item: CategoryItem) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CategoryItem>(normalizeCategoryDraft(category));

  useEffect(() => {
    setDraft(normalizeCategoryDraft(category));
  }, [category]);

  const updateName = (locale: keyof CategoryItem['name'], value: string) => {
    setDraft((current) => {
      const next = {
        ...current,
        name: { ...current.name, [locale]: value },
      };

      if (locale === 'en') {
        const previousAutoSlug = slugifyPathSegment(current.name.en);
        const nextAutoSlug = slugifyPathSegment(value);
        if (!current.slug || current.slug === previousAutoSlug) {
          next.slug = nextAutoSlug;
        }
      }

      return next;
    });
  };

  return (
    <div className="card-luxury p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_320px]">
        {(['ru', 'en', 'kz'] as const).map((locale) => (
          <Input
            key={locale}
            value={draft.name[locale]}
            onChange={(event) => updateName(locale, event.target.value)}
            placeholder={`${t('shop.admin.categoryName')} ${locale.toUpperCase()}`}
          />
        ))}
        <Input
          value={draft.slug}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              slug: slugifyPathSegment(event.target.value),
            }))
          }
          placeholder={t('shop.admin.categorySlug')}
        />
      </div>
      <p className="mt-3 text-sm text-white/45">{t('shop.admin.categorySlugHint')}</p>
      <p className="mt-2 text-sm text-luxury-burgundy">
        /hongqi-parts/catalog/{draft.slug || 'category-slug'}
      </p>

      <div className="mt-5 grid gap-4">
        {(['ru', 'en', 'kz'] as const).map((locale) => (
          <Textarea
            key={`category-description-${category.id}-${locale}`}
            value={draft.description[locale]}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: {
                  ...current.description,
                  [locale]: event.target.value,
                },
              }))
            }
            placeholder={`${t('shop.admin.categoryDescription')} ${locale.toUpperCase()}`}
            className="min-h-[96px]"
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => onSave(normalizeCategoryDraft(draft))}>
          {t('shop.actions.save')}
        </button>
        <button className="btn-outline" onClick={() => onDelete(category.id)}>
          {t('shop.actions.delete')}
        </button>
      </div>
    </div>
  );
};

const ModelEditor = ({
  model,
  onSave,
  onDelete,
}: {
  model: HongqiModel;
  onSave: (item: HongqiModel) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(model);

  useEffect(() => {
    setDraft(model);
  }, [model]);

  return (
    <div className="card-luxury p-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Input
          value={draft.code}
          onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
          placeholder="Code"
        />
        {(['ru', 'en', 'kz'] as const).map((locale) => (
          <Input
            key={locale}
            value={draft.name[locale]}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: { ...current.name, [locale]: event.target.value },
              }))
            }
            placeholder={`${t('shop.admin.categoryName')} ${locale.toUpperCase()}`}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => onSave(draft)}>
          {t('shop.actions.save')}
        </button>
        <button className="btn-outline" onClick={() => onDelete(model.id)}>
          {t('shop.actions.delete')}
        </button>
      </div>
    </div>
  );
};

const StoreEditor = ({
  store,
  onSave,
  onDelete,
}: {
  store: StoreItem;
  onSave: (item: StoreItem) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(store);

  useEffect(() => {
    setDraft(store);
  }, [store]);

  return (
    <div className="card-luxury p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          value={draft.phone}
          onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
          placeholder="Phone"
        />
        <Input
          value={draft.city}
          onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
          placeholder="City"
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => onSave(draft)}>
          {t('shop.actions.save')}
        </button>
        <button className="btn-outline" onClick={() => onDelete(store.id)}>
          {t('shop.actions.delete')}
        </button>
      </div>
    </div>
  );
};

const ProductEditor = ({
  categories,
  models,
  product,
  onSave,
  onDelete,
}: {
  categories: CategoryItem[];
  models: HongqiModel[];
  product?: ProductItem;
  onSave: (item: ProductItem) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const buildEditableProduct = (source?: ProductItem): ProductItem => {
    const base = source ?? {
      id: `p-${Date.now()}`,
      slug: '',
      name: emptyLocale(),
      categoryId: categories[0]?.id ?? '',
      article: '',
      oem: '',
      manufacturer: 'Hongqi Genuine Parts',
      price: 0,
      stock: 0,
      images: [SITE_IMAGES.secondary, SITE_IMAGES.cta, SITE_IMAGES.hero],
      models: [],
      description: emptyLocale(),
      seoText: emptyLocale(),
      specs: [],
      compatibility: [],
    };

    return {
      ...base,
      description: {
        ru: base.description.ru || base.seoText.ru || '',
        en: base.description.en || base.seoText.en || '',
        kz: base.description.kz || base.seoText.kz || '',
      },
    };
  };

  const createDraft = (): ProductItem => ({
    id: `p-${Date.now()}`,
    slug: '',
    name: emptyLocale(),
    categoryId: categories[0]?.id ?? '',
    article: '',
    oem: '',
    manufacturer: 'Hongqi Genuine Parts',
    price: 0,
    stock: 0,
    images: [SITE_IMAGES.secondary, SITE_IMAGES.cta, SITE_IMAGES.hero],
    models: [],
    description: emptyLocale(),
    seoText: emptyLocale(),
    specs: [],
    compatibility: [],
  });
  const [draft, setDraft] = useState<ProductItem>(buildEditableProduct(product ?? createDraft()));

  useEffect(() => {
    setDraft(buildEditableProduct(product ?? createDraft()));
  }, [categories, product]);

  return (
    <div className="card-luxury p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          value={draft.slug}
          onChange={(event) => setDraft({ ...draft, slug: slugifyPathSegment(event.target.value) })}
          placeholder={t('shop.admin.productSlug')}
        />
        <Input
          value={draft.article}
          onChange={(event) => setDraft({ ...draft, article: event.target.value })}
          placeholder={t('shop.product.article')}
        />
        <Input
          value={draft.oem}
          onChange={(event) => setDraft({ ...draft, oem: event.target.value })}
          placeholder={t('shop.product.oem')}
        />
        <Input
          value={draft.manufacturer}
          onChange={(event) => setDraft({ ...draft, manufacturer: event.target.value })}
          placeholder={t('shop.product.manufacturer')}
        />
        <Input
          type="number"
          value={draft.price}
          onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
          placeholder={t('shop.admin.price')}
        />
        <Input
          type="number"
          value={draft.stock}
          onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })}
          placeholder={t('shop.admin.stock')}
        />
        <Select
          value={draft.categoryId}
          onChange={(event) =>
            setDraft({
              ...draft,
              categoryId: event.target.value,
            })
          }
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {localizedText(category.name, { lng: 'ru', fallbackLng: 'ru' })}
            </option>
          ))}
        </Select>
        <Input
          value={draft.models.join(', ')}
          onChange={(event) =>
            setDraft({
              ...draft,
              models: event.target.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          placeholder={t('shop.admin.modelsComma')}
        />
        <Input
          value={draft.kaspiUrl ?? ''}
          onChange={(event) => setDraft({ ...draft, kaspiUrl: event.target.value })}
          placeholder="Kaspi URL"
        />
      </div>
      <div className="mt-4 grid gap-4">
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
            {t('shop.admin.productName')}
          </p>
          <div className="grid gap-4">
            {(['ru', 'en', 'kz'] as const).map((locale) => (
              <Input
                key={`name-${locale}`}
                value={draft.name[locale]}
                onChange={(event) =>
                  setDraft({ ...draft, name: { ...draft.name, [locale]: event.target.value } })
                }
                placeholder={`${t('shop.admin.productName')} ${locale.toUpperCase()}`}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
            {t('shop.admin.productDescription')}
          </p>
          <p className="mb-4 text-sm text-white/45">{t('shop.admin.productDescriptionHint')}</p>
          <div className="grid gap-4">
            {(['ru', 'en', 'kz'] as const).map((locale) => (
              <Textarea
                key={`desc-${locale}`}
                value={draft.description[locale]}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    description: { ...draft.description, [locale]: event.target.value },
                  })
                }
                placeholder={`${t('shop.admin.productDescription')} ${locale.toUpperCase()}`}
                className="min-h-[120px]"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => onSave(draft)}>
          {t('shop.actions.save')}
        </button>
        {product ? (
          <button className="btn-outline" onClick={() => onDelete(product.id)}>
            {t('shop.actions.delete')}
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-white/45">{models.map((model) => model.code).join(', ')}</p>
    </div>
  );
};

const SeoEditor = ({
  page,
  onSave,
  onDelete,
}: {
  page: SeoPage;
  onSave: (item: SeoPage) => void;
  onDelete: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(page);

  useEffect(() => setDraft(page), [page]);

  return (
    <div className="card-luxury p-6">
      <p className="mb-4 text-sm text-white/45">{page.slug}</p>
      <div className="grid gap-4">
        {(['ru', 'en', 'kz'] as const).map((locale) => (
          <Input
            key={`title-${locale}`}
            value={draft.title[locale]}
            onChange={(event) =>
              setDraft({ ...draft, title: { ...draft.title, [locale]: event.target.value } })
            }
            placeholder={`${t('shop.admin.seoTitle')} ${locale.toUpperCase()}`}
          />
        ))}
        {(['ru', 'en', 'kz'] as const).map((locale) => (
          <Textarea
            key={`description-${locale}`}
            value={draft.description[locale]}
            onChange={(event) =>
              setDraft({
                ...draft,
                description: { ...draft.description, [locale]: event.target.value },
              })
            }
            placeholder={`${t('shop.admin.seoDescription')} ${locale.toUpperCase()}`}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => onSave(draft)}>
          {t('shop.actions.save')}
        </button>
        <button className="btn-outline" onClick={() => onDelete(page.id)}>
          {t('shop.actions.delete')}
        </button>
      </div>
    </div>
  );
};

export const ShopAdminPage = ({
  embedded = false,
  notify,
}: {
  embedded?: boolean;
  notify?: (message: string, actionLabel?: string, onAction?: () => void) => void;
}) => {
  const { t, i18n } = useTranslation();
  const {
    state,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveModel,
    deleteModel,
    saveStore,
    deleteStore,
    updateOrderStatus,
    deleteOrder,
    deleteRequest,
    addInventoryMovement,
    saveSeoPage,
    deleteSeoPage,
    loadAdminData,
    isLoading,
    loadError,
  } = useShop();
  const [tab, setTab] = useState<
    'products' | 'categories' | 'models' | 'orders' | 'warehouse' | 'stores' | 'requests' | 'seo' | 'import'
  >('products');
  const [selectedProductId, setSelectedProductId] = useState<string | null | undefined>(undefined);
  const [saveNotice, setSaveNotice] = useState('');
  const confirmDelete = (message: string, onConfirm: () => void) => {
    if (!window.confirm(message)) return;
    onConfirm();
  };
  const confirmSave = (onConfirm: () => void) => {
    if (!window.confirm('Сохранить изменения?')) return;
    onConfirm();
  };
  const pushNotice = (message: string) => {
    if (notify) {
      notify(message, 'ОК');
      return;
    }
    setSaveNotice(message);
  };
  const notifySaved = () => {
    pushNotice(t('shop.admin.savedSuccess'));
  };
  const notifyError = (message: string) => {
    pushNotice(message);
  };

  useEffect(() => {
    if (!saveNotice) return;
    const timer = window.setTimeout(() => setSaveNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);

  useEffect(() => {
    void loadAdminData().catch(() => undefined);
  }, [loadAdminData]);

  useEffect(() => {
    if (selectedProductId === undefined && state.products[0]?.id) {
      setSelectedProductId(state.products[0].id);
    }
  }, [selectedProductId, state.products]);

  const selectedProduct = state.products.find((item) => item.id === selectedProductId);
  const lowStock = state.products.filter((product) => product.stock <= 2);
  const inventorySummary = useMemo(
    () => ({
      totalProducts: state.products.length,
      totalStock: state.products.reduce((sum, product) => sum + product.stock, 0),
      lowStockCount: lowStock.length,
      totalMovements: state.inventoryMovements.length,
    }),
    [lowStock.length, state.inventoryMovements.length, state.products]
  );

  const content = (
    <div className="grid gap-6">
      <div className={embedded ? '' : 'container mx-auto px-6 py-12 lg:px-16'}>
        <div className={embedded ? 'mb-6' : 'mb-8'}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
            {t('shop.admin.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{t('shop.routes.shop')}</h2>
          <p className="mt-3 max-w-3xl text-white/55">{t('shop.admin.description')}</p>
        </div>

        <AnimatePresence>
          {saveNotice ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mb-5 inline-flex border border-luxury-burgundy/35 bg-luxury-burgundy/10 px-4 py-3 text-sm text-white"
            >
              {saveNotice}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {(isLoading || loadError) && <ShopAsyncState embedded />}

        <div className="mt-6 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="card-luxury h-fit p-4 xl:sticky xl:top-10">
            {(
              ['products', 'categories', 'models', 'orders', 'warehouse', 'stores', 'requests', 'seo', 'import'] as const
            ).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`mb-2 block w-full border px-4 py-3 text-left text-sm ${
                  tab === item
                    ? 'border-luxury-burgundy bg-luxury-burgundy/10 text-white'
                    : 'border-white/10 text-white/65'
                }`}
              >
                {t(`shop.admin.tabs.${item}`)}
              </button>
            ))}
          </aside>

          <main className="min-w-0 grid gap-6">
            {tab === 'products' ? (
              <div className="grid gap-6 2xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="card-luxury p-4">
                  <div className="max-h-[640px] overflow-auto pr-1">
                    {state.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProductId(product.id)}
                        className={`mb-2 block w-full border px-3 py-3 text-left ${
                          selectedProductId === product.id
                            ? 'border-luxury-burgundy bg-luxury-burgundy/10 text-white'
                            : 'border-white/10 text-white/65'
                        }`}
                      >
                        {localizedText(product.name, { lng: i18n.language })}
                      </button>
                    ))}
                  </div>
                  <button className="btn-outline mt-4 w-full" onClick={() => setSelectedProductId(null)}>
                    {t('shop.admin.newProduct')}
                  </button>
                </div>
                <ProductEditor
                  categories={state.categories}
                  models={state.models}
                  product={selectedProduct}
                  onSave={(item) => {
                    confirmSave(() => {
                      void (async () => {
                        const result = await saveProduct(item);
                        if (!result.ok) {
                          notifyError(result.error);
                          return;
                        }
                        notifySaved();
                        setSelectedProductId(item.id);
                      })();
                    });
                  }}
                  onDelete={(id) => {
                    confirmDelete('Удалить товар?', () => {
                      void (async () => {
                        const result = await deleteProduct(id);
                        if (!result.ok) {
                          notifyError(result.error);
                          return;
                        }
                        notifySaved();
                        setSelectedProductId(state.products.find((product) => product.id !== id)?.id);
                      })();
                    });
                  }}
                />
              </div>
            ) : null}

            {tab === 'categories' ? (
              <div className="grid gap-4">
                <button
                  className="btn-outline"
                  onClick={() => {
                    void (async () => {
                      const result = await saveCategory({
                        id: `category-${Date.now()}`,
                        slug: `new-category-${Date.now()}`,
                        name: { ru: 'Новая категория', en: 'New category', kz: 'Жаңа санат' },
                        description: emptyLocale(),
                      });
                      if (!result.ok) {
                        notifyError(result.error);
                        return;
                      }
                      notifySaved();
                    })();
                  }}
                >
                  {t('shop.admin.addCategory', 'Добавить категорию')}
                </button>
                {state.categories.map((category) => (
                  <CategoryEditor
                    key={category.id}
                    category={category}
                    onSave={(item) => {
                      confirmSave(() => {
                        void (async () => {
                          const result = await saveCategory(item);
                          if (!result.ok) {
                            notifyError(result.error);
                            return;
                          }
                          notifySaved();
                        })();
                      });
                    }}
                    onDelete={(id) => {
                      confirmDelete('Удалить категорию?', () => {
                        void (async () => {
                          const result = await deleteCategory(id);
                          if (!result.ok) {
                            notifyError(result.error);
                            return;
                          }
                          notifySaved();
                        })();
                      });
                    }}
                  />
                ))}
              </div>
            ) : null}

            {tab === 'models' ? (
              <div className="grid gap-4">
                {state.models.map((model) => (
                  <ModelEditor
                    key={model.id}
                    model={model}
                    onSave={(item) => {
                      confirmSave(() => {
                        saveModel(item);
                        notifySaved();
                      });
                    }}
                    onDelete={(id) =>
                      confirmDelete('Удалить модель?', () => deleteModel(id))
                    }
                  />
                ))}
                <button
                  className="btn-outline"
                  onClick={() =>
                    saveModel({
                      id: `model-${Date.now()}`,
                      code: '',
                      slug: `model-${Date.now()}`,
                      name: emptyLocale(),
                    })
                  }
                >
                  {t('shop.admin.addModel')}
                </button>
              </div>
            ) : null}

            {tab === 'orders' ? (
              <div className="grid gap-4">
                {state.orders.length === 0 ? (
                  <div className="card-luxury p-6 text-white/55">{t('shop.admin.noOrders')}</div>
                ) : null}
                {state.orders.map((order) => (
                  <div key={order.id} className="card-luxury p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">{order.id}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {order.name} • {order.phone} • {order.city}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {new Date(order.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <Select
                        value={order.status}
                        onChange={(event) => {
                          updateOrderStatus(order.id, event.target.value as OrderItem['status']);
                          notifySaved();
                        }}
                      >
                        <option value="new">Новый</option>
                        <option value="paid">Оплачен</option>
                        <option value="shipped">Отправлен</option>
                        <option value="completed">Завершен</option>
                      </Select>
                    </div>

                    <div className="mt-6 overflow-hidden border border-white/10 bg-white/[0.02]">
                      <div className="hidden grid-cols-[minmax(0,1.6fr)_100px_140px_140px] gap-4 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-white/40 md:grid">
                        <span>{t('shop.admin.orderProduct')}</span>
                        <span>{t('shop.admin.orderQuantity')}</span>
                        <span>{t('shop.admin.orderUnitPrice')}</span>
                        <span>{t('shop.admin.orderLineTotal')}</span>
                      </div>

                      <div className="divide-y divide-white/10">
                        {order.items.map((item) => {
                          const product = state.products.find((entry) => entry.id === item.productId);
                          const lineTotal = item.quantity * item.price;
                          return (
                            <div
                              key={`${order.id}-${item.productId}`}
                              className="grid gap-2 px-4 py-4 md:grid-cols-[minmax(0,1.6fr)_100px_140px_140px] md:items-start md:gap-4"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  {product
                                    ? localizedText(product.name, { lng: i18n.language })
                                    : item.productId}
                                </p>
                                {product ? (
                                  <p className="mt-1 text-xs text-white/40">
                                    {product.article} · {product.oem}
                                  </p>
                                ) : null}
                              </div>
                              <div className="text-sm text-white/65">
                                <span className="mr-2 inline-block md:hidden text-white/35">
                                  {t('shop.admin.orderQuantity')}:
                                </span>
                                {item.quantity}
                              </div>
                              <div className="text-sm text-white/65">
                                <span className="mr-2 inline-block md:hidden text-white/35">
                                  {t('shop.admin.orderUnitPrice')}:
                                </span>
                                {formatPrice(item.price)}
                              </div>
                              <div className="text-sm font-medium text-white">
                                <span className="mr-2 inline-block md:hidden text-white/35">
                                  {t('shop.admin.orderLineTotal')}:
                                </span>
                                {formatPrice(lineTotal)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div className="text-sm text-white/55">
                        <p>
                          {t('shop.admin.orderItemsCount')}: <span className="text-white">{order.items.length}</span>
                        </p>
                        <p className="mt-1">
                          {t('shop.admin.orderUnitsCount')}:{' '}
                          <span className="text-white">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        </p>
                        {order.comment ? (
                          <p className="mt-3 text-white/65">
                            {t('shop.admin.orderComment')}: {order.comment}
                          </p>
                        ) : null}
                      </div>
                      <div className="border border-luxury-burgundy/25 bg-luxury-burgundy/10 px-4 py-3 text-right">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                          {t('shop.admin.orderGrandTotal')}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                      <button
                        className="btn-outline"
                        onClick={() =>
                          confirmDelete('Удалить заказ?', () => {
                            deleteOrder(order.id);
                            pushNotice(t('shop.admin.orderDeleted'));
                          })
                        }
                      >
                        {t('shop.actions.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'warehouse' ? (
              <WarehouseSection
                products={state.products}
                inventoryMovements={state.inventoryMovements}
                lowStock={lowStock}
                inventorySummary={inventorySummary}
                onAddInventoryMovement={addInventoryMovement}
              />
            ) : null}

            {tab === 'stores' ? (
              <div className="grid gap-4">
                {state.stores.map((store) => (
                  <StoreEditor
                    key={store.id}
                    store={store}
                    onSave={(item) => {
                      confirmSave(() => {
                        saveStore(item);
                        notifySaved();
                      });
                    }}
                    onDelete={(id) =>
                      confirmDelete('Удалить магазин?', () => deleteStore(id))
                    }
                  />
                ))}
                <button
                  className="btn-outline"
                  onClick={() =>
                    saveStore({
                      id: `store-${Date.now()}`,
                      city: '',
                      name: emptyLocale(),
                      address: emptyLocale(),
                      phone: '',
                      hours: emptyLocale(),
                    })
                  }
                >
                  {t('shop.admin.addNew', 'Добавить новый')}
                </button>
              </div>
            ) : null}

            {tab === 'requests' ? (
              <div className="grid gap-4">
                {state.requests.length === 0 ? (
                  <div className="card-luxury p-6 text-white/55">{t('shop.admin.noRequests')}</div>
                ) : null}
                {state.requests.map((request) => (
                  <div key={request.id} className="card-luxury p-6">
                    <p className="text-white font-semibold">{request.name}</p>
                    <p className="mt-2 text-white/55">
                      {request.phone} • {request.vin}
                    </p>
                    <p className="mt-3 text-white/70">{request.comment}</p>
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                      <button
                        className="btn-outline"
                        onClick={() =>
                          confirmDelete('Удалить заявку?', () => {
                            deleteRequest(request.id);
                            pushNotice(t('shop.admin.requestDeleted'));
                          })
                        }
                      >
                        {t('shop.actions.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'seo' ? (
              <div className="grid gap-4">
                <button
                  className="btn-outline"
                  onClick={() =>
                    saveSeoPage({
                      id: `seo-${Date.now()}`,
                      slug: `/hongqi-parts/page-${Date.now()}`,
                      title: emptyLocale(),
                      description: emptyLocale(),
                      h1: emptyLocale(),
                    })
                  }
                >
                  {t('shop.admin.addSeoPage')}
                </button>
                {state.seoPages.map((page) => (
                  <SeoEditor
                    key={page.id}
                    page={page}
                    onSave={(item) => {
                      confirmSave(() => {
                        saveSeoPage(item);
                        notifySaved();
                      });
                    }}
                    onDelete={(id) =>
                      confirmDelete('Удалить SEO-страницу?', () => deleteSeoPage(id))
                    }
                  />
                ))}
              </div>
            ) : null}

            {tab === 'import' ? <ShopImportSection /> : null}
          </main>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <div className="min-h-screen bg-luxury-black pt-24">{content}</div>;
};

const WarehouseSection = ({
  products,
  inventoryMovements,
  lowStock,
  inventorySummary,
  onAddInventoryMovement,
}: {
  products: ProductItem[];
  inventoryMovements: { id: string; productId: string; date: string; operation: 'income' | 'expense'; reason?: string; quantity: number; comment: string }[];
  lowStock: ProductItem[];
  inventorySummary: {
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    totalMovements: number;
  };
  onAddInventoryMovement: (payload: Omit<{ id: string; productId: string; date: string; operation: 'income' | 'expense'; reason?: string; quantity: number; comment: string }, 'id' | 'date'>) => void;
}) => {
  const { t, i18n } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? '');
  const [movementOperation, setMovementOperation] = useState<'income' | 'expense'>('income');
  const [movementReason, setMovementReason] = useState('restock');
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [movementComment, setMovementComment] = useState('');
  const [movementFilter, setMovementFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [movementQuery, setMovementQuery] = useState('');

  useEffect(() => {
    if (!selectedProductId && products[0]?.id) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const movementReasonOptions =
    movementOperation === 'income'
      ? [
          { value: 'restock', label: t('shop.admin.reasonRestock') },
          { value: 'return', label: t('shop.admin.reasonReturn') },
          { value: 'adjustment', label: t('shop.admin.reasonAdjustment') },
        ]
      : [
          { value: 'writeoff', label: t('shop.admin.reasonWriteoff') },
          { value: 'order', label: t('shop.admin.reasonOrder') },
          { value: 'reservation', label: t('shop.admin.reasonReservation') },
        ];

  useEffect(() => {
    setMovementReason(movementReasonOptions[0]?.value ?? '');
  }, [movementOperation]);

  const filteredMovements = useMemo(() => {
    const query = movementQuery.trim().toLowerCase();
    return inventoryMovements.filter((movement) => {
      const product = products.find((item) => item.id === movement.productId);
      const productName = localizedText(
        product?.name ?? { ru: movement.productId, en: movement.productId, kz: movement.productId },
        { lng: i18n.language }
      ).toLowerCase();
      const sku = product?.article.toLowerCase() ?? '';
      const operationMatch = movementFilter === 'all' || movement.operation === movementFilter;
      const queryMatch =
        !query ||
        productName.includes(query) ||
        sku.includes(query) ||
        movement.comment.toLowerCase().includes(query) ||
        (movement.reason ?? '').toLowerCase().includes(query);
      return operationMatch && queryMatch;
    });
  }, [i18n.language, inventoryMovements, movementFilter, movementQuery, products]);

  const exportMovements = () => {
    const csvEscape = (value: string) => value.split('"').join('""');
    const rows = filteredMovements.map((movement) => {
      const product = products.find((item) => item.id === movement.productId);
      const productName = localizedText(
        product?.name ?? { ru: movement.productId, en: movement.productId, kz: movement.productId },
        { lng: i18n.language }
      );
      return [
        new Date(movement.date).toLocaleString(),
        `"${csvEscape(String(productName))}"`,
        `"${csvEscape(product?.article ?? '')}"`,
        movement.operation,
        movement.reason ?? '',
        String(movement.quantity),
        `"${csvEscape(movement.comment)}"`,
      ].join(',');
    });
    const csv = [
      ['date', 'product', 'article', 'operation', 'reason', 'quantity', 'comment'].join(','),
      ...rows,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'warehouse-movements.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('shop.admin.summarySku'), value: inventorySummary.totalProducts },
          { label: t('shop.admin.summaryTotalStock'), value: inventorySummary.totalStock },
          { label: t('shop.admin.summaryLowStock'), value: inventorySummary.lowStockCount },
          { label: t('shop.admin.summaryMovements'), value: inventorySummary.totalMovements },
        ].map((item) => (
          <div key={item.label} className="card-luxury p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-luxury p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">{t('shop.admin.manualMovement')}</h2>
            <p className="text-sm text-white/50">{t('shop.admin.manualMovementHint')}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {localizedText(product.name, { lng: i18n.language })} ({product.article})
                </option>
              ))}
            </Select>
            <Select
              value={movementOperation}
              onChange={(event) => setMovementOperation(event.target.value as 'income' | 'expense')}
            >
              <option value="income">{t('shop.admin.operationIncome')}</option>
              <option value="expense">{t('shop.admin.operationExpense')}</option>
            </Select>
            <Select value={movementReason} onChange={(event) => setMovementReason(event.target.value)}>
              {movementReasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              value={movementQuantity}
              onChange={(event) => setMovementQuantity(Math.max(1, Number(event.target.value) || 1))}
              placeholder={t('shop.admin.quantity')}
            />
            <div className="md:col-span-2">
              <Textarea
                value={movementComment}
                onChange={(event) => setMovementComment(event.target.value)}
                placeholder={t('shop.admin.manualCommentPlaceholder')}
                className="min-h-[110px]"
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              onClick={() =>
                onAddInventoryMovement({
                  productId: selectedProductId,
                  operation: movementOperation,
                  reason: movementReason,
                  quantity: movementQuantity,
                  comment: movementComment || movementReason,
                })
              }
            >
              {t('shop.admin.applyMovement')}
            </button>
          </div>
        </div>

        <div className="card-luxury p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">{t('shop.admin.lowStock')}</h2>
            <p className="text-sm text-white/50">{t('shop.admin.lowStockHint')}</p>
          </div>
          <div className="mt-4 grid gap-3">
            {lowStock.length === 0 ? (
              <div className="border border-white/10 bg-white/[0.02] p-4 text-white/55">
                {t('shop.admin.allStockOk')}
              </div>
            ) : null}
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 border border-white/10 bg-white/[0.02] p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div>
                  <p className="text-lg font-semibold text-white">
                    {localizedText(product.name, { lng: i18n.language })}
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/35">
                    {product.article}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-14 text-center text-white/55">{product.stock}</span>
                  <button
                    className="btn-outline px-4 py-2"
                    onClick={() =>
                      onAddInventoryMovement({
                        productId: product.id,
                        operation: 'income',
                        reason: 'restock',
                        quantity: 1,
                        comment: 'Manual restock',
                      })
                    }
                  >
                    +1
                  </button>
                  <button
                    className="btn-outline px-4 py-2"
                    onClick={() =>
                      onAddInventoryMovement({
                        productId: product.id,
                        operation: 'expense',
                        reason: 'writeoff',
                        quantity: 1,
                        comment: 'Manual write-off',
                      })
                    }
                  >
                    -1
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-luxury p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{t('shop.admin.movementsHistory')}</h2>
            <p className="mt-2 text-sm text-white/50">{t('shop.admin.movementsHistoryHint')}</p>
          </div>
          <button className="btn-outline px-5 py-3 text-[11px]" onClick={exportMovements}>
            {t('shop.admin.exportCsv')}
          </button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            value={movementQuery}
            onChange={(event) => setMovementQuery(event.target.value)}
            placeholder={t('shop.admin.movementSearch')}
          />
          <Select
            value={movementFilter}
            onChange={(event) => setMovementFilter(event.target.value as 'all' | 'income' | 'expense')}
          >
            <option value="all">{t('shop.admin.allOperations')}</option>
            <option value="income">{t('shop.admin.operationIncome')}</option>
            <option value="expense">{t('shop.admin.operationExpense')}</option>
          </Select>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-3">{t('shop.admin.date')}</th>
                <th className="pb-3">{t('shop.admin.productColumn')}</th>
                <th className="pb-3">{t('shop.product.article')}</th>
                <th className="pb-3">{t('shop.admin.operation')}</th>
                <th className="pb-3">{t('shop.admin.reason')}</th>
                <th className="pb-3">{t('shop.admin.quantity')}</th>
                <th className="pb-3">{t('shop.forms.comment')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement) => {
                const product = products.find((item) => item.id === movement.productId);
                return (
                  <tr key={movement.id} className="border-t border-white/10 text-white/70">
                    <td className="py-3">{new Date(movement.date).toLocaleString()}</td>
                    <td className="py-3">
                      {localizedText(
                        product?.name ?? { ru: movement.productId, en: movement.productId, kz: movement.productId },
                        { lng: i18n.language }
                      )}
                    </td>
                    <td className="py-3">{product?.article ?? '—'}</td>
                    <td className="py-3">
                      {movement.operation === 'income'
                        ? t('shop.admin.operationIncome')
                        : t('shop.admin.operationExpense')}
                    </td>
                    <td className="py-3">{t(`shop.admin.reasonMap.${movement.reason ?? 'adjustment'}`)}</td>
                    <td className="py-3">{movement.quantity}</td>
                    <td className="py-3">{movement.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMovements.length === 0 ? (
            <div className="mt-4 border border-white/10 bg-white/[0.02] p-4 text-white/55">
              {t('shop.admin.noMovements')}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const ShopCatalogResolverPage = () => {
  const { slug } = useParams();
  const { state } = useShop();
  const isCategory = state.categories.some((item) => item.slug === slug);

  return isCategory ? <ShopCatalogPage /> : <ShopProductPage />;
};

const ShopImportSection = () => {
  const { t } = useTranslation();
  const { loadAdminData } = useShop();
  const [report, setReport] = useState<Array<{ key: string; count: number }>>([]);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setError('');
    try {
      const payload = await parseShopWorkbook(file);
      const summary = summarizeImportPayload(payload);

      for (const model of payload.models) {
        await shopAdminApi.upsert('models', model.id, model);
      }
      for (const category of payload.categories) {
        await shopAdminApi.upsert('categories', category.id, category);
      }
      for (const product of payload.products) {
        await shopAdminApi.upsert('products', product.id, product);
      }
      for (const store of payload.stores) {
        await shopAdminApi.upsert('stores', store.id, store);
      }
      for (const page of payload.seoPages) {
        await shopAdminApi.upsert('seoPages', page.id, page);
      }

      await loadAdminData();
      setReport(summary);
    } catch (nextError) {
      setError((nextError as Error).message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="card-luxury p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-luxury-burgundy">
          {t('shop.admin.importEyebrow')}
        </p>
        <h3 className="mt-4 text-2xl font-semibold text-white">{t('shop.admin.importTitle')}</h3>
        <p className="mt-4 max-w-3xl text-white/60">{t('shop.admin.importDescription')}</p>
        <div className="mt-6 rounded-sm border border-white/10 bg-white/[0.02] p-5">
          <p className="text-sm font-medium text-white">{t('shop.admin.importSheetsTitle')}</p>
          <p className="mt-3 text-sm leading-7 text-white/55">{t('shop.admin.importSheetsHint')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['models', 'categories', 'products', 'stores', 'seoPages'].map((item) => (
              <span
                key={item}
                className="border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/65"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <label className="mt-6 flex cursor-pointer items-center justify-center border border-dashed border-white/20 bg-white/[0.02] px-6 py-10 text-center transition hover:border-luxury-burgundy/60 hover:bg-luxury-burgundy/5">
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void handleImport(file);
              event.currentTarget.value = '';
            }}
          />
          <span className="text-sm leading-7 text-white/75">
            {isImporting ? t('shop.admin.importing') : t('shop.admin.importCta')}
          </span>
        </label>
        {error ? <div className="mt-4 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      </div>

      {report.length ? (
        <div className="card-luxury p-6">
          <h4 className="text-lg font-semibold text-white">{t('shop.admin.importResult')}</h4>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {report.map((item) => (
              <div key={item.key} className="border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{item.key}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
