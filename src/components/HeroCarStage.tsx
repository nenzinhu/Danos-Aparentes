'use client';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/** Soft settle — shared across home hero motion (Lane A). */
export const HERO_EASE = [0.16, 1, 0.3, 1] as const;

const stage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};

/** Copy column: brand → headline → CTA (leads the car stage). */
export const heroCopyStage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const heroCopyItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: HERO_EASE },
  },
};

export const heroCarVariant: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.65, ease: HERO_EASE } },
};

export const heroTagVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: HERO_EASE } },
};

export const heroSpecCellVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: HERO_EASE } },
};

// Ficha técnica é o último beat (depois do carro + tags terem entrado).
export const heroSpecStage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.48 } },
};

/**
 * Envolve o palco do carro/tags do hero e aplica stagger
 * entre os filhos diretos. Roda uma única vez no mount.
 */
export default function HeroCarStage({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={stage} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
