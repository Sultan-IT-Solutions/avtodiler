import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from './components/Navigation';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
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
          Luxury Auto Kazakhstan
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

/* ===== SCROLL TO TOP ===== */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/service" element={<Service />} />
          <Route path="/test-drive" element={<TestDrive />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

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
      {/* Preloader */}
      <AnimatePresence>
        {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      {/* Main App */}
      {!isLoading && (
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-luxury-black noise-overlay">
            <CustomCursor />
            <Navigation />
            <FloatingWhatsApp />
            <main>
              <AnimatedRoutes />
            </main>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
