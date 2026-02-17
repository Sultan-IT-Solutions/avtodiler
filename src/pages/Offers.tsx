import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_IMAGES } from '../data/siteImages';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';

const HEADING_FONT = { fontFamily: "'Montserrat', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'Space Grotesk', monospace" };

const offers = [
  {
    id: 1,
    title: '\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u043D\u0430 Hongqi E-HS9',
    description:
      '\u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u043B\u0430\u0433\u043C\u0430\u043D \u043F\u043E \u0432\u044B\u0433\u043E\u0434\u043D\u043E\u0439 \u0446\u0435\u043D\u0435. \u0422\u0440\u0435\u0439\u0434-\u0438\u043D \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u2014 \u0441\u043A\u0438\u0434\u043A\u0430 \u0434\u043E 500 000 \u20B8 \u043F\u0440\u0438 \u0441\u0434\u0430\u0447\u0435 \u0441\u0442\u0430\u0440\u043E\u0433\u043E \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F.',
    image:
      'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/297/19297/01jaz17hfkatcmvsxywakv7ggd.jpg',
    badge: '\u0425\u0438\u0442',
    validUntil: '31 \u043C\u0430\u0440\u0442\u0430 2025',
  },
  {
    id: 2,
    title: '\u041A\u0440\u0435\u0434\u0438\u0442 \u043E\u0442 0.01% \u043D\u0430 \u0432\u0435\u0441\u044C \u043C\u043E\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u0440\u044F\u0434',
    description:
      '\u041E\u0444\u043E\u0440\u043C\u0438\u0442\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C Hongqi \u0432 \u043A\u0440\u0435\u0434\u0438\u0442 \u043F\u043E \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0442\u0430\u0432\u043A\u0435. \u041F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0439 \u0432\u0437\u043D\u043E\u0441 \u043E\u0442 20%. \u0421\u0440\u043E\u043A \u0434\u043E 7 \u043B\u0435\u0442.',
    image:
      'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/856/19856/01jqdpmr8bngv811xjr27qk8w7.jpg',
    badge: '\u041A\u0440\u0435\u0434\u0438\u0442',
    validUntil: '28 \u0444\u0435\u0432\u0440\u0430\u043B\u044F 2025',
  },
  {
    id: 3,
    title: '\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0422\u041E \u043F\u0440\u0438 \u043F\u043E\u043A\u0443\u043F\u043A\u0435 H9',
    description:
      '\u041F\u0440\u0438 \u043F\u043E\u043A\u0443\u043F\u043A\u0435 Hongqi H9 \u2014 3 \u0433\u043E\u0434\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0433\u043E \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044F \u0432 \u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u043C \u0441\u0435\u0440\u0432\u0438\u0441\u043D\u043E\u043C \u0446\u0435\u043D\u0442\u0440\u0435.',
    image:
      'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/1/470/1470/01j0bsdmd342djpxh9a0hbsdqh.jpg',
    badge: '\u0421\u0435\u0440\u0432\u0438\u0441',
    validUntil: '15 \u0430\u043F\u0440\u0435\u043B\u044F 2025',
  },
  {
    id: 4,
    title: '\u0417\u0438\u043C\u043D\u0438\u0435 \u0448\u0438\u043D\u044B \u0432 \u043F\u043E\u0434\u0430\u0440\u043E\u043A',
    description:
      '\u041F\u0440\u0438 \u043F\u043E\u043A\u0443\u043F\u043A\u0435 \u043B\u044E\u0431\u043E\u0433\u043E \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F Hongqi \u0434\u043E \u043A\u043E\u043D\u0446\u0430 \u0444\u0435\u0432\u0440\u0430\u043B\u044F \u2014 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u044B\u0445 \u0437\u0438\u043C\u043D\u0438\u0445 \u0448\u0438\u043D \u0432 \u043F\u043E\u0434\u0430\u0440\u043E\u043A.',
    image:
      'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/22/443/22443/01k3pbpxbtz8zsf92kp8esmjd8.jpg',
    badge: '\u041F\u043E\u0434\u0430\u0440\u043E\u043A',
    validUntil: '28 \u0444\u0435\u0432\u0440\u0430\u043B\u044F 2025',
  },
  {
    id: 5,
    title: '\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u0434\u043B\u044F \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432',
    description:
      '\u0421\u043A\u0438\u0434\u043A\u0430 15% \u043D\u0430 \u0432\u0441\u0435 \u0443\u0441\u043B\u0443\u0433\u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u043D\u043E\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430 \u0434\u043B\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0445 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439 Hongqi.',
    image:
      'https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/22/316/22316/01k2phgvm20tey34x8x6ccz27a.jpg',
    badge: '\u041B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u044C',
    validUntil: '\u0411\u0435\u0441\u0441\u0440\u043E\u0447\u043D\u043E',
  },
];

export const Offers = () => {
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
      {/* ====== HERO ====== */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[500px] overflow-hidden"
      >
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src="https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/297/19297/01jaz17hfkatcmvsxywakv7ggd.jpg"
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
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">
                {'\u0421\u043F\u0435\u0446\u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F'}
              </span>
            </div>
            <div className="overflow-hidden mb-1">
              <h1
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                style={HEADING_FONT}
              >
                {'\u041F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F'}
              </h1>
            </div>
            <div className="overflow-hidden">
              <span
                className="block text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white/80 uppercase"
                style={HEADING_FONT}
              >
                {'\u0438 \u0430\u043A\u0446\u0438\u0438'}
              </span>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <span className="text-white/50 text-sm font-light" style={MONO_FONT}>
                {String(offers.length).padStart(2, '0')}
              </span>
              <div className="w-6 h-px bg-white/20" />
              <span className="text-white/30 text-sm font-light">
                {'\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0439'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== OFFERS LIST ====== */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="space-y-10 lg:space-y-14">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 1,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group"
              >
                <div className="bg-luxury-elevated border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-600">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    {/* Image */}
                    <div className="lg:col-span-2 relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-luxury-elevated/60 hidden lg:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 to-transparent lg:hidden" />

                      {/* Badge */}
                      <div className="absolute top-4 left-4 bg-luxury-burgundy px-4 py-1.5">
                        <span className="text-[11px] uppercase tracking-[0.25em] text-white flex items-center gap-2">
                          <Tag size={12} />
                          {offer.badge}
                        </span>
                      </div>

                      {/* Index number */}
                      <div className="absolute bottom-4 right-4 hidden lg:block">
                        <span
                          className="text-[64px] font-bold leading-none text-white/[0.04]"
                          style={MONO_FONT}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                      <h3
                        className="text-xl lg:text-2xl font-bold text-white mb-4 group-hover:text-luxury-burgundy transition-colors duration-400 uppercase tracking-[-0.02em]"
                        style={HEADING_FONT}
                      >
                        {offer.title}
                      </h3>

                      <p className="text-white/40 font-light leading-relaxed mb-8 max-w-xl">
                        {offer.description}
                      </p>

                      <div className="h-px bg-white/5 mb-6" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-white/30">
                          <Clock size={14} className="text-luxury-burgundy" />
                          <span className="text-sm font-light">
                            {'\u0414\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043E: '}
                            <span style={MONO_FONT}>{offer.validUntil}</span>
                          </span>
                        </div>
                        <Link
                          to="/test-drive"
                          className="inline-flex items-center gap-2 text-luxury-burgundy hover:text-luxury-burgundyHover transition-colors group/link"
                        >
                          <span className="text-[11px] uppercase tracking-[0.25em]">
                            {'\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435'}
                          </span>
                          <ArrowRight
                            size={14}
                            className="transition-transform duration-400 group-hover/link:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-24 lg:py-40 bg-luxury-surface">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-8 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">
                {'\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B'}
              </span>
              <div className="w-8 h-px bg-luxury-burgundy" />
            </div>

            <h2
              className="text-[clamp(28px,4vw,56px)] font-bold leading-[1.1] tracking-[-0.03em] text-white uppercase mb-6"
              style={HEADING_FONT}
            >
              {'\u041D\u0435 \u043D\u0430\u0448\u043B\u0438 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0435\u0435'}
              <br />
              <span className="text-white/90">
                {'\u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435?'}
              </span>
            </h2>

            <p className="text-white/40 font-light mb-12 max-w-lg mx-auto text-base leading-relaxed">
              {'\u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u043C\u0438 \u2014 \u043C\u044B \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u043C \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435'}
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 px-10 py-4 bg-luxury-burgundy text-white text-[11px] uppercase tracking-[0.25em] hover:bg-luxury-burgundyHover transition-colors duration-400"
            >
              {'\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043D\u0430\u043C\u0438'}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />
    </div>
  );
};
