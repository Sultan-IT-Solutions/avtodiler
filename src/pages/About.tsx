import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, Users, Car, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE_IMAGES } from '../data/siteImages';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   ANIMATED COUNTER with Space Grotesk monospace numbers
   ================================================================ */
const Counter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const duration = 2200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target]);
  return <span ref={ref} style={{ fontFamily: "'Space Grotesk', monospace" }}>{count}{suffix}</span>;
};

/* ================================================================
   MAIN ABOUT COMPONENT
   ================================================================ */
export const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [1, 0.6, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOverlay = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 1]);

  const values = [
    { icon: Award, title: '\u041f\u0440\u0435\u0432\u043e\u0441\u0445\u043e\u0434\u0441\u0442\u0432\u043e', description: '\u041a\u0430\u0436\u0434\u044b\u0439 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442 \u0441\u0442\u0440\u043e\u0433\u0438\u0439 \u043e\u0442\u0431\u043e\u0440 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u043f\u0435\u0440\u0435\u0434 \u0442\u0435\u043c, \u043a\u0430\u043a \u043f\u043e\u043f\u0430\u0441\u0442\u044c \u0432 \u043d\u0430\u0448 \u0448\u043e\u0443\u0440\u0443\u043c.' },
    { icon: Users, title: '\u041a\u043b\u0438\u0435\u043d\u0442\u043e\u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0441\u0442\u044c', description: '\u041f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u0434\u0445\u043e\u0434 \u043a \u043a\u0430\u0436\u0434\u043e\u043c\u0443 \u043a\u043b\u0438\u0435\u043d\u0442\u0443. \u0412\u0430\u0448\u0435 \u0443\u0434\u043e\u0432\u043b\u0435\u0442\u0432\u043e\u0440\u0435\u043d\u0438\u0435 \u2014 \u043d\u0430\u0448 \u0433\u043b\u0430\u0432\u043d\u044b\u0439 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442.' },
    { icon: Car, title: '\u0418\u043d\u043d\u043e\u0432\u0430\u0446\u0438\u0438', description: '\u041c\u044b \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u043c \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442 \u0431\u0443\u0434\u0443\u0449\u0435\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c\u043d\u043e\u0439 \u0438\u043d\u0434\u0443\u0441\u0442\u0440\u0438\u0438.' },
    { icon: Shield, title: '\u0414\u043e\u0432\u0435\u0440\u0438\u0435', description: '\u041f\u043e\u043b\u043d\u0430\u044f \u043f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u043e\u0441\u0442\u044c \u043d\u0430 \u043a\u0430\u0436\u0434\u043e\u043c \u044d\u0442\u0430\u043f\u0435 \u2014 \u043e\u0442 \u0432\u044b\u0431\u043e\u0440\u0430 \u0434\u043e \u043f\u043e\u0441\u043b\u0435\u043f\u0440\u043e\u0434\u0430\u0436\u043d\u043e\u0433\u043e \u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u044f.' },
  ];

  const timeline = [
    { year: '2020', title: '\u041e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u0435', description: '\u041e\u0442\u043a\u0440\u044b\u0442\u0438\u0435 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u0448\u043e\u0443\u0440\u0443\u043c\u0430 \u0432 \u0410\u043b\u043c\u0430\u0442\u044b' },
    { year: '2021', title: '\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435', description: '\u0417\u0430\u043f\u0443\u0441\u043a \u0441\u0435\u0440\u0432\u0438\u0441\u043d\u043e\u0433\u043e \u0446\u0435\u043d\u0442\u0440\u0430 \u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435 \u043c\u043e\u0434\u0435\u043b\u044c\u043d\u043e\u0433\u043e \u0440\u044f\u0434\u0430' },
    { year: '2023', title: '\u041f\u0430\u0440\u0442\u043d\u0451\u0440\u0441\u0442\u0432\u043e', description: '\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0435 \u0434\u0438\u043b\u0435\u0440\u0441\u0442\u0432\u043e Hongqi \u0432 \u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d\u0435' },
    { year: '2024', title: '\u0420\u0435\u043a\u043e\u0440\u0434\u044b', description: '\u0411\u043e\u043b\u0435\u0435 150 \u0434\u043e\u0432\u043e\u043b\u044c\u043d\u044b\u0445 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432 \u0438 8 \u043c\u043e\u0434\u0435\u043b\u0435\u0439 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435' },
  ];

  const stats = [
    { number: 150, suffix: '+', label: '\u0414\u043e\u0432\u043e\u043b\u044c\u043d\u044b\u0445 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432' },
    { number: 8, suffix: '', label: '\u041c\u043e\u0434\u0435\u043b\u0435\u0439 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435' },
    { number: 5, suffix: '', label: '\u041b\u0435\u0442 \u043d\u0430 \u0440\u044b\u043d\u043a\u0435' },
    { number: 24, suffix: '/7', label: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430' },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (heroContentRef.current) {
        const lines = heroContentRef.current.querySelectorAll('.hero-reveal');
        gsap.fromTo(lines,
          { y: 120, opacity: 0, skewY: 3 },
          { y: 0, opacity: 1, skewY: 0, duration: 1.4, ease: 'power4.out', stagger: 0.1, delay: 0.3 }
        );
      }
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.fromTo(el,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }
        );
      });
      if (timelineLineRef.current) {
        gsap.fromTo(timelineLineRef.current,
          { scaleY: 0 },
          { scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: timelineLineRef.current, start: 'top 80%', end: 'bottom 20%', scrub: 0.8 } }
        );
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

        <div className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-luxury-black/60 via-transparent to-luxury-black" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-luxury-black/70 via-luxury-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] z-[3] bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
        <motion.div className="absolute inset-0 z-[5] bg-luxury-black pointer-events-none" style={{ opacity: heroOverlay }} />

        <div className="absolute inset-0 z-[6] flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[clamp(100px,18vw,280px)] font-bold uppercase tracking-[-0.05em] select-none whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1px rgba(255,255,255,0.03)', color: 'transparent' }}>
            ABOUT
          </span>
        </div>

        <motion.div ref={heroContentRef} style={{ opacity: heroOpacity }}
          className="relative z-[10] container mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-16 lg:pb-24">
          <div className="overflow-hidden mb-5">
            <div className="hero-reveal flex items-center gap-3">
              <span className="w-10 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{'\u041e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438'}</span>
            </div>
          </div>
          <div className="max-w-5xl mb-6">
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-[clamp(44px,8vw,120px)] font-bold leading-[0.9] tracking-[-0.04em] text-white uppercase"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                HONGQI AUTO
              </h1>
            </div>
            <div className="overflow-hidden">
              <span className="hero-reveal block text-[clamp(44px,8vw,120px)] font-bold leading-[0.9] tracking-[-0.04em] text-white/70 uppercase"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                KAZAKHSTAN
              </span>
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="hero-reveal text-base lg:text-lg text-white/40 max-w-lg font-light leading-relaxed">
              {'\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u0434\u0438\u043b\u0435\u0440 \u043f\u0440\u0435\u043c\u0438\u0430\u043b\u044c\u043d\u044b\u0445 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0435\u0439. \u041c\u044b \u0441\u043e\u0437\u0434\u0430\u0451\u043c \u0438\u0441\u043a\u043b\u044e\u0447\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043e\u043f\u044b\u0442 \u0432\u043b\u0430\u0434\u0435\u043d\u0438\u044f \u0441 2020 \u0433\u043e\u0434\u0430.'}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 right-8 lg:right-16 z-[10] flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 [writing-mode:vertical-lr]">Scroll</span>
          <div className="w-px h-16 bg-white/5 relative overflow-hidden">
            <motion.div className="absolute top-0 left-0 w-full bg-luxury-burgundy"
              animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>

        <div className="absolute left-6 lg:left-16 top-0 bottom-0 z-[8] hidden lg:flex flex-col items-center justify-center">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>
      </section>

      {/* MISSION */}
      <section className="relative py-32 lg:py-48 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{'\u041d\u0430\u0448\u0430 \u043c\u0438\u0441\u0441\u0438\u044f'}</span>
              </div>
              <blockquote className="mb-10">
                <p className="text-[clamp(24px,3.5vw,48px)] font-bold leading-[1.15] tracking-[-0.02em] text-white uppercase"
                  style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                  {'\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0441\u0430\u043c\u044b\u0439 \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u044b\u0439, \u044d\u043a\u043e\u043b\u043e\u0433\u0438\u0447\u043d\u044b\u0439 \u0438 \u044d\u043d\u0435\u0440\u0433\u043e\u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u044b\u0439'}{' '}
                  <span className="text-white/90">{'\u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c\u043d\u044b\u0439 \u043e\u043f\u044b\u0442'}</span>
                </p>
              </blockquote>
              <div className="w-16 h-px bg-white/10 mb-8" />
              <p className="text-lg text-white/40 font-light leading-relaxed mb-6 max-w-lg">
                {'\u041c\u044b \u0432\u0435\u0440\u0438\u043c, \u0447\u0442\u043e \u0440\u043e\u0441\u043a\u043e\u0448\u043d\u044b\u0439 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c \u2014 \u044d\u0442\u043e \u043d\u0435 \u043f\u0440\u043e\u0441\u0442\u043e \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u043e \u043f\u0435\u0440\u0435\u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f. \u042d\u0442\u043e \u043e\u0442\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0432\u0430\u0448\u0435\u0439 \u043b\u0438\u0447\u043d\u043e\u0441\u0442\u0438, \u0432\u0430\u0448\u0438\u0445 \u0446\u0435\u043d\u043d\u043e\u0441\u0442\u0435\u0439 \u0438 \u0441\u0442\u0440\u0435\u043c\u043b\u0435\u043d\u0438\u044f \u043a \u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u0441\u0442\u0432\u0443.'}
              </p>
              <p className="text-base text-white/25 font-light leading-relaxed max-w-lg">
                {'\u041a\u0430\u0436\u0434\u044b\u0439 Hongqi \u0432 \u043d\u0430\u0448\u0435\u043c \u0448\u043e\u0443\u0440\u0443\u043c\u0435 \u043f\u0440\u043e\u0448\u0451\u043b \u0442\u0449\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043e\u0442\u0431\u043e\u0440 \u0438 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0443, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432\u0430\u043c \u043d\u0435\u043f\u0440\u0435\u0432\u0437\u043e\u0439\u0434\u0451\u043d\u043d\u044b\u0439 \u043e\u043f\u044b\u0442 \u0432\u043b\u0430\u0434\u0435\u043d\u0438\u044f.'}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={SITE_IMAGES.philosophy} alt="Hongqi" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 lg:-left-12 bg-luxury-surface/90 backdrop-blur-xl border border-white/5 p-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-luxury-burgundy mb-2">{'\u0421 2020 \u0433\u043e\u0434\u0430'}</div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>150+</div>
                <div className="text-xs text-white/30">{'\u0434\u043e\u0432\u043e\u043b\u044c\u043d\u044b\u0445 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432'}</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-24 lg:py-40 border-y border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-luxury-burgundy/[0.03] blur-[150px]" />
        </div>
        <div className="relative container mx-auto px-6 lg:px-16">
          <div className="text-center mb-20 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">{'\u0412 \u0446\u0438\u0444\u0440\u0430\u0445'}</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              {'\u041d\u0430\u0448\u0438'} <span className="text-white/90">{'\u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b'}</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="text-center group">
                <div className="text-[clamp(40px,6vw,72px)] font-bold text-white leading-none tracking-[-0.03em] mb-3">
                  <Counter target={stat.number} suffix={stat.suffix} />
                </div>
                <div className="w-8 h-px bg-white/10 mx-auto mb-3 group-hover:w-12 group-hover:bg-luxury-burgundy transition-all duration-500" />
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/25">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20 gsap-reveal">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-px bg-luxury-burgundy" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">{'\u041d\u0430\u0448\u0438 \u0446\u0435\u043d\u043d\u043e\u0441\u0442\u0438'}</span>
              </div>
              <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                {'\u0427\u0442\u043e \u043d\u0430\u0441'}<br /><span className="text-white/90">{'\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442'}</span>
              </h2>
            </div>
            <p className="text-base text-white/30 font-light max-w-md lg:text-right">
              {'\u0427\u0435\u0442\u044b\u0440\u0435 \u043f\u0440\u0438\u043d\u0446\u0438\u043f\u0430, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043b\u0435\u0436\u0430\u0442 \u0432 \u043e\u0441\u043d\u043e\u0432\u0435 \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u043d\u0430\u0448\u0435\u0433\u043e \u0440\u0435\u0448\u0435\u043d\u0438\u044f \u0438 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u044f.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-luxury-elevated border border-white/5 p-8 lg:p-10 hover:border-white/10 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-burgundy/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="absolute top-6 right-8 text-[80px] font-bold text-white/[0.02] leading-none select-none"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  0{i + 1}
                </span>
                <div className="relative z-10">
                  <div className="w-14 h-14 border border-white/10 flex items-center justify-center mb-6 group-hover:border-luxury-burgundy/50 group-hover:bg-luxury-burgundy/10 transition-all duration-500">
                    <value.icon size={24} className="text-white/30 group-hover:text-luxury-burgundy transition-colors duration-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-[-0.01em] group-hover:text-luxury-burgundy transition-colors duration-400"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                    {value.title}
                  </h3>
                  <p className="text-sm text-white/30 font-light leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-32 lg:py-48 bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-20 gsap-reveal">
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-4">{'\u041d\u0430\u0448\u0430 \u0438\u0441\u0442\u043e\u0440\u0438\u044f'}</span>
            <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              {'\u041f\u0443\u0442\u044c \u043a'}<br /><span className="text-white/90">{'\u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u0441\u0442\u0432\u0443'}</span>
            </h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />
            <div ref={timelineLineRef}
              className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-luxury-burgundy via-luxury-burgundy/50 to-luxury-burgundy/10 -translate-x-1/2 origin-top"
              style={{ transformOrigin: 'top center' }} />
            {timeline.map((item, i) => (
              <motion.div key={item.year} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-start gap-8 mb-20 last:mb-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-luxury-burgundy border-4 border-luxury-surface" />
                  <div className="absolute w-8 h-8 rounded-full bg-luxury-burgundy/20 animate-pulse-slow" />
                </div>
                <div className={`ml-16 lg:ml-0 lg:w-1/2 ${i % 2 === 0 ? 'lg:pr-20 lg:text-right' : 'lg:pl-20'}`}>
                  <div className="bg-luxury-elevated border border-white/5 p-6 lg:p-8 hover:border-white/10 transition-all duration-500">
                    <div className="text-3xl font-bold text-luxury-burgundy mb-2 tracking-[-0.02em]"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}>
                      {item.year}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 uppercase tracking-[-0.01em]"
                      style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/30 font-light leading-relaxed">{item.description}</p>
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
          <img src={SITE_IMAGES.cta} alt="Hongqi" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.philosophy; }; }} />
          <div className="absolute inset-0 bg-luxury-black/80" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-luxury-burgundy/5 blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto px-6 lg:px-16 text-center">
          <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <span className="text-[clamp(80px,12vw,200px)] font-bold uppercase tracking-[-0.05em] block mb-4 select-none"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif", WebkitTextStroke: '1.5px rgba(255,255,255,0.06)', color: 'transparent' }}>
              READY
            </span>
            <h2 className="text-[clamp(24px,3vw,48px)] font-bold text-white uppercase tracking-[-0.02em] mb-6"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
              {'\u0413\u043e\u0442\u043e\u0432\u044b \u043d\u0430\u0447\u0430\u0442\u044c?'}
            </h2>
            <p className="text-base text-white/30 font-light mb-10 max-w-xl mx-auto">
              {'\u0417\u0430\u043f\u0438\u0448\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0443\u044e \u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u044e \u0438 \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043c\u0438\u0440 \u043f\u0440\u0435\u043c\u0438\u0430\u043b\u044c\u043d\u044b\u0445 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0435\u0439'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact"
                className="group inline-flex items-center gap-3 bg-luxury-burgundy hover:bg-luxury-burgundy/90 text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] transition-all duration-400">
                {'\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u043d\u0430\u043c\u0438'}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/catalog"
                className="inline-flex items-center gap-3 border border-white/10 hover:border-white/25 text-white/60 hover:text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] transition-all duration-400">
                {'\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043a\u0430\u0442\u0430\u043b\u043e\u0433'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />
    </div>
  );
};
