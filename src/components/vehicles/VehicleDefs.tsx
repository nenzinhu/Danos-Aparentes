'use client';
export default function VehicleDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="metal-car-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0c4a6e" />
          <stop offset="14%" stopColor="#0ea5e9" />
          <stop offset="30%" stopColor="#7dd3fc" />
          <stop offset="42%" stopColor="#38bdf8" />
          <stop offset="52%" stopColor="#0ea5e9" />
          <stop offset="68%" stopColor="#0369a1" />
          <stop offset="86%" stopColor="#075985" />
          <stop offset="100%" stopColor="#04263b" />
        </linearGradient>
        <linearGradient id="metal-moto-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="30%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#fca5a5" />
          <stop offset="68%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="metal-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="18%" stopColor="#0f172a" />
          <stop offset="38%" stopColor="#155e75" />
          <stop offset="48%" stopColor="#67e8f9" />
          <stop offset="56%" stopColor="#22d3ee" />
          <stop offset="66%" stopColor="#0e7490" />
          <stop offset="82%" stopColor="#0c4a6e" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="grad-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="25%" stopColor="#64748b" />
          <stop offset="48%" stopColor="#e2e8f0" />
          <stop offset="62%" stopColor="#94a3b8" />
          <stop offset="82%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="metal-truck-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="32%" stopColor="#475569" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="68%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="metal-bus-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="30%" stopColor="#059669" />
          <stop offset="50%" stopColor="#6ee7b7" />
          <stop offset="68%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="metal-van-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="35%" stopColor="#334155" />
          <stop offset="52%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="radial-wheel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="65%" stopColor="#090d16" />
          <stop offset="85%" stopColor="#020617" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="radial-calota" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="62%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
        <linearGradient id="metal-damage-low" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d4f63" />
          <stop offset="28%" stopColor="#5c6f85" />
          <stop offset="50%" stopColor="#8fa3b8" />
          <stop offset="72%" stopColor="#b8c8d6" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="metal-damage-medium" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="30%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fed7aa" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="metal-damage-high" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="30%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#fecaca" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="metal-selected" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="28%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#a5f3fc" />
          <stop offset="72%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
        <linearGradient id="metal-hover" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#075985" />
          <stop offset="40%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#bae6fd" />
          <stop offset="75%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <filter id="shadow-filter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" result="blur" />
        </filter>
      </defs>
    </svg>
  )
}
