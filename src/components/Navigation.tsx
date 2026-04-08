import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const CART_RETURN_PATH_KEY = 'hongqi-cart-return-path';

type NavLink = {
  path: string;
  label: string;
};

type NavItem =
  | {
      type: 'link';
      path: string;
      label: string;
    }
  | {
      type: 'owners';
      label: string;
    };

export const Navigation = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, cartNotice } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isOwnersMenuOpen, setIsOwnersMenuOpen] = useState(false);
  const [isMobileOwnersOpen, setIsMobileOwnersOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ownersMenuRef = useRef<HTMLDivElement>(null);

  const isOwnersActive =
    location.pathname.startsWith('/hongqi-parts') || location.pathname.startsWith('/service');
  const showCartInHeader =
    location.pathname.startsWith('/hongqi-parts') ||
    location.pathname === '/cart' ||
    location.pathname === '/checkout';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsOwnersMenuOpen(false);
    setIsMobileOwnersOpen(isOwnersActive);
  }, [location.pathname, isOwnersActive]);

  useEffect(() => {
    if (location.pathname === '/cart') return;

    window.sessionStorage.setItem(
      CART_RETURN_PATH_KEY,
      `${location.pathname}${location.search}${location.hash}`
    );
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ownersMenuRef.current?.contains(event.target as Node)) {
        setIsOwnersMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ownersLinks: NavLink[] = [
    { path: '/hongqi-parts', label: t('nav.parts') },
    { path: '/service', label: t('nav.services') },
  ];

  const navItems: NavItem[] = [
    { type: 'link', path: '/', label: t('nav.home') },
    { type: 'link', path: '/catalog', label: t('nav.catalog') },
    { type: 'owners', label: t('nav.owners') },
    { type: 'link', path: '/brands', label: t('nav.brands') },
    { type: 'link', path: '/offers', label: t('nav.offers') },
    { type: 'link', path: '/dealers', label: t('nav.dealers') },
    { type: 'link', path: '/contact', label: t('nav.contact') },
  ];

  const leftItems = navItems.slice(0, Math.ceil(navItems.length / 2));
  const rightItems = navItems.slice(Math.ceil(navItems.length / 2));

  const languages = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'kz', label: 'KZ' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleCartClick = () => {
    if (location.pathname === '/cart') {
      const returnPath = window.sessionStorage.getItem(CART_RETURN_PATH_KEY);
      navigate(returnPath && returnPath !== '/cart' ? returnPath : '/hongqi-parts');
      return;
    }

    window.sessionStorage.setItem(
      CART_RETURN_PATH_KEY,
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate('/cart');
  };

  const renderCartLink = () => (
    <button
      type="button"
      onClick={handleCartClick}
      className={`relative inline-flex h-11 w-11 items-center justify-center border transition-all duration-300 ${
        location.pathname === '/cart'
          ? 'border-luxury-burgundy bg-luxury-burgundy/10 text-white'
          : 'border-white/10 text-white/80 hover:border-white/25 hover:text-white'
      }`}
      aria-label={t('shop.cart.title')}
    >
      <ShoppingBag size={18} strokeWidth={1.8} />
      {cartCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-luxury-burgundy px-1 text-[10px] font-semibold text-white">
          {cartCount}
        </span>
      ) : null}
    </button>
  );

  const renderDesktopItem = (item: NavItem, layoutId: string) => {
    if (item.type === 'owners') {
      return (
        <div key="owners" ref={ownersMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOwnersMenuOpen((value) => !value)}
            className="relative group inline-flex items-center gap-2"
            aria-expanded={isOwnersMenuOpen}
            aria-haspopup="menu"
          >
            <span
              className={`text-micro uppercase tracking-luxury transition-colors duration-300 ${
                isOwnersActive ? 'text-white' : 'text-luxury-subtle hover:text-white'
              }`}
            >
              {item.label}
            </span>
            <ChevronDown
              size={14}
              className={`text-luxury-subtle transition-all duration-300 ${
                isOwnersMenuOpen || isOwnersActive ? 'rotate-180 text-white' : 'group-hover:text-white'
              }`}
            />
            {(isOwnersActive || isOwnersMenuOpen) && (
              <motion.div
                layoutId={layoutId}
                className="absolute -bottom-1 left-0 right-0 h-px bg-luxury-red"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>

          <AnimatePresence>
            {isOwnersMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-1/2 top-full z-[70] mt-5 w-64 -translate-x-1/2 border border-white/10 bg-luxury-elevated/95 p-3 shadow-luxury-lg backdrop-blur-xl"
              >
                <div className="grid gap-2">
                  {ownersLinks.map((link) => {
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOwnersMenuOpen(false)}
                        className={`flex items-center justify-between border px-4 py-4 transition-colors duration-300 ${
                          isActive
                            ? 'border-luxury-burgundy/50 bg-luxury-burgundy/10 text-white'
                            : 'border-white/10 text-luxury-subtle hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="text-micro uppercase tracking-[0.24em]">{link.label}</span>
                        <span className="text-lg leading-none text-white/35">+</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const isActive = location.pathname === item.path;

    return (
      <Link key={item.path} to={item.path} className="relative group">
        <span
          className={`text-micro uppercase tracking-luxury transition-colors duration-300 ${
            isActive ? 'text-white' : 'text-luxury-subtle hover:text-white'
          }`}
        >
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId={layoutId}
            className="absolute -bottom-1 left-0 right-0 h-px bg-luxury-red"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${
          isScrolled ? 'glass-dark py-3' : 'bg-transparent py-6'
        }`}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="hidden lg:flex items-center gap-8 flex-1">
              {leftItems.map((item) => renderDesktopItem(item, 'nav-indicator-left'))}
            </div>

            <Link to="/" className="relative group flex-shrink-0 mx-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="https://cdn.hongqi.ru/storage/mediadocument/document/0/19/325/19325/01jb1w2g0p3rcwrq2gdxkdy6g5.webp"
                    alt="Hongqi"
                    className="h-14 w-auto object-contain brightness-110"
                  />
                </div>
                <div className="hidden xl:block">
                  <div className="text-white font-display text-base tracking-tight leading-none">Hongqi</div>
                  <div className="text-luxury-subtle text-micro uppercase tracking-ultra mt-0.5">Kazakhstan</div>
                </div>
              </motion.div>
            </Link>

            <div className="hidden lg:flex items-center gap-6 flex-1 justify-end">
              <div className="flex items-center gap-8">
                {rightItems.map((item) => renderDesktopItem(item, 'nav-indicator-right'))}
              </div>

              <div className="flex items-center gap-1 border-l border-white/10 pl-6">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-2 py-1 text-micro uppercase tracking-ultra transition-all duration-300 ${
                      i18n.language === lang.code
                        ? 'text-white bg-white/10'
                        : 'text-luxury-subtle hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {showCartInHeader ? renderCartLink() : null}
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              {showCartInHeader ? renderCartLink() : null}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative flex h-10 w-10 items-center justify-center"
                aria-label="Toggle menu"
              >
                <div className="relative flex h-4 w-6 flex-col justify-between">
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 7 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-px w-full origin-center bg-white"
                  />
                  <motion.span
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                      x: isMobileMenuOpen ? 20 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="block h-px w-full bg-white"
                  />
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? -7 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-px w-full origin-center bg-white"
                  />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {cartNotice ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="fixed right-4 top-24 z-[60] border border-luxury-burgundy/40 bg-luxury-elevated px-4 py-3 text-sm text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] lg:right-6"
          >
            {t('shop.cart.added')}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-luxury-black lg:hidden"
          >
            <div className="h-full overflow-y-auto px-8 pb-10 pt-32 sm:px-12 sm:pt-36">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.type === 'link' ? item.path : 'owners-mobile'}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1 + 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {item.type === 'owners' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsMobileOwnersOpen((value) => !value)}
                          className="flex w-full items-center justify-between text-left"
                        >
                          <div className="flex items-center">
                            <span className="text-luxury-muted text-micro tracking-ultra mr-4">
                              0{index + 1}
                            </span>
                            <span
                              className={`text-4xl md:text-5xl font-display font-light transition-colors ${
                                isOwnersActive ? 'text-white' : 'text-luxury-subtle hover:text-white'
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                          <ChevronDown
                            size={26}
                            className={`text-luxury-subtle transition-all duration-300 ${
                              isMobileOwnersOpen ? 'rotate-180 text-white' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isMobileOwnersOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="ml-10 mt-5 grid gap-3 border-l border-white/10 pl-6">
                                {ownersLinks.map((link) => {
                                  const isActive = location.pathname.startsWith(link.path);
                                  return (
                                    <Link
                                      key={link.path}
                                      to={link.path}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className={`text-lg uppercase tracking-[0.22em] transition-colors ${
                                        isActive ? 'text-white' : 'text-luxury-subtle hover:text-white'
                                      }`}
                                    >
                                      {link.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block"
                      >
                        <span className="text-luxury-muted text-micro tracking-ultra mr-4">
                          0{index + 1}
                        </span>
                        <span
                          className={`text-4xl md:text-5xl font-display font-light transition-colors ${
                            location.pathname === item.path
                              ? 'text-white'
                              : 'text-luxury-subtle hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    )}
                    <div className="line-divider mt-4" />
                  </motion.div>
                ))}
              </div>

              {showCartInHeader ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="mt-10 flex items-center justify-between gap-4 border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-luxury-subtle">
                      {t('shop.cart.title')}
                    </p>
                    <p className="mt-2 text-sm text-white/65">
                      {t('shop.cart.headerCount', { count: cartCount })}
                    </p>
                  </div>
                  {renderCartLink()}
                </motion.div>
              ) : null}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-wrap gap-4"
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-luxury-muted text-micro tracking-ultra"
              >
                <a
                  href="mailto:hongqiparts@gmail.com"
                  className="break-all text-luxury-muted transition-colors hover:text-white"
                >
                  hongqiparts@gmail.com
                </a>
                <a
                  href="tel:+77753813839"
                  className="text-luxury-muted transition-colors hover:text-white"
                >
                  +7 (775) 381-38-39
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
