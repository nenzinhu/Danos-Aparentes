interface Props {
  size?: number
  showText?: boolean
}

const ICON_ASPECT_RATIO = 300 / 175

export default function Logo({ size = 36, showText = true }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/brand/logo-icon.png"
        alt="Danos Aparentes"
        width={Math.round(size * ICON_ASPECT_RATIO)}
        height={size}
        style={{ borderRadius: size * 0.18, objectFit: 'contain', flexShrink: 0 }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {showText && (
        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: size * 0.5, color: '#e8f4ff', letterSpacing: 0.3 }}>
          Danos Aparentes
        </div>
      )}
    </div>
  )
}
