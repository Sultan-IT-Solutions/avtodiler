import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wrench, ShieldCheck, Paintbrush, Cog, Zap, CarFront, Send, MessageCircle, Phone } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { submitLead } from '../utils/leads';
import { useTranslation } from 'react-i18next';
import { publicApi } from '../utils/publicApi';
import { localizedText } from '../utils/localizedText';
import type { ServiceItem } from '../types/admin';
import { EmptyState } from '../components/EmptyState';

const serviceIcons = [Wrench, ShieldCheck, Cog, Paintbrush, Zap, CarFront];

const ease = [0.16, 1, 0.3, 1] as const;

export const Service = () => {
  const { t, i18n } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    comment: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .services()
      .then((items) => {
        if (!cancelled) setServices(items);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const localizedServices = useMemo(
    () =>
      services.map((service, index) => ({
        ...service,
        icon: serviceIcons[index % serviceIcons.length],
        title: localizedText(service.title, { lng: i18n.language, fallbackLng: 'ru' }),
        description: localizedText(service.description, { lng: i18n.language, fallbackLng: 'ru' }),
      })),
    [services, i18n.language],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services.find((service) => service.id === formData.service);
    await submitLead({
      type: 'service',
      name: formData.name,
      phone: formData.phone,
      service: selectedService
        ? localizedText(selectedService.title, { lng: i18n.language, fallbackLng: 'ru' })
        : formData.service,
      comment: formData.comment,
    });
    setIsSubmitted(true);
    setFormData({
      name: '',
      phone: '',
      service: '',
      comment: '',
    });
    setTimeout(() => setIsSubmitted(false), 4000);
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
            alt="Service"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-luxury-black/20 to-luxury-black" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
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
                {t('servicePage.hero.eyebrow')}
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
                {t('servicePage.hero.titleLine1')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
                className="block text-white"
              >
                {t('servicePage.hero.titleLine2')}
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

      {/* Contact Section */}
      <section className="py-16 lg:py-20 bg-luxury-surface border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-luxury-red" />
              <span className="text-micro uppercase tracking-ultra text-luxury-red font-semibold">
                {t('servicePage.contact.eyebrow')}
              </span>
            </div>
            <h2 className="text-h2 font-display text-white mb-8">
              {t('servicePage.contact.title')}
            </h2>
            <p className="text-body text-white/70 mb-10">
              {t('servicePage.contact.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`https://wa.me/77753813839?text=${encodeURIComponent(t('servicePage.contact.whatsappMessage'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-5 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all duration-400"
              >
                <MessageCircle size={22} strokeWidth={2.5} />
                <span className="text-label uppercase tracking-luxury font-semibold">
                  {t('servicePage.contact.whatsapp')}
                </span>
              </a>
              <a
                href="tel:+77753813839"
                className="group px-8 py-5 bg-luxury-burgundy text-white flex items-center justify-center gap-3 hover:bg-luxury-burgundyHover hover:shadow-[0_0_30px_rgba(200,16,46,0.4)] transition-all duration-400"
              >
                <Phone size={22} strokeWidth={2.5} />
                <span className="text-label uppercase tracking-luxury font-semibold">
                  {t('contactForm.call')}
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-5">
              Услуги
            </span>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              Что мы
              <br />
              <span className="text-white/90">предлагаем</span>
            </h2>
          </motion.div>

          {localizedServices.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localizedServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease }}
                  className="bg-luxury-elevated border border-white/5 p-8 lg:p-10 group hover:border-white/10 hover:bg-luxury-hover transition-all duration-600 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-luxury-burgundy/0 via-luxury-burgundy/40 to-luxury-burgundy/0 opacity-0 group-hover:opacity-100 transition-opacity duration-600" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-luxury-burgundy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 border border-white/10 flex items-center justify-center mb-8 group-hover:border-luxury-burgundy group-hover:bg-luxury-burgundy/10 transition-all duration-400">
                      <service.icon size={24} className="text-white/40 group-hover:text-luxury-burgundy transition-colors duration-400" />
                    </div>

                    <h3
                      className="text-[15px] font-bold text-white uppercase tracking-[0.05em] mb-4"
                      style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                    >
                      {service.title}
                    </h3>
                    <p className="text-white/40 font-light text-[15px] leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {service.price ? (
                      <div className="pt-6 border-t border-white/5">
                        <span
                          className="text-luxury-burgundy text-lg font-medium"
                          style={{ fontFamily: "'Space Grotesk', monospace" }}
                        >
                          {service.price}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-24 lg:py-40 bg-luxury-surface border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease }}
            >
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-6">
                {t('servicePage.booking.eyebrow')}
              </span>
              <h2
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-8"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
              >
                {t('servicePage.booking.titleLine1')}
                <br />
                <span className="text-white/90">{t('servicePage.booking.titleLine2')}</span>
              </h2>
              <p className="text-white/40 font-light text-lg leading-relaxed mb-12 max-w-md">
                {t('servicePage.booking.subtitle')}
              </p>

              {/* Working Hours */}
              <div className="bg-luxury-elevated border border-white/5 p-8 inline-block">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                    <Wrench size={18} className="text-luxury-burgundy" />
                  </div>
                  <span
                    className="text-[11px] uppercase tracking-[0.25em] text-white font-bold"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {t('servicePage.booking.hoursTitle')}
                  </span>
                </div>
                <div className="space-y-3 text-white/40 font-light text-[15px]">
                  <div className="flex justify-between gap-8">
                    <span>Ежедневно</span>
                    <span className="text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>10:00 — 18:00</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease }}
            >
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease }}
                  className="bg-luxury-elevated border border-white/5 p-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-luxury-burgundy/20 flex items-center justify-center mx-auto mb-8">
                    <Send size={28} className="text-luxury-burgundy" />
                  </div>
                  <h3
                    className="text-[clamp(24px,3vw,36px)] font-bold text-white uppercase tracking-[-0.03em] mb-4"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {t('servicePage.booking.successTitle')}
                  </h3>
                  <p className="text-white/40 font-light text-lg">
                    {t('servicePage.booking.successSubtitle')}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('contactForm.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-luxury"
                      placeholder={t('contactForm.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('contactForm.phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-luxury"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('servicePage.booking.serviceLabel')}
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="input-luxury"
                    >
                      <option value="">{t('servicePage.booking.servicePlaceholder')}</option>
                      {localizedServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('servicePage.booking.commentLabel')}
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="input-luxury h-32 py-4 resize-none"
                      placeholder={t('servicePage.booking.commentPlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-3"
                  >
                    {t('servicePage.booking.submit')}
                    <Send size={18} />
                  </button>

                  <p className="text-[11px] text-white/30 text-center tracking-[0.15em]">
                    {t('servicePage.booking.privacyNote')}
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <ContactFormSection />
      <Footer />
    </div>
  );
};
