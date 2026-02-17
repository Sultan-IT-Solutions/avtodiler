import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { cars } from '../data/cars';
import { SITE_IMAGES } from '../data/siteImages';
import { ArrowRight, SlidersHorizontal, X, Search, MessageCircle, Phone } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';

type SortOption = 'newest' | 'priceHigh' | 'priceLow';

const HEADING_FONT = { fontFamily: "'Montserrat', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'Space Grotesk', monospace" };

/** Каталог только Hongqi — данные с [hongqi.ru](https://hongqi.ru) */
export const Catalog = () => {
  const { t } = useTranslation();
  const [yearRange, setYearRange] = useState<[number, number]>([2020, 2030]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<SortOption>('priceLow');
  const [showFilters, setShowFilters] = useState(false);

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
    let filtered = cars.filter((car) => {
      const yearMatch = car.year >= yearRange[0] && car.year <= yearRange[1];
      const priceMatch =
        car.price >= priceRange[0] && car.price <= priceRange[1];
      return yearMatch && priceMatch;
    });

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price);
        break;
    }
    return filtered;
  }, [yearRange, priceRange, sortBy]);

  const resetFilters = () => {
    setYearRange([2020, 2030]);
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters =
    yearRange[0] !== 2020 ||
    yearRange[1] !== 2030 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 10000000;

  /** Цены в рублях, как на hongqi.ru */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

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
              Кроссоверы и седаны Hongqi
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
              {filteredCars.length === 1
                ? '\u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C'
                : '\u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439'}
            </span>
          </div>
        </motion.div>
      </section>

      {/* MAIN */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
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
                      Консультация
                    </span>
                  </div>
                  <p className="text-sm text-white/70 font-light mb-6 leading-relaxed">
                    Наши эксперты помогут подобрать идеальный автомобиль
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/77001234567?text=Здравствуйте!%20Хочу%20получить%20консультацию%20по%20автомобилям%20Hongqi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full px-4 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-400"
                    >
                      <MessageCircle size={16} strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-luxury font-semibold">WhatsApp</span>
                    </a>
                    <a
                      href="tel:+77001234567"
                      className="group w-full px-4 py-3 bg-luxury-burgundy text-white flex items-center justify-center gap-2 hover:bg-luxury-burgundyHover hover:shadow-[0_0_25px_rgba(200,16,46,0.4)] transition-all duration-400"
                    >
                      <Phone size={16} strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-luxury font-semibold">Позвонить</span>
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
                    {filteredCars.length === 1
                      ? '\u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C'
                      : '\u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439'}
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
                    {'\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B'}
                  </h3>
                  <p className="text-white/30 font-light mb-8 text-sm max-w-md mx-auto">
                    {'\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0444\u0438\u043B\u044C\u0442\u0440\u0430'}
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
                    {'\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactFormSection />
      <Footer />
    </div>
  );
};

/* ================================================================
   CATALOG CARD - Clean, modern design with availability badge
   ================================================================ */
const CatalogCard = ({
  car,
  index,
  formatPrice,
}: {
  car: (typeof cars)[0];
  index: number;
  formatPrice: (p: number) => string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      transition={{
        duration: 1,
        delay: (index % 2) * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
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
                  {car.availability}
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
                от {formatPrice(car.price)}
              </div>
              <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 border border-white/20 rounded-full">
                <span className="text-xs text-white/70">В кредит</span>
                <span className="text-xs font-medium text-white">от 0,01%</span>
              </div>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-2 text-sm text-white/50 mb-5 font-light">
              <span>{car.specifications.power.split(' ')[0]} л. с.</span>
              <span>•</span>
              <span>{car.specifications.acceleration}</span>
              <span>•</span>
              <span>{car.specifications.seats} мест</span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-red group-hover:text-luxury-redBright transition-colors font-semibold">
                <span>Подробнее</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-red group-hover:text-luxury-redBright transition-colors font-semibold">
                <span>Подробнее</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
