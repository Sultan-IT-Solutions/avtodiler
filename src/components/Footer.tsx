import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/catalog', label: t('nav.catalog') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer ref={ref} className="bg-luxury-black border-t border-white/5">
      {/* Big CTA Banner */}
      <div className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-20"
        >
          <div>
            <span className="text-micro uppercase tracking-ultra text-luxury-red block mb-4 font-semibold">
              {t('footerCta.eyebrow')}
            </span>
            <h2 className="text-h1 font-display text-white font-light leading-tight">
              {t('footerCta.titleLine1')}<br />{t('footerCta.titleLine2')}
            </h2>
          </div>
          <Link
            to="/contact"
            className="group flex items-center gap-4"
          >
            <span className="text-label uppercase tracking-luxury text-luxury-subtle group-hover:text-white transition-colors">
              {t('footerCta.button')}
            </span>
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-luxury-burgundy group-hover:bg-luxury-burgundy transition-all duration-400">
              <ArrowUpRight size={24} className="text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        </motion.div>

        <div className="line-divider mb-16" />

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-luxury-burgundy flex items-center justify-center">
                <span className="text-white font-display text-lg font-bold">L</span>
              </div>
              <div>
                <div className="text-white font-display text-lg tracking-tight leading-none">Luxury Auto</div>
                <div className="text-luxury-muted text-micro uppercase tracking-ultra mt-0.5">Kazakhstan</div>
              </div>
            </div>
            <p className="text-sm text-luxury-muted leading-relaxed max-w-sm font-light">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-micro uppercase tracking-ultra text-white mb-6">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-luxury-muted hover:text-white transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-micro uppercase tracking-ultra text-white mb-6">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-luxury-muted">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
              <li>
                <a href="tel:+77001234567" className="flex items-start gap-3 text-luxury-muted hover:text-white transition-colors">
                  <Phone size={16} className="mt-0.5 flex-shrink-0" />
                  <span>+7 (700) 123-45-67</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@luxuryauto.kz" className="flex items-start gap-3 text-luxury-muted hover:text-white transition-colors">
                  <Mail size={16} className="mt-0.5 flex-shrink-0" />
                  <span>info@luxuryauto.kz</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-micro uppercase tracking-ultra text-white mb-6">
              {t('footer.social')}
            </h4>
            <ul className="space-y-4">
              {['Instagram', 'Facebook', 'YouTube'].map((social) => (
                <li key={social}>
                  <a
                    href="#"
                    className="text-sm text-luxury-muted hover:text-white transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    {social}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="line-divider mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-micro tracking-ultra text-luxury-muted">
          <div>
            &copy; {currentYear} Luxury Auto Kazakhstan. {t('footer.rights')}.
          </div>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
