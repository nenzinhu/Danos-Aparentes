'use client';
import { useRef } from 'react';
import gsap from 'gsap';

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
  const src = variant === 'full' ? '/brand/logo-full.svg' : '/logo.svg'
  const displayText = showText && variant !== 'full'
  const imgRef = useRef<HTMLImageElement>(null)

  const handleMouseEnter = () => {
    if (!imgRef.current) return
    gsap.to(imgRef.current, {
      scale: 1.1,
      rotation: 6,
      filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.5))',
      duration: 0.3,
      ease: 'back.out(2)',
    })
  }

  const handleMouseLeave = () => {
    if (!imgRef.current) return
    gsap.to(imgRef.current, {
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
      <img
        ref={imgRef}
        src={src}
        alt="Danos Aparentes"
        style={{ height: size, width: variant === 'full' ? 'auto' : size }}
        className="object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-shadow duration-300"
        fetchPriority="high"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {displayText && (
        <div 
          style={{ fontSize: size * 0.45 }}
          className="font-outfit font-extrabold text-[var(--text-main)] tracking-wider"
        >
          Danos Aparentes
        </div>
      )}
    </div>
  )
}
