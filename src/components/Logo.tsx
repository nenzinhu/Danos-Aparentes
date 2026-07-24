'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import GsapLetterScanText from './GsapLetterScanText';
import LupaVehicleReveal, { SELECTOR_VEHICLES } from './LupaVehicleReveal';

interface Props {
  size?: number
  showText?: boolean
  variant?: 'icon' | 'full'
  className?: string
}

export default function Logo({
  size = 48,
  showText = true,
  variant = 'icon',
  className,
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex items-center gap-2.5 cursor-pointer select-none ${className ?? ''}`}
    >
      {variant === 'full' ? (
        <img
          ref={hoverRef as React.RefObject<HTMLImageElement>}
          src="/brand/logo-full.svg"
          alt="Danos Aparentes"
          style={{ height: size, width: 'auto' }}
          className="object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-shadow duration-300"
          fetchPriority="high"
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
          className="font-outfit font-extrabold text-[var(--text-main)] tracking-wider"
        />
      )}
    </div>
  )
}
