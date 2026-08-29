'use client';
import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import GsapLetterScanText from './GsapLetterScanText';
import LupaVehicleReveal, { SELECTOR_VEHICLES } from './LupaVehicleReveal';

interface Props {
  size?: number
  showText?: boolean
  variant?: 'icon' | 'full'
  className?: string
  /**
   * Text color class for "Danos Aparentes". Defaults to the theme variable —
   * override on surfaces with a fixed (non-theme-reactive) background, e.g.
   * a card that stays dark in both light and dark mode, so the name doesn't
   * go dark-on-dark when the theme variable flips for light mode.
   */
  textClassName?: string
}

export default function Logo({
  size = 48,
  showText = true,
  variant = 'icon',
  className,
  textClassName = 'text-[var(--text-main)]',
}: Props) {
  const displayText = showText && variant !== 'full'
  const hoverRef = useRef<HTMLElement | HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (!hoverRef.current) return
    gsap.to(hoverRef.current, {
      scale: 1.1,
      rotation: 6,
      filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.5))',
      duration: 0.3,
      ease: 'back.out(2)',
    })
  }

  const handleMouseLeave = () => {
    if (!hoverRef.current) return
    gsap.to(hoverRef.current, {
      scale: 1,
      rotation: 0,
      filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.25))',
      duration: 0.35,
      ease: 'power2.out',
    })
  }

  return (
    <div
      role="presentation"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`flex items-center gap-2.5 cursor-pointer select-none ${className ?? ''}`}
    >
      {variant === 'full' ? (
        <Image
          ref={hoverRef as React.RefObject<HTMLImageElement>}
          src="/brand/logo-full.svg"
          alt="Danos Aparentes"
          style={{ height: size, width: 'auto' }}
          className="object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-shadow duration-300"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width={160}
          height={size}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div ref={hoverRef as React.RefObject<HTMLDivElement>} className="flex-shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-shadow duration-300" style={{ transformOrigin: 'center' }}>
          <LupaVehicleReveal size={size} vehicles={SELECTOR_VEHICLES} />
        </div>
      )}
      {displayText && (
        <GsapLetterScanText
          text="Danos Aparentes"
          fontSize={size * 0.45}
          className={`font-outfit font-extrabold tracking-wider ${textClassName}`}
        />
      )}
    </div>
  )
}
