import { useRef, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE_IMAGES } from '../data/siteImages';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const brandInfo = {
  name: 'Hongqi',
  taglineKey: 'brandsPage.brand.tagline',
  founded: '1958',
  originKey: 'brandsPage.brand.origin',
  philosophyKey: 'brandsPage.brand.philosophy',
  descriptionKey: 'brandsPage.brand.description',
  values: [
    { titleKey: 'brandsPage.values.heritage.title', textKey: 'brandsPage.values.heritage.text' },
    { titleKey: 'brandsPage.values.innovation.title', textKey: 'brandsPage.values.innovation.text' },
    { titleKey: 'brandsPage.values.craftsmanship.title', textKey: 'brandsPage.values.craftsmanship.text' },
    { titleKey: 'brandsPage.values.safety.title', textKey: 'brandsPage.values.safety.text' },
  ],
  milestones: [
    { year: '1958', eventKey: 'brandsPage.milestones.1958' },
    { year: '1981', eventKey: 'brandsPage.milestones.1981' },
    { year: '2018', eventKey: 'brandsPage.milestones.2018' },
    { year: '2020', eventKey: 'brandsPage.milestones.2020' },
    { year: '2023', eventKey: 'brandsPage.milestones.2023' },
    { year: '2024', eventKey: 'brandsPage.milestones.2024' },
  ],
};

export const Brands = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [1, 0.6, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOverlay = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 1]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (heroContentRef.current) {
        const lines = heroContentRef.current.querySelectorAll('.hero-reveal');
        gsap.fromTo(lines, { y: 120, opacity: 0, skewY: 3 }, { y: 0, opacity: 1, skewY: 0, duration: 1.4, ease: 'power4.out', stagger: 0.1, delay: 0.3 });
      }
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.fromTo(el, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
      });
      if (timelineLineRef.current) {
        gsap.fromTo(timelineLineRef.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timelineLineRef.current, start: 'top 80%', end: 'bottom 20%', scrub: 0.8 } });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-luxury-black">

      {/* HERO */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 will-change-transform">
          <img src={SITE_IMAGES.hero} alt="Hongqi" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = SITE_IMAGES.philosophy; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }} />
        </motion.div>
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-luxury-black/60 via-transparent to-luxury-black" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-luxury-black/70 via-luxury-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] z-[3] bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
        <motion.div className="absolute inset-0 z-[5] bg-luxury-black pointer-events-none" style={{ opacity: heroOverlay }} />
        <div className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[clamp(100px,18vw,280px)] font-bold uppercase tracking-[-0.05em] select-none whitespace-nowrap" style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1px rgba(255,255,255,0.03)', color: 'transparent' }}>HONGQI</span>
        </div>
        <motion.div ref={heroContentRef} style={{ opacity: heroOpacity }} className="relative z-[10] container mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-16 lg:pb-24">
          <div className="overflow-hidden mb-5">
            <div className="hero-reveal flex items-center gap-3">
              <span className="w-10 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('brandsPage.hero.eyebrow')}</span>
            </div>
          </div>
          <div className="max-w-5xl mb-4">
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-[clamp(52px,9vw,140px)] font-bold leading-[0.9] tracking-[-0.04em] text-white uppercase" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{brandInfo.name}</h1>
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="hero-reveal text-base lg:text-lg text-white/40 max-w-xl font-light leading-relaxed">{t(brandInfo.taglineKey)}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2 }} className="absolute bottom-8 right-8 lg:right-16 z-[10] flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 [writing-mode:vertical-lr]">{t('brandsPage.hero.scroll')}</span>
          <div className="w-px h-16 bg-white/5 relative overflow-hidden">
            <motion.div className="absolute top-0 left-0 w-full bg-luxury-burgundy" animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>
        <div className="absolute left-6 lg:left-16 top-0 bottom-0 z-[8] hidden lg:flex flex-col items-center justify-center">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>
      </section>

      {/* PHILOSOPHY — Large split layout */}
      <section className="relative py-32 lg:py-48 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('brandsPage.philosophy.eyebrow')}</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-8" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t('brandsPage.philosophy.titleLine1')}<br /><span className="text-white/90">{t('brandsPage.philosophy.titleLine2')}</span></h2>
              <div className="w-16 h-px bg-white/10 mb-8" />
              <p className="text-lg text-white/85 font-light leading-relaxed mb-6 max-w-lg">{t(brandInfo.philosophyKey)}</p>
              <p className="text-base text-white/70 font-light leading-relaxed max-w-lg">{t(brandInfo.descriptionKey)}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-6 relative">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={SITE_IMAGES.philosophy} alt="Hongqi" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} className="absolute -bottom-6 -left-6 lg:-left-12 bg-luxury-surface/90 backdrop-blur-xl border border-white/5 p-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-luxury-burgundy mb-2">{t('brandsPage.philosophy.foundedLabel')}</div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>{brandInfo.founded}</div>
                <div className="text-xs text-white/30">{t(brandInfo.originKey)}</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES — Numbered 01-04 grid */}
      <section className="py-32 lg:py-48 bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20 gsap-reveal">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{t('brandsPage.values.eyebrow')}</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t('brandsPage.values.titleLine1')}<br /><span className="text-white/90">Hongqi</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brandInfo.values.map((v, i) => (
              <motion.div key={v.titleKey} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className="group relative bg-luxury-elevated border border-white/5 p-8 lg:p-10 hover:border-white/10 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-burgundy/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="text-[clamp(48px,5vw,72px)] font-bold text-luxury-burgundy/20 mb-4 leading-none tracking-[-0.03em]" style={{ fontFamily: "'Space Grotesk', monospace" }}>0{i + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-[-0.01em] group-hover:text-luxury-burgundy transition-colors duration-400" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t(v.titleKey)}</h3>
                  <p className="text-sm text-white/30 font-light leading-relaxed">{t(v.textKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">{t('brandsPage.video.eyebrow')}</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t('brandsPage.video.titleLine1')}<br /><span className="text-white/90">Hongqi</span></h2>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="relative aspect-video overflow-hidden group cursor-pointer">
            <img src={SITE_IMAGES.cta} alt="Hongqi" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.philosophy; }; }} />
            <div className="absolute inset-0 bg-luxury-black/40 group-hover:bg-luxury-black/20 transition-colors duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Play size={28} className="text-white ml-1" fill="currentColor" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-transparent">
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-2">{t('brandsPage.video.eyebrow')}</span>
              <span className="text-xl lg:text-2xl text-white font-bold uppercase tracking-[-0.01em]" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t('brandsPage.video.cardTitle')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-32 lg:py-48 bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-20 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">{t('brandsPage.timeline.eyebrow')}</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t('brandsPage.timeline.titleLine1')}<br /><span className="text-white/90">{t('brandsPage.timeline.titleLine2')}</span></h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />
            <div ref={timelineLineRef} className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-luxury-burgundy via-luxury-burgundy/50 to-luxury-burgundy/10 -translate-x-1/2 origin-top" style={{ transformOrigin: 'top center' }} />
            {brandInfo.milestones.map((m, i) => (
              <motion.div key={m.year + i} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className={`relative flex items-start gap-8 mb-16 last:mb-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-luxury-burgundy border-4 border-luxury-surface" />
                  <div className="absolute w-8 h-8 rounded-full bg-luxury-burgundy/20 animate-pulse-slow" />
                </div>
                <div className={`ml-16 lg:ml-0 lg:w-1/2 ${i % 2 === 0 ? 'lg:pr-20 lg:text-right' : 'lg:pl-20'}`}>
                  <div className="bg-luxury-elevated border border-white/5 p-6 lg:p-8 hover:border-white/10 transition-all duration-500">
                    <div className="text-2xl font-bold text-luxury-burgundy mb-2 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', monospace" }}>{m.year}</div>
                    <p className="text-sm text-white/30 font-light leading-relaxed">{t(m.eventKey)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-40 lg:py-56 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SITE_IMAGES.secondary} alt="Hongqi" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }} />
          <div className="absolute inset-0 bg-luxury-black/80" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-luxury-burgundy/5 blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto px-6 lg:px-16 text-center">
          <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[clamp(80px,12vw,200px)] font-bold uppercase tracking-[-0.05em] block mb-4 select-none" style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1.5px rgba(255,255,255,0.06)', color: 'transparent' }}>EXPLORE</span>
            <h2 className="text-[clamp(24px,3vw,48px)] font-bold text-white uppercase tracking-[-0.02em] mb-6" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>{t('brandsPage.cta.title')}</h2>
            <p className="text-base text-white/30 font-light mb-10 max-w-xl mx-auto">{t('brandsPage.cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/catalog" className="group inline-flex items-center gap-3 bg-luxury-burgundy hover:bg-luxury-burgundy/90 text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] transition-all duration-400">{t('brandsPage.cta.primary')}<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></Link>
              <Link to="/contact" className="inline-flex items-center gap-3 border border-white/10 hover:border-white/25 text-white/60 hover:text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] transition-all duration-400">{t('brandsPage.cta.secondary')}</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />
    </div>
  );
};
