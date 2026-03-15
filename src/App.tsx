import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { CarDetail } from './pages/CarDetail';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Brands } from './pages/Brands';
import { Service } from './pages/Service';
import { TestDrive } from './pages/TestDrive';
import { Offers } from './pages/Offers';
import { Dealers } from './pages/Dealers';
import { Policy } from './pages/Policy';
import AdminApp from './admin/AdminApp';
import { ShopProvider } from './context/ShopContext';
import { VisualAdminProvider, useVisualAdmin } from './context/VisualAdminContext';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from './components/Navigation';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { VisualAdminToolbar } from './components/VisualAdminToolbar';
import {
  ShopCartPage,
  ShopCatalogPage,
  ShopCatalogResolverPage,
  ShopCheckoutPage,
  ShopHomePage,
  ShopRequestPage,
  ShopStoresPage,
} from './pages/ShopPages';
import { publicApi } from './utils/publicApi';
import { localizedText } from './utils/localizedText';
import type { SeoItem } from './types/admin';
import type { SeoPage } from './types/shop';
import { shopPublicApi } from './utils/shopApi';

class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    if (!import.meta.env.PROD) {
      console.error('RouteErrorBoundary', error);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-luxury-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full border border-white/10 bg-luxury-elevated p-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-luxury-burgundy mb-3">Ошибка</p>
          <h1 className="text-xl font-semibold">Страница упала</h1>
          <p className="mt-3 text-sm text-white/60">Попробуйте обновить страницу или вернуться назад.</p>
        </div>
      </div>
    );
  }
}

gsap.registerPlugin(ScrollTrigger);

/* ===== PRELOADER ===== */
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Count animation
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate as we get closer to 100
        const step = prev < 60 ? 3 : prev < 90 ? 2 : 1;
        return Math.min(prev + step, 100);
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count === 100) {
      // Animate out
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      tl.to(counterRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.inOut',
      })
      .to(containerRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1,
        ease: 'power4.inOut',
      }, '-=0.2');
    }
  }, [count, onComplete]);

  return (
    <div
      ref={containerRef}
      className="preloader"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      {/* Background lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent absolute left-1/4" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent absolute left-1/2" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent absolute left-3/4" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-micro uppercase tracking-ultra text-luxury-muted"
        >
          HONGQI AUTO Kazakhstan
        </motion.div>

        {/* Counter */}
        <span ref={counterRef} className="preloader-counter">
          {count.toString().padStart(3, '0')}
        </span>

        {/* Progress bar */}
        <div className="w-48 h-px bg-white/10 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-luxury-burgundy"
            style={{ width: `${count}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
};

/* ===== CUSTOM CURSOR ===== */
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      gsap.set(cursor, { x: cursorX, y: cursorY });
      requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleHideEnter = () => setHideCursor(true);
    const handleHideLeave = () => setHideCursor(false);

    const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    const hideElements = document.querySelectorAll('[data-cursor-hide]');
    hideElements.forEach(el => {
      el.addEventListener('mouseenter', handleHideEnter);
      el.addEventListener('mouseleave', handleHideLeave);
    });

    window.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      hideElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHideEnter);
        el.removeEventListener('mouseleave', handleHideLeave);
      });
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
      const handleMouseEnter = () => setIsHovering(true);
      const handleMouseLeave = () => setIsHovering(false);
      const handleHideEnter = () => setHideCursor(true);
      const handleHideLeave = () => setHideCursor(false);

      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
      document.querySelectorAll('[data-cursor-hide]').forEach(el => {
        el.addEventListener('mouseenter', handleHideEnter);
        el.addEventListener('mouseleave', handleHideLeave);
      });
    }, 500);
    return () => clearTimeout(t);
  });

  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  const invisible = hideCursor ? 'opacity-0 pointer-events-none' : '';

  return (
    <>
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-opacity duration-200 ${invisible}`}
      >
        <div
          className={`rounded-full border border-white transition-all duration-500 ease-luxury ${
            isHovering ? 'w-16 h-16 opacity-60' : 'w-8 h-8 opacity-40'
          }`}
        />
      </div>
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${invisible}`}
      >
        <div className="w-1 h-1 rounded-full bg-white" />
      </div>
    </>
  );
};

const useSeoMeta = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [items, setItems] = useState<SeoItem[]>([]);
  const [shopItems, setShopItems] = useState<SeoPage[]>([]);
  const defaultsRef = useRef({
    title: document.title,
    description: '',
  });

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    defaultsRef.current = {
      title: document.title,
      description: meta?.getAttribute('content') ?? '',
    };
  }, []);

  useEffect(() => {
    let active = true;
    publicApi
      .seo()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    shopPublicApi
      .seoPages()
      .then((data) => {
        if (active) setShopItems(data);
      })
      .catch(() => {
        if (active) setShopItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    const lang = (i18n.language as 'ru' | 'kz' | 'en') ?? 'ru';
    const path = location.pathname || '/';
    const isShopPath =
      path.startsWith('/hongqi-parts') || path === '/cart' || path === '/checkout';

    const exact = items.find((item) => item.slug === path);
    const wildcard = items.find((item) => item.slug === '/car/*' && path.startsWith('/car/'));
    const fallback = items.find((item) => item.slug === '*') ?? items.find((item) => item.slug === 'global');
    const selected = exact ?? wildcard ?? fallback;
    const selectedShop = isShopPath ? shopItems.find((item) => item.slug === path) : undefined;

    const fallbackTitle = defaultsRef.current.title;
    const fallbackDescription = defaultsRef.current.description;

    const title = selectedShop
      ? localizedText(selectedShop.title, { lng: lang, fallbackLng: 'ru', emptyFallback: '' })
      : selected
        ? localizedText(selected.title, { lng: lang, fallbackLng: 'ru', emptyFallback: '' })
        : '';
    const description = selectedShop
      ? localizedText(selectedShop.description, {
          lng: lang,
          fallbackLng: 'ru',
          emptyFallback: '',
        })
      : selected
        ? localizedText(selected.description, {
            lng: lang,
            fallbackLng: 'ru',
            emptyFallback: '',
          })
        : '';
    const keywords = selected
      ? localizedText(selected.keywords, { lng: lang, fallbackLng: 'ru', emptyFallback: '' })
      : '';
    const imageUrl = selected?.image?.trim() ?? '';
    const faviconUrl = selected?.favicon?.trim() ?? '';

    document.title = title || fallbackTitle;

    const descriptionMeta =
      document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    descriptionMeta.setAttribute('name', 'description');
    descriptionMeta.setAttribute('content', description || fallbackDescription);
    if (!descriptionMeta.parentElement) document.head.appendChild(descriptionMeta);

    const keywordsMeta = document.querySelector('meta[name="keywords"]') ?? document.createElement('meta');
    keywordsMeta.setAttribute('name', 'keywords');
    keywordsMeta.setAttribute('content', keywords);
    if (!keywordsMeta.parentElement) document.head.appendChild(keywordsMeta);

    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'index,follow');
    if (!robots.parentElement) document.head.appendChild(robots);

    const localeMap: Record<string, string> = { ru: 'ru_RU', kz: 'kk_KZ', en: 'en_US' };
    const ogLocale = localeMap[lang] ?? 'ru_RU';
    const ogUrl = `${window.location.origin}${path}`;

    const ogTitle = document.querySelector('meta[property="og:title"]') ?? document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', title || fallbackTitle || document.title);
    if (!ogTitle.parentElement) document.head.appendChild(ogTitle);

    const ogDescription =
      document.querySelector('meta[property="og:description"]') ?? document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', description || fallbackDescription || '');
    if (!ogDescription.parentElement) document.head.appendChild(ogDescription);

    const ogType = document.querySelector('meta[property="og:type"]') ?? document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.setAttribute('content', 'website');
    if (!ogType.parentElement) document.head.appendChild(ogType);

    const ogUrlMeta = document.querySelector('meta[property="og:url"]') ?? document.createElement('meta');
    ogUrlMeta.setAttribute('property', 'og:url');
    ogUrlMeta.setAttribute('content', ogUrl);
    if (!ogUrlMeta.parentElement) document.head.appendChild(ogUrlMeta);

    const ogLocaleMeta =
      document.querySelector('meta[property="og:locale"]') ?? document.createElement('meta');
    ogLocaleMeta.setAttribute('property', 'og:locale');
    ogLocaleMeta.setAttribute('content', ogLocale);
    if (!ogLocaleMeta.parentElement) document.head.appendChild(ogLocaleMeta);

  const ogImage = document.querySelector('meta[property="og:image"]') ?? document.createElement('meta');
  ogImage.setAttribute('property', 'og:image');
  ogImage.setAttribute('content', imageUrl);
  if (!ogImage.parentElement) document.head.appendChild(ogImage);

    const twitterCard =
      document.querySelector('meta[name="twitter:card"]') ?? document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');
    if (!twitterCard.parentElement) document.head.appendChild(twitterCard);

    const twitterTitle =
      document.querySelector('meta[name="twitter:title"]') ?? document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    twitterTitle.setAttribute('content', title || fallbackTitle || document.title);
    if (!twitterTitle.parentElement) document.head.appendChild(twitterTitle);

    const twitterDescription =
      document.querySelector('meta[name="twitter:description"]') ?? document.createElement('meta');
    twitterDescription.setAttribute('name', 'twitter:description');
    twitterDescription.setAttribute('content', description || fallbackDescription || '');
    if (!twitterDescription.parentElement) document.head.appendChild(twitterDescription);

    const twitterImage =
      document.querySelector('meta[name="twitter:image"]') ?? document.createElement('meta');
    twitterImage.setAttribute('name', 'twitter:image');
    twitterImage.setAttribute('content', imageUrl);
    if (!twitterImage.parentElement) document.head.appendChild(twitterImage);

    const canonicalUrl = `${window.location.origin}${path}`;
    const canonical = document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', canonicalUrl);
    if (!canonical.parentElement) document.head.appendChild(canonical);

    if (faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') ?? document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('href', faviconUrl);
      if (!favicon.parentElement) document.head.appendChild(favicon);

      const shortcut =
        document.querySelector('link[rel="shortcut icon"]') ?? document.createElement('link');
      shortcut.setAttribute('rel', 'shortcut icon');
      shortcut.setAttribute('href', faviconUrl);
      if (!shortcut.parentElement) document.head.appendChild(shortcut);
    }

    document.documentElement.lang = lang;
  }, [items, shopItems, location.pathname, i18n.language]);
};

/* ===== SCROLL TO TOP ===== */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function normalizeShopPath(pathname: string) {
  let normalized = pathname.replace(/\/{2,}/g, '/');

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/, '');
  }

  const parts = normalized.split('/').filter(Boolean);
  if (parts[0] !== 'hongqi-parts') return normalized || '/';

  if (parts[1] === 'catalog' && parts.length > 4) {
    return `/${parts.slice(0, 4).join('/')}`;
  }

  if (parts[1] !== 'catalog' && parts.length > 2) {
    return `/${parts.slice(0, 2).join('/')}`;
  }

  return normalized || '/';
}

function NormalizeRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedPath = normalizeShopPath(location.pathname);
    if (normalizedPath === location.pathname) return;

    navigate(
      `${normalizedPath}${location.search}${location.hash}`,
      { replace: true }
    );
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}

/* ===== ANIMATED ROUTES ===== */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/hongqi-parts" element={<ShopHomePage />} />
          <Route path="/hongqi-parts/catalog" element={<ShopCatalogPage />} />
          <Route path="/hongqi-parts/catalog/:categorySlug" element={<ShopCatalogPage />} />
          <Route path="/hongqi-parts/catalog/:categorySlug/:subcategorySlug" element={<ShopCatalogPage />} />
          <Route path="/cart" element={<ShopCartPage />} />
          <Route path="/checkout" element={<ShopCheckoutPage />} />
          <Route path="/hongqi-parts/stores" element={<ShopStoresPage />} />
          <Route path="/hongqi-parts/request" element={<ShopRequestPage />} />
          <Route path="/hongqi-parts/:slug" element={<ShopCatalogResolverPage />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/service" element={<Service />} />
          <Route path="/test-drive" element={<TestDrive />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/privacy" element={<Policy />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const AppShell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isShopRoute = location.pathname.startsWith('/hongqi-parts');
  const { enabled: isVisualAdminEnabled, authed: isVisualAdminAuthed } = useVisualAdmin();

  useSeoMeta();

  return (
    <RouteErrorBoundary>
      <div className="min-h-screen bg-luxury-black noise-overlay">
        {!isAdmin && <CustomCursor />}
        {!isAdmin && <Navigation />}
        {!isAdmin && <FloatingWhatsApp />}
        <main>
          <AnimatedRoutes />
        </main>
        {!isAdmin && isVisualAdminEnabled && isVisualAdminAuthed ? <VisualAdminToolbar /> : null}
        {!isAdmin && isShopRoute && <Footer />}
      </div>
    </RouteErrorBoundary>
  );
};

/* ===== MAIN APP ===== */
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isLoading]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      {!isLoading && (
        <Router>
          <VisualAdminProvider>
            <ShopProvider>
              <NormalizeRoutes />
              <ScrollToTop />
              <AppShell />
            </ShopProvider>
          </VisualAdminProvider>
        </Router>
      )}
    </>
  );
}

export default App;
