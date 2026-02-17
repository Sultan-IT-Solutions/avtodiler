import { useState, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Gauge } from 'lucide-react';
import { Car } from '../types/car';
import { SITE_IMAGES } from '../data/siteImages';

interface CarCardProps {
  car: Car;
  index?: number;
}

export const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect using Framer Motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseXPos = (e.clientX - centerX) / (rect.width / 2);
    const mouseYPos = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0, 0, 0.2, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative gpu-accelerated"
    >
      <Link to={`/car/${car.id}`} className="block">
        <motion.div
          animate={{
            y: isHovered ? -8 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="card-luxury overflow-hidden transition-shadow duration-400 hover:shadow-luxury-xl"
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-luxury-surface">
            {/* Image with Scale Effect */}
            <motion.div
              animate={{
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              className="w-full h-full"
            >
              <img
                src={car.images[0]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = SITE_IMAGES.hero; e.currentTarget.onerror = () => { e.currentTarget.src = SITE_IMAGES.cta; }; }}
              />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />

            {/* Featured Badge */}
            {car.featured && (
              <div className="absolute top-4 left-4 z-10">
                <div className="glass px-4 py-2 rounded-sm">
                  <span className="text-luxury-burgundy text-xs uppercase tracking-luxury font-medium">
                    Featured
                  </span>
                </div>
              </div>
            )}

            {/* Hover Details Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 20,
              }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0, 0, 0.2, 1] }}
              className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-luxury-black via-luxury-black/90 to-transparent"
            >
              <div className="flex items-center gap-4 text-sm text-luxury-muted">
                <div className="flex items-center gap-2">
                  <Gauge size={16} />
                  <span>{car.mileage.toLocaleString()} {t('car.km')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{car.specifications.power}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Card Content */}
          <div className="p-6 lg:p-8">
            {/* Brand Label */}
            <div className="text-luxury-burgundy text-xs uppercase tracking-luxury font-medium mb-2">
              {car.brand}
            </div>

            {/* Model Name */}
            <h3 className="text-h3 font-display text-luxury-cream mb-3 group-hover:text-luxury-burgundy transition-colors duration-400">
              {car.model}
            </h3>

            {/* Year & Mileage */}
            <div className="flex items-center gap-4 text-sm text-luxury-muted mb-6">
              <span>{car.year} {t('car.year')}</span>
              <span>•</span>
              <span>{car.mileage.toLocaleString()} {t('car.km')}</span>
            </div>

            {/* Price & Arrow */}
            <div className="flex items-center justify-between">
              <div className="text-h3 font-display text-luxury-cream">
                {formatPrice(car.price)}
              </div>

              <motion.div
                animate={{
                  x: isHovered ? 4 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="text-luxury-burgundy"
              >
                <ArrowRight size={24} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
