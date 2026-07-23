'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 1. Animated Sun / Moon Toggle Icon
export function IconSunMoon({ isDark, className = '', size = 20 }: IconProps & { isDark: boolean }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={false}
      animate={{ rotate: isDark ? 180 : 0, scale: [0.85, 1.1, 1] }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {isDark ? (
        // Moon
        <motion.path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      ) : (
        // Sun
        <>
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <motion.path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            style={{ transformOrigin: '12px 12px' }}
          />
        </>
      )}
    </motion.svg>
  );
}

// 2. Animated Camera Icon
export function IconCamera({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.12, rotate: [-2, 2, 0] }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <motion.circle
        cx="12"
        cy="13"
        r="4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

// 3. Animated Gallery / Photo Icon
export function IconGallery({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.1, y: -1 }}
      whileTap={{ scale: 0.9 }}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </motion.svg>
  );
}

// 4. Animated Check Icon
export function IconCheck({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <motion.polyline
        points="20 6 9 17 4 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

// 5. Animated Sponge / Eraser / Clear Icon
export function IconEraser({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ rotate: [0, -15, 15, -10, 0], scale: 1.1 }}
      transition={{ duration: 0.4 }}
    >
      <path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L21 10C21.5 10.5 21.5 11.5 21 12L13 20" />
      <path d="M18 13L11 6" />
    </motion.svg>
  );
}

// 6. Animated Team / Users Icon
export function IconTeam({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.1 }}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </motion.svg>
  );
}

// 7. Animated Document PDF Icon
export function IconDocument({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ y: -2, scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </motion.svg>
  );
}

// 8. Animated Shield Check (Security / SHA-256) Icon
export function IconShieldCheck({ className = '', size = 20 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </motion.svg>
  );
}

// 9. Animated Signature Pen Icon
export function IconSignature({ className = '', size = 20 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ rotate: [-5, 5, 0], x: 2 }}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </motion.svg>
  );
}

// 10. Animated GPS Location Icon
export function IconGps({ className = '', size = 20 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.15, y: -2 }}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </motion.svg>
  );
}

// 11. Animated Car / Vehicle Icon
export function IconCar({ className = '', size = 20 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ x: [0, 4, 0] }}
      transition={{ duration: 0.3 }}
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 12.5V16c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </motion.svg>
  );
}

// 12. Animated Sparkles Icon
export function IconSparkles({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    >
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </motion.svg>
  );
}

// 13. Animated Arrow Left / Back Icon
export function IconArrowLeft({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ x: -3 }}
      transition={{ duration: 0.2 }}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </motion.svg>
  );
}

// 14. Animated Arrow Right Icon
export function IconArrowRight({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2 }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </motion.svg>
  );
}

// 15. Animated Tag / Label Icon
export function IconTag({ className = '', size = 16 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ rotate: 15, scale: 1.1 }}
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </motion.svg>
  );
}

// 16. Animated Magnifying Glass / Lookup Icon
export function IconSearch({ className = '', size = 18 }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.15, rotate: 10 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </motion.svg>
  );
}
