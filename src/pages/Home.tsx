import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform, useInView, useScroll } from 'framer-motion';
import { ArrowRight, Play, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cars } from '../data/cars';
import { SITE_IMAGES } from '../data/siteImages';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';

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

const ParallaxImage = ({ src, alt, className = '', speed = 0.3 }: {
  src: string; alt: string; className?: string; speed?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y }} className="w-full h-[120%] object-cover" />
    </div>
  );
};

/* ================================================================
   MAIN HOME COMPONENT
   ================================================================ */
export const Home = () => {
  const { t } = useTranslation();
  const featuredCars = cars.filter(car => car.featured);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const horizontalInnerRef = useRef<HTMLDivElement>(null);

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

      // Horizontal scroll
      if (horizontalRef.current && horizontalInnerRef.current) {
        const totalWidth = horizontalInnerRef.current.scrollWidth - window.innerWidth;
        gsap.to(horizontalInnerRef.current, {
          x: -totalWidth, ease: 'none',
          scrollTrigger: { trigger: horizontalRef.current, start: 'top top', end: () => `+=${totalWidth}`, scrub: 1, pin: true, anticipatePin: 1 },
        });
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
            onError={(e) => { e.currentTarget.src = SITE_IMAGES.philosophy; }}
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
            LUXURY AUTO
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
                  { val: '551', unit: 'л.с.', label: 'Мощность' },
                  { val: '4.8', unit: 'с', label: '0-100 км/ч' },
                  { val: '230', unit: 'км/ч', label: 'Макс.' },
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
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 [writing-mode:vertical-lr]">Scroll</span>
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

      {/* ============================================================
          SECTION: FLAGSHIP METRICS BAR
          ============================================================ */}
      <section className="relative py-20 lg:py-28 border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            {[
              { num: 8, suf: '', label: 'Моделей' },
              { num: 551, suf: '', label: 'Макс. л.с.' },
              { num: 150, suf: '+', label: 'Клиентов' },
              { num: 5, suf: '', label: 'Лет на рынке' },
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
          SECTION: FEATURED MODELS — HORIZONTAL SCROLL
          ============================================================ */}
      <section ref={horizontalRef} className="relative h-screen">
        <div className="h-full flex items-center">
          <div ref={horizontalInnerRef} className="flex items-center gap-6 px-16 h-full">
            {/* Intro card */}
            <div className="flex-shrink-0 w-[400px] lg:w-[480px] h-full flex flex-col justify-center pr-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('featured.subtitle')}</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-6"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                {t('featured.title')}
              </h2>
              <p className="text-base text-white/30 font-light mb-8 max-w-sm">
                Откройте для себя флагманские модели, которые определяют новый стандарт роскоши
              </p>
              <Link to="/catalog" className="group inline-flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Все модели</span>
                <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                  <ArrowRight size={14} className="text-white/50 group-hover:text-white transition-colors" />
                </span>
              </Link>
            </div>

            {/* Car Cards */}
            {featuredCars.map((car, index) => (
              <HorizontalCarCard key={car.id} car={car} index={index} />
            ))}

            {/* View All */}
            <div className="flex-shrink-0 w-[300px] h-[70vh] flex items-center justify-center">
              <Link to="/catalog" className="group flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-luxury-burgundy group-hover:bg-luxury-burgundy/5 transition-all duration-500">
                  <ArrowRight size={24} className="text-white/30 group-hover:text-luxury-burgundy transition-colors" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/20 group-hover:text-white/50 transition-colors">Весь каталог</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: PHILOSOPHY (Cinematic split)
          ============================================================ */}
      <section className="relative py-32 lg:py-48 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">Философия</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-8"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                Представьте<br /><span className="text-white/20">совершенство</span>
              </h2>
              <p className="text-lg text-white/40 font-light leading-relaxed mb-6 max-w-lg">
                Каждый автомобиль — это продолжение вашей личности. Линии кузова, продолжающиеся
                в каждой детали. Фары как источник вдохновения.
              </p>
              <p className="text-base text-white/20 font-light leading-relaxed mb-12 max-w-lg">
                Каждый автомобиль в нашей коллекции — это заявление об утончённом вкусе,
                исключительном мастерстве и вневременной элегантности.
              </p>
              <Link to="/about" className="group inline-flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Узнать больше</span>
                <span className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-500">
                  <ArrowRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <ParallaxImage
                  src={SITE_IMAGES.philosophy}
                  alt="Luxury Philosophy" className="w-full h-full" speed={0.2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 lg:-left-12 bg-luxury-surface/90 backdrop-blur-xl border border-white/5 p-6"
              >
                <div className="text-[11px] uppercase tracking-[0.2em] text-luxury-burgundy mb-2">С 2020 года</div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>150+</div>
                <div className="text-xs text-white/30">довольных клиентов</div>
              </motion.div>
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
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">Технологии безопасности</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              Тотальное<br /><span className="text-white/20">управление</span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video overflow-hidden rounded-sm group cursor-pointer"
          >
            <img src={SITE_IMAGES.cta} alt="Hongqi" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
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
                  <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-2">Hongqi Safety</span>
                  <span className="text-xl lg:text-2xl text-white font-light">Смотреть о технологиях безопасности</span>
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
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">Модельный ряд</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              Найдите свой<br /><span className="text-white/20">Hongqi</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cars.slice(0, 4).map((car, index) => (
              <ModelGridCard key={car.id} car={car} index={index} />
            ))}
          </div>
          <div className="mt-16 text-center gsap-reveal">
            <MagneticButton to="/catalog" className="btn-primary inline-flex items-center gap-3">
              Все модели <ArrowRight size={16} />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: OFFERS
          ============================================================ */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex items-end justify-between mb-16 gsap-reveal">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">Спецпредложения</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                Актуальные<br /><span className="text-white/20">акции</span>
              </h2>
            </div>
            <Link to="/offers" className="hidden md:flex items-center gap-3 text-white/20 hover:text-white/60 transition-colors group">
              <span className="text-[11px] uppercase tracking-[0.2em]">Все акции</span>
              <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Трейд-ин на E-HS9', desc: 'Скидка до 500 000 ₸ при сдаче старого авто', badge: 'Хит', image: cars[0]?.images[0] },
              { title: 'Кредит от 0.01%', desc: 'Специальная ставка на весь модельный ряд', badge: 'Кредит', image: cars[1]?.images[0] },
              { title: 'Бесплатное ТО', desc: '3 года бесплатного обслуживания при покупке H9', badge: 'Сервис', image: cars[2]?.images[0] },
            ].map((offer, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/offers" className="block group">
                  <div className="bg-luxury-elevated border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-500">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={offer.image} alt={offer.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-70" />
                      <div className="absolute top-3 left-3 bg-luxury-burgundy px-2.5 py-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white">{offer.badge}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-luxury-burgundy transition-colors"
                        style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{offer.title}</h3>
                      <p className="text-sm text-white/30 font-light">{offer.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: CINEMATIC CTA
          ============================================================ */}
      <section className="relative py-40 lg:py-56 overflow-hidden">
        <div className="absolute inset-0">
          <ParallaxImage src={SITE_IMAGES.cta} alt="Hongqi" className="w-full h-full" speed={0.15} />
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

      <ContactFormSection />
      <Footer />
    </div>
  );
};

/* ================================================================
   HORIZONTAL CAR CARD
   ================================================================ */
const HorizontalCarCard = ({ car, index }: { car: typeof cars[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); setIsHovered(false); }}
      className="flex-shrink-0 w-[380px] lg:w-[460px]"
    >
      <Link to={`/car/${car.id}`} className="block group">
        <motion.div animate={{ y: isHovered ? -6 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-luxury-elevated border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-500">
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.img animate={{ scale: isHovered ? 1.06 : 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-70" />
            <div className="absolute top-5 right-5">
              <span className="text-6xl font-bold text-white/[0.03]" style={{ fontFamily: "'Space Grotesk', monospace" }}>0{index + 1}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-[0.25em] text-luxury-burgundy mb-2">{car.brand}</div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-luxury-burgundy transition-colors duration-400"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{car.model}</h3>
            <div className="flex items-center gap-3 text-xs text-white/20 mb-4">
              <span>{car.specifications.power}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>{car.specifications.acceleration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg text-white font-light" style={{ fontFamily: "'Space Grotesk', monospace" }}>{formatPrice(car.price)}</span>
              <motion.div animate={{ x: isHovered ? 4 : 0 }} className="text-luxury-burgundy"><ArrowRight size={16} /></motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

/* ================================================================
   MODEL GRID CARD
   ================================================================ */
const ModelGridCard = ({ car, index }: { car: typeof cars[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}>
      <Link to={`/car/${car.id}`} className="block group relative overflow-hidden rounded-sm">
        <div className="relative aspect-[16/9] overflow-hidden bg-luxury-elevated">
          <img src={car.images[0]} alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" loading="lazy" />
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
