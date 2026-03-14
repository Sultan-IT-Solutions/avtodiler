import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPriceKzt } from '../utils/formatPrice';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { SITE_IMAGES } from '../data/siteImages';
import { ArrowRight, SlidersHorizontal, X, Search, MessageCircle, Phone } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { publicApi } from '../utils/publicApi';
import { EmptyState } from '../components/EmptyState';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { VisualInlineEditLink } from '../components/VisualInlineEditLink';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
  InlineCmsTextarea,
} from '../components/InlineCmsModal';
import type { AdminCar } from '../types/admin';
import { buildAdminUrl } from '../utils/visualAdmin';
import { carsApi } from '../utils/adminApi';

type SortOption = 'newest' | 'priceHigh' | 'priceLow';

const HEADING_FONT = { fontFamily: "'Montserrat', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'Space Grotesk', monospace" };

/** Каталог только Hongqi — данные с [hongqi.ru](https://hongqi.ru) */
export const Catalog = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loadError, setLoadError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .cars()
      .then((items) => {
        if (cancelled) return;
        setCars(items as unknown as AdminCar[]);
        setLoadError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError((err as Error)?.message ?? String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [yearRange, setYearRange] = useState<[number, number]>([2020, 2030]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<SortOption>('priceLow');
  const [showFilters, setShowFilters] = useState(false);
  const [editingCar, setEditingCar] = useState<AdminCar | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => {
    if (!heroTextRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 1.1, delay: 0.2 },
      )
        .fromTo(
          '.hero-line',
          { opacity: 0, y: 100, skewY: 4 },
          { opacity: 1, y: 0, skewY: 0, duration: 1.4, stagger: 0.12 },
          '-=0.7',
        )
        .fromTo(
          '.hero-meta',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=0.5',
        );
    }, heroTextRef);
    return () => ctx.revert();
  }, []);

  const filteredCars = useMemo(() => {
    const toNumberOrNull = (value: unknown): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string') {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    let filtered = cars.filter((car) => {
      const year = toNumberOrNull((car as unknown as { year?: unknown }).year);
      const price = toNumberOrNull((car as unknown as { price?: unknown }).price);

      const yearMatch =
        year == null || (year >= yearRange[0] && year <= yearRange[1]);
      const priceMatch =
        price == null || (price >= priceRange[0] && price <= priceRange[1]);

      return yearMatch && priceMatch;
    });

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case 'priceHigh':
        filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'priceLow':
        filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
    }
    return filtered;
  }, [cars, yearRange, priceRange, sortBy]);

  const hasCars = filteredCars.length > 0;

  const resetFilters = () => {
    setYearRange([2020, 2030]);
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters =
    yearRange[0] !== 2020 ||
    yearRange[1] !== 2030 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 10000000;

  const formatPrice = (price: number) => formatPriceKzt(price);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: t('catalog.sortNewest') },
    { value: 'priceHigh', label: t('catalog.sortPriceHigh') },
    { value: 'priceLow', label: t('catalog.sortPriceLow') },
  ];

  return (
    <div className="bg-luxury-black min-h-screen">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[500px] overflow-hidden"
      >
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src={SITE_IMAGES.hero}
            alt="Каталог Hongqi"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = SITE_IMAGES.philosophy; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-luxury-black/30 to-luxury-black" />
        </motion.div>

        <motion.div
          ref={heroTextRef}
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-16 lg:pb-24"
        >
          <div className="hero-eyebrow flex items-center gap-4 mb-8 opacity-0">
            <div className="w-16 h-px bg-luxury-burgundy" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">
              {t('catalog.subtitle')}
            </span>
          </div>

          <div className="overflow-hidden mb-1">
            <h1
              className="hero-line text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase opacity-0"
              style={HEADING_FONT}
            >
              {t('catalog.title')}
            </h1>
          </div>
          <div className="overflow-hidden">
            <span
              className="hero-line block text-[clamp(28px,4vw,56px)] font-bold leading-[1] tracking-[-0.03em] text-white/30 uppercase opacity-0"
              style={HEADING_FONT}
            >
              {t('catalogPage.hero.subline')}
            </span>
          </div>

          <div className="hero-meta mt-10 opacity-0 flex items-center gap-3">
            <span
              className="text-white/50 text-sm font-light"
              style={MONO_FONT}
            >
              {String(filteredCars.length).padStart(2, '0')}
            </span>
            <div className="w-6 h-px bg-white/20" />
            <span className="text-white/30 text-sm font-light">
              {t('catalogPage.carsCount', { count: filteredCars.length })}
            </span>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Каталог автомобилей"
          description="Быстрый переход к редактированию автомобилей и SEO каталога."
          actions={[
            { label: 'Автомобили', href: buildAdminUrl('cars'), kind: 'primary' },
            { label: 'SEO', href: buildAdminUrl('seo') },
          ]}
        />
      </section>

      {/* MAIN */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          {loadError && (
            <div className="mb-6 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Ошибка загрузки автомобилей: {loadError}
            </div>
          )}

          {!hasCars && !loadError && (
            <div className="mb-10">
              <EmptyState />
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Sticky sidebar desktop */}
            <aside className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="sticky top-28">
                <div className="bg-luxury-elevated border border-white/5 p-8">
                  <div className="flex items-center justify-between mb-10">
                    <h3
                      className="text-[11px] uppercase tracking-[0.25em] text-white"
                      style={HEADING_FONT}
                    >
                      {t('catalog.filters')}
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy hover:text-luxury-burgundyHover transition-colors duration-400"
                      >
                        {t('catalog.reset')}
                      </button>
                    )}
                  </div>

                  <div>
                    <h4
                      className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-6"
                      style={HEADING_FONT}
                    >
                      {t('catalog.sort')}
                    </h4>
                    <div className="space-y-3">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={`block w-full text-left text-sm font-light py-1.5 transition-all duration-400 ${
                            sortBy === opt.value
                              ? 'text-white pl-4 border-l border-luxury-burgundy'
                              : 'text-white/40 hover:text-white/60 pl-0'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Consultation Section */}
                <div className="mt-6 bg-gradient-to-br from-luxury-elevated to-luxury-surface border border-white/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-px bg-luxury-red" />
                    <span className="text-micro uppercase tracking-ultra text-luxury-red font-semibold">
                      {t('catalogPage.consultation.eyebrow')}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 font-light mb-6 leading-relaxed">
                    {t('catalogPage.consultation.text')}
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/77753813839?text=Здравствуйте!%20Хочу%20получить%20консультацию%20по%20автомобилям%20Hongqi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full px-4 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-400"
                    >
                      <MessageCircle size={16} strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-luxury font-semibold">WhatsApp</span>
                    </a>
                    <a
                      href="tel:+77753813839"
                      className="group w-full px-4 py-3 bg-luxury-burgundy text-white flex items-center justify-center gap-2 hover:bg-luxury-burgundyHover hover:shadow-[0_0_25px_rgba(200,16,46,0.4)] transition-all duration-400"
                    >
                      <Phone size={16} strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-luxury font-semibold">{t('catalogPage.consultation.call')}</span>
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile filter toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(true)}
                className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 hover:border-white/20 bg-luxury-elevated transition-all duration-400"
              >
                <SlidersHorizontal size={16} className="text-white/60" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                  {t('catalog.filters')}
                </span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-luxury-burgundy" />
                )}
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={filteredCars.length}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.35 }}
                      className="text-[32px] font-bold text-white leading-none"
                      style={MONO_FONT}
                    >
                      {String(filteredCars.length).padStart(2, '0')}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-white/40 font-light text-sm">
                    {t('catalogPage.carsCount', { count: filteredCars.length })}
                  </span>
                </div>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={resetFilters}
                    className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy hover:text-luxury-burgundyHover transition-colors"
                  >
                    {t('catalog.reset')}
                  </motion.button>
                )}
              </div>

              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCars.map((car, index) => (
                    <CatalogCard
                      key={car.id}
                      car={car}
                      index={index}
                      formatPrice={formatPrice}
                      onEdit={() => setEditingCar(car)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredCars.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-32"
                >
                  <div className="w-20 h-20 mx-auto mb-8 border border-white/10 rounded-full flex items-center justify-center">
                    <Search size={28} className="text-white/20" />
                  </div>
                  <h3
                    className="text-xl text-white/60 mb-3 font-bold uppercase tracking-[-0.03em]"
                    style={HEADING_FONT}
                  >
                    {t('catalogPage.empty.title')}
                  </h3>
                  <p className="text-white/30 font-light mb-8 text-sm max-w-md mx-auto">
                    {t('catalogPage.empty.text')}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-8 py-3 border border-white/10 hover:border-luxury-burgundy text-white/60 hover:text-white transition-all duration-400 text-[11px] uppercase tracking-[0.25em]"
                  >
                    {t('catalog.reset')}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE FILTER MODAL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed inset-0 z-50 bg-luxury-black overflow-y-auto"
          >
            <div className="container mx-auto px-6 py-24">
              <div className="flex justify-between items-center mb-12">
                <h3
                  className="text-[clamp(24px,4vw,36px)] font-bold text-white uppercase tracking-[-0.03em]"
                  style={HEADING_FONT}
                >
                  {t('catalog.filters')}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-12 h-12 border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-10">
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-5">
                    {t('catalog.sort')}
                  </h4>
                  <div className="space-y-3">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`block w-full text-left text-base font-light py-2 transition-all duration-400 ${
                          sortBy === opt.value
                            ? 'text-white pl-5 border-l-2 border-luxury-burgundy'
                            : 'text-white/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-white/5">
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-4 border border-white/10 text-white/60 text-[11px] uppercase tracking-[0.25em] hover:border-white/20 transition-all duration-400"
                  >
                    {t('catalog.reset')}
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-4 bg-luxury-burgundy text-white text-[11px] uppercase tracking-[0.25em] hover:bg-luxury-burgundyHover transition-colors duration-400"
                  >
                    {t('catalogPage.filters.apply')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactFormSection />
      <Footer />

      {editingCar ? (
        <InlineCmsModal
          title="Редактирование автомобиля"
          onClose={() => setEditingCar(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  await carsApi.upsert(editingCar);
                  setCars((current) => current.map((item) => (item.id === editingCar.id ? editingCar : item)));
                  setEditingCar(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={async () => {
                  if (!window.confirm('Удалить автомобиль?')) return;
                  await carsApi.remove(editingCar.id);
                  setCars((current) => current.filter((item) => item.id !== editingCar.id));
                  setEditingCar(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsLocaleFields
            label="Название"
            value={editingCar.title}
            onChange={(title) => setEditingCar({ ...editingCar, title })}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingCar.brand}
              onChange={(brand) => setEditingCar({ ...editingCar, brand })}
              placeholder="Бренд"
            />
            <InlineCmsInput
              value={editingCar.modelDisplay ?? editingCar.model}
              onChange={(modelDisplay) => setEditingCar({ ...editingCar, modelDisplay, model: modelDisplay })}
              placeholder="Модель"
            />
            <InlineCmsInput
              value={editingCar.year}
              onChange={(year) => setEditingCar({ ...editingCar, year: Number(year) || 0 })}
              placeholder="Год"
              type="number"
            />
            <InlineCmsInput
              value={editingCar.price}
              onChange={(price) => setEditingCar({ ...editingCar, price: Number(price) || 0 })}
              placeholder="Цена"
              type="number"
            />
            <InlineCmsInput
              value={editingCar.availability}
              onChange={(availability) => setEditingCar({ ...editingCar, availability })}
              placeholder="Наличие"
            />
            <InlineCmsInput
              value={editingCar.images[0] ?? ''}
              onChange={(image) => setEditingCar({ ...editingCar, images: [image, ...editingCar.images.slice(1)] })}
              placeholder="URL главного изображения"
            />
          </div>
          <InlineCmsTextarea
            value={editingCar.description.ru}
            onChange={(ru) => setEditingCar({ ...editingCar, description: { ...editingCar.description, ru } })}
            placeholder="Описание RU"
          />
        </InlineCmsModal>
      ) : null}
    </div>
  );
};


const CatalogCard = ({
  car,
  index,
  formatPrice,
  onEdit,
}: {
  car: AdminCar;
  index: number;
  formatPrice: (p: number) => string;
  onEdit: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      transition={{
        duration: 1,
        delay: (index % 2) * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <VisualInlineEditLink onClick={onEdit} label="Автомобиль" className="right-5 top-5" />
      <Link to={`/car/${car.id}`} className="group block">
        <div className="bg-luxury-elevated border border-white/5 overflow-hidden hover:border-luxury-red/30 transition-all duration-600">
          {/* Image Section */}
          <div className="relative aspect-[16/9] overflow-hidden bg-luxury-surface">
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-luxury-black/20 to-transparent" />

            {/* Availability Badge */}
            {car.availability && (
              <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-white font-semibold">
                  {car.availability === 'inStock'
                    ? t('availability.inStock')
                    : car.availability === 'incoming'
                      ? t('availability.incoming')
                      : car.availability === 'preOrder'
                        ? t('availability.preOrder')
                        : car.availability}
                </span>
              </div>
            )}

            {/* Quick specs on hover */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center justify-between text-xs text-white/90 bg-luxury-black/70 backdrop-blur-md px-4 py-3 border border-white/10">
                <span className="font-light">{car.specifications.engine}</span>
                <span className="w-px h-4 bg-white/20" />
                <span className="font-light">{car.specifications.power}</span>
                <span className="w-px h-4 bg-white/20" />
                <span className="font-light">{car.specifications.acceleration}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Brand */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-micro uppercase tracking-ultra text-luxury-red font-semibold">
                {car.brand}
              </span>
              <span className="text-xs text-white/50 font-light" style={MONO_FONT}>
                {car.year}
              </span>
            </div>

            {/* Model Name — как на hongqi.ru */}
            <h3
              className="text-2xl font-bold text-white mb-2 group-hover:text-luxury-red transition-colors duration-400 uppercase tracking-tight"
              style={HEADING_FONT}
            >
              {car.modelDisplay ?? car.model}
            </h3>

            {/* Цена от + В кредит от 0,01% */}
            <div className="mb-4">
              <div className="text-lg text-white font-light tracking-tight" style={MONO_FONT}>
                {t('catalogPage.card.priceFrom', { price: formatPrice(car.price) })}
              </div>
              <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 border border-white/20 rounded-full">
                <span className="text-xs text-white/70">{t('catalogPage.card.creditLabel')}</span>
                <span className="text-xs font-medium text-white">{t('catalogPage.card.creditFrom')}</span>
              </div>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-2 text-sm text-white/50 mb-5 font-light">
              <span>{t('catalogPage.card.power', { value: car.specifications.power.split(' ')[0] })}</span>
              <span>•</span>
              <span>{car.specifications.acceleration}</span>
              <span>•</span>
              <span>{t('catalogPage.card.seats', { count: car.specifications.seats })}</span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-red group-hover:text-luxury-redBright transition-colors font-semibold">
                <span>{t('catalogPage.card.more')}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-red group-hover:text-luxury-redBright transition-colors font-semibold">
                <span>{t('catalogPage.card.more')}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
