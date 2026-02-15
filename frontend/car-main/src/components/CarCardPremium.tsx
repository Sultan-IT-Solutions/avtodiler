import { useState, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Gauge } from 'lucide-react';
import { Car } from '../types/car';

interface CarCardPremiumProps {
  car: Car;
  index?: number;
}

export const CarCardPremium = ({ car, index = 0 }: CarCardPremiumProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect
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
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0, 0, 0.2, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative"
    >
      <Link to={`/car/${car.id}`} className="block">
        <motion.div
          animate={{
            y: isHovered ? -12 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="bg-luxury-elevated rounded-2xl overflow-hidden shadow-luxury-md hover:shadow-luxury-xl transition-shadow duration-400"
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-luxury-surface">
            {/* Image with Scale Effect */}
            <motion.div
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="w-full h-full"
            >
              <img
                src={car.images[0]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />

            {/* Featured Badge */}
            {car.featured && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-4 left-4 z-10"
              >
                <div className="glass px-4 py-2 rounded-sm backdrop-blur-xl">
                  <span className="text-luxury-burgundy text-xs uppercase tracking-[0.15em] font-medium">
                    Featured
                  </span>
                </div>
              </motion.div>
            )}

            {/* Hover Details Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 20,
              }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0, 0, 0.2, 1] }}
              className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-luxury-black via-luxury-black/95 to-transparent"
            >
              <div className="flex items-center gap-4 text-sm text-luxury-muted">
                <div className="flex items-center gap-2">
                  <Gauge size={16} />
                  <span>{car.mileage.toLocaleString()} km</span>
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
            <motion.div
              animate={{ opacity: isHovered ? 0.8 : 1 }}
              className="text-luxury-burgundy text-xs uppercase tracking-[0.15em] font-medium mb-2"
            >
              {car.brand}
            </motion.div>

            {/* Model Name */}
            <h3 className="text-2xl lg:text-3xl font-display text-luxury-cream mb-3 group-hover:text-luxury-burgundy transition-colors duration-400 font-light">
              {car.model}
            </h3>

            {/* Year & Mileage */}
            <div className="flex items-center gap-4 text-sm text-luxury-muted mb-6">
              <span>{car.year}</span>
              <span>•</span>
              <span>{car.mileage.toLocaleString()} km</span>
            </div>

            {/* Price & Arrow */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-display text-luxury-cream font-light">
                {formatPrice(car.price)}
              </div>

              <motion.div
                animate={{
                  x: isHovered ? 6 : 0,
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
