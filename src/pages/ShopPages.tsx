import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SITE_IMAGES } from '../data/siteImages';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { VisualInlineEditLink } from '../components/VisualInlineEditLink';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
  InlineCmsTextarea,
} from '../components/InlineCmsModal';
import { useShop } from '../context/ShopContext';
import type { CategoryItem, HongqiModel, OrderItem, ProductItem, SeoPage } from '../types/shop';
import { localizedText } from '../utils/localizedText';
import { isValidPhone } from '../utils/phone';
import { buildAdminUrl } from '../utils/visualAdmin';
import { shopAdminApi } from '../utils/shopApi';
import { parseShopWorkbook, summarizeImportPayload } from '../utils/shopImport';

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
                <div className="flex shrink-0 items-center gap-3">
                  <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {String(category.subcategories.length).padStart(2, '0')}
                  </span>
                  <ChevronDownIcon open={isOpen} />
                </div>
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
                      {category.subcategories.slice(0, 4).map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center gap-3 text-sm leading-6 text-white/60"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-luxury-burgundy" />
                          <span>{localizedText(subcategory.name, { lng: i18n.language })}</span>
                        </div>
                      ))}
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

const ShopAsyncState = ({ embedded = false }: { embedded?: boolean }) => {
  const { t } = useTranslation();
  const { isLoading, loadError } = useShop();

  if (!isLoading && !loadError) {
    return null;
  }

  return (
    <div
      className={`card-luxury ${embedded ? '' : 'mt-8'} p-6 text-white/65`}
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

const ProductCard = ({
  product,
  onEdit,
}: {
  product: ProductItem;
  onEdit?: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useShop();
  const name = localizedText(product.name, { lng: i18n.language });

  return (
    <article className="card-luxury relative flex h-full flex-col overflow-hidden">
      <VisualInlineEditLink
        to={onEdit ? undefined : buildAdminUrl('shop', 'products')}
        onClick={onEdit}
        label="Товар"
      />
      <Link to={`/hongqi-parts/${product.slug}`} className="block overflow-hidden">
        <SmartImage
          src={product.images[0]}
          alt={name}
          fallbackLabel={product.article}
          className="h-64 w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
          <span>{product.article}</span>
          <span className={product.stock > 0 ? 'text-white/75' : 'text-luxury-burgundy'}>
            {stockLabel(product.stock, t)}
          </span>
        </div>
        <Link
          to={`/hongqi-parts/${product.slug}`}
          className="mt-4 line-clamp-3 text-2xl font-semibold leading-tight text-white"
        >
          {name}
        </Link>
        <p className="mt-3 text-sm text-white/50">{product.oem}</p>
        <div className="mt-6 grid gap-2 text-sm text-white/60">
          <p>{product.manufacturer}</p>
          <p>{product.models.join(', ') || 'Hongqi'}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-8">
          <span className="text-2xl font-semibold text-white">{formatPrice(product.price)}</span>
          <button
            onClick={() => addToCart(product.id)}
            className="btn-primary px-5 py-3 text-[11px]"
            disabled={product.stock <= 0}
          >
            {t('shop.actions.addToCart')}
          </button>
        </div>
      </div>
    </article>
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

const Breadcrumbs = ({
  category,
  subcategory,
}: {
  category?: CategoryItem;
  subcategory?: CategoryItem['subcategories'][number];
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-white/40">
      <Link to="/">{t('nav.home')}</Link>
      <span>/</span>
      <Link to="/hongqi-parts">{t('shop.routes.shop')}</Link>
      {category ? (
        <>
          <span>/</span>
          <Link to={`/hongqi-parts/catalog/${category.slug}`}>
            {localizedText(category.name, { lng: i18n.language })}
          </Link>
        </>
      ) : null}
      {subcategory ? (
        <>
          <span>/</span>
          <span>{localizedText(subcategory.name, { lng: i18n.language })}</span>
        </>
      ) : null}
    </div>
  );
};

export const ShopHomePage = () => {
  const { t, i18n } = useTranslation();
  const {
    state,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveModel,
    deleteModel,
  } = useShop();
  const seoPage = useShopSeo('/hongqi-parts');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingModel, setEditingModel] = useState<HongqiModel | null>(null);

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
      <section className="relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0">
          <SmartImage
            src={SITE_IMAGES.hero}
            alt="Hongqi"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.55)_0%,rgba(5,5,5,0.88)_55%,rgba(5,5,5,0.98)_100%)]" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-20 sm:py-24 lg:px-16 lg:py-28">
          <div className="max-w-5xl">
            <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-luxury-burgundy">
              {t('shop.home.hero.eyebrow')}
            </p>
            <h1 className="text-[clamp(42px,7vw,88px)] font-display font-light leading-[0.98] text-white">
              {localizedText(seoPage?.h1 ?? { ru: t('shop.home.hero.title'), en: t('shop.home.hero.title'), kz: t('shop.home.hero.title') }, { lng: i18n.language })}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/60">
              {t('shop.home.hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/hongqi-parts/catalog" className="btn-primary">
                {t('shop.actions.goCatalog')}
              </Link>
              <Link to="/hongqi-parts/request" className="btn-outline">
                {t('shop.actions.pickByModel')}
              </Link>
              <Link to="/hongqi-parts/stores" className="btn-outline">
                {t('shop.stores.title')}
              </Link>
            </div>
          </div>
          <ShopAsyncState />
        </div>
      </section>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Главная страница каталога"
          description="Управление товарами, категориями, моделями, магазинами, заявками, заказами и SEO."
          actions={[
            { label: 'Товары', href: buildAdminUrl('shop', 'products'), kind: 'primary' },
            { label: 'Категории', href: buildAdminUrl('shop', 'categories') },
            { label: 'Модели', href: buildAdminUrl('shop', 'models') },
            { label: 'Магазины', href: buildAdminUrl('shop', 'stores') },
            { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
          ]}
        />
      </section>

      <section className="container mx-auto px-6 py-16 lg:px-16 lg:py-20">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
            {t('shop.home.models.eyebrow')}
          </p>
          <h2 className="mt-4 text-h2 text-white">{t('shop.home.models.title')}</h2>
        </div>
        <MobileModelPicker models={state.models} />
        <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-5">
          {state.models.map((model) => (
            <Link
              key={model.id}
              to={`/hongqi-parts/catalog?model=${encodeURIComponent(model.code)}`}
              className="card-luxury group relative overflow-hidden p-6"
            >
              <VisualInlineEditLink onClick={() => setEditingModel(model)} label="Модель" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,18,52,0.16),transparent_35%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex h-full min-h-[180px] flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xl font-semibold text-white transition-colors duration-300 group-hover:text-luxury-cream">
                    {localizedText(model.name, { lng: i18n.language })}
                  </p>
                  <span className="border border-luxury-burgundy/35 bg-luxury-burgundy/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-luxury-burgundy">
                    {model.code}
                  </span>
                </div>
                <div className="mt-8">
                  <div className="h-px w-full bg-gradient-to-r from-luxury-burgundy/50 via-white/10 to-transparent" />
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    {t('shop.home.models.link')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 lg:px-16 lg:py-20">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
            {t('shop.home.categories.eyebrow')}
          </p>
          <h2 className="mt-4 text-h2 text-white">{t('shop.home.categories.title')}</h2>
        </div>
        <MobileCategoryAccordion categories={state.categories} />
        <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
          {state.categories.map((category) => (
            <Link
              key={category.id}
              to={`/hongqi-parts/catalog/${category.slug}`}
              className="card-luxury group relative overflow-hidden p-6"
            >
              <VisualInlineEditLink onClick={() => setEditingCategory(category)} label="Категория" />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(168,18,52,0.16),transparent_38%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex h-full min-h-[240px] flex-col">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[26px] font-semibold leading-tight text-white">
                    {localizedText(category.name, { lng: i18n.language })}
                  </h3>
                  <span className="shrink-0 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {String(category.subcategories.length).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/60">
                  {localizedText(category.description, { lng: i18n.language })}
                </p>
                <div className="mt-auto pt-8">
                  <div className="grid gap-2">
                    {category.subcategories.slice(0, 3).map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center gap-3 text-sm text-white/50"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-luxury-burgundy" />
                        <span>{localizedText(subcategory.name, { lng: i18n.language })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 lg:px-16 lg:py-20">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
            {t('shop.home.popular.eyebrow')}
          </p>
          <h2 className="mt-4 text-h2 text-white">{t('shop.home.popular.title')}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {state.products.filter((product) => product.popular).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditingProduct(product)}
            />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 lg:px-16 lg:py-20">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="card-luxury p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
              {t('shop.home.advantages.eyebrow')}
            </p>
            <h2 className="mt-4 text-h2 text-white">{t('shop.home.advantages.title')}</h2>
            <div className="mt-8 grid gap-4">
              {['original', 'china', 'delivery', 'guarantee', 'payments'].map((key) => (
                <div
                  key={key}
                  className="grid gap-3 border border-white/10 bg-white/[0.02] p-4 text-white/75 sm:grid-cols-[24px_1fr] sm:items-start"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-luxury-burgundy/50 bg-luxury-burgundy/10 text-sm text-luxury-burgundy">
                    ✓
                  </span>
                  <span>{t(`shop.home.advantages.items.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-luxury p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
              {t('shop.home.steps.eyebrow')}
            </p>
            <h2 className="mt-4 text-h2 text-white">{t('shop.home.steps.title')}</h2>
            <div className="mt-8 grid gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="grid gap-3 border border-white/10 p-4 sm:grid-cols-[56px_1fr]">
                  <span className="text-lg text-luxury-burgundy">{String(index).padStart(2, '0')}</span>
                  <span className="text-white/75">{t(`shop.home.steps.items.${index}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20 lg:px-16 lg:pb-24">
        <div className="card-luxury overflow-hidden p-8 lg:p-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
            {t('shop.home.request.eyebrow')}
          </p>
          <h2 className="mt-4 text-h2 text-white">{t('shop.home.request.title')}</h2>
          <p className="mt-4 max-w-3xl text-white/60">{t('shop.home.request.subtitle')}</p>
          <QuickRequestForm />
        </div>
      </section>

      {editingModel ? (
        <InlineCmsModal
          title="Редактирование модели"
          onClose={() => setEditingModel(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveModel(editingModel);
                  setEditingModel(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить модель?')) return;
                  deleteModel(editingModel.id);
                  setEditingModel(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingModel.code}
              onChange={(code) => setEditingModel({ ...editingModel, code })}
              placeholder="Код модели"
            />
            <InlineCmsInput
              value={editingModel.slug}
              onChange={(slug) => setEditingModel({ ...editingModel, slug })}
              placeholder="Slug"
            />
          </div>
          <InlineCmsLocaleFields
            label="Название модели"
            value={editingModel.name}
            onChange={(name) => setEditingModel({ ...editingModel, name })}
          />
        </InlineCmsModal>
      ) : null}

      {editingCategory ? (
        <InlineCmsModal
          title="Редактирование категории"
          onClose={() => setEditingCategory(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveCategory(editingCategory);
                  setEditingCategory(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить категорию?')) return;
                  deleteCategory(editingCategory.id);
                  setEditingCategory(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingCategory.slug}
              onChange={(slug) => setEditingCategory({ ...editingCategory, slug })}
              placeholder="Slug категории"
            />
          </div>
          <InlineCmsLocaleFields
            label="Название категории"
            value={editingCategory.name}
            onChange={(name) => setEditingCategory({ ...editingCategory, name })}
          />
          <InlineCmsLocaleFields
            label="Описание категории"
            value={editingCategory.description}
            multiline
            onChange={(description) => setEditingCategory({ ...editingCategory, description })}
          />
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Подкатегории</p>
              <button
                type="button"
                className="btn-outline px-4 py-2 text-[11px]"
                onClick={() =>
                  setEditingCategory({
                    ...editingCategory,
                    subcategories: [
                      ...editingCategory.subcategories,
                      { id: `sub-${Date.now()}`, slug: '', name: emptyLocale() },
                    ],
                  })
                }
              >
                Добавить подкатегорию
              </button>
            </div>
            <div className="grid gap-4">
              {editingCategory.subcategories.map((subcategory, index) => (
                <div key={subcategory.id} className="border border-white/10 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-white/70">Подкатегория {index + 1}</p>
                    <button
                      type="button"
                      className="text-sm text-luxury-burgundy"
                      onClick={() =>
                        setEditingCategory({
                          ...editingCategory,
                          subcategories: editingCategory.subcategories.filter(
                            (item) => item.id !== subcategory.id
                          ),
                        })
                      }
                    >
                      Удалить
                    </button>
                  </div>
                  <InlineCmsInput
                    value={subcategory.slug}
                    onChange={(slug) =>
                      setEditingCategory({
                        ...editingCategory,
                        subcategories: editingCategory.subcategories.map((item) =>
                          item.id === subcategory.id ? { ...item, slug } : item
                        ),
                      })
                    }
                    placeholder="Slug подкатегории"
                  />
                  <div className="mt-3">
                    <InlineCmsLocaleFields
                      label="Название подкатегории"
                      value={subcategory.name}
                      onChange={(name) =>
                        setEditingCategory({
                          ...editingCategory,
                          subcategories: editingCategory.subcategories.map((item) =>
                            item.id === subcategory.id ? { ...item, name } : item
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </InlineCmsModal>
      ) : null}

      {editingProduct ? (
        <InlineCmsModal
          title="Редактирование товара"
          onClose={() => setEditingProduct(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveProduct(editingProduct);
                  setEditingProduct(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить товар?')) return;
                  deleteProduct(editingProduct.id);
                  setEditingProduct(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingProduct.slug}
              onChange={(slug) => setEditingProduct({ ...editingProduct, slug })}
              placeholder="Slug товара"
            />
            <InlineCmsInput
              value={editingProduct.article}
              onChange={(article) => setEditingProduct({ ...editingProduct, article })}
              placeholder="Артикул"
            />
            <InlineCmsInput
              value={editingProduct.oem}
              onChange={(oem) => setEditingProduct({ ...editingProduct, oem })}
              placeholder="OEM"
            />
            <InlineCmsInput
              value={editingProduct.manufacturer}
              onChange={(manufacturer) => setEditingProduct({ ...editingProduct, manufacturer })}
              placeholder="Производитель"
            />
            <InlineCmsInput
              type="number"
              value={editingProduct.price}
              onChange={(price) =>
                setEditingProduct({ ...editingProduct, price: Number(price) || 0 })
              }
              placeholder="Цена"
            />
            <InlineCmsInput
              type="number"
              value={editingProduct.stock}
              onChange={(stock) =>
                setEditingProduct({ ...editingProduct, stock: Number(stock) || 0 })
              }
              placeholder="Остаток"
            />
            <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
              <select
                value={editingProduct.categorySlug}
                onChange={(event) => {
                  const nextCategory = state.categories.find(
                    (category) => category.slug === event.target.value
                  );
                  setEditingProduct({
                    ...editingProduct,
                    categorySlug: event.target.value,
                    subcategorySlug: nextCategory?.subcategories[0]?.slug ?? '',
                  });
                }}
                className="h-12 w-full border border-white/10 bg-luxury-surface px-4 text-white"
              >
                {state.categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {localizedText(category.name, { lng: 'ru' })}
                  </option>
                ))}
              </select>
              <select
                value={editingProduct.subcategorySlug}
                onChange={(event) =>
                  setEditingProduct({ ...editingProduct, subcategorySlug: event.target.value })
                }
                className="h-12 w-full border border-white/10 bg-luxury-surface px-4 text-white"
              >
                {(state.categories.find((item) => item.slug === editingProduct.categorySlug)
                  ?.subcategories ?? []
                ).map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.slug}>
                    {localizedText(subcategory.name, { lng: 'ru' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <InlineCmsLocaleFields
            label="Название товара"
            value={editingProduct.name}
            onChange={(name) => setEditingProduct({ ...editingProduct, name })}
          />
          <InlineCmsLocaleFields
            label="Краткое описание"
            value={editingProduct.description}
            multiline
            onChange={(description) => setEditingProduct({ ...editingProduct, description })}
          />
          <InlineCmsLocaleFields
            label="SEO описание"
            value={editingProduct.seoText}
            multiline
            onChange={(seoText) => setEditingProduct({ ...editingProduct, seoText })}
          />
          <InlineCmsInput
            value={editingProduct.kaspiUrl ?? ''}
            onChange={(kaspiUrl) => setEditingProduct({ ...editingProduct, kaspiUrl })}
            placeholder="Kaspi URL"
          />
          <InlineCmsTextarea
            value={editingProduct.models.join(', ')}
            onChange={(models) =>
              setEditingProduct({
                ...editingProduct,
                models: models
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Модели через запятую"
            rows={3}
          />
          <InlineCmsTextarea
            value={editingProduct.images.join('\n')}
            onChange={(images) =>
              setEditingProduct({
                ...editingProduct,
                images: images
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="URL изображений, каждое с новой строки"
            rows={4}
          />
        </InlineCmsModal>
      ) : null}
    </div>
  );
};

export const ShopCatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { state, saveProduct, deleteProduct } = useShop();
  const location = useLocation();
  const { categorySlug, subcategorySlug } = useParams();
  const seoPage = useShopSeo('/hongqi-parts/catalog');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

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

  const category = state.categories.find((item) => item.slug === categorySlug);
  const subcategory = category?.subcategories.find((item) => item.slug === subcategorySlug);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const items = state.products.filter((product) => {
      const queryMatch =
        !q ||
        localizedText(product.name, { lng: i18n.language }).toLowerCase().includes(q) ||
        product.article.toLowerCase().includes(q) ||
        product.oem.toLowerCase().includes(q);
      const modelMatch = !model || product.models.includes(model);
      const categoryMatch = !categorySlug || product.categorySlug === categorySlug;
      const subcategoryMatch = !subcategorySlug || product.subcategorySlug === subcategorySlug;
      const availabilityMatch =
        availability === 'all' ||
        (availability === 'inStock' ? product.stock > 0 : product.stock === 0);
      const minPriceMatch = !minPrice || product.price >= Number(minPrice);
      const maxPriceMatch = !maxPrice || product.price <= Number(maxPrice);

      return (
        queryMatch &&
        modelMatch &&
        categoryMatch &&
        subcategoryMatch &&
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
    categorySlug,
    deferredQuery,
    i18n.language,
    maxPrice,
    model,
    minPrice,
    sort,
    state.products,
    subcategorySlug,
  ]);

  useEffect(() => {
    setPage(1);
  }, [availability, categorySlug, deferredQuery, maxPrice, minPrice, model, sort, subcategorySlug]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showSubcategoryFallback =
    !subcategory &&
    Boolean(category) &&
    filtered.length === 0 &&
    (category?.subcategories.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
      <section className="border-y border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]">
        <div className="container mx-auto px-6 py-14 lg:px-16 lg:py-16">
          <ShopSectionIntro
            eyebrow={t('shop.catalog.eyebrow')}
            title={
              subcategory
                ? localizedText(subcategory.name, { lng: i18n.language })
                : category
                  ? localizedText(category.name, { lng: i18n.language })
                  : localizedText(
                      seoPage?.h1 ?? {
                        ru: t('shop.catalog.title'),
                        en: t('shop.catalog.title'),
                        kz: t('shop.catalog.title'),
                      },
                      { lng: i18n.language }
                    )
            }
            subtitle={t('shop.catalog.subtitle')}
          />
          <Breadcrumbs category={category} subcategory={subcategory} />
          <ShopAsyncState />
        </div>
      </section>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Каталог запчастей"
          description="Редактирование каталога, категорий, товаров и SEO текущего раздела."
          actions={[
            { label: 'Товары', href: buildAdminUrl('shop', 'products'), kind: 'primary' },
            { label: 'Категории', href: buildAdminUrl('shop', 'categories') },
            { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
          ]}
        />
      </section>

      <section className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="card-luxury p-6">
              <div className="grid gap-5">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('shop.catalog.searchPlaceholder')}
                />
                <Select value={model} onChange={(event) => setModel(event.target.value)}>
                  <option value="">{t('shop.catalog.allModels')}</option>
                  {state.models.map((item) => (
                    <option key={item.id} value={item.code}>
                      {localizedText(item.name, { lng: i18n.language })}
                    </option>
                  ))}
                </Select>
                <Select
                  value={availability}
                  onChange={(event) =>
                    setAvailability(event.target.value as 'all' | 'inStock' | 'outOfStock')
                  }
                >
                  <option value="all">{t('shop.catalog.allAvailability')}</option>
                  <option value="inStock">{t('shop.stock.inStock')}</option>
                  <option value="outOfStock">{t('shop.stock.outOfStock')}</option>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder={t('shop.catalog.priceFrom')}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder={t('shop.catalog.priceTo')}
                  />
                </div>
                <Select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as 'popular' | 'priceAsc' | 'priceDesc')
                  }
                >
                  <option value="popular">{t('shop.catalog.sortPopular')}</option>
                  <option value="priceAsc">{t('shop.catalog.sortPriceAsc')}</option>
                  <option value="priceDesc">{t('shop.catalog.sortPriceDesc')}</option>
                </Select>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-white/55">{t('shop.catalog.found', { count: filtered.length })}</p>
              {(query || model || minPrice || maxPrice || availability !== 'all' || sort !== 'popular') ? (
                <button
                  className="btn-outline px-4 py-2 text-[11px]"
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
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => setEditingProduct(product)}
                />
              ))}
            </div>
            {showSubcategoryFallback ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {category?.subcategories.map((item) => (
                  <Link
                    key={item.id}
                    to={`/hongqi-parts/catalog/${category.slug}/${item.slug}`}
                    className="card-luxury group p-6"
                  >
                    <p className="text-[11px] uppercase tracking-[0.24em] text-luxury-burgundy">
                      {localizedText(category.name, { lng: i18n.language })}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      {localizedText(item.name, { lng: i18n.language })}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/55">
                      {t('shop.catalog.categoryFallback')}
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}
            {items.length === 0 && !showSubcategoryFallback ? (
              <div className="card-luxury mt-6 p-8 text-white/55">{t('shop.catalog.empty')}</div>
            ) : null}
            {pageCount > 1 ? (
              <div className="mt-10 flex flex-wrap gap-3">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
                  <button
                    key={value}
                    onClick={() => setPage(value)}
                    className={`h-11 w-11 border text-sm ${
                      safePage === value
                        ? 'border-luxury-burgundy bg-luxury-burgundy/10 text-white'
                        : 'border-white/15 text-white/60'
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

      {editingProduct ? (
        <InlineCmsModal
          title="Редактирование товара"
          onClose={() => setEditingProduct(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveProduct(editingProduct);
                  setEditingProduct(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить товар?')) return;
                  deleteProduct(editingProduct.id);
                  setEditingProduct(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsLocaleFields
            label="Название товара"
            value={editingProduct.name}
            onChange={(name) => setEditingProduct({ ...editingProduct, name })}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingProduct.article}
              onChange={(article) => setEditingProduct({ ...editingProduct, article })}
              placeholder="Артикул"
            />
            <InlineCmsInput
              value={editingProduct.oem}
              onChange={(oem) => setEditingProduct({ ...editingProduct, oem })}
              placeholder="OEM"
            />
            <InlineCmsInput
              type="number"
              value={editingProduct.price}
              onChange={(price) =>
                setEditingProduct({ ...editingProduct, price: Number(price) || 0 })
              }
              placeholder="Цена"
            />
            <InlineCmsInput
              type="number"
              value={editingProduct.stock}
              onChange={(stock) =>
                setEditingProduct({ ...editingProduct, stock: Number(stock) || 0 })
              }
              placeholder="Остаток"
            />
          </div>
          <InlineCmsLocaleFields
            label="Описание"
            value={editingProduct.description}
            multiline
            onChange={(description) => setEditingProduct({ ...editingProduct, description })}
          />
        </InlineCmsModal>
      ) : null}
    </div>
  );
};

export const ShopProductPage = () => {
  const { t, i18n } = useTranslation();
  const { state, addToCart, saveProduct, deleteProduct } = useShop();
  const { slug } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const product = state.products.find((item) => item.slug === slug);
  const category = state.categories.find((item) => item.slug === product?.categorySlug);
  const sameCategoryProducts = state.products
    .filter((item) => item.id !== product?.id && item.categorySlug === product?.categorySlug)
    .slice(0, 4);
  const similarProducts = state.products
    .filter((item) => {
      if (!product || item.id === product.id) return false;
      if (item.categorySlug === product.categorySlug) return false;
      return item.models.some((model) => product.models.includes(model));
    })
    .slice(0, 4);

  useEffect(() => {
    setActiveImage(0);
    setIsZoomOpen(false);
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
      <div className="min-h-screen bg-luxury-black pt-32">
        <div className="container mx-auto px-6 py-20 text-white/70 lg:px-16">
          {t('shop.product.notFound')}
        </div>
      </div>
    );
  }

  const productName = localizedText(product.name, { lng: i18n.language });

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <Breadcrumbs category={category} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <button
              type="button"
              className="block w-full overflow-hidden border border-white/10 bg-luxury-elevated text-left"
              onClick={() => setIsZoomOpen(true)}
            >
              <SmartImage
                src={product.images[activeImage]}
                alt={productName}
                className="h-[320px] w-full object-cover sm:h-[420px] xl:h-[560px]"
                fallbackLabel={productName}
              />
            </button>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden border ${
                    activeImage === index ? 'border-luxury-burgundy' : 'border-white/10'
                  }`}
                >
                  <SmartImage
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    className="h-24 w-full object-cover sm:h-28"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="card-luxury p-6 sm:p-8">
            <VisualInlineEditLink onClick={() => setEditingProduct(product)} label="Товар" />
            <p className="text-[11px] uppercase tracking-[0.24em] text-luxury-burgundy">
              {category ? localizedText(category.name, { lng: i18n.language }) : 'Hongqi Parts'}
            </p>
            <h1 className="mt-4 text-[clamp(30px,4vw,52px)] font-display font-light leading-[1.05] text-white">
              {productName}
            </h1>
            <div className="mt-6 grid gap-3 border-y border-white/10 py-6 text-sm text-white/65 sm:grid-cols-2">
              <p>
                {t('shop.product.article')}: <span className="text-white">{product.article}</span>
              </p>
              <p>
                {t('shop.product.oem')}: <span className="text-white">{product.oem}</span>
              </p>
              <p>
                {t('shop.product.manufacturer')}:{' '}
                <span className="text-white">{product.manufacturer}</span>
              </p>
              <p>
                {t('shop.product.availability')}:{' '}
                <span className="text-white">{stockLabel(product.stock, t)}</span>
              </p>
              <p className="sm:col-span-2">
                {t('shop.product.stock')}: <span className="text-white">{product.stock}</span>
              </p>
            </div>
            <p className="mt-8 text-3xl font-semibold text-white">{formatPrice(product.price)}</p>
            <p className="mt-4 text-base leading-7 text-white/70">
              {localizedText(product.description, { lng: i18n.language })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="btn-primary"
                onClick={() => addToCart(product.id)}
                disabled={product.stock <= 0}
              >
                {t('shop.actions.addToCart')}
              </button>
              {product.kaspiUrl ? (
                <a href={product.kaspiUrl} target="_blank" rel="noreferrer" className="btn-outline">
                  {t('shop.actions.buyKaspi')}
                </a>
              ) : null}
            </div>
            <p className="mt-5 text-sm text-white/45">{t('shop.product.zoomHint')}</p>
          </div>
        </div>

        <section className="mt-16 grid gap-8 xl:grid-cols-2">
          <div className="card-luxury p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
              {t('shop.product.characteristicsEyebrow')}
            </p>
            <h2 className="mt-4 text-h3 text-white">{t('shop.product.characteristics')}</h2>
            <div className="mt-8 overflow-hidden rounded-sm border border-white/10">
              {product.specs.map((spec) => (
                <div
                  key={spec.id}
                  className="grid grid-cols-1 border-b border-white/10 last:border-b-0 sm:grid-cols-2"
                >
                  <div className="bg-white/5 px-4 py-3 text-white/60">
                    {localizedText(spec.label, { lng: i18n.language })}
                  </div>
                  <div className="px-4 py-3 text-white">
                    {localizedText(spec.value, { lng: i18n.language })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-luxury overflow-hidden p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
              {t('shop.product.compatibilityEyebrow')}
            </p>
            <h2 className="mt-4 text-h3 text-white">{t('shop.product.compatibility')}</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="text-white/45">
                  <tr>
                    <th className="pb-3">{t('shop.product.table.model')}</th>
                    <th className="pb-3">{t('shop.product.table.year')}</th>
                    <th className="pb-3">{t('shop.product.table.engine')}</th>
                    <th className="pb-3">{t('shop.product.table.note')}</th>
                  </tr>
                </thead>
                <tbody>
                  {product.compatibility.map((item, index) => (
                    <tr
                      key={`${item.modelCode}-${index}`}
                      className="border-t border-white/10 text-white/75"
                    >
                      <td className="py-3">{item.modelCode}</td>
                      <td className="py-3">{item.year}</td>
                      <td className="py-3">{item.engine}</td>
                      <td className="py-3">{localizedText(item.note, { lng: i18n.language })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="card-luxury p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
              {t('shop.product.seoEyebrow')}
            </p>
            <h2 className="mt-4 text-h3 text-white">{t('shop.product.descriptionTitle')}</h2>
            <p className="mt-6 max-w-5xl text-base leading-7 text-white/70">
              {localizedText(product.seoText, { lng: i18n.language })}
            </p>
          </div>
        </section>

        {sameCategoryProducts.length ? (
          <section className="mt-16">
            <h2 className="text-h3 text-white">{t('shop.product.related')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {sameCategoryProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onEdit={() => setEditingProduct(item)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {similarProducts.length ? (
          <section className="mt-16">
            <h2 className="text-h3 text-white">
              {t('shop.product.similar')}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onEdit={() => setEditingProduct(item)}
                />
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
              className="absolute right-4 top-4 z-10 h-11 w-11 border border-white/15 bg-black/40 text-xl text-white"
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

      {editingProduct ? (
        <InlineCmsModal
          title="Редактирование товара"
          onClose={() => setEditingProduct(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveProduct(editingProduct);
                  setEditingProduct(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить товар?')) return;
                  deleteProduct(editingProduct.id);
                  setEditingProduct(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsLocaleFields
            label="Название товара"
            value={editingProduct.name}
            onChange={(name) => setEditingProduct({ ...editingProduct, name })}
          />
          <InlineCmsInput
            value={editingProduct.manufacturer}
            onChange={(manufacturer) => setEditingProduct({ ...editingProduct, manufacturer })}
            placeholder="Производитель"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              type="number"
              value={editingProduct.price}
              onChange={(price) =>
                setEditingProduct({ ...editingProduct, price: Number(price) || 0 })
              }
              placeholder="Цена"
            />
            <InlineCmsInput
              type="number"
              value={editingProduct.stock}
              onChange={(stock) =>
                setEditingProduct({ ...editingProduct, stock: Number(stock) || 0 })
              }
              placeholder="Остаток"
            />
          </div>
          <InlineCmsLocaleFields
            label="Описание"
            value={editingProduct.description}
            multiline
            onChange={(description) => setEditingProduct({ ...editingProduct, description })}
          />
        </InlineCmsModal>
      ) : null}
    </div>
  );
};

export const ShopCartPage = () => {
  const { t, i18n } = useTranslation();
  const { cart, getProduct, removeFromCart, updateCartQuantity, cartTotal, cartCount } = useShop();
  const subtotal = cartTotal;

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <ShopSectionIntro
          eyebrow={t('shop.cart.eyebrow', 'Shop cart')}
          title={t('shop.cart.title')}
          subtitle={t('shop.cart.subtitle', 'Проверьте состав заказа перед оформлением.')}
        />
        <VisualEditPanel
          title="Корзина"
          description="Быстрый переход к товарам, заказам и SEO страницы корзины."
          actions={[
            { label: 'Товары', href: buildAdminUrl('shop', 'products'), kind: 'primary' },
            { label: 'Заказы', href: buildAdminUrl('shop', 'orders') },
            { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
          ]}
          className="mt-8"
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
    </div>
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
      <div className="min-h-screen bg-luxury-black pt-32">
        <div className="container mx-auto px-6 py-20 text-white/70 lg:px-16">
          {t('shop.checkout.empty')}
        </div>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <VisualEditPanel
          title="Оформление заказа"
          description="Управление заказами, товарами и SEO checkout-сценария."
          actions={[
            { label: 'Заказы', href: buildAdminUrl('shop', 'orders'), kind: 'primary' },
            { label: 'Товары', href: buildAdminUrl('shop', 'products') },
            { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
          ]}
          className="mb-8"
        />
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
    </div>
  );
};

export const ShopStoresPage = () => {
  const { t, i18n } = useTranslation();
  const { state, saveStore, deleteStore } = useShop();
  const seoPage = useShopSeo('/hongqi-parts/stores');
  const [editingStore, setEditingStore] = useState<(typeof state.stores)[number] | null>(null);

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
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
        <VisualEditPanel
          title="Страница магазинов"
          description="Редактирование магазинов и SEO страницы."
          actions={[
            { label: 'Магазины', href: buildAdminUrl('shop', 'stores'), kind: 'primary' },
            { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
          ]}
          className="mt-8"
        />
        <ShopAsyncState />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {state.stores.map((store) => (
            <article key={store.id} className="card-luxury relative p-6">
              <VisualInlineEditLink onClick={() => setEditingStore(store)} label="Магазин" />
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

      {editingStore ? (
        <InlineCmsModal
          title="Редактирование магазина"
          onClose={() => setEditingStore(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveStore(editingStore);
                  setEditingStore(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить магазин?')) return;
                  deleteStore(editingStore.id);
                  setEditingStore(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingStore.city}
              onChange={(city) => setEditingStore({ ...editingStore, city })}
              placeholder="Город"
            />
            <InlineCmsInput
              value={editingStore.phone}
              onChange={(phone) => setEditingStore({ ...editingStore, phone })}
              placeholder="Телефон"
            />
          </div>
          <InlineCmsLocaleFields
            label="Название магазина"
            value={editingStore.name}
            onChange={(name) => setEditingStore({ ...editingStore, name })}
          />
          <InlineCmsLocaleFields
            label="Адрес"
            value={editingStore.address}
            multiline
            onChange={(address) => setEditingStore({ ...editingStore, address })}
          />
          <InlineCmsLocaleFields
            label="Часы работы"
            value={editingStore.hours}
            onChange={(hours) => setEditingStore({ ...editingStore, hours })}
          />
        </InlineCmsModal>
      ) : null}
    </div>
  );
};

export const ShopRequestPage = () => {
  const { t, i18n } = useTranslation();
  const seoPage = useShopSeo('/hongqi-parts/request');

  return (
    <div className="min-h-screen bg-luxury-black pt-24 sm:pt-28 lg:pt-32">
      <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-16">
        <VisualEditPanel
          title="Заявка на подбор"
          description="Управление входящими заявками, товарами и SEO страницы."
          actions={[
            { label: 'Заявки', href: buildAdminUrl('shop', 'requests'), kind: 'primary' },
            { label: 'Товары', href: buildAdminUrl('shop', 'products') },
            { label: 'SEO', href: buildAdminUrl('shop', 'seo') },
          ]}
          className="mb-8"
        />
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
    </div>
  );
};

const emptyLocale = () => ({ ru: '', en: '', kz: '' });

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
  const createDraft = (): ProductItem => ({
    id: `p-${Date.now()}`,
    slug: '',
    name: emptyLocale(),
    categorySlug: categories[0]?.slug ?? '',
    subcategorySlug: categories[0]?.subcategories[0]?.slug ?? '',
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
  const [draft, setDraft] = useState<ProductItem>(product ?? createDraft());

  useEffect(() => {
    setDraft(product ?? createDraft());
  }, [product]);

  const currentCategory = categories.find((category) => category.slug === draft.categorySlug);

  return (
    <div className="card-luxury p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          value={draft.slug}
          onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
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
          value={draft.categorySlug}
          onChange={(event) =>
            setDraft({
              ...draft,
              categorySlug: event.target.value,
              subcategorySlug:
                categories.find((category) => category.slug === event.target.value)?.subcategories[0]
                  ?.slug ?? '',
            })
          }
        >
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {localizedText(category.name, { lng: 'ru', fallbackLng: 'ru' })}
            </option>
          ))}
        </Select>
        <Select
          value={draft.subcategorySlug}
          onChange={(event) => setDraft({ ...draft, subcategorySlug: event.target.value })}
        >
          {(currentCategory?.subcategories ?? []).map((subcategory) => (
            <option key={subcategory.id} value={subcategory.slug}>
              {localizedText(subcategory.name, { lng: 'ru', fallbackLng: 'ru' })}
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
            placeholder={`${t('shop.admin.shortDescription')} ${locale.toUpperCase()}`}
          />
        ))}
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
  initialTab = 'products',
}: {
  embedded?: boolean;
  notify?: (message: string, actionLabel?: string, onAction?: () => void) => void;
  initialTab?: 'products' | 'categories' | 'models' | 'orders' | 'warehouse' | 'stores' | 'requests' | 'seo' | 'import';
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
  >(initialTab);
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

  useEffect(() => {
    if (!saveNotice) return;
    const timer = window.setTimeout(() => setSaveNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

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
                      saveProduct(item);
                      notifySaved();
                      setSelectedProductId(item.id);
                    });
                  }}
                  onDelete={(id) => {
                    confirmDelete('Удалить товар?', () => {
                      deleteProduct(id);
                      setSelectedProductId(state.products.find((product) => product.id !== id)?.id);
                    });
                  }}
                />
              </div>
            ) : null}

            {tab === 'categories' ? (
              <div className="grid gap-4">
                <button
                  className="btn-outline"
                  onClick={() =>
                    saveCategory({
                      id: `category-${Date.now()}`,
                      slug: `category-${Date.now()}`,
                      name: emptyLocale(),
                      description: emptyLocale(),
                      subcategories: [],
                    })
                  }
                >
                  {t('shop.admin.addCategory', 'Добавить категорию')}
                </button>
                {state.categories.map((category) => (
                  <div key={category.id} className="card-luxury p-6">
                    <div className="grid gap-4 lg:grid-cols-3">
                      {(['ru', 'en', 'kz'] as const).map((locale) => (
                        <Input
                          key={locale}
                          value={category.name[locale]}
                          onChange={(event) =>
                            saveCategory({
                              ...category,
                              name: { ...category.name, [locale]: event.target.value },
                            })
                          }
                        />
                      ))}
                    </div>
                    <div className="mt-4 grid gap-4">
                      {(['ru', 'en', 'kz'] as const).map((locale) => (
                        <Textarea
                          key={`category-description-${category.id}-${locale}`}
                          value={category.description[locale]}
                          onChange={(event) =>
                            saveCategory({
                              ...category,
                              description: {
                                ...category.description,
                                [locale]: event.target.value,
                              },
                            })
                          }
                          placeholder={`Описание ${locale.toUpperCase()}`}
                          className="min-h-[96px]"
                        />
                      ))}
                    </div>
                    <div className="mt-6 space-y-4">
                      {category.subcategories.map((subcategory, subIndex) => (
                        <div
                          key={subcategory.id}
                          className="border border-white/10 bg-white/[0.02] p-4"
                        >
                          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                            <Input
                              value={subcategory.slug}
                              onChange={(event) =>
                                saveCategory({
                                  ...category,
                                  subcategories: category.subcategories.map((item, itemIndex) =>
                                    itemIndex === subIndex
                                      ? { ...item, slug: event.target.value }
                                      : item
                                  ),
                                })
                              }
                              placeholder="Slug подкатегории"
                            />
                            <Input
                              value={subcategory.id}
                              onChange={(event) =>
                                saveCategory({
                                  ...category,
                                  subcategories: category.subcategories.map((item, itemIndex) =>
                                    itemIndex === subIndex
                                      ? { ...item, id: event.target.value }
                                      : item
                                  ),
                                })
                              }
                              placeholder="ID подкатегории"
                            />
                            <button
                              className="btn-outline justify-center px-4 py-3 text-[11px]"
                              onClick={() =>
                                confirmDelete('Удалить подкатегорию?', () =>
                                  saveCategory({
                                    ...category,
                                    subcategories: category.subcategories.filter(
                                      (_, itemIndex) => itemIndex !== subIndex
                                    ),
                                  })
                                )
                              }
                            >
                              {t('shop.actions.delete')}
                            </button>
                          </div>
                          <div className="mt-4 grid gap-4 lg:grid-cols-3">
                            {(['ru', 'en', 'kz'] as const).map((locale) => (
                              <Input
                                key={`${subcategory.id}-${locale}`}
                                value={subcategory.name[locale]}
                                onChange={(event) =>
                                  saveCategory({
                                    ...category,
                                    subcategories: category.subcategories.map((item, itemIndex) =>
                                      itemIndex === subIndex
                                        ? {
                                            ...item,
                                            name: {
                                              ...item.name,
                                              [locale]: event.target.value,
                                            },
                                          }
                                        : item
                                    ),
                                  })
                                }
                                placeholder={`Подкатегория ${locale.toUpperCase()}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        className="btn-outline"
                        onClick={() =>
                          saveCategory({
                            ...category,
                            subcategories: [
                              ...category.subcategories,
                              {
                                id: `subcategory-${Date.now()}`,
                                slug: `subcategory-${category.subcategories.length + 1}`,
                                name: emptyLocale(),
                              },
                            ],
                          })
                        }
                      >
                        {t('shop.admin.addSubcategory')}
                      </button>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        className="btn-primary"
                        onClick={() => {
                          confirmSave(() => {
                            saveCategory(category);
                            notifySaved();
                          });
                        }}
                      >
                        {t('shop.actions.save')}
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() =>
                          confirmDelete('Удалить категорию?', () => deleteCategory(category.id))
                        }
                      >
                        {t('shop.actions.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'models' ? (
              <div className="grid gap-4">
                {state.models.map((model) => (
                  <div key={model.id} className="card-luxury p-6">
                    <div className="grid gap-4 lg:grid-cols-4">
                      <Input
                        value={model.code}
                        onChange={(event) => saveModel({ ...model, code: event.target.value })}
                      />
                      {(['ru', 'en', 'kz'] as const).map((locale) => (
                        <Input
                          key={locale}
                          value={model.name[locale]}
                          onChange={(event) =>
                            saveModel({
                              ...model,
                              name: { ...model.name, [locale]: event.target.value },
                            })
                          }
                        />
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        className="btn-primary"
                        onClick={() => {
                          confirmSave(() => {
                            saveModel(model);
                            notifySaved();
                          });
                        }}
                      >
                        {t('shop.actions.save')}
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() =>
                          confirmDelete('Удалить модель?', () => deleteModel(model.id))
                        }
                      >
                        {t('shop.actions.delete')}
                      </button>
                    </div>
                  </div>
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
                  <div key={store.id} className="card-luxury p-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Input
                        value={store.phone}
                        onChange={(event) => saveStore({ ...store, phone: event.target.value })}
                      />
                      <Input
                        value={store.city}
                        onChange={(event) => saveStore({ ...store, city: event.target.value })}
                      />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        className="btn-primary"
                        onClick={() => {
                          confirmSave(() => {
                            saveStore(store);
                            notifySaved();
                          });
                        }}
                      >
                        {t('shop.actions.save')}
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() =>
                          confirmDelete('Удалить магазин?', () => deleteStore(store.id))
                        }
                      >
                        {t('shop.actions.delete')}
                      </button>
                    </div>
                  </div>
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
