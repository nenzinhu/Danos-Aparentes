'use client';

interface Props {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 48, showText = true }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo.svg"
        alt="Danos Aparentes"
        style={{ height: size }}
        className="object-contain flex-shrink-0"
        fetchPriority="high"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {showText && (
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
