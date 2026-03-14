import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, ArrowUpRight, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { VisualEditPanel } from '../components/VisualEditPanel';
import { InlineCmsCollectionMenu } from '../components/InlineCmsCollectionMenu';
import {
  InlineCmsInput,
  InlineCmsLocaleFields,
  InlineCmsModal,
  InlineCmsTextarea,
} from '../components/InlineCmsModal';
import { InlineSeoEditorModal } from '../components/InlineSeoEditorModal';
import { useVisualAdmin } from '../context/VisualAdminContext';
import { submitLead } from '../utils/leads';
import { publicApi } from '../utils/publicApi';
import { dealersApi, leadsApi } from '../utils/adminApi';
import type { Car } from '../types/car';
import type { DealerItem, LeadItem } from '../types/admin';

const contactMethods = [
  {
    icon: Phone,
    labelKey: 'contactPage.methods.phone.label',
    value: '+7 (775) 381-38-39',
    href: 'tel:+77753813839',
    descriptionKey: 'contactPage.methods.phone.description',
  },
  {
    icon: MessageCircle,
    labelKey: 'contactPage.methods.whatsapp.label',
    value: '+7 (775) 381-38-39',
    href: 'https://wa.me/77753813839',
    descriptionKey: 'contactPage.methods.whatsapp.description',
  },
  {
    icon: Mail,
    labelKey: 'contactPage.methods.email.label',
    value: 'hongqiparts@gmail.com',
    href: 'mailto:hongqiparts@gmail.com',
    descriptionKey: 'contactPage.methods.email.description',
  },
  {
    icon: MapPin,
    labelKey: 'contactPage.methods.address.label',
    value: 'Алатау просп., 1а/5, Шугыла',
    href: 'https://maps.google.com',
    descriptionKey: 'contactPage.methods.address.description',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export const Contact = () => {
  const { t } = useTranslation();
  const { enabled, authed } = useVisualAdmin();
  const location = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    model: '',
    message: '',
  });

  const [cars, setCars] = useState<Car[]>([]);
  const [dealers, setDealers] = useState<DealerItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [editingDealer, setEditingDealer] = useState<DealerItem | null>(null);
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [isDealersMenuOpen, setIsDealersMenuOpen] = useState(false);
  const [isLeadsMenuOpen, setIsLeadsMenuOpen] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  useEffect(() => {
    if (!enabled || !authed) return;
    let cancelled = false;
    void publicApi
      .cars()
      .then((items) => {
        if (!cancelled) setCars(items);
      })
      .catch(() => {
        if (!cancelled) setCars([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, enabled]);

  useEffect(() => {
    let cancelled = false;
    void dealersApi
      .list()
      .then((items) => {
        if (!cancelled) setDealers(items);
      })
      .catch(() => {
        if (!cancelled) setDealers([]);
      });
    void leadsApi
      .list()
      .then((items) => {
        if (!cancelled) setLeads(items.filter((item) => item.type === 'contact'));
      })
      .catch(() => {
        if (!cancelled) setLeads([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const carOptions = useMemo(() => {
    const map = new Map<string, Car>();
    cars.forEach((car: Car) => {
      const label = car.modelDisplay ?? `${car.brand} ${car.model}`.trim();
      if (!map.has(label)) map.set(label, car);
    });
    return Array.from(map.entries()).map(([label, car]) => ({
      label,
      value: car.model,
      key: car.id ?? label,
    }));
  }, [cars]);

  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const isPhoneValid = useMemo(() => {
    const digits = formData.phone.replace(/\D/g, '');
    return digits.length >= 10;
  }, [formData.phone]);

  const isEmailValid = useMemo(() => {
    if (!formData.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  }, [formData.email]);

  const phoneError = phoneTouched && !isPhoneValid;
  const emailError = emailTouched && !isEmailValid;

  const [isSubmitted, setIsSubmitted] = useState(false);

  const createDealerDraft = (): DealerItem => ({
    id: `dealer-${Date.now()}`,
    name: { ru: '', kz: '', en: '' },
    address: { ru: '', kz: '', en: '' },
    phone: '',
    hours: '',
    services: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    setEmailTouched(true);
    if (!isPhoneValid || !isEmailValid) return;
    await submitLead({
      type: 'contact',
      name: formData.name,
      phone: formData.phone,
      car: formData.model,
      comment: formData.message,
    });
    setIsSubmitted(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      model: '',
      message: '',
    });
    setTimeout(() => setIsSubmitted(false), 3000);
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
            alt="Contact"
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
                {t('contactPage.hero.eyebrow')}
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
                {t('contactPage.hero.titleLine1')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
                className="block text-white/90"
              >
                {t('contactPage.hero.titleLine2')}
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
          title="Страница контактов"
          description="Редактирование дилеров, входящих заявок и SEO страницы контактов."
          details={[
            { label: 'Текущий URL', value: location.pathname },
            { label: 'SEO привязка', value: '/contact' },
          ]}
          actions={[
            { label: 'Дилеры', onClick: () => setIsDealersMenuOpen(true), kind: 'primary' },
            { label: 'Заявки', onClick: () => setIsLeadsMenuOpen(true) },
            { label: 'SEO', onClick: () => setIsSeoOpen(true) },
          ]}
        />
      </section>

      {/* Contact Methods Grid */}
      <section className="py-24 lg:py-40 bg-luxury-surface border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-5">
              {t('contactPage.methodsSection.eyebrow')}
            </span>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('contactPage.methodsSection.titleLine1')}
              <br />
              <span className="text-white/90">{t('contactPage.methodsSection.titleLine2')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.labelKey}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease }}
                className="bg-luxury-elevated border border-white/5 p-8 group hover:border-white/10 hover:bg-luxury-hover cursor-pointer block transition-all duration-600 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-luxury-burgundy/0 via-luxury-burgundy/40 to-luxury-burgundy/0 opacity-0 group-hover:opacity-100 transition-opacity duration-600" />

                <div className="w-14 h-14 border border-white/10 flex items-center justify-center mb-6 group-hover:border-luxury-burgundy group-hover:bg-luxury-burgundy/10 transition-all duration-400">
                  <method.icon size={22} className="text-white/40 group-hover:text-luxury-burgundy transition-colors duration-400" />
                </div>
                <h3
                  className="text-[13px] font-bold text-white uppercase tracking-[0.15em] mb-2 flex items-center gap-2"
                  style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                >
                  {t(method.labelKey)}
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-luxury-burgundy" />
                </h3>
                <p className="text-lg text-white font-light mb-2">{method.value}</p>
                <p className="text-white/40 text-[13px] font-light">{t(method.descriptionKey)}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section (Split Layout) */}
      <section className="py-24 lg:py-40">
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
                {t('contactPage.consultation.eyebrow')}
              </span>
              <h2
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-8"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
              >
                {t('contactPage.consultation.titleLine1')}
                <br />
                <span className="text-white/90">{t('contactPage.consultation.titleLine2')}</span>
              </h2>
              <p className="text-white/40 font-light text-lg leading-relaxed mb-12 max-w-md">
                {t('contactPage.consultation.description')}
              </p>

              {/* Working Hours Card */}
              <div className="bg-luxury-elevated border border-white/5 p-8 inline-block">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                    <Clock size={18} className="text-luxury-burgundy" />
                  </div>
                  <span
                    className="text-[11px] uppercase tracking-[0.25em] text-white font-bold"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {t('contactPage.hours.title')}
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
                    {t('contactPage.form.successTitle')}
                  </h3>
                  <p className="text-white/40 font-light text-lg">
                    {t('contactPage.form.successText')}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                        {t('contactPage.form.nameLabel')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-luxury"
                        placeholder={t('contactPage.form.namePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                        {t('contactPage.form.phoneLabel')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                          if (!phoneTouched) setPhoneTouched(true);
                          setFormData({ ...formData, phone: e.target.value });
                        }}
                        onBlur={() => setPhoneTouched(true)}
                        className={`input-luxury ${phoneError ? 'border-luxury-burgundy/70' : ''}`}
                        placeholder={t('contactPage.form.phonePlaceholder')}
                      />
                      {phoneError && (
                        <p className="text-[11px] text-luxury-burgundy mt-2">
                          {t('contactPage.form.phoneError')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('contactPage.form.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        if (!emailTouched) setEmailTouched(true);
                        setFormData({ ...formData, email: e.target.value });
                      }}
                      onBlur={() => setEmailTouched(true)}
                      className={`input-luxury ${emailError ? 'border-luxury-burgundy/70' : ''}`}
                      placeholder={t('contactPage.form.emailPlaceholder')}
                    />
                    {emailError && (
                      <p className="text-[11px] text-luxury-burgundy mt-2">
                        {t('contactPage.form.emailError')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('contactPage.form.modelLabel')}
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="input-luxury"
                    >
                      <option value="">{t('contactPage.form.modelPlaceholder')}</option>
                      {carOptions.map((option) => (
                        <option key={option.key} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      {t('contactPage.form.messageLabel')}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-luxury h-32 py-4 resize-none"
                      placeholder={t('contactPage.form.messagePlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isPhoneValid || !isEmailValid}
                    className={`btn-primary w-full flex items-center justify-center gap-3 ${
                      !isPhoneValid || !isEmailValid ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {t('contactPage.form.submit')}
                    <Send size={18} />
                  </button>

                  <p className="text-[11px] text-white/30 text-center tracking-[0.15em]">
                    {t('contactPage.form.privacyNote')}
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="relative h-[450px] lg:h-[550px] bg-luxury-surface border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <MapPin size={32} className="text-luxury-burgundy" />
            </div>
            <h3
              className="text-[clamp(24px,3vw,36px)] font-bold text-white uppercase tracking-[-0.03em] mb-3"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('contactPage.map.title')}
            </h3>
            <p className="text-white/40 font-light text-lg mb-6">
              {t('contactPage.map.address')}
            </p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-3"
            >
              {t('contactPage.map.open')}
              <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      <InlineCmsCollectionMenu
        title="Дилеры"
        open={isDealersMenuOpen}
        onClose={() => setIsDealersMenuOpen(false)}
        addLabel="Добавить дилера"
        onAdd={() => {
          setEditingDealer(createDealerDraft());
          setIsDealersMenuOpen(false);
        }}
        items={dealers.map((dealer) => ({
          id: dealer.id,
          title: dealer.name.ru || dealer.name.en || dealer.name.kz || dealer.id,
          subtitle: dealer.phone || dealer.hours,
        }))}
        onEdit={(id) => {
          const dealer = dealers.find((item) => item.id === id);
          if (!dealer) return;
          setEditingDealer(dealer);
          setIsDealersMenuOpen(false);
        }}
        onDelete={(id) => {
          const dealer = dealers.find((item) => item.id === id);
          if (!dealer || !window.confirm('Удалить дилера?')) return;
          void dealersApi.remove(id);
          setDealers((current) => current.filter((item) => item.id !== id));
        }}
      />

      <InlineCmsCollectionMenu
        title="Контактные заявки"
        open={isLeadsMenuOpen}
        onClose={() => setIsLeadsMenuOpen(false)}
        items={leads.map((lead) => ({
          id: lead.id,
          title: `${lead.name} • ${lead.phone}`,
          subtitle: lead.createdAt ? new Date(lead.createdAt).toLocaleString('ru-RU') : lead.comment ?? '',
        }))}
        onEdit={(id) => {
          const lead = leads.find((item) => item.id === id);
          if (!lead) return;
          setEditingLead(lead);
          setIsLeadsMenuOpen(false);
        }}
        onDelete={(id) => {
          const lead = leads.find((item) => item.id === id);
          if (!lead || !window.confirm('Удалить заявку?')) return;
          void leadsApi.remove(id);
          setLeads((current) => current.filter((item) => item.id !== id));
        }}
      />

      {editingDealer ? (
        <InlineCmsModal
          title="Редактирование дилера"
          onClose={() => setEditingDealer(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void dealersApi.upsert(editingDealer);
                  setDealers((current) =>
                    current.some((item) => item.id === editingDealer.id)
                      ? current.map((item) => (item.id === editingDealer.id ? editingDealer : item))
                      : [editingDealer, ...current]
                  );
                  setEditingDealer(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить дилера?')) return;
                  void dealersApi.remove(editingDealer.id);
                  setDealers((current) => current.filter((item) => item.id !== editingDealer.id));
                  setEditingDealer(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <InlineCmsLocaleFields
            label="Название дилера"
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
          <InlineCmsTextarea
            value={editingDealer.services.join(', ')}
            onChange={(services) =>
              setEditingDealer({
                ...editingDealer,
                services: services
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Услуги через запятую"
          />
        </InlineCmsModal>
      ) : null}

      {editingLead ? (
        <InlineCmsModal
          title="Заявка с формы контактов"
          onClose={() => setEditingLead(null)}
          actions={
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void leadsApi.upsert(editingLead);
                  setLeads((current) =>
                    current.map((item) => (item.id === editingLead.id ? editingLead : item))
                  );
                  setEditingLead(null);
                }}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  if (!window.confirm('Удалить заявку?')) return;
                  void leadsApi.remove(editingLead.id);
                  setLeads((current) => current.filter((item) => item.id !== editingLead.id));
                  setEditingLead(null);
                }}
              >
                Удалить
              </button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingLead.name}
              onChange={(name) => setEditingLead({ ...editingLead, name })}
              placeholder="Имя"
            />
            <InlineCmsInput
              value={editingLead.phone}
              onChange={(phone) => setEditingLead({ ...editingLead, phone })}
              placeholder="Телефон"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <InlineCmsInput
              value={editingLead.car ?? ''}
              onChange={(car) => setEditingLead({ ...editingLead, car })}
              placeholder="Модель"
            />
            <InlineCmsInput
              value={editingLead.dealer ?? ''}
              onChange={(dealer) => setEditingLead({ ...editingLead, dealer })}
              placeholder="Дилер"
            />
          </div>
          <InlineCmsTextarea
            value={editingLead.comment ?? ''}
            onChange={(comment) => setEditingLead({ ...editingLead, comment })}
            placeholder="Комментарий"
          />
        </InlineCmsModal>
      ) : null}

      <InlineSeoEditorModal slug="/contact" open={isSeoOpen} onClose={() => setIsSeoOpen(false)} />

      <Footer />
    </div>
  );
};
