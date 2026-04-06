import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const CART_RETURN_PATH_KEY = 'hongqi-cart-return-path';

type NavLink = {
  path: string;
  label: string;
};

const buildNavLinks = (t: (key: string) => string): NavLink[] => [
  { path: '/', label: t('nav.home') },
  { path: '/catalog', label: t('nav.catalog') },
  { path: '/hongqi-parts', label: t('nav.parts') },
  { path: '/brands', label: t('nav.brands') },
  { path: '/offers', label: t('nav.offers') },
  { path: '/dealers', label: t('nav.dealers') },
  { path: '/contact', label: t('nav.contact') },
];

const languages = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kz', label: 'KZ' },
];

const isOwnersRoute = (pathname: string) =>
  pathname.startsWith('/hongqi-parts') ||
  pathname === '/cart' ||
  pathname === '/checkout' ||
  pathname === '/service';

const isLinkActive = (pathname: string, path: string) => {
  if (path === '/hongqi-parts') {
    return isOwnersRoute(pathname);
  }

  return pathname === path;
};

const useNavigationBase = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, cartNotice } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/cart') return;

    window.sessionStorage.setItem(
      CART_RETURN_PATH_KEY,
      `${location.pathname}${location.search}${location.hash}`
    );
  }, [location.hash, location.pathname, location.search]);

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

  return {
    t,
    i18n,
    location,
    cartCount,
    cartNotice,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    changeLanguage,
    handleCartClick,
    navLinks: buildNavLinks(t),
  };
};

const CartNotice = ({ text, className }: { text: string; className: string }) => (
  <AnimatePresence>
    {text ? (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22 }}
        className={`fixed right-4 z-[60] px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.18)] lg:right-6 ${className}`}
      >
        {text}
      </motion.div>
    ) : null}
  </AnimatePresence>
);

const OwnersCartButton = ({
  active,
  cartCount,
  label,
  onClick,
}: {
  active: boolean;
  cartCount: number;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 transition-all duration-300 ${
      active
        ? 'border-luxury-burgundy/45 bg-luxury-burgundy/10 text-[#6d1727]'
        : 'border-black/10 bg-white/90 text-black/65 hover:border-luxury-burgundy/25 hover:bg-white hover:text-black'
    }`}
    aria-label={label}
  >
    <ShoppingBag size={16} strokeWidth={1.8} />
    {cartCount > 0 ? (
      <>
        <span className="text-[11px] uppercase tracking-[0.18em] text-black/55">{cartCount}</span>
        <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-luxury-burgundy px-1 text-[10px] font-semibold text-white">
          {cartCount}
        </span>
      </>
    ) : (
      <span className="hidden text-[11px] uppercase tracking-[0.18em] text-black/45 sm:inline">
        {label}
      </span>
    )}
  </button>
);

export const SiteNavigation = () => {
  const {
    i18n,
    location,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    changeLanguage,
    navLinks,
  } = useNavigationBase();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

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

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-600 ${
          isScrolled ? 'glass-dark py-3' : 'bg-transparent py-6'
        }`}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="hidden flex-1 items-center gap-8 lg:flex">
              {navLinks.slice(0, Math.ceil(navLinks.length / 2)).map((link) => (
                <Link key={link.path} to={link.path} className="relative group">
                  <span
                    className={`text-micro uppercase tracking-luxury transition-colors duration-300 ${
                      isLinkActive(location.pathname, link.path)
                        ? 'text-white'
                        : 'text-luxury-subtle hover:text-white'
                    }`}
                  >
                    {link.label}
                  </span>
                  {isLinkActive(location.pathname, link.path) ? (
                    <motion.div
                      layoutId="site-nav-indicator-left"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-luxury-red"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ) : null}
                </Link>
              ))}
            </div>

            <Link to="/" className="relative mx-8 flex-shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center">
                  <img
                    src="https://cdn.hongqi.ru/storage/mediadocument/document/0/19/325/19325/01jb1w2g0p3rcwrq2gdxkdy6g5.webp"
                    alt="Hongqi"
                    className="h-14 w-auto object-contain brightness-110"
                  />
                </div>
                <div className="hidden xl:block">
                  <div className="font-display text-base leading-none tracking-tight text-white">
                    Hongqi
                  </div>
                  <div className="mt-0.5 text-micro uppercase tracking-ultra text-luxury-subtle">
                    Kazakhstan
                  </div>
                </div>
              </motion.div>
            </Link>

            <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
              <div className="flex items-center gap-8">
                {navLinks.slice(Math.ceil(navLinks.length / 2)).map((link) => (
                  <Link key={link.path} to={link.path} className="relative group">
                    <span
                      className={`text-micro uppercase tracking-luxury transition-colors duration-300 ${
                        isLinkActive(location.pathname, link.path)
                          ? 'text-white'
                          : 'text-luxury-subtle hover:text-white'
                      }`}
                    >
                      {link.label}
                    </span>
                    {isLinkActive(location.pathname, link.path) ? (
                      <motion.div
                        layoutId="site-nav-indicator-right"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-luxury-red"
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ) : null}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-1 border-l border-white/10 pl-6">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-2 py-1 text-micro uppercase tracking-ultra transition-all duration-300 ${
                      i18n.language === lang.code
                        ? 'bg-white/10 text-white'
                        : 'text-luxury-subtle hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen((value) => !value)}
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
        {isMobileMenuOpen ? (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-luxury-black lg:hidden"
          >
            <div className="h-full overflow-y-auto px-8 pb-10 pt-32 sm:px-12 sm:pt-36">
              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1 + 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <span className="mr-4 text-micro tracking-ultra text-luxury-muted">
                        0{index + 1}
                      </span>
                      <span
                        className={`font-display text-4xl font-light transition-colors md:text-5xl ${
                          isLinkActive(location.pathname, link.path)
                            ? 'text-white'
                            : 'text-luxury-subtle hover:text-white'
                        }`}
                      >
                        {link.label}
                      </span>
                    </Link>
                    <div className="line-divider mt-4" />
                  </motion.div>
                ))}
              </div>

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
                        ? 'bg-luxury-burgundy text-white'
                        : 'border border-white/10 text-luxury-muted hover:text-white'
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
                className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-micro tracking-ultra text-luxury-muted"
              >
                <a
                  href="mailto:hongqiparts@gmail.com"
                  className="break-all text-luxury-muted transition-colors hover:text-white"
                >
                  hongqiparts@gmail.com
                </a>
                <a href="tel:+77753813839" className="text-luxury-muted transition-colors hover:text-white">
                  +7 (775) 381-38-39
                </a>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export const OwnersNavigation = () => {
  const {
    t,
    i18n,
    location,
    cartCount,
    cartNotice,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    changeLanguage,
    handleCartClick,
    navLinks,
  } = useNavigationBase();
  const [isScrolled, setIsScrolled] = useState(false);
  const ownerEyebrow = [
    t('shop.home.hero.chips.service'),
    t('shop.home.hero.chips.parts'),
    t('shop.home.hero.chips.support'),
  ].join(' · ');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderDesktopLink = (link: NavLink) => (
    <Link
      key={link.path}
      to={link.path}
      className={`relative px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
        isLinkActive(location.pathname, link.path)
          ? 'text-[#701729]'
          : 'text-black/45 hover:text-black/80'
      }`}
    >
      {link.label}
      {isLinkActive(location.pathname, link.path) ? (
        <motion.span
          layoutId="owners-nav-line"
          className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-luxury-burgundy"
        />
      ) : null}
    </Link>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'border-b border-black/5 bg-[rgba(249,245,243,0.94)] shadow-[0_18px_40px_rgba(157,34,53,0.08)] backdrop-blur-xl'
            : 'bg-[rgba(249,245,243,0.78)] backdrop-blur-md'
        }`}
      >
        <div className="border-b border-black/6">
          <div className="container mx-auto flex h-8 items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="truncate pr-3 text-[9px] uppercase tracking-[0.3em] text-black/35">
              {ownerEyebrow}
            </span>
            <a
              href="tel:+77753813839"
              className="inline-flex shrink-0 items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-black/35 transition-colors hover:text-black/70"
            >
              <Phone className="h-2.5 w-2.5" />
              +7 775 381 38 39
            </a>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/hongqi-parts" className="group flex items-center gap-3">
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-semibold uppercase tracking-[0.16em] text-black">
                  HONGQI
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-px w-8 bg-luxury-burgundy" />
                  <span className="whitespace-nowrap text-[7px] uppercase tracking-[0.35em] text-black/40">
                    {t('nav.parts')}
                  </span>
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map(renderDesktopLink)}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-1 border-r border-black/8 pr-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] uppercase tracking-[0.22em] transition-all ${
                      i18n.language === lang.code
                        ? 'bg-luxury-burgundy text-white'
                        : 'text-black/40 hover:bg-black/[0.03] hover:text-black/75'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <OwnersCartButton
                active={location.pathname === '/cart'}
                cartCount={cartCount}
                label={t('shop.cart.title')}
                onClick={handleCartClick}
              />
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <OwnersCartButton
                active={location.pathname === '/cart'}
                cartCount={cartCount}
                label={t('shop.cart.title')}
                onClick={handleCartClick}
              />
              <button
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center text-black/60"
                aria-label="Toggle menu"
              >
                <div className="relative flex h-4 w-6 flex-col justify-between">
                  <motion.span
                    animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 7 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="block h-px w-full origin-center bg-black"
                  />
                  <motion.span
                    animate={{ opacity: isMobileMenuOpen ? 0 : 1, x: isMobileMenuOpen ? 12 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="block h-px w-full bg-black"
                  />
                  <motion.span
                    animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -7 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="block h-px w-full origin-center bg-black"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <CartNotice
        text={cartNotice ? t('shop.cart.added') : ''}
        className="top-24 rounded-2xl border border-luxury-burgundy/20 bg-white/95 text-[#5a1422]"
      />

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 top-24 z-40 overflow-hidden border-t border-black/6 bg-[rgba(249,245,243,0.96)] shadow-[0_20px_40px_rgba(157,34,53,0.08)] backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    isLinkActive(location.pathname, link.path)
                      ? 'bg-luxury-burgundy/10 text-[#701729]'
                      : 'text-black/50 hover:bg-black/[0.03] hover:text-black/80'
                  }`}
                >
                  <span
                    className={`inline-block h-px w-4 ${
                      isLinkActive(location.pathname, link.path) ? 'bg-luxury-burgundy' : 'bg-black/10'
                    }`}
                  />
                  {link.label}
                </Link>
              ))}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-black/8 pt-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`rounded-xl px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-all ${
                      i18n.language === lang.code
                        ? 'bg-luxury-burgundy text-white'
                        : 'border border-black/10 text-black/45 hover:bg-black/[0.03] hover:text-black/80'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export const Navigation = SiteNavigation;
