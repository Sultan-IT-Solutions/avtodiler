import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wrench, ShieldCheck, Paintbrush, Cog, Zap, CarFront, Send } from 'lucide-react';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';

const services = [
  {
    id: 1,
    icon: Wrench,
    title: 'Техническое обслуживание',
    description: 'Регулярное ТО по регламенту производителя. Замена масла, фильтров, проверка всех систем автомобиля.',
    price: 'от 45 000 ₸',
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: 'Диагностика',
    description: 'Полная компьютерная диагностика всех систем автомобиля. Выявление неисправностей и рекомендации.',
    price: 'от 15 000 ₸',
  },
  {
    id: 3,
    icon: Cog,
    title: 'Ремонт двигателя',
    description: 'Капитальный и текущий ремонт двигателя с использованием оригинальных запчастей.',
    price: 'по запросу',
  },
  {
    id: 4,
    icon: Paintbrush,
    title: 'Кузовной ремонт',
    description: 'Восстановление кузова, покраска, полировка. Работаем с оригинальными материалами.',
    price: 'по запросу',
  },
  {
    id: 5,
    icon: Zap,
    title: 'Электрика и электроника',
    description: 'Диагностика и ремонт электрических систем, обновление ПО, калибровка датчиков.',
    price: 'от 20 000 ₸',
  },
  {
    id: 6,
    icon: CarFront,
    title: 'Шиномонтаж и балансировка',
    description: 'Сезонная замена шин, балансировка, хранение колёс. Работаем с премиальными брендами.',
    price: 'от 8 000 ₸',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export const Service = () => {
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
    service: '',
    comment: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
                Сервис
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
                Сервисный
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.2, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
                className="block text-white/20"
              >
                центр
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
              <span className="text-white/20">предлагаем</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
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
                    <s.icon size={24} className="text-white/40 group-hover:text-luxury-burgundy transition-colors duration-400" />
                  </div>

                  <h3
                    className="text-[15px] font-bold text-white uppercase tracking-[0.05em] mb-4"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-white/40 font-light text-[15px] leading-relaxed mb-6">
                    {s.description}
                  </p>

                  <div className="pt-6 border-t border-white/5">
                    <span
                      className="text-luxury-burgundy text-lg font-medium"
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {s.price}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
                Запись
              </span>
              <h2
                className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase mb-8"
                style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
              >
                Запишитесь
                <br />
                <span className="text-white/20">на сервис</span>
              </h2>
              <p className="text-white/40 font-light text-lg leading-relaxed mb-12 max-w-md">
                Заполните форму и наш специалист свяжется с вами для подтверждения записи.
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
                    Часы работы сервиса
                  </span>
                </div>
                <div className="space-y-3 text-white/40 font-light text-[15px]">
                  <div className="flex justify-between gap-8">
                    <span>Пн — Пт</span>
                    <span className="text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>08:00 — 20:00</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Сб</span>
                    <span className="text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>09:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>Вс</span>
                    <span className="text-white/40" style={{ fontFamily: "'Space Grotesk', monospace" }}>выходной</span>
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
                    С вами свяжутся в течение рабочего времени
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      Услуга
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="input-luxury"
                    >
                      <option value="">Выберите услугу</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                      Комментарий
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="input-luxury h-32 py-4 resize-none"
                      placeholder="Опишите проблему..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-3"
                  >
                    Записаться
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

      <ContactFormSection />
      <Footer />
    </div>
  );
};
