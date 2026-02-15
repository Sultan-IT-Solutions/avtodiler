import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}

export const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.8,
  y = 40
}: ScrollRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration,
        delay,
        ease: [0, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
};
