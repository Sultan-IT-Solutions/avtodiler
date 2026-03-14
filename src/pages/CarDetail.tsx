import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SITE_IMAGES } from '../data/siteImages';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { VisualInlineEditLink } from '../components/VisualInlineEditLink';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
  InlineCmsTextarea,
} from '../components/InlineCmsModal';
import { InlineSeoEditorModal } from '../components/InlineSeoEditorModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { publicApi } from '../utils/publicApi';
import { formatPriceKzt } from '../utils/formatPrice';
import type { AdminCar } from '../types/admin';
import { carsApi } from '../utils/adminApi';
import {
  Phone,
  MessageCircle,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  Play,
  Pause,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ===== ANIMATED NUMBER ===== */
const AnimatedNumber = ({ value, suffix = '', prefix = '' }: { value: string; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const numericPart = value.replace(/[^\d.]/g, '');

  useEffect(() => {
    if (!ref.current || !numericPart) return;
    const target = parseFloat(numericPart);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${target % 1 !== 0 ? obj.val.toFixed(1) : Math.round(obj.val)}${suffix}`;
        }
      },
    });
  }, [numericPart, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

/* ===== HORIZONTAL PROGRESS BAR ===== */
const SpecBar = ({ label, value, delay }: { label: string; value: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { width: '0%' },
      {
        width: '100%',
        duration: 1.5,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 95%', once: true },
      }
    );
  }, [delay]);

  return (
    <div className="group cursor-default">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors duration-500">
          {label}
        </span>
        <span className="text-lg text-white font-light tracking-tight">{value}</span>
      </div>
      <div className="h-px bg-white/5 relative overflow-hidden">
        <div ref={ref} className="absolute inset-y-0 left-0 bg-gradient-to-r from-luxury-burgundy to-luxury-burgundy/30" />
      </div>
    </div>
  );
};

export const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [editingCar, setEditingCar] = useState<AdminCar | null>(null);
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .cars()
      .then((items) => {
        if (!cancelled && items.length > 0) setCars(items as unknown as AdminCar[]);
      })
      .catch(() => {
        // no local fallback by requirement
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const rawCar = cars.find((c) => c.id === id);
  const car = rawCar
    ? {
        ...rawCar,
        title: rawCar.title ?? { ru: '', kz: '', en: '' },
        description: rawCar.description ?? { ru: '', kz: '', en: '' },
        images: Array.isArray(rawCar.images) ? rawCar.images : [],
        image360: Array.isArray(rawCar.image360) ? rawCar.image360 : [],
        colors: Array.isArray(rawCar.colors) ? rawCar.colors : [],
        interiors: Array.isArray(rawCar.interiors) ? rawCar.interiors : [],
        wheels: Array.isArray(rawCar.wheels) ? rawCar.wheels : [],
        specifications: {
          engine: rawCar.specifications?.engine ?? '',
          power: rawCar.specifications?.power ?? '',
          acceleration: rawCar.specifications?.acceleration ?? '',
          topSpeed: rawCar.specifications?.topSpeed ?? '',
          transmission: rawCar.specifications?.transmission ?? '',
          drivetrain: rawCar.specifications?.drivetrain ?? '',
          fuelType: rawCar.specifications?.fuelType ?? '',
          consumption: rawCar.specifications?.consumption ?? '',
          seats: rawCar.specifications?.seats ?? 5,
        },
      }
    : undefined;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedInterior, setSelectedInterior] = useState(0);
  const [selectedWheels, setSelectedWheels] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(heroProgress, [0, 1], ['0%', '30%']);
  const heroImgScale = useTransform(heroProgress, [0, 1], [1, 1.2]);
  const heroOverlayOpacity = useTransform(heroProgress, [0, 0.5, 1], [0.06, 0.3, 0.82]);
  const heroTitleY = useTransform(heroProgress, [0, 1], ['0%', '80%']);
  const heroInfoOpacity = useTransform(heroProgress, [0, 0.4], [1, 0]);

  // Image autoplay
  useEffect(() => {
    if (!car || !isAutoplay || car.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % car.images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [car, isAutoplay]);

  // GSAP entrance animations
  useLayoutEffect(() => {
    if (!car) return;
    const ctx = gsap.context(() => {
      // Title reveal
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current.querySelectorAll('.reveal-line'),
          { y: 120, opacity: 0, skewY: 3 },
          { y: 0, opacity: 1, skewY: 0, duration: 1.2, ease: 'power4.out', stagger: 0.12, delay: 0.3 }
        );
      }

      // Specs section — horizontal pin animation
      if (specsRef.current) {
        gsap.fromTo(
          specsRef.current.querySelectorAll('.spec-item'),
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: specsRef.current, start: 'top 80%', once: true },
          }
        );
      }

      // Config section reveal
      if (configRef.current) {
        gsap.fromTo(
          configRef.current.querySelectorAll('.config-item'),
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: { trigger: configRef.current, start: 'top 80%', once: true },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [car]);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-surface">
        <div className="text-center">
          <h2 className="text-h2 font-display text-white mb-6">{t('empty.title')}</h2>
          <Link to="/catalog" className="btn-primary">{t('nav.catalog')}</Link>
        </div>
      </div>
    );
  }


  const similarCars = cars.filter(c => c.id !== car.id && c.brand === car.brand).slice(0, 3);

  const formatPrice = (price: number) => formatPriceKzt(price);

  // Extract numeric for animated specs
  const heroSpecs = [
    { label: t('carDetail.specs.power'), value: (car.specifications.power || '').split(/\s/)[0] || '-', unit: '' },
    {
      label: t('carDetail.specs.acceleration'),
      value: (car.specifications.acceleration || '').replace(/\s*сек$/i, '').replace('s', '') || '-',
      unit: 'с',
    },
    { label: t('carDetail.specs.topSpeed'), value: (car.specifications.topSpeed || '').replace(/[^\d]/g, '') || '-', unit: 'км/ч' },
    { label: t('carDetail.specs.drivetrain'), value: car.specifications.drivetrain || '-', unit: '' },
  ];

  const sections = [
    { id: 'overview', label: t('carDetail.overview') },
    { id: 'specs', label: t('carDetail.specifications') },
    { id: 'config', label: t('carDetail.configure') },
    { id: 'gallery', label: t('carDetail.gallery') },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-luxury-surface min-h-screen">

      {/* ===================== IMMERSIVE HERO ===================== */}
      <section
        ref={heroRef}
        className="relative h-[100vh] min-h-[600px] overflow-hidden"
      >
        <motion.div
          style={{ y: heroImgY, scale: heroImgScale }}
          className="absolute inset-0 flex items-center justify-center bg-luxury-surface will-change-transform [filter:brightness(1.15)_contrast(1.12)_saturate(1.05)]"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={car.images[currentImageIndex]}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-contain object-center"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Затемнение только внизу под текст и кнопки — остальное фото остаётся ярким */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: heroOverlayOpacity }}
        >
          <div className="absolute inset-0 bg-luxury-surface" />
        </motion.div>
        {/* Один градиент снизу: тёмная полоса только под блоком с ценой и CTA */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 18%, rgba(0,0,0,0.2) 35%, transparent 55%)',
          }}
        />

        {/* Back button — minimal glass pill */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-28 left-6 lg:left-16 z-20"
        >
          <Link
            to="/catalog"
            className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-500"
          >
            <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-500">
              <ArrowLeft size={16} />
            </span>
            <span className="text-xs uppercase tracking-[0.2em] hidden lg:block">{t('carDetail.backToCatalog')}</span>
          </Link>
        </motion.div>

        {/* Image navigation dots — слева от списка моделей */}
        {car.images.length > 1 && (
          <div className="absolute right-6 lg:right-[11rem] top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            {car.images.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => { setCurrentImageIndex(index); setIsAutoplay(false); }}
                className="group relative flex items-center justify-end"
              >
                <span className={`block transition-all duration-700 rounded-full ${
                  currentImageIndex === index
                    ? 'w-8 h-1 bg-white'
                    : 'w-4 h-1 bg-white/20 group-hover:bg-white/50 group-hover:w-6'
                }`} />
              </button>
            ))}
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="mt-2 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
            >
              {isAutoplay ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        )}

        {/* Вертикальный список моделей Hongqi — как на hongqi.ru */}
        <div className="absolute right-6 lg:right-16 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-end gap-0.5">
          {cars.map((c) => {
            const isActive = c.id === car.id;
            return (
              <Link
                key={c.id}
                to={`/car/${c.id}`}
                className={`group flex items-center gap-3 py-2 transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className={`block w-px min-h-[1rem] transition-colors duration-300 ${
                  isActive ? 'bg-luxury-burgundy' : 'bg-transparent group-hover:bg-white/30'
                }`} />
                <span className="text-[11px] uppercase tracking-[0.2em] whitespace-nowrap">
                  {c.modelDisplay ?? c.model}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Hero title & info overlay */}
        <motion.div
          ref={titleRef}
          style={{ y: heroTitleY, opacity: heroInfoOpacity }}
          className="absolute bottom-0 left-0 right-0 z-10 pb-16 lg:pb-24"
        >
          <div className="container mx-auto px-6 lg:px-16">
            <div className="max-w-6xl">
              {/* Brand eyebrow */}
              <div className="overflow-hidden mb-4">
                <div className="reveal-line">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-luxury-burgundy inline-flex items-center gap-3">
                    <span className="w-8 h-px bg-luxury-burgundy" />
                    {car.brand} &middot; {car.year}
                  </span>
                </div>
              </div>

              {/* Model name — как на hongqi.ru */}
              <div className="overflow-hidden mb-6">
                <div className="reveal-line">
                  <h1
                    className="text-[clamp(56px,10vw,160px)] font-bold leading-[0.9] tracking-[-0.04em] text-white uppercase"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {car.modelDisplay ?? car.model}
                  </h1>
                </div>
              </div>

              {/* Quick specs row */}
              <div className="overflow-hidden mb-8">
                <div className="reveal-line flex items-center gap-6 lg:gap-10 flex-wrap">
                  {heroSpecs.map((spec, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl font-light text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                        {spec.value}
                      </span>
                      {spec.unit && <span className="text-xs text-white/30 uppercase tracking-wider">{spec.unit}</span>}
                      <span className="text-[10px] text-white/20 uppercase tracking-[0.15em] ml-1">{spec.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + В кредит от 0,01% & CTA */}
              <div className="overflow-hidden">
                <div className="reveal-line flex items-center gap-8 flex-wrap">
                  <div>
                    <div className="text-3xl lg:text-4xl font-light text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                      от {formatPrice(car.price)}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-full">
                      <span className="text-xs text-white/70">{t('carDetail.credit')}</span>
                      <span className="text-xs font-medium text-white">от 0,01%</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href={`https://wa.me/77753813839?text=${encodeURIComponent(`Интересует ${car.brand} ${car.model} ${car.year}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-400"
                    >
                      <MessageCircle size={18} strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-luxury font-semibold">WhatsApp</span>
                    </a>
                    <a
                      href="tel:+77753813839"
                      className="group px-6 py-3 bg-luxury-burgundy text-white flex items-center justify-center gap-2 hover:bg-luxury-burgundyHover hover:shadow-[0_0_30px_rgba(200,16,46,0.4)] transition-all duration-400"
                    >
                      <Phone size={18} strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-luxury font-semibold">{t('contactForm.call')}</span>
                    </a>
                    <Link to="/test-drive" className="btn-outline !py-3 !px-6 text-xs whitespace-nowrap">
                      <Calendar size={14} className="inline mr-2" />
                      {t('carDetail.testDrive')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} className="text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===================== STICKY NAV ===================== */}
      <div className="sticky top-[72px] z-30 bg-luxury-surface/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`relative px-5 h-full text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-500 ${
                  activeSection === s.id ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {s.label}
                {activeSection === s.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-px bg-luxury-burgundy"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Карточка автомобиля"
          description="Редактирование контента этой модели, характеристик, конфигурации и SEO прямо со страницы."
          details={[
            { label: 'Текущий URL', value: location.pathname },
            { label: 'SEO привязка', value: location.pathname },
          ]}
          actions={[
            { label: 'Автомобиль', onClick: () => setEditingCar(car), kind: 'primary' },
            { label: 'SEO', onClick: () => setIsSeoOpen(true) },
          ]}
        />
      </section>

      {/* ===================== OVERVIEW (Description + key specs) ===================== */}
      <section id="section-overview" className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left: big quote-like description */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative lg:col-span-7"
            >
              <VisualInlineEditLink onClick={() => setEditingCar(car)} label="Автомобиль" className="right-0 top-0" />
              <div className="flex items-center gap-3 mb-8">
                <span className="w-12 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('carDetail.philosophy')}</span>
              </div>
              {car.description && (
                <p className="text-[clamp(24px,3.5vw,48px)] font-light leading-[1.3] text-white/90 tracking-[-0.01em]">
                  {car.description[i18n.language as 'ru' | 'kz' | 'en'] || car.description.ru}
                </p>
              )}
              <div className="mt-12 flex items-center gap-2 text-white/20 text-xs uppercase tracking-[0.15em]">
                <span>{t('carDetail.scrollForDetails')}</span>
                <ArrowRight size={12} />
              </div>
            </motion.div>

            {/* Right: vertical key stats */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="space-y-8">
                {[
                  { label: t('carDetail.specs.engine'), value: car.specifications.engine },
                  { label: t('carDetail.specs.power'), value: car.specifications.power },
                  { label: t('carDetail.specs.transmission'), value: car.specifications.transmission },
                  { label: t('carDetail.specs.drivetrain'), value: car.specifications.drivetrain },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-end pb-6 border-b border-white/5">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">{item.label}</span>
                    <span className="text-lg text-white font-light">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== FULL SPECIFICATIONS ===================== */}
      <section id="section-specs" ref={specsRef} className="py-24 lg:py-40 bg-luxury-surface relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="container relative z-10 mx-auto px-6 lg:px-16">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('carDetail.specsEyebrow')}</span>
            </div>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('carDetail.specsHeadlineLine1')}<br />
              <span className="text-white/90">{t('carDetail.specsHeadlineLine2')}</span>
            </h2>
          </motion.div>

          {/* Big animated numbers row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-20">
            {heroSpecs.map((spec, i) => (
              <motion.div
                key={i}
                className="spec-item"
              >
                <div className="text-[clamp(40px,6vw,80px)] font-bold text-white leading-none tracking-[-0.04em]" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  <AnimatedNumber value={spec.value} suffix={spec.unit} />
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/30">{spec.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Detailed specs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            {[
              { label: t('carDetail.specs.engine'), value: car.specifications.engine },
              { label: t('carDetail.specs.power'), value: car.specifications.power },
              { label: t('carDetail.specs.acceleration'), value: car.specifications.acceleration },
              { label: t('carDetail.specs.topSpeed'), value: car.specifications.topSpeed },
              { label: t('carDetail.specs.transmission'), value: car.specifications.transmission },
              { label: t('carDetail.specs.drivetrain'), value: car.specifications.drivetrain },
              { label: t('carDetail.specs.fuelType'), value: car.specifications.fuelType },
              { label: t('carDetail.specs.consumption'), value: car.specifications.consumption },
              { label: t('carDetail.specs.seats'), value: car.specifications.seats.toString() },
            ].map((spec, i) => (
              <div key={i} className="spec-item">
                <SpecBar label={spec.label} value={spec.value} delay={i * 0.05} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CONFIGURATOR ===================== */}
      <section id="section-config" ref={configRef} className="py-24 lg:py-40">
        <div className="container relative mx-auto px-6 lg:px-16">
          <VisualInlineEditLink onClick={() => setEditingCar(car)} label="Конфигурация" className="right-6 top-0 lg:right-16" />
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('carDetail.personalization')}</span>
            </div>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('carDetail.yourStyle')}<br />
              <span className="text-white/90">{t('carDetail.yourCar')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: live preview */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] rounded-sm overflow-hidden bg-luxury-surface config-item">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${currentImageIndex}-${selectedColor}`}
                    src={car.images[currentImageIndex]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
                  />
                </AnimatePresence>

                {/* Color reflection glow */}
                {car.colors.length > 0 ? (
                  <div
                    className="absolute inset-0 opacity-10 transition-colors duration-1000"
                    style={{
                      background: `radial-gradient(circle at 30% 70%, ${car.colors[Math.min(selectedColor, car.colors.length - 1)].hex}, transparent 70%)`,
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 via-transparent to-transparent" />

                {/* Fullscreen button */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 transition-all duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
                  </svg>
                </button>

                {/* Selected config label */}
                {car.colors.length > 0 ? (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{
                        backgroundColor: car.colors[Math.min(selectedColor, car.colors.length - 1)].hex,
                      }}
                    />
                    <span className="text-xs text-white/50">
                      {car.colors[Math.min(selectedColor, car.colors.length - 1)].name}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Thumbnail strip */}
              {car.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {car.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => { setCurrentImageIndex(index); setIsAutoplay(false); }}
                      className={`relative aspect-[16/10] flex-1 max-w-[120px] overflow-hidden transition-all duration-500 ${
                        currentImageIndex === index
                          ? 'ring-1 ring-luxury-burgundy ring-offset-1 ring-offset-luxury-black opacity-100'
                          : 'opacity-30 hover:opacity-60 grayscale hover:grayscale-0'
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: config options */}
            <div className="lg:col-span-5 space-y-10">
              {/* Colors */}
              <div className="config-item">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">{t('carDetail.exterior')}</span>
                  <span className="text-xs text-white/20">{selectedColor + 1}/{car.colors.length}</span>
                </div>
                <div className="space-y-1">
                  {car.colors.map((color: AdminCar['colors'][number], index: number) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-full group flex items-center gap-4 p-4 rounded-sm transition-all duration-500 ${
                        selectedColor === index
                          ? 'bg-white/[0.03] border border-white/10'
                          : 'border border-transparent hover:bg-white/[0.02]'
                      }`}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full transition-all duration-500 ${
                            selectedColor === index ? 'ring-2 ring-offset-2 ring-offset-luxury-black ring-luxury-burgundy scale-110' : ''
                          }`}
                          style={{ backgroundColor: color.hex, border: color.hex === '#ffffff' || color.hex === '#f8f9fa' || color.hex === '#f5f5f5' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                        />
                        {selectedColor === index && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-luxury-burgundy flex items-center justify-center"
                          >
                            <Check size={10} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className={`text-sm transition-colors duration-300 ${selectedColor === index ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                        {color.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Interior */}
              <div className="config-item">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">{t('carDetail.interior')}</span>
                  <span className="text-xs text-white/20">{selectedInterior + 1}/{car.interiors.length}</span>
                </div>
                <div className="space-y-1">
                  {car.interiors.map((interior: AdminCar['interiors'][number], index: number) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedInterior(index)}
                      className={`w-full group p-4 rounded-sm text-left transition-all duration-500 ${
                        selectedInterior === index
                          ? 'bg-white/[0.03] border border-white/10'
                          : 'border border-transparent hover:bg-white/[0.02]'
                      }`}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm transition-colors duration-300 ${selectedInterior === index ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                            {interior.name}
                          </div>
                          <div className="text-[11px] text-white/20 mt-0.5">{interior.description}</div>
                        </div>
                        {selectedInterior === index && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} className="text-luxury-burgundy" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Wheels */}
              <div className="config-item">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">{t('carDetail.wheels')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {car.wheels.map((wheel: AdminCar['wheels'][number], index: number) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedWheels(index)}
                      className={`p-5 rounded-sm text-left transition-all duration-500 ${
                        selectedWheels === index
                          ? 'bg-white/[0.03] border border-white/10'
                          : 'border border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                      }`}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className={`text-2xl font-light mb-1 transition-colors ${selectedWheels === index ? 'text-white' : 'text-white/30'}`} style={{ fontFamily: "'Space Grotesk', monospace" }}>
                        {wheel.size}
                      </div>
                      <div className={`text-xs transition-colors ${selectedWheels === index ? 'text-white/60' : 'text-white/20'}`}>
                        {wheel.name}
                      </div>
                      {selectedWheels === index && (
                        <motion.div
                          layoutId="wheelIndicator"
                          className="mt-3 h-px bg-luxury-burgundy"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="config-item pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">{t('carDetail.total')}</span>
                  <span className="text-2xl text-white font-light tracking-tight" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    {formatPrice(car.price)}
                  </span>
                </div>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/77753813839?text=${encodeURIComponent(`${t('carDetail.wantReserveMessage')} ${car.brand} ${car.model} ${car.year}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full px-6 py-4 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center gap-2 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all duration-400"
                  >
                    <MessageCircle size={18} strokeWidth={2.5} />
                    <span className="text-label uppercase tracking-luxury font-semibold">{t('carDetail.reserveWhatsApp')}</span>
                  </a>
                  <a
                    href="tel:+77753813839"
                    className="group w-full px-6 py-4 bg-luxury-burgundy text-white flex items-center justify-center gap-2 hover:bg-luxury-burgundyHover hover:shadow-[0_0_30px_rgba(200,16,46,0.4)] transition-all duration-400"
                  >
                    <Phone size={18} strokeWidth={2.5} />
                    <span className="text-label uppercase tracking-luxury font-semibold">{t('contactForm.call')}</span>
                  </a>
                  <Link to="/test-drive" className="btn-outline w-full flex items-center justify-center gap-2 !py-4">
                    <Calendar size={16} />
                    {t('carDetail.testDrive')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== GALLERY / SIMILAR ===================== */}
      <section id="section-gallery" ref={galleryRef} className="py-24 lg:py-40 bg-luxury-surface">
        <div className="container relative mx-auto px-6 lg:px-16">
          <VisualInlineEditLink onClick={() => setEditingCar(car)} label="Галерея" className="right-6 top-0 lg:right-16" />
          {similarCars.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex items-end justify-between mb-16"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-12 h-px bg-luxury-burgundy" />
                    <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('carDetail.similarCars')}</span>
                  </div>
                  <h2
                    className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {t('carDetail.similarCars')}
                  </h2>
                </div>
                <Link
                  to="/catalog"
                  className="hidden lg:flex items-center gap-3 text-white/30 hover:text-white transition-colors duration-500 group"
                >
                  <span className="text-xs uppercase tracking-[0.2em]">{t('nav.catalog')}</span>
                  <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-500">
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarCars.map((sc, index) => (
                  <motion.div
                    key={sc.id}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={`/car/${sc.id}`} className="block group relative">
                      <div className="relative aspect-[4/3] overflow-hidden bg-luxury-elevated rounded-sm">
                        <img
                          src={sc.images[0]}
                          alt={`${sc.brand} ${sc.model}`}
                          className="w-full h-full object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />

                        {/* Hover overlay content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-luxury-burgundy mb-2">{sc.brand}</div>
                          <h3
                            className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-[-0.02em]"
                            style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                          >
                            {sc.model}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-white/30">
                            <span>{sc.specifications.power}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{sc.specifications.acceleration}</span>
                          </div>
                          <div className="mt-4 overflow-hidden h-0 group-hover:h-8 transition-all duration-500">
                            <span className="text-lg font-light text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                              {formatPrice(sc.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===================== FULLSCREEN LIGHTBOX ===================== */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-luxury-black/98 backdrop-blur-2xl flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsFullscreen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all z-10"
            >
              <X size={20} />
            </motion.button>

            {/* Image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              src={car.images[currentImageIndex]}
              alt={`${car.brand} ${car.model}`}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
            />

            {/* Navigation arrows */}
            {car.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? car.images.length - 1 : prev - 1); }}
                  className="absolute left-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % car.images.length); }}
                  className="absolute right-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all"
                >
                  <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/30 tracking-[0.2em]">
              {currentImageIndex + 1} / {car.images.length}
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
                  navigate('/catalog');
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

          <div className="grid gap-4 lg:grid-cols-3">
            <InlineCmsInput
              value={editingCar.brand}
              onChange={(brand) => setEditingCar({ ...editingCar, brand })}
              placeholder="Бренд"
            />
            <InlineCmsInput
              value={editingCar.model}
              onChange={(model) => setEditingCar({ ...editingCar, model })}
              placeholder="Код модели"
            />
            <InlineCmsInput
              value={editingCar.modelDisplay ?? ''}
              onChange={(modelDisplay) => setEditingCar({ ...editingCar, modelDisplay })}
              placeholder="Отображаемое имя модели"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
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
              value={editingCar.mileage}
              onChange={(mileage) => setEditingCar({ ...editingCar, mileage: Number(mileage) || 0 })}
              placeholder="Пробег"
              type="number"
            />
            <InlineCmsInput
              value={editingCar.availability}
              onChange={(availability) => setEditingCar({ ...editingCar, availability })}
              placeholder="Наличие"
            />
          </div>

          <InlineCmsTextarea
            value={editingCar.images.join('\n')}
            onChange={(images) =>
              setEditingCar({
                ...editingCar,
                images: images
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="URL изображений, по одному в строке"
          />

          <InlineCmsLocaleFields
            label="Описание"
            value={editingCar.description}
            multiline
            onChange={(description) => setEditingCar({ ...editingCar, description })}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingCar.specifications.engine}
              onChange={(engine) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, engine },
                })
              }
              placeholder="Двигатель"
            />
            <InlineCmsInput
              value={editingCar.specifications.power}
              onChange={(power) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, power },
                })
              }
              placeholder="Мощность"
            />
            <InlineCmsInput
              value={editingCar.specifications.acceleration}
              onChange={(acceleration) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, acceleration },
                })
              }
              placeholder="0-100"
            />
            <InlineCmsInput
              value={editingCar.specifications.topSpeed}
              onChange={(topSpeed) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, topSpeed },
                })
              }
              placeholder="Макс. скорость"
            />
            <InlineCmsInput
              value={editingCar.specifications.transmission}
              onChange={(transmission) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, transmission },
                })
              }
              placeholder="Трансмиссия"
            />
            <InlineCmsInput
              value={editingCar.specifications.drivetrain}
              onChange={(drivetrain) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, drivetrain },
                })
              }
              placeholder="Привод"
            />
            <InlineCmsInput
              value={editingCar.specifications.fuelType}
              onChange={(fuelType) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, fuelType },
                })
              }
              placeholder="Тип топлива"
            />
            <InlineCmsInput
              value={editingCar.specifications.consumption}
              onChange={(consumption) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, consumption },
                })
              }
              placeholder="Расход"
            />
            <InlineCmsInput
              value={editingCar.specifications.seats}
              onChange={(seats) =>
                setEditingCar({
                  ...editingCar,
                  specifications: { ...editingCar.specifications, seats: Number(seats) || 0 },
                })
              }
              placeholder="Места"
              type="number"
            />
          </div>

          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45">Цвета</p>
            <div className="grid gap-3">
              {editingCar.colors.map((color, index) => (
                <div key={`${color.name}-${index}`} className="grid gap-3 lg:grid-cols-2">
                  <InlineCmsInput
                    value={color.name}
                    onChange={(name) =>
                      setEditingCar({
                        ...editingCar,
                        colors: editingCar.colors.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name } : item
                        ),
                      })
                    }
                    placeholder="Название цвета"
                  />
                  <InlineCmsInput
                    value={color.hex}
                    onChange={(hex) =>
                      setEditingCar({
                        ...editingCar,
                        colors: editingCar.colors.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, hex } : item
                        ),
                      })
                    }
                    placeholder="#HEX"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45">Интерьеры</p>
            <div className="grid gap-3">
              {editingCar.interiors.map((interior, index) => (
                <div key={`${interior.name}-${index}`} className="grid gap-3 lg:grid-cols-2">
                  <InlineCmsInput
                    value={interior.name}
                    onChange={(name) =>
                      setEditingCar({
                        ...editingCar,
                        interiors: editingCar.interiors.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name } : item
                        ),
                      })
                    }
                    placeholder="Название интерьера"
                  />
                  <InlineCmsInput
                    value={interior.description}
                    onChange={(description) =>
                      setEditingCar({
                        ...editingCar,
                        interiors: editingCar.interiors.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, description } : item
                        ),
                      })
                    }
                    placeholder="Описание интерьера"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/45">Диски</p>
            <div className="grid gap-3">
              {editingCar.wheels.map((wheel, index) => (
                <div key={`${wheel.name}-${index}`} className="grid gap-3 lg:grid-cols-2">
                  <InlineCmsInput
                    value={wheel.name}
                    onChange={(name) =>
                      setEditingCar({
                        ...editingCar,
                        wheels: editingCar.wheels.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name } : item
                        ),
                      })
                    }
                    placeholder="Название диска"
                  />
                  <InlineCmsInput
                    value={wheel.size}
                    onChange={(size) =>
                      setEditingCar({
                        ...editingCar,
                        wheels: editingCar.wheels.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, size } : item
                        ),
                      })
                    }
                    placeholder="Размер"
                  />
                </div>
              ))}
            </div>
          </div>
        </InlineCmsModal>
      ) : null}

      <InlineSeoEditorModal slug={location.pathname} open={isSeoOpen} onClose={() => setIsSeoOpen(false)} />
    </div>
  );
};
