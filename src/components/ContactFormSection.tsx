import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export const ContactFormSection = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setName('');
    setPhone('');
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <section className="py-20 lg:py-28 border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-luxury-elevated border border-white/5 p-8 lg:p-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px bg-luxury-burgundy" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy">
                Обратная связь
              </span>
            </div>
            <h2
              className="text-[clamp(28px,4vw,42px)] font-bold leading-tight tracking-[-0.03em] text-white uppercase mb-4"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              Оставьте заявку
            </h2>
            <p className="text-white/40 font-light mb-8">
              Оставьте контакты — мы перезвоним и ответим на вопросы
            </p>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-luxury-burgundy/20 flex items-center justify-center mx-auto mb-4">
                  <Send size={22} className="text-luxury-burgundy" />
                </div>
                <p className="text-white font-light">Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/40 block mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-luxury-surface border border-white/10 text-white font-light focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/40 block mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 px-4 bg-luxury-surface border border-white/10 text-white font-light focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 !py-3 !px-8 text-xs"
                  >
                    Отправить заявку
                    <Send size={14} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
