import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CarFront,
  Cog,
  MessageCircle,
  Paintbrush,
  Phone,
  Send,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { localizedText } from '../../utils/localizedText';
import { isValidPhone } from '../../utils/phone';
import { publicApi } from '../../utils/publicApi';
import { submitLead } from '../../utils/leads';
import type { ServiceItem } from '../../types/admin';

const serviceIcons = [Wrench, ShieldCheck, Cog, Paintbrush, Zap, CarFront];
const ease = [0.16, 1, 0.3, 1] as const;

export const OwnerServiceHub = () => {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    comment: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = phoneTouched && !isValidPhone(formData.phone);

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

  useEffect(() => {
    if (!isSubmitted) return undefined;

    const timeoutId = window.setTimeout(() => setIsSubmitted(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [isSubmitted]);

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPhoneTouched(true);
    if (!isValidPhone(formData.phone)) return;

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
    setPhoneTouched(false);
  };

  return (
    <>
      <section
        id="service"
        className="relative overflow-hidden border-y border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0)_100%)]"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-luxury-burgundy/8 to-transparent" />
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-luxury-burgundy/10 blur-3xl" />
          <div className="absolute bottom-0 right-20 h-72 w-72 rounded-full bg-white/80 blur-3xl" />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.03]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="owner-service-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#9d2235" strokeOpacity="0.16" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#owner-service-grid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 lg:px-16 lg:py-20">
          <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-luxury-burgundy/12 bg-white/80 px-4 py-2 shadow-[0_14px_32px_rgba(157,34,53,0.05)]">
                <span className="h-2 w-2 rounded-full bg-luxury-burgundy" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-black/55">
                  {t('servicePage.hero.eyebrow')}
                </span>
              </div>
              <h2 className="text-[clamp(34px,5vw,72px)] font-display font-semibold leading-[1.02] tracking-tight text-[#1c1716]">
                {t('servicePage.hero.titleLine1')}
                <br />
                <span className="text-black/20">{t('servicePage.hero.titleLine2')}</span>
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-black/60">
                {t('servicePage.contact.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/hongqi-parts#service-booking"
                  className="inline-flex items-center rounded-xl bg-luxury-burgundy px-7 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-luxury-burgundyHover hover:shadow-[0_18px_40px_rgba(157,34,53,0.35)]"
                >
                  {t('shop.home.quickActions.service.title')}
                </Link>
                <a
                  href={`https://wa.me/77753813839?text=${encodeURIComponent(t('servicePage.contact.whatsappMessage'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl border border-luxury-burgundy/20 bg-white/85 px-7 py-3 text-[11px] uppercase tracking-[0.18em] text-[#7a2433] transition-all duration-300 hover:border-luxury-burgundy/35 hover:bg-white hover:text-[#5d1725]"
                >
                  {t('servicePage.contact.whatsapp')}
                </a>
                <a
                  href="tel:+77753813839"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-luxury-burgundy/20 bg-white/85 px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-[#7a2433] transition-all duration-300 hover:border-luxury-burgundy/35 hover:bg-white hover:text-[#5d1725]"
                >
                  {t('contactForm.call')}
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.55, ease }}
                className="rounded-[30px] border border-luxury-burgundy/12 bg-white p-6 shadow-[0_20px_48px_rgba(157,34,53,0.08)]"
              >
                <p className="text-[10px] uppercase tracking-[0.26em] text-black/35">
                  {t('servicePage.booking.hoursTitle')}
                </p>
                <p className="mt-4 text-2xl font-semibold text-[#1c1716]">
                  {t('servicePage.booking.hoursDaily')}
                </p>
                <p className="mt-2 text-sm text-black/50">10:00 - 18:00</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.55, delay: 0.08, ease }}
                className="rounded-[30px] border border-luxury-burgundy/12 bg-[linear-gradient(180deg,#fff7f5_0%,#ffffff_100%)] p-6 shadow-[0_20px_48px_rgba(157,34,53,0.08)]"
              >
                <p className="text-[10px] uppercase tracking-[0.26em] text-black/35">
                  {t('shop.home.quickActions.catalog.title')}
                </p>
                <p className="mt-4 text-2xl font-semibold text-[#1c1716]">
                  {t('shop.home.hero.stats.partsValue')}
                </p>
                <p className="mt-2 text-sm text-black/50">
                  {t('shop.home.quickActions.catalog.description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.55, delay: 0.16, ease }}
                className="rounded-[30px] border border-luxury-burgundy/12 bg-[linear-gradient(135deg,#9d2235_0%,#b7374f_100%)] p-6 text-white shadow-[0_24px_54px_rgba(157,34,53,0.22)] sm:col-span-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/68">
                      {t('shop.home.quickActions.request.title')}
                    </p>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">
                      {t('shop.home.quickActions.request.description')}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/86">
                    {localizedServices.length || services.length}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 lg:px-16 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
              {t('servicePage.contact.eyebrow')}
            </p>
            <h2 className="mt-4 text-h2 text-[#1c1716]">{t('servicePage.contact.title')}</h2>
          </div>
          <div className="rounded-full border border-luxury-burgundy/12 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black/45 shadow-[0_14px_32px_rgba(157,34,53,0.06)]">
            {String(localizedServices.length || services.length).padStart(2, '0')}
          </div>
        </div>

        {localizedServices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {localizedServices.map((service, index) => (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.06, ease }}
                className="group relative overflow-hidden rounded-[28px] border border-luxury-burgundy/12 bg-white p-7 shadow-[0_20px_48px_rgba(157,34,53,0.08)] transition-all duration-500 hover:-translate-y-1 hover:border-luxury-burgundy/20"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,18,52,0.12),transparent_34%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-luxury-burgundy/12 bg-luxury-burgundy/8 transition-colors duration-300 group-hover:border-luxury-burgundy/40 group-hover:bg-luxury-burgundy/12">
                      <service.icon
                        size={22}
                        className="text-black/45 transition-colors duration-300 group-hover:text-luxury-burgundy"
                      />
                    </div>
                    {service.price ? (
                      <span className="border border-luxury-burgundy/30 bg-luxury-burgundy/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-luxury-burgundy">
                        {service.price}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold leading-tight text-[#1c1716]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-black/58">{service.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <section
        id="service-booking"
        className="border-t border-black/6 bg-[linear-gradient(180deg,#faf4f2_0%,#f3ece9_100%)] py-16 lg:py-20"
      >
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-luxury-burgundy">
                {t('servicePage.booking.eyebrow')}
              </p>
              <h2 className="mt-4 text-[clamp(34px,5vw,64px)] font-display font-semibold leading-[1.02] tracking-tight text-[#1c1716]">
                {t('servicePage.booking.titleLine1')}
                <br />
                <span className="text-black/20">{t('servicePage.booking.titleLine2')}</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-black/60">
                {t('servicePage.booking.subtitle')}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <a
                  href={`https://wa.me/77753813839?text=${encodeURIComponent(t('servicePage.contact.whatsappMessage'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-[24px] border border-black/8 bg-white p-5 transition-colors duration-300 hover:border-green-500/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1c1716]">{t('servicePage.contact.whatsapp')}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/35">WhatsApp</p>
                  </div>
                </a>
                <a
                  href="tel:+77753813839"
                  className="group flex items-center gap-4 rounded-[24px] border border-black/8 bg-white p-5 transition-colors duration-300 hover:border-luxury-burgundy/18"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-luxury-burgundy/10 text-luxury-burgundy">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1c1716]">{t('contactForm.call')}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/35">+7 (775) 381-38-39</p>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease }}
              className="relative overflow-hidden rounded-[32px] border border-luxury-burgundy/12 bg-white p-6 shadow-[0_24px_56px_rgba(157,34,53,0.1)] sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(157,34,53,0.04)_0%,transparent_28%)]" />
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease }}
                  className="relative z-10 flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-luxury-burgundy/20">
                    <Send size={28} className="text-luxury-burgundy" />
                  </div>
                  <h3 className="mt-8 text-3xl font-semibold text-[#1c1716]">
                    {t('servicePage.booking.successTitle')}
                  </h3>
                  <p className="mt-4 max-w-md text-black/55">
                    {t('servicePage.booking.successSubtitle')}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  <div>
                    <label className="mb-3 block text-[11px] uppercase tracking-[0.25em] text-black/40">
                      {t('contactForm.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                      className="input-luxury rounded-2xl"
                      placeholder={t('contactForm.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] uppercase tracking-[0.25em] text-black/40">
                      {t('contactForm.phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(event) => {
                        if (!phoneTouched) setPhoneTouched(true);
                        setFormData({ ...formData, phone: event.target.value });
                      }}
                      onBlur={() => setPhoneTouched(true)}
                      className={`input-luxury rounded-2xl ${phoneError ? 'border-luxury-burgundy/70' : ''}`}
                      placeholder="+7 (___) ___-__-__"
                    />
                    {phoneError ? (
                      <p className="mt-2 text-[11px] text-luxury-burgundy">
                        {t('contactForm.phoneError')}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-3 block text-[11px] uppercase tracking-[0.25em] text-black/40">
                      {t('servicePage.booking.serviceLabel')}
                    </label>
                    <select
                      value={formData.service}
                      onChange={(event) => setFormData({ ...formData, service: event.target.value })}
                      className="input-luxury rounded-2xl"
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
                    <label className="mb-3 block text-[11px] uppercase tracking-[0.25em] text-black/40">
                      {t('servicePage.booking.commentLabel')}
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(event) => setFormData({ ...formData, comment: event.target.value })}
                      className="input-luxury h-32 resize-none rounded-2xl py-4"
                      placeholder={t('servicePage.booking.commentPlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-luxury-burgundy px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-luxury-burgundyHover hover:shadow-[0_18px_40px_rgba(157,34,53,0.35)]"
                  >
                    {t('servicePage.booking.submit')}
                    <Send size={18} />
                  </button>

                  <p className="text-center text-[11px] tracking-[0.15em] text-black/30">
                    {t('servicePage.booking.privacyNote')}
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};
