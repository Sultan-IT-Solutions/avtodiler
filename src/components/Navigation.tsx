import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const Navigation = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      setIsScrolled(currentScrollY > 80);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/catalog', label: t('nav.catalog') },
    { path: '/brands', label: 'Бренд' },
    { path: '/service', label: 'Сервис' },
    { path: '/offers', label: 'Акции' },
    { path: '/dealers', label: 'Дилеры' },
    { path: '/contact', label: t('nav.contact') },
  ];

  const languages = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'kz', label: 'KZ' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      {/* Main Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${
          isScrolled ? 'glass-dark py-3' : 'bg-transparent py-6'
        }`}
      >
        <nav className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="relative group flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-luxury-burgundy flex items-center justify-center">
                  <span className="text-white font-display text-lg font-bold">L</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-white font-display text-lg tracking-tight leading-none">Luxury Auto</div>
                  <div className="text-luxury-muted text-micro uppercase tracking-ultra mt-0.5">Kazakhstan</div>
                </div>
              </motion.div>
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <span className={`text-micro uppercase tracking-ultra transition-colors duration-400 ${
                    location.pathname === link.path
                      ? 'text-white'
                      : 'text-luxury-subtle hover:text-white'
                  }`}>
                    {link.label}
                  </span>
                  {/* Active indicator */}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-luxury-burgundy"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side: Language + CTA */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Language Switcher */}
              <div className="flex items-center gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-2.5 py-1 text-micro uppercase tracking-ultra transition-all duration-300 ${
                      i18n.language === lang.code
                        ? 'text-white bg-white/10'
                        : 'text-luxury-muted hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                to="/contact"
                className="btn-primary text-micro px-6 py-3"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-4 flex flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 7 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block w-full h-px bg-white origin-center"
                />
                <motion.span
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    x: isMobileMenuOpen ? 20 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="block w-full h-px bg-white"
                />
                <motion.span
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? -7 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block w-full h-px bg-white origin-center"
                />
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-luxury-black lg:hidden"
          >
            <div className="h-full flex flex-col justify-center px-12">
              {/* Nav Links */}
              <div className="space-y-2 mb-16">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1 + 0.3,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block"
                    >
                      <span className="text-luxury-muted text-micro tracking-ultra mr-4">
                        0{index + 1}
                      </span>
                      <span className={`text-4xl md:text-5xl font-display font-light transition-colors ${
                        location.pathname === link.path
                          ? 'text-white'
                          : 'text-luxury-subtle hover:text-white'
                      }`}>
                        {link.label}
                      </span>
                    </Link>
                    <div className="line-divider mt-4" />
                  </motion.div>
                ))}
              </div>

              {/* Language Switcher */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-4 py-2 text-micro uppercase tracking-ultra transition-all ${
                      i18n.language === lang.code
                        ? 'text-white bg-luxury-burgundy'
                        : 'text-luxury-muted border border-white/10 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>

              {/* Bottom info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 left-12 right-12 flex justify-between items-end text-luxury-muted text-micro tracking-ultra"
              >
                <span>info@luxuryauto.kz</span>
                <span>+7 (700) 123-45-67</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
