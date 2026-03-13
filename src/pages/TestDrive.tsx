import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Send, Calendar, MapPin, Car } from 'lucide-react';
import { cars } from '../data/cars';
import { Footer } from '../components/Footer';
import { ContactFormSection } from '../components/ContactFormSection';
import { submitLead } from '../utils/leads';
import { isValidPhone } from '../utils/phone';

const dealers = [
  { id: 1, name: 'Hongqi Auto — Алматы', address: 'Алатау просп., 1а/5, Шугыла м-н, Наурызбайский район, Алматы' },
];

const steps = [
  {
    icon: Car,
    step: '01',
    title: 'Выберите автомобиль',
    text: 'Укажите модель, которая вас интересует, из нашего каталога',
  },
  {
    icon: MapPin,
    step: '02',
    title: 'Выберите дилерский центр',
    text: 'Удобное расположение для комфортного визита',
  },
  {
    icon: Calendar,
    step: '03',
    title: 'Оставьте заявку',
    text: 'Мы свяжемся для подтверждения даты и времени',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export const TestDrive = () => {
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
    car: '',
    dealer: '',
    comment: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError = phoneTouched && !isValidPhone(formData.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (!isValidPhone(formData.phone)) return;
    await submitLead({
      type: 'test-drive',
      name: formData.name,
      phone: formData.phone,
      car: formData.car,
      dealer: formData.dealer,
      comment: formData.comment,
    });
    setIsSubmitted(true);
    setFormData({
      name: '',
      phone: '',
      car: '',
      dealer: '',
      comment: '',
    });
    setPhoneTouched(false);
    setTimeout(() => setIsSubmitted(false), 5000);
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
            alt="Test Drive"
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
                Тест-драйв
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
                Запись на
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
                className="block text-white/90"
              >
                тест-драйв
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

      {/* Steps Section */}
      <section className="py-24 lg:py-40 bg-luxury-surface border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-5">
              Как это работает
            </span>
            <h2
              className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              Три простых
              <br />
              <span className="text-white/90">шага</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-white/10" />
                )}

                <div className="text-center">
                  <div className="w-14 h-14 border border-white/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon size={24} className="text-luxury-burgundy" />
                  </div>

                  <div
                    className="text-luxury-burgundy text-[13px] font-medium tracking-[0.25em] mb-3"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}
                  >
                    {item.step}
                  </div>

                  <h3
                    className="text-[15px] font-bold text-white uppercase tracking-[0.05em] mb-3"
                    style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                  >
                    {item.title}
                  </h3>

                  <p className="text-white/40 font-light text-[15px] max-w-[260px] mx-auto">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-16 max-w-3xl">
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
                С вами свяжутся в течение рабочего времени для подтверждения записи
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              <div className="text-center mb-16">
                <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy block mb-5">
                  Форма заявки
                </span>
                <h2
                  className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white uppercase"
                  style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
                >
                  Забронируйте
                  <br />
                  <span className="text-white/90">тест-драйв</span>
                </h2>
              </div>

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
                      onChange={(e) => {
                        if (!phoneTouched) setPhoneTouched(true);
                        setFormData({ ...formData, phone: e.target.value });
                      }}
                      onBlur={() => setPhoneTouched(true)}
                      className={`input-luxury ${phoneError ? 'border-luxury-burgundy/70' : ''}`}
                      placeholder="+7 (___) ___-__-__"
                    />
                    {phoneError ? (
                      <p className="mt-2 text-[11px] text-luxury-burgundy">
                        Введите корректный номер телефона
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                    Автомобиль *
                  </label>
                  <select
                    required
                    value={formData.car}
                    onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                    className="input-luxury"
                  >
                    <option value="">Выберите автомобиль</option>
                    {cars.map((car) => (
                      <option key={car.id} value={`${car.brand} ${car.model}`}>
                        {car.brand} {car.model} ({car.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                    Дилерский центр *
                  </label>
                  <select
                    required
                    value={formData.dealer}
                    onChange={(e) => setFormData({ ...formData, dealer: e.target.value })}
                    className="input-luxury"
                  >
                    <option value="">Выберите дилерский центр</option>
                    {dealers.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} — {d.address}
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
                    placeholder="Пожелания по дате и времени..."
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
            </motion.div>
          )}
        </div>
      </section>

      <ContactFormSection />
      <Footer />
    </div>
  );
};
