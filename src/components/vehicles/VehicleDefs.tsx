export default function VehicleDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="metal-car-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#93c5fd" />
          <stop offset="65%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="metal-moto-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#fca5a5" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="metal-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="25%" stopColor="#1e293b" />
          <stop offset="45%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#38bdf8" />
          <stop offset="80%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0b1329" />
        </linearGradient>
        <linearGradient id="grad-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="metal-truck-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="35%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="65%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="metal-bus-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#a7f3d0" />
          <stop offset="65%" stopColor="#059669" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="metal-van-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="35%" stopColor="#475569" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="65%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="radial-wheel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="65%" stopColor="#090d16" />
          <stop offset="85%" stopColor="#020617" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="radial-calota" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#cbd5e1" />
          <stop offset="80%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
        <filter id="shadow-filter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" result="blur" />
        </filter>
      </defs>
    </svg>
  )
}
