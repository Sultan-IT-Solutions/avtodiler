import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const Hero = () => {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.4;

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-luxury-black">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 gpu-accelerated bg-luxury-black"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/70 via-luxury-black/50 to-luxury-black z-10" />
        <img
          src="https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/297/19297/01jaz17hfkatcmvsxywakv7ggd.jpg"
          alt="Hongqi"
          className="w-full h-full object-cover scale-110"
          loading="eager"
          onError={(e) => {
            console.log('Image failed to load');
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 h-full flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0, 0, 0.2, 1] }}
          className="max-w-5xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-luxury-red text-label uppercase tracking-luxury mb-6 font-semibold"
          >
            {t('hero.eyebrow')}
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0, 0, 0.2, 1] }}
            className="text-display gradient-text mb-8 uppercase tracking-[-0.02em]"
            style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-body-lg text-luxury-cream/90 max-w-3xl mx-auto mb-12"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/catalog" className="btn-primary">
              {t('hero.ctaPrimary')}
            </Link>
            <Link to="/contact" className="btn-outline">
              {t('hero.ctaSecondary')}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2 text-luxury-cream/60">
          <span className="text-xs uppercase tracking-luxury">Scroll</span>
          <ChevronDown className="animate-bounce-subtle" size={24} />
        </div>
      </motion.div>
    </section>
  );
};
