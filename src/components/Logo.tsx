interface Props {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 36, showText = true }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d4ff" />
            <stop offset="1" stopColor="#0066cc" />
          </linearGradient>
        </defs>
        <path d="M8 40 L11 30 Q13 27 17 27 H38 Q42 27 44 30 L47 40 V45 Q47 47 45 47 H10 Q8 47 8 45 Z" fill="#103354" stroke="#00aaff" strokeWidth="1.5" />
        <circle cx="16" cy="45" r="3.5" fill="#0a1628" stroke="#00d4ff" strokeWidth="1.3" />
        <circle cx="39" cy="45" r="3.5" fill="#0a1628" stroke="#00d4ff" strokeWidth="1.3" />
        <circle cx="42" cy="20" r="13" fill="none" stroke="url(#logo-grad)" strokeWidth="4" />
        <line x1="51" y1="29" x2="58" y2="36" stroke="url(#logo-grad)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {showText && (
        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: size * 0.5, color: '#e8f4ff', letterSpacing: 0.3 }}>
          VISTORIA<span style={{ color: '#00aaff' }}>+</span>
        </div>
      )}
    </div>
  )
}
