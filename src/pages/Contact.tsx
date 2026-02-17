import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock, ArrowUpRight, Send } from 'lucide-react';
import { Footer } from '../components/Footer';

const contactMethods = [
  {
    icon: Phone,
    label: 'Телефон',
    value: '+7 (700) 123-45-67',
    href: 'tel:+77001234567',
    description: 'Звоните нам в рабочие часы',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+7 (700) 123-45-67',
    href: 'https://wa.me/77001234567',
    description: 'Напишите в WhatsApp 24/7',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@luxuryauto.kz',
    href: 'mailto:info@luxuryauto.kz',
    description: 'Ответим в течение 24 часов',
  },
  {
    icon: MapPin,
    label: 'Адрес',
    value: 'ул. Аль-Фараби, 77',
    href: 'https://maps.google.com',
    description: 'Алматы, Казахстан',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export const Contact = () => {
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

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
                Контакты
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
                Свяжитесь
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
                className="block text-white/90"
              >
                с нами
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
              Как связаться
            </span>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              Выберите удобный
              <br />
              <span className="text-white/90">способ связи</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.label}
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
                  {method.label}
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-luxury-burgundy" />
                </h3>
                <p className="text-lg text-white font-light mb-2">{method.value}</p>
                <p className="text-white/40 text-[13px] font-light">{method.description}</p>
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
                Запишитесь
              </span>
              <h2
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-8"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
              >
                Персональная
                <br />
                <span className="text-white/90">консультация</span>
              </h2>
              <p className="text-white/40 font-light text-lg leading-relaxed mb-12 max-w-md">
                Заполните форму, и наш специалист свяжется с вами для подбора идеального автомобиля.
                Мы подготовим индивидуальное предложение.
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
                    Часы работы
                  </span>
                </div>
                <div className="space-y-3 text-white/40 font-light text-[15px]">
                  <div className="flex justify-between gap-8">
                    <span>Пн — Пт</span>
                    <span className="text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>09:00 — 20:00</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Сб</span>
                    <span className="text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>10:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Вс</span>
                    <span className="text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>11:00 — 17:00</span>
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
                    Заявка отправлена
                  </h3>
                  <p className="text-white/40 font-light text-lg">
                    Мы свяжемся с вами в ближайшее время
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                        Имя *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-luxury"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                        Телефон *
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
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-luxury"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      Интересующая модель
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="input-luxury"
                    >
                      <option value="">Выберите модель</option>
                      <option value="E-HS9">Hongqi E-HS9</option>
                      <option value="HQ9">Hongqi HQ9</option>
                      <option value="H9">Hongqi H9</option>
                      <option value="HS7">Hongqi HS7</option>
                      <option value="H6">Hongqi H6</option>
                      <option value="HS5">Hongqi HS5</option>
                      <option value="H5">Hongqi H5</option>
                      <option value="HS3">Hongqi HS3</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      Сообщение
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-luxury h-32 py-4 resize-none"
                      placeholder="Расскажите о ваших пожеланиях..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-3"
                  >
                    Отправить заявку
                    <Send size={18} />
                  </button>

                  <p className="text-[11px] text-white/30 text-center tracking-[0.15em]">
                    Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
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
              Наш шоурум
            </h3>
            <p className="text-white/40 font-light text-lg mb-6">
              ул. Аль-Фараби, 77, Алматы, Казахстан
            </p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-3"
            >
              Открыть на карте
              <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
