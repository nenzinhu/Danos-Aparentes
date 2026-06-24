'use client';

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

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <img
        src={src}
        alt="Danos Aparentes"
        style={{ height: size, width: variant === 'full' ? 'auto' : size }}
        className="object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)]"
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
