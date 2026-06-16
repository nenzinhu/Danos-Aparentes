interface Props {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 36, showText = true }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/brand/logo-icon.png"
        alt="Danos Aparentes"
        width={size}
        height={size}
        style={{ borderRadius: size * 0.22, objectFit: 'cover', flexShrink: 0 }}
      />
      {showText && (
        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: size * 0.5, color: '#e8f4ff', letterSpacing: 0.3 }}>
          Danos Aparentes
        </div>
      )}
    </div>
  )
}
