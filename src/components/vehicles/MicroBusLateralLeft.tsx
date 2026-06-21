'use client';
import { VehicleProps } from '../../types'

export default function MicroBusLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
    <svg viewBox="0 0 560 220" width="100%">
      <ellipse cx="280" cy="200" rx="258" ry="12" className="shadow-ground" />

      {/* lateral esquerda = espelho da direita */}
      <g transform="matrix(-1 0 0 1 560 0)">
        {/* eixos atrás das rodas */}
        <g pointerEvents="none">
          <rect x="98" y="150" width="44" height="18" fill="#1e293b" />
          <rect x="448" y="150" width="44" height="18" fill="#1e293b" />
        </g>

        {/* Roda traseira */}
        <g pointerEvents="none">
          <circle cx="120" cy="168" r="30" fill="url(#radial-wheel)" />
          <circle cx="120" cy="168" r="27" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,6" opacity="0.8" />
          <circle cx="120" cy="168" r="19" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" />
          <circle cx="120" cy="168" r="13" fill="#1e293b" />
          <circle cx="120" cy="168" r="9" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,3" />
          <circle cx="120" cy="168" r="4" fill="#cbd5e1" />
        </g>
        <circle {...partProps('microbus-l-wheel-rear')} data-name="Roda Traseira Esquerda" cx="120" cy="168" r="30" />

        {/* Roda dianteira */}
        <g pointerEvents="none">
          <circle cx="470" cy="168" r="30" fill="url(#radial-wheel)" />
          <circle cx="470" cy="168" r="27" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,6" opacity="0.8" />
          <circle cx="470" cy="168" r="19" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" />
          <circle cx="470" cy="168" r="13" fill="#1e293b" />
          <circle cx="470" cy="168" r="9" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,3" />
          <circle cx="470" cy="168" r="4" fill="#cbd5e1" />
        </g>
        <circle {...partProps('microbus-l-wheel-front')} data-name="Roda Dianteira Esquerda" cx="470" cy="168" r="30" />

        {/* Carroceria / Lateral */}
        <path {...partProps('microbus-l-body')} data-name="Carroceria / Lateral"
          d="M540,44 C540,37 535,32 527,32 L48,32 C39,32 32,40 32,50 L32,162 C32,170 37,176 46,176 L90,176 Q90,140 120,140 Q150,140 150,176 L440,176 Q440,140 470,140 Q500,140 500,176 L528,176 C535,176 540,171 540,162 Z"
          fill="url(#grad-metal)" />

        {/* detalhes da carroceria */}
        <g pointerEvents="none">
          <rect x="40" y="36" width="430" height="58" rx="8" fill="#0f172a" opacity="0.9" />
          <line x1="34" y1="100" x2="538" y2="100" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="32" y="104" width="508" height="9" fill="#f97316" opacity="0.85" />
          <line x1="34" y1="132" x2="538" y2="132" stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="120" cy="123" r="2.5" fill="#f59e0b" />
          <circle cx="300" cy="123" r="2.5" fill="#f59e0b" />
          <circle cx="450" cy="123" r="2.5" fill="#f59e0b" />
          <rect x="36" y="116" width="8" height="16" rx="2" fill="#dc2626" />
          <rect x="528" y="116" width="10" height="14" rx="3" fill="#fde68a" stroke="#475569" strokeWidth="0.6" />
        </g>

        {/* Janelas dos Passageiros */}
        <g {...partProps('microbus-l-windows')} data-name="Janelas dos Passageiros">
          <path d="M58,42 L148,42 L148,86 L58,86 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />
          <path d="M210,42 L458,42 L458,86 L210,86 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />
          <g pointerEvents="none">
            <line x1="103" y1="42" x2="103" y2="86" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="258" y1="42" x2="258" y2="86" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="308" y1="42" x2="308" y2="86" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="358" y1="42" x2="358" y2="86" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="408" y1="42" x2="408" y2="86" stroke="#0f172a" strokeWidth="2.5" />
            <path d="M430,42 L458,42 L428,86 L400,86 Z" fill="#fff" opacity="0.15" />
            <path d="M300,42 L328,42 L298,86 L270,86 Z" fill="#fff" opacity="0.15" />
            <path d="M110,42 L138,42 L108,86 L80,86 Z" fill="#fff" opacity="0.15" />
          </g>
        </g>

        {/* Parabrisa Dianteiro (Lateral) */}
        <g {...partProps('microbus-l-windshield')} data-name="Parabrisa Dianteiro (Lateral)">
          <path d="M538,40 L486,40 L486,92 L524,92 C532,92 538,86 538,78 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1.2" />
          <path d="M536,42 L516,42 L528,92 L538,92 Z" fill="#fff" opacity="0.22" pointerEvents="none" />
        </g>

        {/* Porta de Passageiros */}
        <g {...partProps('microbus-l-door')} data-name="Porta de Passageiros">
          <rect x="154" y="42" width="44" height="134" rx="4" fill="url(#grad-metal)" stroke="#0f172a" strokeWidth="2" />
          <rect x="162" y="48" width="16" height="42" rx="2" fill="url(#metal-glass)" stroke="#000" strokeWidth="1" opacity="0.85" />
          <rect x="180" y="48" width="16" height="42" rx="2" fill="url(#metal-glass)" stroke="#000" strokeWidth="1" opacity="0.85" />
          <rect x="154" y="104" width="44" height="9" fill="#f97316" opacity="0.85" pointerEvents="none" />
          <line x1="176" y1="42" x2="176" y2="100" stroke="#0f172a" strokeWidth="1.5" pointerEvents="none" />
        </g>
      </g>
    </svg>
  )
}
