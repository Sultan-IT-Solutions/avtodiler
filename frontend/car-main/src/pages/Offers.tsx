import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { useOffers } from '../lib/hooks';
import { uploadUrl } from '../lib/api';

const HEADING_FONT = { fontFamily: "'Montserrat', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'Space Grotesk', monospace" };

export const Offers = () => {
  const { data, loading, error, reload } = useOffers();
  const offers = data ?? [];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <div className="bg-luxury-black min-h-screen">
      {error && (
        <div className="bg-red-950/40 border-b border-red-500/20 text-red-100">
          <div className="container mx-auto px-6 lg:px-16 py-3 flex items-center justify-between gap-4">
            <div className="text-sm">Ошибка загрузки предложений: {error}</div>
            <button onClick={reload} className="text-sm underline hover:no-underline">
              Повторить
            </button>
          </div>
        </div>
      )}

      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img
            src={
              offers[0]?.image
                ? uploadUrl(offers[0].image)
                : 'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/297/19297/01jaz17hfkatcmvsxywakv7ggd.jpg'
            }
            alt="Offers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-luxury-black/30 to-luxury-black" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-16 lg:pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">Спецпредложения</span>
            </div>

            <div className="overflow-hidden mb-1">
              <h1
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                style={HEADING_FONT}
              >
                Предложения
              </h1>
            </div>

            <div className="overflow-hidden">
              <span
                className="block text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white/20 uppercase"
                style={HEADING_FONT}
              >
                и акции
              </span>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <span className="text-white/50 text-sm font-light" style={MONO_FONT}>
                {loading ? '--' : String(offers.length).padStart(2, '0')}
              </span>
              <div className="w-6 h-px bg-white/20" />
              <span className="text-white/30 text-sm font-light">активных предложений</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="space-y-10 lg:space-y-14">
            {offers.map((offer: any, i: number) => (
              <motion.div
                key={offer.id ?? i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div className="bg-luxury-elevated border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-600">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    <div className="lg:col-span-2 relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                      <img
                        src={offer.image ? uploadUrl(offer.image) : undefined}
                        alt={offer.titleRu || offer.titleEn || offer.titleKz || ''}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-luxury-elevated/60 hidden lg:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 to-transparent lg:hidden" />

                      <div className="absolute top-4 left-4 bg-luxury-burgundy px-4 py-1.5">
                        <span className="text-[11px] uppercase tracking-[0.25em] text-white flex items-center gap-2">
                          <Tag size={12} />
                          {offer.badge || 'Акция'}
                        </span>
                      </div>

                      <div className="absolute bottom-4 right-4 hidden lg:block">
                        <span className="text-[64px] font-bold leading-none text-white/[0.04]" style={MONO_FONT}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                      <h3
                        className="text-xl lg:text-2xl font-bold text-white mb-4 group-hover:text-luxury-burgundy transition-colors duration-400 uppercase tracking-[-0.02em]"
                        style={HEADING_FONT}
                      >
                        {offer.titleRu || offer.titleEn || offer.titleKz}
                      </h3>

                      <p className="text-white/40 font-light leading-relaxed mb-8 max-w-xl">
                        {offer.descriptionRu || offer.descriptionEn || offer.descriptionKz}
                      </p>

                      <div className="h-px bg-white/5 mb-6" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-white/30">
                          <Clock size={14} className="text-luxury-burgundy" />
                          <span className="text-sm font-light">
                            Действует до: <span style={MONO_FONT}>{offer.validUntil || 'Не указано'}</span>
                          </span>
                        </div>
                        <Link
                          to="/test-drive"
                          className="inline-flex items-center gap-2 text-luxury-burgundy hover:text-luxury-burgundyHover transition-colors group/link"
                        >
                          <span className="text-[11px] uppercase tracking-[0.25em]">Подробнее</span>
                          <ArrowRight size={14} className="transition-transform duration-400 group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {!loading && offers.length === 0 && (
              <div className="text-white/40">Сейчас нет активных предложений.</div>
            )}
          </div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />
    </div>
  );
};

export default Offers;
