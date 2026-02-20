import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/** Иконка WhatsApp (Bootstrap Icons) — облачко с трубкой */
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

export const FloatingWhatsApp = () => {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
    tl.to(buttonRef.current, { y: -12, duration: 0.3, ease: 'power2.out' })
      .to(buttonRef.current, { y: 0, duration: 0.3, ease: 'bounce.out' })
      .to(buttonRef.current, { y: -8, duration: 0.2, ease: 'power2.out' })
      .to(buttonRef.current, { y: 0, duration: 0.2, ease: 'bounce.out' });
    return () => { tl.kill(); };
  }, []);

  const whatsappNumber = '+77753813839';
  const whatsappMessage = encodeURIComponent('Здравствуйте! Интересуют автомобили Hongqi.');
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`;

  return (
    <motion.a
      ref={buttonRef}
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] group"
      data-cursor-hide
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Написать в WhatsApp"
    >
      <div className="w-16 h-16 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_32px_rgba(37,211,102,0.5)]">
        <WhatsAppIcon className="w-8 h-8 text-white" />
      </div>

      {/* Подсказка */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-luxury-elevated border border-white/10 px-4 py-2 rounded-lg whitespace-nowrap shadow-luxury-md">
          <span className="text-micro uppercase tracking-luxury text-luxury-cream">
            Написать в WhatsApp
          </span>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-2 h-2 bg-luxury-elevated border-r border-t border-white/10 rotate-45" />
      </div>
    </motion.a>
  );
};
