import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import i18n from '../i18n/config';
import { localizedText } from '../utils/localizedText';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView, useScroll } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Car } from '../types/car';
import type { AdminCar } from '../types/admin';
import { SITE_IMAGES } from '../data/siteImages';
import { EmptyState } from '../components/EmptyState';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { VisualInlineEditLink } from '../components/VisualInlineEditLink';
import { InlineCmsCollectionMenu } from '../components/InlineCmsCollectionMenu';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
} from '../components/InlineCmsModal';
import { InlineSeoEditorModal } from '../components/InlineSeoEditorModal';
import { publicApi } from '../utils/publicApi';
import { useShop } from '../context/ShopContext';
import { carsApi } from '../utils/adminApi';
import type { ReviewItem } from '../types/shop';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   REUSABLE ANIMATED COMPONENTS
   ================================================================ */

const AnimatedCounter = ({ target, suffix = '', duration = 2 }: {
  target: number; suffix?: string; duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  useEffect(() => {
    if (!isInView) return;
    const start = 0, end = target, startTime = Date.now(), durationMs = duration * 1000;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);
  return <span ref={ref} style={{ fontFamily: "'Space Grotesk', monospace" }}>{count}{suffix}</span>;
};

const MagneticButton = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<typeof Link> & { className?: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  return (
    <motion.div style={{ x: springX, y: springY }} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <Link ref={ref} className={className} {...props}>{children}</Link>
    </motion.div>
  );
};

const ParallaxImage = ({ src, alt, className = '', speed = 0.3, fallback = SITE_IMAGES.hero }: {
  src: string; alt: string; className?: string; speed?: number; fallback?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => setImgSrc(src), [src]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);
  const handleError = () => setImgSrc(fallback);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={imgSrc} alt={alt} style={{ y }} className="w-full h-[120%] object-cover" onError={handleError} />
    </div>
  );
};

/* ================================================================
   MAIN HOME COMPONENT
   ================================================================ */
export const Home = () => {
  const { t } = useTranslation();
  const { state, saveReview, deleteReview } = useShop();
  const [cars, setCars] = useState<Car[]>([]);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editingCar, setEditingCar] = useState<AdminCar | null>(null);
  const [isCarsMenuOpen, setIsCarsMenuOpen] = useState(false);
  const [isReviewsMenuOpen, setIsReviewsMenuOpen] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const featuredCars = useMemo<Car[]>(() => cars.filter((car) => car.featured), [cars]);

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .cars()
      .then((items) => {
        if (!cancelled) setCars(items);
      })
      .catch(() => {
        // no local fallback by requirement
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const createCarDraft = (): AdminCar => ({
    id: `car-${Date.now()}`,
    brand: 'Hongqi',
    makeId: 'hongqi',
    model: '',
    modelDisplay: '',
    title: { ru: '', kz: '', en: '' },
    year: new Date().getFullYear(),
    price: 0,
    availability: 'В наличии',
    mileage: 0,
    featured: false,
    images: [SITE_IMAGES.hero],
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
    description: { ru: '', kz: '', en: '' },
  });
  const createReviewDraft = (): ReviewItem => ({
    id: `review-${Date.now()}`,
    name: '',
    rating: null,
    text: { ru: '', kz: '', en: '' },
  });
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], [0, 400]);
  const heroOpacity = useTransform(heroProgress, [0, 0.4, 0.8], [1, 0.6, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroOverlay = useTransform(heroProgress, [0, 0.5, 1], [0.2, 0.6, 1]);
  const watermarkY = useTransform(heroProgress, [0, 1], [0, -200]);

  // Mouse spotlight
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothMX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleHeroMouse = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  // GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text reveal
      if (heroContentRef.current) {
        const lines = heroContentRef.current.querySelectorAll('.hero-reveal');
        gsap.fromTo(lines,
          { y: 140, opacity: 0, skewY: 4, rotateX: -15 },
          { y: 0, opacity: 1, skewY: 0, rotateX: 0, duration: 1.4, ease: 'power4.out', stagger: 0.1, delay: 0.4 }
        );
      }


      // Section reveals
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.fromTo(el,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-luxury-black">

      {/* ============================================================
          HERO — AWWWARDS CHAMPION LEVEL
          ============================================================ */}
      <section
        ref={heroRef}
        className="relative h-[100vh] min-h-[700px] w-full overflow-hidden"
        onMouseMove={handleHeroMouse}
      >
        {/* Layer 1: Video/Image Background with parallax */}
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img
            src={SITE_IMAGES.hero}
            alt="Hongqi"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = SITE_IMAGES.philosophy; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
          />
        </motion.div>

        {/* Layer 2: Cinematic noise/grain overlay */}
        <div className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

        {/* Layer 3: Dynamic gradient overlays */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-luxury-black/60 via-transparent to-luxury-black" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-luxury-black/80 via-luxury-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] z-[3] bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />

        {/* Layer 4: Mouse-following spotlight */}
        <motion.div className="absolute inset-0 z-[4] pointer-events-none" style={{
          background: useTransform(
            [smoothMX, smoothMY],
            ([x, y]: number[]) => `radial-gradient(800px circle at ${x * 100}% ${y * 100}%, rgba(157,34,53,0.08) 0%, transparent 60%)`
          ),
        }} />

        {/* Layer 5: Scroll-driven darkness */}
        <motion.div className="absolute inset-0 z-[5] bg-luxury-black pointer-events-none" style={{ opacity: heroOverlay }} />

        {/* Layer 6: Giant watermark text */}
        <motion.div style={{ y: watermarkY }} className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="text-[clamp(120px,20vw,300px)] font-bold uppercase tracking-[-0.05em] select-none whitespace-nowrap"
            style={{
              fontFamily: "'Montserrat', system-ui, sans-serif",
              WebkitTextStroke: '1px rgba(255,255,255,0.03)',
              color: 'transparent',
            }}
          >
            HONGQI AUTO
          </span>
        </motion.div>

        {/* Layer 7: Main content */}
        <motion.div
          ref={heroContentRef}
          style={{ opacity: heroOpacity }}
          className="relative z-[10] container mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-20 lg:pb-28"
        >
          {/* Eyebrow */}
          <div className="overflow-hidden mb-5">
            <div className="hero-reveal flex items-center gap-3">
              <span className="w-10 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.3em] text-luxury-burgundy">
                {t('hero.eyebrow')}
              </span>
            </div>
          </div>

          {/* Main Title — крупно, но помещается в экран */}
          <div className="max-w-6xl mb-6 pr-4">
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-[clamp(32px,5.5vw,80px)] font-bold leading-[1.05] tracking-[-0.04em] text-white uppercase max-w-5xl"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                {t('hero.title')}
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          <div className="overflow-hidden mb-10 max-w-2xl pr-4">
            <p className="hero-reveal text-sm lg:text-base text-white/40 font-light leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* CTAs + Metrics */}
          <div className="overflow-hidden pr-4">
            <div className="hero-reveal flex flex-wrap items-center gap-8 lg:gap-12">
              {/* Buttons */}
              <div className="flex items-center gap-3">
                <MagneticButton to="/catalog" className="btn-primary !py-3.5 !px-8 text-xs flex items-center gap-2">
                  {t('hero.ctaPrimary')} <ArrowRight size={14} />
                </MagneticButton>
                <MagneticButton to="/contact" className="btn-outline !py-3.5 !px-8 text-xs">
                  {t('hero.ctaSecondary')}
                </MagneticButton>
              </div>

              {/* Mini metrics */}
              <div className="hidden lg:flex items-center gap-8">
                {[
                  { val: '551', unit: t('homePage.units.hpShort'), label: t('homePage.heroMiniMetrics.power') },
                  { val: '4.8', unit: t('homePage.units.secondsShort'), label: t('homePage.heroMiniMetrics.acceleration') },
                  { val: '230', unit: t('homePage.units.kmhShort'), label: t('homePage.heroMiniMetrics.topSpeed') },
                ].map((m, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span className="text-xl text-white font-light" style={{ fontFamily: "'Space Grotesk', monospace" }}>{m.val}</span>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider">{m.unit}</span>
                    <span className="text-[10px] text-white/10 uppercase tracking-[0.15em] ml-1">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 right-8 lg:right-16 z-[10] flex flex-col items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 [writing-mode:vertical-lr]">{t('homePage.scroll')}</span>
          <div className="w-px h-16 bg-white/5 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-luxury-burgundy"
              animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Side verticals */}
        <div className="absolute left-6 lg:left-16 top-0 bottom-0 z-[8] hidden lg:flex flex-col items-center justify-center">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>
      </section>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Главная страница"
          description="Редактирование автомобилей, отзывов и SEO главной страницы."
          actions={[
            { label: 'Автомобили', onClick: () => setIsCarsMenuOpen(true), kind: 'primary' },
            { label: 'Отзывы', onClick: () => setIsReviewsMenuOpen(true) },
            { label: 'SEO', onClick: () => setIsSeoOpen(true) },
          ]}
        />
      </section>

      {/* ============================================================
          SECTION: FLAGSHIP METRICS BAR
          ============================================================ */}
      <section className="relative py-20 lg:py-28 border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            {[
              { num: 8, suf: '', label: t('homePage.metricsBar.models') },
              { num: 551, suf: '', label: t('homePage.metricsBar.maxHp') },
              { num: 150, suf: '+', label: t('homePage.metricsBar.clients') },
              { num: 5, suf: '', label: t('homePage.metricsBar.yearsOnMarket') },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="text-center lg:text-left"
              >
                <div className="text-[clamp(36px,5vw,64px)] font-bold text-white leading-none tracking-[-0.03em]">
                  <AnimatedCounter target={s.num} suffix={s.suf} />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/20">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: MARQUEE
          ============================================================ */}
      <section className="py-6 overflow-hidden border-b border-white/5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="text-[clamp(60px,8vw,120px)] font-bold uppercase tracking-[-0.04em]"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1px rgba(255,255,255,0.05)', color: 'transparent' }}>
                HONGQI
              </span>
              <span className="text-luxury-burgundy/20 text-3xl">&#9670;</span>
              <span className="text-[clamp(60px,8vw,120px)] font-bold uppercase tracking-[-0.04em]"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1px rgba(255,255,255,0.05)', color: 'transparent' }}>
                LUXURY
              </span>
              <span className="text-luxury-burgundy/20 text-3xl">&#9670;</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION: FEATURED MODELS — PRESENTATION CAROUSEL
          ============================================================ */}
      {cars.length === 0 ? (
        <section className="py-20 lg:py-28 border-b border-white/5">
          <div className="container mx-auto px-6 lg:px-16">
            <EmptyState />
          </div>
        </section>
      ) : (
        <FeaturedModelsCarousel cars={featuredCars.length ? featuredCars : cars} />
      )}

      {/* ============================================================
          SECTION: HONGQI HERITAGE
          ============================================================ */}
      <section className="relative py-32 lg:py-48 overflow-hidden bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative order-2 lg:order-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ParallaxImage
                  src={SITE_IMAGES.philosophy}
                  alt="Hongqi Heritage"
                  className="w-full h-full"
                  speed={0.2}
                  fallback={SITE_IMAGES.hero}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-40" />

                {/* Floating stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4"
                >
                  <div className="bg-luxury-black/80 backdrop-blur-xl border border-white/10 p-5">
                    <div className="text-luxury-red text-xs uppercase tracking-wider mb-1 font-semibold">{t('homePage.heritage.foundedLabel')}</div>
                    <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>1958</div>
                  </div>
                  <div className="bg-luxury-black/80 backdrop-blur-xl border border-white/10 p-5">
                    <div className="text-luxury-red text-xs uppercase tracking-wider mb-1 font-semibold">{t('homePage.heritage.legacyLabel')}</div>
                    <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>65+</div>
                    <div className="text-xs text-white/50">{t('homePage.heritage.legacyValue')}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-px bg-luxury-red" />
                <span className="text-micro uppercase tracking-ultra text-luxury-red font-semibold">{t('homePage.heritage.eyebrow')}</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em] text-white uppercase mb-8"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                {t('homePage.heritage.titleLine1')}<br /><span className="text-luxury-red">{t('homePage.heritage.titleLine2')}</span>
              </h2>
              <div className="space-y-6 mb-10">
                <p className="text-lg text-white/90 font-light leading-relaxed max-w-lg">
                  {t('homePage.heritage.p1')}
                </p>
                <p className="text-base text-white/70 font-light leading-relaxed max-w-lg">
                  {t('homePage.heritage.p2')}
                </p>
                <div className="border-l-2 border-luxury-red pl-6 py-2">
                  <p className="text-white/60 italic font-light">
                    {t('homePage.heritage.quote')}
                  </p>
                </div>
              </div>
              <Link to="/brands" className="group inline-flex items-center gap-3 px-8 py-4 bg-luxury-red hover:bg-luxury-redBright transition-all duration-400">
                <span className="text-xs uppercase tracking-luxury text-white font-semibold">{t('homePage.heritage.button')}</span>
                <ArrowRight size={18} className="text-white transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: VIDEO SHOWCASE
          ============================================================ */}
      <section className="relative py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">{t('homePage.video.eyebrow')}</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              {t('homePage.video.titleLine1')}<br /><span className="text-white/90">{t('homePage.video.titleLine2')}</span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video overflow-hidden rounded-sm group cursor-pointer"
          >
            <img src={SITE_IMAGES.cta} alt="Hongqi" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.philosophy; }; }} />
            <div className="absolute inset-0 bg-luxury-black/40 group-hover:bg-luxury-black/20 transition-colors duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Play size={28} className="text-white ml-1" fill="currentColor" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-2">{t('homePage.video.cardEyebrow')}</span>
                  <span className="text-xl lg:text-2xl text-white font-light">{t('homePage.video.cardTitle')}</span>
                </div>
                <ChevronRight className="text-white/30" size={24} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION: MODELS GRID
          ============================================================ */}
      <section className="py-32 lg:py-48 bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-20 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">{t('homePage.modelsGrid.eyebrow')}</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              {t('homePage.modelsGrid.titleLine1')}<br /><span className="text-white/90">{t('homePage.modelsGrid.titleLine2')}</span>
            </h2>
          </div>
          {cars.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cars.slice(0, 4).map((car, index) => (
                <ModelGridCard key={car.id} car={car} index={index} onEdit={() => setEditingCar(car as unknown as AdminCar)} />
              ))}
            </div>
          )}
          <div className="mt-16 text-center gsap-reveal">
            <MagneticButton to="/catalog" className="btn-primary inline-flex items-center gap-3">
              {t('homePage.common.allModels')} <ArrowRight size={16} />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: CINEMATIC CTA
          ============================================================ */}
      <section className="relative py-40 lg:py-56 overflow-hidden">
        <div className="absolute inset-0">
          <ParallaxImage src={SITE_IMAGES.cta} alt="Hongqi" className="w-full h-full" speed={0.15} fallback={SITE_IMAGES.hero} />
          <div className="absolute inset-0 bg-luxury-black/75" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-luxury-burgundy/5 blur-[100px]" />
        </div>
        <div className="relative z-10 container mx-auto px-6 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[clamp(80px,12vw,200px)] font-bold uppercase tracking-[-0.05em] block mb-4"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1.5px rgba(255,255,255,0.08)', color: 'transparent' }}>
              POWER
            </span>
            <h2 className="text-[clamp(24px,3vw,48px)] font-light text-white mb-6">{t('cta.title')}</h2>
            <p className="text-base text-white/30 font-light mb-10 max-w-xl mx-auto">{t('cta.description')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <MagneticButton to="/contact" className="btn-primary inline-flex items-center gap-2">
                {t('cta.button')} <ArrowRight size={14} />
              </MagneticButton>
              <MagneticButton to="/catalog" className="btn-outline inline-flex items-center gap-2">
                {t('hero.ctaPrimary')}
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-32 border-t border-white/5 bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">
              {t('shop.home.reviews.eyebrow')}
            </span>
            <h2
              className="text-[clamp(34px,4.5vw,64px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('shop.home.reviews.title')}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {state.reviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
                className="relative border border-white/10 bg-luxury-black p-8"
              >
                <VisualInlineEditLink onClick={() => setEditingReview(review)} label="Отзыв" />
                {typeof review.rating === 'number' ? (
                  <p className="text-luxury-burgundy tracking-[0.2em]">
                    {'★'.repeat(Math.max(0, Math.min(5, review.rating)))}
                  </p>
                ) : null}
                <p className="mt-5 text-base leading-8 text-white/75">
                  {localizedText(review.text, { lng: i18n.language })}
                </p>
                <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-white/45">
                  {review.name}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />

      {editingReview ? (
        <InlineCmsModal
          title="Редактирование отзыва"
          onClose={() => setEditingReview(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  saveReview(editingReview);
                  setEditingReview(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить отзыв?')) return;
                  deleteReview(editingReview.id);
                  setEditingReview(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsInput
            value={editingReview.name}
            onChange={(name) => setEditingReview({ ...editingReview, name })}
            placeholder="Имя"
          />
          <InlineCmsInput
            value={editingReview.rating ?? ''}
            onChange={(rating) =>
              setEditingReview({
                ...editingReview,
                rating: rating === '' ? null : Math.max(0, Math.min(5, Number(rating) || 0)),
              })
            }
            placeholder="Рейтинг 0-5"
            type="number"
          />
          <InlineCmsLocaleFields
            label="Текст"
            value={editingReview.text}
            multiline
            onChange={(text) => setEditingReview({ ...editingReview, text })}
          />
        </InlineCmsModal>
      ) : null}

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
                  setCars((current) =>
                    current.map((item) =>
                      item.id === editingCar.id ? (editingCar as unknown as Car) : item
                    )
                  );
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
          <InlineCmsInput
            value={editingCar.brand}
            onChange={(brand) => setEditingCar({ ...editingCar, brand })}
            placeholder="Бренд"
          />
          <InlineCmsInput
            value={editingCar.model}
            onChange={(model) => setEditingCar({ ...editingCar, model })}
            placeholder="Модель"
          />
          <InlineCmsInput
            value={editingCar.price}
            onChange={(price) => setEditingCar({ ...editingCar, price: Number(price) || 0 })}
            placeholder="Цена"
            type="number"
          />
        </InlineCmsModal>
      ) : null}

      <InlineCmsCollectionMenu
        title="Автомобили"
        open={isCarsMenuOpen}
        onClose={() => setIsCarsMenuOpen(false)}
        addLabel="Добавить автомобиль"
        onAdd={() => {
          setIsCarsMenuOpen(false);
          setEditingCar(createCarDraft());
        }}
        items={cars.map((car) => ({
          id: car.id,
          title: `${car.brand} ${car.model}`,
          subtitle: String(car.price ?? ''),
        }))}
        onEdit={(id) => {
          const car = cars.find((item) => item.id === id);
          if (!car) return;
          setIsCarsMenuOpen(false);
          setEditingCar(car as unknown as AdminCar);
        }}
        onDelete={(id) => {
          const car = cars.find((item) => item.id === id);
          if (!car || !window.confirm('Удалить автомобиль?')) return;
          void carsApi.remove(id);
          setCars((current) => current.filter((item) => item.id !== id));
        }}
      />

      <InlineCmsCollectionMenu
        title="Отзывы"
        open={isReviewsMenuOpen}
        onClose={() => setIsReviewsMenuOpen(false)}
        addLabel="Добавить отзыв"
        onAdd={() => {
          setIsReviewsMenuOpen(false);
          setEditingReview(createReviewDraft());
        }}
        items={state.reviews.map((review) => ({
          id: review.id,
          title: review.name || 'Без имени',
          subtitle: typeof review.rating === 'number' ? `Рейтинг: ${review.rating}` : 'Без рейтинга',
        }))}
        onEdit={(id) => {
          const review = state.reviews.find((item) => item.id === id);
          if (!review) return;
          setIsReviewsMenuOpen(false);
          setEditingReview(review);
        }}
        onDelete={(id) => {
          const review = state.reviews.find((item) => item.id === id);
          if (!review || !window.confirm('Удалить отзыв?')) return;
          deleteReview(id);
        }}
      />

      <InlineSeoEditorModal slug="/" open={isSeoOpen} onClose={() => setIsSeoOpen(false)} />
    </div>
  );
};

/* ================================================================
   FEATURED MODELS CAROUSEL - Presentation Style
   ================================================================ */
const FeaturedModelsCarousel = ({ cars }: { cars: Car[] }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const hasCars = cars.length > 0;
  const currentCar = hasCars ? cars[currentIndex] : undefined;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const nextSlide = () => {
    if (!hasCars) return;
    setCurrentIndex((prev) => (prev + 1) % cars.length);
  };
  const prevSlide = () => {
    if (!hasCars) return;
    setCurrentIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!hasCars) return;
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused, cars.length, hasCars]);

  if (!hasCars || !currentCar) {
    return null;
  }

  return (
    <section
      className="relative min-h-screen bg-luxury-black overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={currentCar.images[0]}
            alt={`${currentCar.brand} ${currentCar.model}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/70 to-luxury-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-16 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-px bg-luxury-red" />
                <span className="text-micro uppercase tracking-ultra text-luxury-red font-semibold">
                  {t('homePage.common.modelsRange')}
                </span>
              </div>

              <h2 className="text-[clamp(48px,8vw,120px)] font-bold leading-[0.9] tracking-[-0.03em] text-white uppercase mb-6"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                {currentCar.model}
              </h2>

              <p className="text-xl text-white/70 font-light mb-8 max-w-lg leading-relaxed">
                {localizedText(('description' in currentCar ? currentCar.description : undefined), { lng: i18n.language, fallbackLng: 'ru' })}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div>
                  <div className="text-luxury-red text-xs uppercase tracking-wider mb-2 font-semibold">{t('homePage.common.power')}</div>
                  <div className="text-2xl text-white font-light" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    {currentCar.specifications.power.split(' ')[0]}
                  </div>
                  <div className="text-xs text-white/50">HP</div>
                </div>
                <div>
                  <div className="text-luxury-red text-xs uppercase tracking-wider mb-2 font-semibold">{t('homePage.common.acceleration')}</div>
                  <div className="text-2xl text-white font-light" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    {currentCar.specifications.acceleration}
                  </div>
                </div>
                <div>
                  <div className="text-luxury-red text-xs uppercase tracking-wider mb-2 font-semibold">{t('homePage.common.price')}</div>
                  <div className="text-lg text-white font-light" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    {formatPrice(currentCar.price)}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link to={`/car/${currentCar.id}`} className="btn-primary inline-flex items-center gap-2">
                  {t('homePage.common.details')} <ArrowRight size={16} />
                </Link>
                <Link to="/catalog" className="btn-outline inline-flex items-center gap-2">
                  {t('homePage.common.allModels')}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: Navigation Dots & Controls */}
          <div className="hidden lg:flex flex-col items-end gap-8">
            {/* Navigation Dots */}
            <div className="flex flex-col gap-4">
              {cars.map((car: Car, idx: number) => (
                <button
                  key={car.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="group flex items-center gap-4 transition-all duration-400"
                >
                  <span className={`text-xs uppercase tracking-wider transition-all duration-400 ${
                    idx === currentIndex ? 'text-white opacity-100' : 'text-white/30 opacity-0 group-hover:opacity-100'
                  }`}>
                    {car.model}
                  </span>
                  <div className={`h-px transition-all duration-600 ${
                    idx === currentIndex ? 'w-16 bg-luxury-red' : 'w-8 bg-white/20 group-hover:w-12 group-hover:bg-white/40'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
        <button
          onClick={prevSlide}
          className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-luxury-red hover:bg-luxury-red/10 transition-all duration-400"
          aria-label="Previous"
        >
          <ChevronRight size={20} className="text-white rotate-180" />
        </button>

        {/* Progress indicators */}
        <div className="flex gap-2">
          {cars.map((_: Car, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="relative h-1 w-12 bg-white/10 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-luxury-red"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: idx === currentIndex ? 1 : 0 }}
                transition={{ duration: idx === currentIndex && !isPaused ? 5 : 0.3, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-luxury-red hover:bg-luxury-red/10 transition-all duration-400"
          aria-label="Next"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
};

/* ================================================================
   MODEL GRID CARD
   ================================================================ */
const ModelGridCard = ({ car, index, onEdit }: { car: Car; index: number; onEdit: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="relative"
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}>
      <VisualInlineEditLink onClick={onEdit} label="Авто" className="right-4 top-4" />
      <Link to={`/car/${car.id}`} className="block group relative overflow-hidden rounded-sm">
        <div className="relative aspect-[16/9] overflow-hidden bg-luxury-elevated">
          <img src={car.images[0]} alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" loading="lazy"
            onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
            <div className="text-[10px] uppercase tracking-[0.25em] text-luxury-burgundy mb-2">{car.brand} {car.year}</div>
            <h3 className="text-2xl lg:text-3xl font-bold text-white group-hover:text-luxury-burgundy transition-colors duration-400"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{car.model}</h3>
            <div className="mt-2 text-sm text-white/20 font-light">от {formatPrice(car.price)}</div>
            <div className="mt-3 h-0 group-hover:h-10 overflow-hidden transition-all duration-500">
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span>{car.specifications.power}</span><span className="w-1 h-1 rounded-full bg-white/10" /><span>{car.specifications.acceleration}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
