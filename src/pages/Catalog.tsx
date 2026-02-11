import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { cars } from '../data/cars';
import { ArrowRight, SlidersHorizontal, X, Search } from 'lucide-react';
import { Footer } from '../components/Footer';

type SortOption = 'newest' | 'priceHigh' | 'priceLow';

const HEADING_FONT = { fontFamily: "'Montserrat', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'Space Grotesk', monospace" };

export const Catalog = () => {
  const { t } = useTranslation();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([2020, 2024]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
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

  const brands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, []);

  const filteredCars = useMemo(() => {
    let filtered = cars.filter((car) => {
      const brandMatch =
        selectedBrands.length === 0 || selectedBrands.includes(car.brand);
      const yearMatch = car.year >= yearRange[0] && car.year <= yearRange[1];
      const priceMatch =
        car.price >= priceRange[0] && car.price <= priceRange[1];
      return brandMatch && yearMatch && priceMatch;
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
  }, [selectedBrands, yearRange, priceRange, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand],
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setYearRange([2020, 2024]);
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    yearRange[0] !== 2020 ||
    yearRange[1] !== 2024 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 10000000;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
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
            src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=2400&q=90"
            alt="Catalog"
            className="w-full h-full object-cover"
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
              className="hero-line block text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white/20 uppercase opacity-0"
              style={HEADING_FONT}
            >
              Collection
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

                  <div className="mb-10">
                    <h4
                      className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-6"
                      style={HEADING_FONT}
                    >
                      {t('catalog.brand')}
                    </h4>
                    <div className="space-y-4">
                      {brands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div
                            className={`w-4 h-4 border flex items-center justify-center transition-all duration-400 ${
                              selectedBrands.includes(brand)
                                ? 'bg-luxury-burgundy border-luxury-burgundy'
                                : 'border-white/20 group-hover:border-white/40'
                            }`}
                            onClick={() => toggleBrand(brand)}
                          >
                            {selectedBrands.includes(brand) && (
                              <motion.svg
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                width="10"
                                height="8"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="1.5"
                                />
                              </motion.svg>
                            )}
                          </div>
                          <span className="text-sm text-white/40 group-hover:text-white transition-colors duration-400 font-light">
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5 mb-10" />

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
                    {t('catalog.brand')}
                  </h4>
                  <div className="space-y-4">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 border flex items-center justify-center transition-all duration-400 ${
                            selectedBrands.includes(brand)
                              ? 'bg-luxury-burgundy border-luxury-burgundy'
                              : 'border-white/20'
                          }`}
                          onClick={() => toggleBrand(brand)}
                        >
                          {selectedBrands.includes(brand) && (
                            <svg
                              width="12"
                              height="10"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-base text-white/40 font-light">
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

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

      <Footer />
    </div>
  );
};

/* ================================================================
   CATALOG CARD - hover zoom + info reveal + 3D tilt
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
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

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
      style={{ perspective: 900 }}
    >
      <Link to={`/car/${car.id}`} className="group block">
        <motion.div
          onMouseMove={(e) => {
            const rect = (
              e.currentTarget as HTMLDivElement
            ).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setTilt({ rx: (y - 0.5) * -8, ry: (x - 0.5) * 8 });
          }}
          onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
          animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="bg-luxury-elevated border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-600 will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />

            <div className="absolute inset-0 bg-luxury-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-600 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.25em] text-white/80">
                <span>{car.specifications.engine}</span>
                <span className="w-1 h-1 rounded-full bg-luxury-burgundy" />
                <span>{car.specifications.acceleration} 0-100</span>
              </div>
            </div>

            {car.featured && (
              <div className="absolute top-4 left-4 bg-luxury-burgundy/90 backdrop-blur-sm px-4 py-1.5">
                <span className="text-[11px] uppercase tracking-[0.25em] text-white">
                  Featured
                </span>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8">
            <div className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy mb-3">
              {car.brand}
            </div>
            <h3
              className="text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-luxury-burgundy transition-colors duration-400 uppercase tracking-[-0.03em]"
              style={HEADING_FONT}
            >
              {car.model}
            </h3>
            <div className="flex items-center gap-3 text-sm text-white/40 mb-6 font-light">
              <span style={MONO_FONT}>{car.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{car.specifications.power}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{car.specifications.drivetrain}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl text-white font-light" style={MONO_FONT}>
                {formatPrice(car.price)}
              </span>
              <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-luxury-burgundy group-hover:bg-luxury-burgundy/10 transition-all duration-400">
                <ArrowRight
                  size={16}
                  className="text-white/60 group-hover:text-luxury-burgundy transition-all duration-400 group-hover:translate-x-0.5"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
