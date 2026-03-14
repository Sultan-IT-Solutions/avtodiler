import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_IMAGES } from '../data/siteImages';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { VisualInlineEditLink } from '../components/VisualInlineEditLink';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
} from '../components/InlineCmsModal';
import { useEffect, useState } from 'react';
import { publicApi } from '../utils/publicApi';
import { EmptyState } from '../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { buildAdminUrl } from '../utils/visualAdmin';
import { offersApi } from '../utils/adminApi';
import type { OfferItem } from '../types/admin';

const HEADING_FONT = { fontFamily: "'Montserrat', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'Space Grotesk', monospace" };

export const Offers = () => {
  const { t, i18n } = useTranslation();
  const [offers, setOffers] = useState(() => [] as Awaited<ReturnType<typeof publicApi.offers>>);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .offers()
      .then((items) => {
        if (!cancelled && items.length > 0) setOffers(items);
      })
      .catch(() => {
        // no local fallback by requirement
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const lang = i18n.language as 'ru' | 'kz' | 'en';
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
                {t('offersPage.hero.eyebrow')}
              </span>
            </div>
            <div className="overflow-hidden mb-1">
              <h1
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                style={HEADING_FONT}
              >
                {t('offersPage.hero.titleLine1')}
              </h1>
            </div>
            <div className="overflow-hidden">
              <span
                className="block text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white/80 uppercase"
                style={HEADING_FONT}
              >
                {t('offersPage.hero.titleLine2')}
              </span>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <span className="text-white/50 text-sm font-light" style={MONO_FONT}>
                {String(offers.length).padStart(2, '0')}
              </span>
              <div className="w-6 h-px bg-white/20" />
              <span className="text-white/30 text-sm font-light">
                {t('offersPage.hero.activeCountLabel')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Страница предложений"
          description="Редактирование акций и SEO этой страницы."
          actions={[
            { label: 'Предложения', href: buildAdminUrl('offers'), kind: 'primary' },
            { label: 'SEO', href: buildAdminUrl('seo') },
          ]}
        />
      </section>

      {/* ====== OFFERS LIST ====== */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          {offers.length === 0 ? (
            <EmptyState />
          ) : (
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
                className="group relative"
              >
                <VisualInlineEditLink onClick={() => setEditingOffer(offer)} label="Акция" />
                <div className="bg-luxury-elevated border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-600">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    {/* Image */}
                    <div className="lg:col-span-2 relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                      <img
                        src={offer.image}
                        alt={offer.title[lang] || offer.title.ru}
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
                          {offer.badge[lang] || offer.badge.ru}
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
                        {offer.title[lang] || offer.title.ru}
                      </h3>

                      <p className="text-white/40 font-light leading-relaxed mb-8 max-w-xl">
                        {offer.description[lang] || offer.description.ru}
                      </p>

                      <div className="h-px bg-white/5 mb-6" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-white/30">
                          <Clock size={14} className="text-luxury-burgundy" />
                          <span className="text-sm font-light">
                            {t('offersPage.card.validUntilLabel')}{' '}
                            <span style={MONO_FONT}>{offer.validUntil}</span>
                          </span>
                        </div>
                        <Link
                          to="/test-drive"
                          className="inline-flex items-center gap-2 text-luxury-burgundy hover:text-luxury-burgundyHover transition-colors group/link"
                        >
                          <span className="text-[11px] uppercase tracking-[0.25em]">
                            {t('offersPage.card.more')}
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
          )}
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
                {t('offersPage.cta.eyebrow')}
              </span>
              <div className="w-8 h-px bg-luxury-burgundy" />
            </div>

            <h2
              className="text-[clamp(28px,4vw,56px)] font-bold leading-[1.1] tracking-[-0.03em] text-white uppercase mb-6"
              style={HEADING_FONT}
            >
              {t('offersPage.cta.titleLine1')}
              <br />
              <span className="text-white/90">
                {t('offersPage.cta.titleLine2')}
              </span>
            </h2>

            <p className="text-white/40 font-light mb-12 max-w-lg mx-auto text-base leading-relaxed">
              {t('offersPage.cta.subtitle')}
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center gap-3 px-10 py-4 bg-luxury-burgundy text-white text-[11px] uppercase tracking-[0.25em] hover:bg-luxury-burgundyHover transition-colors duration-400"
            >
              {t('offersPage.cta.button')}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />

      {editingOffer ? (
        <InlineCmsModal
          title="Редактирование акции"
          onClose={() => setEditingOffer(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  await offersApi.upsert(editingOffer);
                  setOffers((current) =>
                    current.map((item) => (item.id === editingOffer.id ? editingOffer : item))
                  );
                  setEditingOffer(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={async () => {
                  if (!window.confirm('Удалить акцию?')) return;
                  await offersApi.remove(editingOffer.id);
                  setOffers((current) => current.filter((item) => item.id !== editingOffer.id));
                  setEditingOffer(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsLocaleFields
            label="Название"
            value={editingOffer.title}
            onChange={(title) => setEditingOffer({ ...editingOffer, title })}
          />
          <InlineCmsLocaleFields
            label="Описание"
            value={editingOffer.description}
            multiline
            onChange={(description) => setEditingOffer({ ...editingOffer, description })}
          />
          <InlineCmsLocaleFields
            label="Бейдж"
            value={editingOffer.badge}
            onChange={(badge) => setEditingOffer({ ...editingOffer, badge })}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingOffer.validUntil}
              onChange={(validUntil) => setEditingOffer({ ...editingOffer, validUntil })}
              placeholder="Срок действия"
            />
            <InlineCmsInput
              value={editingOffer.image}
              onChange={(image) => setEditingOffer({ ...editingOffer, image })}
              placeholder="URL изображения"
            />
          </div>
        </InlineCmsModal>
      ) : null}
    </div>
  );
};
