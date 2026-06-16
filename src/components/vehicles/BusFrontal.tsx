import { VehicleProps } from '../../types'

export default function BusFrontal({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
    <svg viewBox="0 0 350 300" width="100%">
      <ellipse cx="175" cy="282" rx="145" ry="10" className="shadow-ground" />
      <g pointerEvents="none">
        <rect x="48" y="245" width="26" height="35" rx="4" fill="#0f172a" />
        <rect x="276" y="245" width="26" height="35" rx="4" fill="#0f172a" />
      </g>
      <rect {...partProps('bus-f-body')} data-name="Painel Frontal" x="40" y="20" width="270" height="250" rx="22" fill="url(#grad-metal)" />
      <g pointerEvents="none">
        <path d="M48,58 L302,58 L302,175 C302,175 302,180 295,180 L55,180 C48,180 48,175 48,175 Z" fill="#090d16" opacity="0.95" />
        <rect x="48" y="112" width="254" height="10" fill="#1e293b" stroke="#000" strokeWidth="0.5" />
      </g>
      <g {...partProps('bus-f-itinerary')} data-name="Painel de Itinerário">
        <rect x="75" y="28" width="200" height="26" rx="4" fill="#020617" stroke="#334155" strokeWidth="1.5" />
        <text x="175" y="45" fontFamily="monospace" fontSize="11" fontWeight="900" fill="#f59e0b" textAnchor="middle" letterSpacing="3" filter="drop-shadow(0 0 2px #f59e0b)" pointerEvents="none">ESPECIAL</text>
      </g>
      <g {...partProps('bus-f-windshield')} data-name="Parabrisa Dianteiro Panorâmico">
        <path d="M52,62 L298,62 L298,108 L52,108 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />
        <path d="M52,126 L298,126 L292,176 L58,176 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />
        <g pointerEvents="none">
          <line x1="175" y1="108" x2="145" y2="82" stroke="#090d16" strokeWidth="2" />
          <line x1="175" y1="108" x2="205" y2="82" stroke="#090d16" strokeWidth="2" />
          <line x1="110" y1="176" x2="80" y2="145" stroke="#090d16" strokeWidth="2" />
          <line x1="240" y1="176" x2="210" y2="145" stroke="#090d16" strokeWidth="2" />
          <path d="M70,62 L100,62 L80,108 L50,108 Z" fill="#ffffff" opacity="0.2" />
          <path d="M220,62 L250,62 L230,108 L200,108 Z" fill="#ffffff" opacity="0.2" />
          <path d="M80,126 L120,126 L100,176 L60,176 Z" fill="#ffffff" opacity="0.2" />
          <path d="M220,126 L260,126 L240,176 L200,176 Z" fill="#ffffff" opacity="0.2" />
        </g>
      </g>
      <g pointerEvents="none">
        <rect x="110" y="210" width="130" height="30" rx="3" fill="#121824" stroke="#334155" strokeWidth="1.2" />
        <line x1="110" y1="216" x2="240" y2="216" stroke="#1e293b" strokeWidth="2" />
        <line x1="110" y1="222" x2="240" y2="222" stroke="#1e293b" strokeWidth="2" />
        <line x1="110" y1="228" x2="240" y2="228" stroke="#1e293b" strokeWidth="2" />
        <circle cx="175" cy="225" r="9" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" />
        <path d="M171,225 L179,225 M175,221 L175,229" stroke="#1e293b" strokeWidth="1" />
      </g>
      <g {...partProps('bus-f-light-left')} data-name="Farol Dianteiro Esquerdo">
        <rect x="52" y="210" width="46" height="22" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <circle cx="62" cy="221" r="5" fill="#fef08a" opacity="0.9" pointerEvents="none" />
        <circle cx="75" cy="221" r="5" fill="#fef08a" opacity="0.9" pointerEvents="none" />
        <path d="M85,213 L87,221 L94,221" fill="none" stroke="#eab308" strokeWidth="2" strokeLinejoin="round" pointerEvents="none" />
      </g>
      <g {...partProps('bus-f-light-right')} data-name="Farol Dianteiro Direito">
        <rect x="252" y="210" width="46" height="22" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <circle cx="288" cy="221" r="5" fill="#fef08a" opacity="0.9" pointerEvents="none" />
        <circle cx="275" cy="221" r="5" fill="#fef08a" opacity="0.9" pointerEvents="none" />
        <path d="M265,213 L263,221 L256,221" fill="none" stroke="#eab308" strokeWidth="2" strokeLinejoin="round" pointerEvents="none" />
      </g>
      <g {...partProps('bus-f-bumper')} data-name="Para-choque Dianteiro">
        <path d="M40,240 L310,240 C310,240 310,268 300,270 L50,270 C40,268 40,240 40,240 Z" fill="#1e293b" stroke="#090d16" strokeWidth="1.8" />
        <rect x="52" y="246" width="16" height="8" rx="2" fill="#fef08a" opacity="0.95" stroke="#eab308" strokeWidth="1" pointerEvents="none" />
        <rect x="282" y="246" width="16" height="8" rx="2" fill="#fef08a" opacity="0.95" stroke="#eab308" strokeWidth="1" pointerEvents="none" />
        <g pointerEvents="none">
          <rect x="145" y="246" width="60" height="15" rx="1.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
          <rect x="146" y="247" width="58" height="3" fill="#3b82f6" />
          <text x="175" y="257" fontFamily="monospace" fontSize="9" fontWeight="900" fill="#000" textAnchor="middle" letterSpacing="1.2">AAA0A00</text>
        </g>
      </g>
      <g {...partProps('bus-f-mirror-left')} data-name="Retrovisor Esquerdo">
        <path d="M68,24 Q22,6 26,60" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="26" cy="62" rx="9" ry="16" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <ellipse cx="26" cy="62" rx="6" ry="13" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
      </g>
      <g {...partProps('bus-f-mirror-right')} data-name="Retrovisor Direito">
        <path d="M282,24 Q328,6 324,60" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="324" cy="62" rx="9" ry="16" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <ellipse cx="324" cy="62" rx="6" ry="13" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
      </g>
    </svg>
  )
}
