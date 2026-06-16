import { VehicleProps } from '../../types'

export default function CarLateralRight({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  function partProps(id: string) {
    const dmg = damages.find(d => d.partId === id)
    const cls = ['part', dmg ? `damage-${dmg.severity}` : '', selectedPartId === id ? 'selected' : ''].filter(Boolean).join(' ')
    return {
      className: cls,
      onClick: (e: React.MouseEvent<SVGElement>) => {
        e.stopPropagation()
        const name = (e.currentTarget as SVGElement).getAttribute('data-name') || id
        onPartClick(id, name)
      },
      onMouseEnter: (e: React.MouseEvent<SVGElement>) => {
        const name = (e.currentTarget as SVGElement).getAttribute('data-name') || id
        onPartHover(id, name)
      },
    }
  }

  return (
    <svg viewBox="0 0 520 220" width="100%">
      <ellipse cx="260" cy="188" rx="230" ry="14" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />
      <path d="M445,160 A45,45 0 0,1 355,160 Z" fill="#0f172a" />
      <path d="M165,160 A45,45 0 0,1 75,160 Z" fill="#0f172a" />
      <g pointerEvents="none">
        <circle cx="120" cy="160" r="38" fill="url(#radial-wheel)" />
        <circle cx="120" cy="160" r="34" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="120" cy="160" r="36" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4,6" opacity="0.8" />
        <circle cx="120" cy="160" r="25" fill="#94a3b8" />
        <circle cx="120" cy="160" r="23" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,3" />
        <path d="M104,144 A25,25 0 0,1 98,160 L92,160 A31,31 0 0,0 100,140 Z" fill="#ef4444" />
        <circle cx="120" cy="160" r="26" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
        <circle cx="120" cy="160" r="22" fill="url(#radial-calota)" />
        <path d="M120,160 L120,138 M120,160 L99,153 M120,160 L107,178 M120,160 L133,178 M120,160 L141,153" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <path d="M120,160 L120,138 M120,160 L99,153 M120,160 L107,178 M120,160 L133,178 M120,160 L141,153" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="120" cy="160" r="5" fill="#475569" />
        <circle cx="120" cy="160" r="2" fill="#e2e8f0" />
      </g>
      <circle {...partProps('car-rr-wheel-rear')} data-name="Roda Traseira Direita" cx="120" cy="160" r="38" />
      <g pointerEvents="none">
        <circle cx="400" cy="160" r="38" fill="url(#radial-wheel)" />
        <circle cx="400" cy="160" r="34" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="400" cy="160" r="36" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4,6" opacity="0.8" />
        <circle cx="400" cy="160" r="25" fill="#94a3b8" />
        <circle cx="400" cy="160" r="23" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,3" />
        <path d="M384,144 A25,25 0 0,1 378,160 L372,160 A31,31 0 0,0 380,140 Z" fill="#ef4444" />
        <circle cx="400" cy="160" r="26" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
        <circle cx="400" cy="160" r="22" fill="url(#radial-calota)" />
        <path d="M400,160 L400,138 M400,160 L379,153 M400,160 L387,178 M400,160 L413,178 M400,160 L421,153" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <path d="M400,160 L400,138 M400,160 L379,153 M400,160 L387,178 M400,160 L413,178 M400,160 L421,153" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="400" cy="160" r="5" fill="#475569" />
        <circle cx="400" cy="160" r="2" fill="#e2e8f0" />
      </g>
      <circle {...partProps('car-rr-wheel-front')} data-name="Roda Dianteira Direita" cx="400" cy="160" r="38" />
      <path {...partProps('car-lr-glass-front')} data-name="Vidro Dianteiro Direito" d="M330,80 L272,42 L202,42 L202,80 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1" />
      <path {...partProps('car-lr-glass-rear')} data-name="Vidro Traseiro Direito" d="M198,42 L142,42 L102,80 L198,80 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1" />
      <rect x="198" y="42" width="4" height="38" fill="#0f172a" pointerEvents="none" />
      <path d="M331,80 L273,42" stroke="#0f172a" strokeWidth="3" fill="none" pointerEvents="none" />
      <path d="M142,42 L101,80" stroke="#0f172a" strokeWidth="3" fill="none" pointerEvents="none" />
      <path {...partProps('car-lr-roof')} data-name="Teto" d="M290,42 L132,42 C125,42 120,40 125,33 C140,24 170,22 240,22 C275,23 300,33 290,42 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1.5" />
      <path {...partProps('car-lr-fender-rear')} data-name="Para-lama Traseiro Direito" d="M140,80 C110,80 75,82 42,92 C28,105 32,125 38,132 C40,138 50,148 72,150 C75,128 85,118 120,118 C132,118 138,125 138,150 C135,135 140,122 140,80 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-lr-door-rear')} data-name="Porta Traseira Direita" d="M245,80 L140,80 C140,122 135,135 138,150 C148,145 150,160 150,160 L245,160 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-lr-door-front')} data-name="Porta Dianteira Direita" d="M360,80 L245,80 L245,160 L360,160 C360,160 358,145 368,150 C365,135 360,122 360,80 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-lr-fender-front')} data-name="Para-lama Dianteiro Direito" d="M488,118 C490,105 480,88 442,80 C410,78 385,80 360,80 C360,122 365,135 368,150 C375,125 390,118 400,118 C420,118 430,128 435,150 L488,150 C490,138 489,125 488,118 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-lr-sill')} data-name="Soleira Direita" d="M368,160 L150,160 L150,168 L368,168 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <g {...partProps('car-lr-mirror')} data-name="Retrovisor Direito">
        <path d="M358,76 C370,76 378,66 372,60 C366,54 355,65 358,76 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        <path d="M360,74 C368,74 374,67 370,63 C366,59 358,67 360,74 Z" fill="url(#metal-car-blue)" pointerEvents="none" />
        <path d="M375,67 Q370,65 366,67" stroke="#fbbf24" strokeWidth="1.5" fill="none" pointerEvents="none" />
      </g>
      <path d="M470,96 C420,92 340,95 280,95 C220,95 140,92 60,98" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" pointerEvents="none" />
      <path d="M350,148 L160,148" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" pointerEvents="none" />
      <path d="M350,149 L160,149" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" pointerEvents="none" />
      <g pointerEvents="none">
        <rect x="259" y="88" width="16" height="4" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <line x1="259" y1="90" x2="275" y2="90" stroke="#000" strokeWidth="1" />
        <rect x="214" y="88" width="16" height="4" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <line x1="214" y1="90" x2="230" y2="90" stroke="#000" strokeWidth="1" />
      </g>
      <path d="M488,118 C487,114 484,110 478,108 C481,118 485,123 488,118 Z" fill="#fef08a" opacity="0.8" pointerEvents="none" />
      <path d="M42,92 C42,96 44,102 47,104 C44,96 42,94 42,92 Z" fill="#f87171" pointerEvents="none" />
    </svg>
  )
}
