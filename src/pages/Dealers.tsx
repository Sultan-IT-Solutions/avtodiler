import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, ChevronRight } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { VisualInlineEditLink } from '../components/VisualInlineEditLink';
import { InlineCmsCollectionMenu } from '../components/InlineCmsCollectionMenu';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
  InlineCmsTextarea,
} from '../components/InlineCmsModal';
import { InlineSeoEditorModal } from '../components/InlineSeoEditorModal';
import { publicApi } from '../utils/publicApi';
import { EmptyState } from '../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { dealersApi } from '../utils/adminApi';
import type { DealerItem } from '../types/admin';

const ease = [0.16, 1, 0.3, 1] as const;

export const Dealers = () => {
  const { t, i18n } = useTranslation();
  const [dealers, setDealers] = useState(() => [] as Awaited<ReturnType<typeof publicApi.dealers>>);

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .dealers()
      .then((items) => {
        if (!cancelled && items.length > 0) setDealers(items);
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
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [selectedDealer, setSelectedDealer] = useState<(typeof dealers)[number] | undefined>(dealers[0]);
  const [editingDealer, setEditingDealer] = useState<DealerItem | null>(null);
  const [isDealersMenuOpen, setIsDealersMenuOpen] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const createDealerDraft = (): DealerItem => ({
    id: `dealer-${Date.now()}`,
    name: { ru: '', kz: '', en: '' },
    address: { ru: '', kz: '', en: '' },
    phone: '',
    hours: '',
    lat: 0,
    lng: 0,
    services: [],
  });

  useEffect(() => {
    if (!selectedDealer && dealers.length > 0) setSelectedDealer(dealers[0]);
  }, [dealers, selectedDealer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ymaps = (window as unknown as Record<string, unknown>).ymaps;
    if (ymaps) {
      (ymaps as { ready: (cb: () => void) => void }).ready(initMap);
      return;
    }

    const script = document.createElement('script');
    const apiKey = (import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined) ?? '';
    const keyQuery = apiKey.trim() ? `apikey=${encodeURIComponent(apiKey.trim())}&` : '';
    script.src = `https://api-maps.yandex.ru/2.1/?${keyQuery}lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      const ym = (window as unknown as Record<string, unknown>).ymaps as { ready: (cb: () => void) => void };
      if (ym) ym.ready(initMap);
    };
    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapLoaded) return;
    if (dealers.length === 0 || !selectedDealer) return;

    const ymaps = (window as unknown as Record<string, unknown>).ymaps as Record<string, unknown>;
    if (!ymaps) return;

    const MapConstructor = ymaps.Map as new (
      el: HTMLElement,
      state: Record<string, unknown>,
      options: Record<string, unknown>
    ) => Record<string, unknown>;

    const PlacemarkConstructor = ymaps.Placemark as new (
      coords: number[],
      props: Record<string, unknown>,
      opts: Record<string, unknown>
    ) => Record<string, unknown>;

    const map = new MapConstructor(
      mapRef.current,
      {
        center: [selectedDealer.lat ?? 0, selectedDealer.lng ?? 0],
        zoom: 14,
        controls: ['zoomControl'],
      },
      {
        suppressMapOpenBlock: true,
      }
    );

    dealers.forEach((dealer) => {
      if (typeof dealer.lat !== 'number' || typeof dealer.lng !== 'number') return;
      const placemark = new PlacemarkConstructor(
        [dealer.lat!, dealer.lng!],
        {
          balloonContentHeader: dealer.name[lang] || dealer.name.ru,
          balloonContentBody: `${dealer.address[lang] || dealer.address.ru}<br>${dealer.phone}`,
          hintContent: dealer.name[lang] || dealer.name.ru,
        },
        {
          preset: 'islands#redDotIcon',
        }
      );
      (map.geoObjects as { add: (p: unknown) => void }).add(placemark);
    });

    (window as unknown as Record<string, unknown>).__luxuryMap = map;
    setMapLoaded(true);
  };

  const focusDealer = (dealer: (typeof dealers)[0]) => {
    setSelectedDealer(dealer);
    const map = (window as unknown as Record<string, unknown>).__luxuryMap as Record<string, unknown> | undefined;
    if (map) {
      (map.setCenter as (coords: number[], zoom: number, opts: Record<string, unknown>) => void)(
        [dealer.lat ?? 0, dealer.lng ?? 0],
        15,
        { duration: 500 }
      );
    }
  };

  return (
    <div className="bg-luxury-black">
      {/* Hero */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src="https://cdn.hongqi.ru/storage/carmodel/image_with_background/0/19/297/19297/01jaz17hfkatcmvsxywakv7ggd.jpg"
            alt="Find Dealer"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-luxury-black/20 to-luxury-black" />
        </motion.div>
        <motion.div
          className="relative z-10 container mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-20 lg:pb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ duration: 1, delay: 0.4, ease }}
                className="h-px bg-luxury-burgundy"
              />
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy"
              >
                {t('dealersPage.hero.eyebrow')}
              </motion.span>
            </div>
            <h1
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease }}
                className="block"
              >
                {t('dealersPage.hero.titleLine1')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
                className="block text-white/90"
              >
                {t('dealersPage.hero.titleLine2')}
              </motion.span>
            </h1>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="scroll-line" />
        </motion.div>
      </section>

      <section className="container mx-auto px-6 pt-6 lg:px-16">
        <VisualEditPanel
          title="Страница дилеров"
          description="Редактирование дилерских центров и SEO страницы."
          actions={[
            { label: 'Дилеры', onClick: () => setIsDealersMenuOpen(true), kind: 'primary' },
            { label: 'SEO', onClick: () => setIsSeoOpen(true) },
          ]}
        />
      </section>

      {/* Map + List Section */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-5">
              {t('dealersPage.centers.eyebrow')}
            </span>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('dealersPage.centers.titleLine1')}
              <br />
              <span className="text-white/90">{t('dealersPage.centers.titleLine2')}</span>
            </h2>
          </motion.div>

          {dealers.length === 0 || !selectedDealer ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Dealers List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                    {t('dealersPage.list.totalCenters')}
                  </span>
                  <span
                    className="text-luxury-burgundy text-lg font-medium"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    {dealers.length}
                  </span>
                </div>

                {dealers.map((dealer, i) => (
                  <motion.button
                    key={dealer.id}
                    onClick={() => focusDealer(dealer)}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    whileHover={{ x: 4 }}
                    className={`w-full text-left bg-luxury-elevated border p-6 lg:p-8 transition-all duration-400 relative overflow-hidden ${
                      selectedDealer.id === dealer.id
                        ? 'border-luxury-burgundy bg-luxury-burgundy/5'
                        : 'border-white/5 hover:border-white/10 hover:bg-luxury-hover'
                    }`}
                  >
                    <VisualInlineEditLink onClick={() => setEditingDealer(dealer)} label="Дилер" />
                    {selectedDealer.id === dealer.id && (
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-luxury-burgundy/0 via-luxury-burgundy/60 to-luxury-burgundy/0" />
                    )}
                    <h3
                      className="text-[13px] font-bold text-white uppercase tracking-[0.05em] mb-4 flex items-center justify-between"
                      style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                    >
                      {dealer.name[lang] || dealer.name.ru}
                      <ChevronRight
                        size={16}
                        className={`transition-colors duration-400 ${
                          selectedDealer.id === dealer.id ? 'text-luxury-burgundy' : 'text-white/20'
                        }`}
                      />
                    </h3>

                    <div className="space-y-3 text-[14px]">
                      <div className="flex items-start gap-3 text-white/40">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="font-light">{dealer.address[lang] || dealer.address.ru}</span>
                      </div>
                      <div className="flex items-start gap-3 text-white/40">
                        <Phone size={14} className="mt-0.5 flex-shrink-0" />
                        <a
                          href={`tel:${dealer.phone.replace(/\D/g, '')}`}
                          className="font-light hover:text-white transition-colors duration-400"
                        >
                          {dealer.phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-3 text-white/40">
                        <Clock size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="font-light">{dealer.hours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/5">
                      {dealer.services.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] uppercase tracking-[0.2em] text-white/40 border border-white/10 px-3 py-1.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}

                <a
                  href={`https://yandex.ru/maps/?rtext=~${selectedDealer.lat},${selectedDealer.lng}&rtt=auto`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-3 mt-4"
                >
                  <Navigation size={16} />
                  {t('dealersPage.list.buildRoute')}
                </a>
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <div
                  ref={mapRef}
                  className="w-full h-[400px] lg:h-[650px] bg-luxury-surface border border-white/5 relative"
                  style={{ minHeight: '400px' }}
                >
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-6">
                          <MapPin size={28} className="text-luxury-burgundy" />
                        </div>
                        <p className="text-white/40 font-light text-[15px]">{t('dealersPage.list.mapLoading')}</p>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-24 lg:py-40 bg-luxury-surface border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-5">
              {t('dealersPage.banner.eyebrow')}
            </span>
            <p className="text-white/40 font-light text-lg leading-relaxed max-w-2xl mx-auto">
              {t('dealersPage.banner.text')}
            </p>
          </motion.div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />

      {editingDealer ? (
        <InlineCmsModal
          title="Редактирование дилера"
          onClose={() => setEditingDealer(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  await dealersApi.upsert(editingDealer);
                  setDealers((current) =>
                    current.map((item) => (item.id === editingDealer.id ? editingDealer : item))
                  );
                  setSelectedDealer((current) => (current?.id === editingDealer.id ? editingDealer : current));
                  setEditingDealer(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={async () => {
                  if (!window.confirm('Удалить дилера?')) return;
                  await dealersApi.remove(editingDealer.id);
                  setDealers((current) => current.filter((item) => item.id !== editingDealer.id));
                  setSelectedDealer((current) => (current?.id === editingDealer.id ? undefined : current));
                  setEditingDealer(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsLocaleFields
            label="Название"
            value={editingDealer.name}
            onChange={(name) => setEditingDealer({ ...editingDealer, name })}
          />
          <InlineCmsLocaleFields
            label="Адрес"
            value={editingDealer.address}
            multiline
            onChange={(address) => setEditingDealer({ ...editingDealer, address })}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingDealer.phone}
              onChange={(phone) => setEditingDealer({ ...editingDealer, phone })}
              placeholder="Телефон"
            />
            <InlineCmsInput
              value={editingDealer.hours}
              onChange={(hours) => setEditingDealer({ ...editingDealer, hours })}
              placeholder="Часы работы"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingDealer.lat ?? ''}
              onChange={(lat) => setEditingDealer({ ...editingDealer, lat: Number(lat) || 0 })}
              placeholder="Широта"
              type="number"
            />
            <InlineCmsInput
              value={editingDealer.lng ?? ''}
              onChange={(lng) => setEditingDealer({ ...editingDealer, lng: Number(lng) || 0 })}
              placeholder="Долгота"
              type="number"
            />
          </div>
          <InlineCmsTextarea
            value={editingDealer.services.join(', ')}
            onChange={(services) =>
              setEditingDealer({
                ...editingDealer,
                services: services.split(',').map((item) => item.trim()).filter(Boolean),
              })
            }
            placeholder="Услуги через запятую"
          />
        </InlineCmsModal>
      ) : null}

      <InlineCmsCollectionMenu
        title="Дилеры"
        open={isDealersMenuOpen}
        onClose={() => setIsDealersMenuOpen(false)}
        addLabel="Добавить дилера"
        onAdd={() => {
          setIsDealersMenuOpen(false);
          setEditingDealer(createDealerDraft());
        }}
        items={dealers.map((dealer) => ({
          id: dealer.id,
          title: dealer.name[lang] || dealer.name.ru,
          subtitle: dealer.phone,
        }))}
        onEdit={(id) => {
          const dealer = dealers.find((item) => item.id === id);
          if (!dealer) return;
          setIsDealersMenuOpen(false);
          setEditingDealer(dealer);
        }}
        onDelete={(id) => {
          const dealer = dealers.find((item) => item.id === id);
          if (!dealer || !window.confirm('Удалить дилера?')) return;
          void dealersApi.remove(id);
          setDealers((current) => current.filter((item) => item.id !== id));
          setSelectedDealer((current) => (current?.id === id ? undefined : current));
        }}
      />

      <InlineSeoEditorModal slug="/dealers" open={isSeoOpen} onClose={() => setIsSeoOpen(false)} />
    </div>
  );
};
