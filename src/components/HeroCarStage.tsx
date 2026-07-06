'use client';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

const stage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.22 } },
};

export const heroCarVariant: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const heroTagVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

export const heroSpecCellVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

// Ficha técnica é o último beat (depois do carro + tags terem entrado),
// por isso um delayChildren maior que o `stage` padrão.
export const heroSpecStage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.52 } },
}

/**
 * Envolve o palco do carro/tags/ficha técnica do hero e aplica o stagger
 * entre os filhos diretos marcados com heroCarVariant/heroTagVariant/
 * heroSpecCellVariant. Roda uma única vez no mount (não é scroll-triggered
 * como o Reveal.tsx, que continua cuidando das seções mais abaixo da página).
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
