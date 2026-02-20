import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Phone } from 'lucide-react';
import { submitLead } from '../utils/leads';
import { useTranslation } from 'react-i18next';

export const ContactFormSection = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLead({
      type: 'callback',
      name,
      phone,
      comment: t('contactForm.eyebrow'),
    });
    setIsSubmitted(true);
    setName('');
    setPhone('');
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const whatsappNumber = '77753813839';
  const whatsappMessage = encodeURIComponent(
    `Здравствуйте! Меня зовут ${name || '[Имя]'}. Интересуют автомобили Hongqi.`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const phoneNumber = '+77753813839';

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
                {t('contactForm.eyebrow')}
              </span>
            </div>
            <h2
              className="text-[clamp(28px,4vw,42px)] font-bold leading-tight tracking-[-0.03em] text-white uppercase mb-4"
              style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
            >
              {t('contactForm.title')}
            </h2>
            <p className="text-white/60 font-light mb-8">
              {t('contactForm.subtitle')}
            </p>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-white/10">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-6 py-4 bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all duration-400"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <MessageCircle size={20} strokeWidth={2.5} />
                <span className="text-label uppercase tracking-luxury font-semibold">
                  {t('contactForm.whatsapp')}
                </span>
              </a>

              <a
                href={`tel:${phoneNumber}`}
                className="group relative px-6 py-4 bg-luxury-burgundy text-white overflow-hidden flex items-center justify-center gap-3 hover:bg-luxury-burgundyHover hover:shadow-[0_0_30px_rgba(200,16,46,0.4)] transition-all duration-400"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Phone size={20} strokeWidth={2.5} />
                <span className="text-label uppercase tracking-luxury font-semibold">
                  {t('contactForm.call')}
                </span>
              </a>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-luxury-burgundy/20 flex items-center justify-center mx-auto mb-4">
                  <Send size={22} className="text-luxury-burgundy" />
                </div>
                <p className="text-white font-light">{t('contactForm.submit')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/60 block mb-2">
                    {t('contactForm.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-luxury-surface border border-white/10 text-white font-light focus:outline-none focus:border-white/30 transition-colors"
                    placeholder={t('contactForm.namePlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/60 block mb-2">
                    {t('contactForm.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 px-4 bg-luxury-surface border border-white/10 text-white font-light focus:outline-none focus:border-white/30 transition-colors"
                    placeholder={t('contactForm.phonePlaceholder')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 !py-3 !px-8 text-xs"
                  >
                    {t('contactForm.submit')}
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
