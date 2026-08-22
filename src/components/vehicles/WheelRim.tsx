'use client';

const SPOKE_ANGLES = [0, 60, 120, 180, 240, 300] as const

type LateralWheelProps = {
  cx: number
  cy: number
  r: number
  caliperSide?: 'left' | 'right' | 'none'
}

/** Pneu + aro + cubo — vista lateral (decorativo, sem clique). */
export function LateralWheelGraphic({ cx, cy, r, caliperSide = 'none' }: LateralWheelProps) {
  const rimR = r * 0.58
  const spokeLen = r * 0.4

  return (
    <g pointerEvents="none" className="wheel-graphic">
      <circle cx={cx} cy={cy} r={r} fill="url(#radial-wheel)" />
      {/* Banda de rodagem (borracha com relevo) */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.97}
        fill="none"
        stroke="#020617"
        strokeWidth={Math.max(1.5, r * 0.06)}
        strokeDasharray={`${r * 0.10},${r * 0.05}`}
        opacity={0.85}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.93}
        fill="none"
        stroke="#0f172a"
        strokeWidth={Math.max(1, r * 0.035)}
        strokeDasharray={`${r * 0.14},${r * 0.09}`}
        opacity={0.7}
      />
      {/* Sombra interna do aro */}
      <circle cx={cx} cy={cy} r={rimR + 2} fill="#0b1220" opacity={0.35} />
      <circle cx={cx} cy={cy} r={rimR} fill="url(#radial-calota)" stroke="#cbd5e1" strokeWidth={1.4} />
      {/* Brilho de aro (realismo) */}
      <circle cx={cx} cy={cy} r={rimR} fill="none" stroke="#f8fafc" strokeWidth={0.8} opacity={0.4} />
      {SPOKE_ANGLES.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x2 = cx + spokeLen * Math.cos(rad)
        const y2 = cy + spokeLen * Math.sin(rad)
        return (
          <line
            key={deg}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="#e2e8f0"
            strokeWidth={Math.max(1.2, r * 0.055)}
            strokeLinecap="round"
            opacity={0.85}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={rimR * 0.52} fill="none" stroke="#64748b" strokeWidth={0.7} opacity={0.65} />
      <circle cx={cx} cy={cy} r={r * 0.15} fill="#475569" stroke="#cbd5e1" strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={r * 0.06} fill="#f1f5f9" />
      {caliperSide === 'left' && (
        <path
          d={`M${cx + r * 0.4},${cy - r * 0.32} A${r * 0.22},${r * 0.22} 0 0,0 ${cx + r * 0.46},${cy} L${cx + r * 0.34},${cy} Z`}
          fill="#ef4444"
          opacity={0.92}
        />
      )}
      {caliperSide === 'right' && (
        <path
          d={`M${cx - r * 0.4},${cy - r * 0.32} A${r * 0.22},${r * 0.22} 0 0,1 ${cx - r * 0.46},${cy} L${cx - r * 0.34},${cy} Z`}
          fill="#ef4444"
          opacity={0.92}
        />
      )}
    </g>
  )
}

type FrontalWheelProps = {
  x: number
  y: number
  width: number
  height: number
}

/** Pneu + aro — vista frontal/traseira (decorativo). */
export function FrontalWheelGraphic({ x, y, width, height }: FrontalWheelProps) {
  const cx = x + width / 2
  const cy = y + height * 0.34

  return (
    <g pointerEvents="none" className="wheel-graphic">
      <rect x={x} y={y} width={width} height={height} rx={width * 0.22} fill="url(#radial-wheel)" />
      <rect x={x + width * 0.08} y={y + height * 0.12} width={width * 0.84} height={height * 0.76} rx={width * 0.18} fill="none" stroke="#0f172a" strokeWidth={0.8} opacity={0.35} />
      <ellipse cx={cx} cy={cy} rx={width * 0.4} ry={width * 0.36} fill="url(#radial-calota)" stroke="#94a3b8" strokeWidth={1} />
      <ellipse cx={cx} cy={cy} rx={width * 0.26} ry={width * 0.22} fill="none" stroke="#64748b" strokeWidth={0.7} opacity={0.7} />
      <ellipse cx={cx} cy={cy} rx={width * 0.11} ry={width * 0.09} fill="#94a3b8" stroke="#e2e8f0" strokeWidth={0.6} />
      <ellipse cx={cx} cy={cy} rx={width * 0.04} ry={width * 0.035} fill="#f8fafc" />
    </g>
  )
}
