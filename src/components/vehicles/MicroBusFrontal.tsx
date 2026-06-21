'use client';
import { VehicleProps } from '../../types'

export default function MicroBusFrontal({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
      <ellipse cx="175" cy="282" rx="135" ry="10" className="shadow-ground" />
      <g pointerEvents="none">
        <rect x="60" y="248" width="24" height="32" rx="4" fill="#0f172a" />
        <rect x="266" y="248" width="24" height="32" rx="4" fill="#0f172a" />
      </g>

      <rect {...partProps('microbus-f-body')} data-name="Painel Frontal" x="55" y="24" width="240" height="246" rx="20" fill="url(#grad-metal)" />

      <g pointerEvents="none">
        <path d="M62,60 L288,60 L288,168 C288,173 284,176 278,176 L72,176 C66,176 62,173 62,168 Z" fill="#090d16" opacity="0.95" />
        <rect x="62" y="110" width="226" height="9" fill="#1e293b" />
        <rect x="55" y="182" width="240" height="10" fill="#f97316" opacity="0.85" />
      </g>

      <g {...partProps('microbus-f-itinerary')} data-name="Painel de Itinerário">
        <rect x="85" y="30" width="180" height="24" rx="4" fill="#020617" stroke="#334155" strokeWidth="1.5" />
        <text x="175" y="46" fontFamily="monospace" fontSize="11" fontWeight="900" fill="#f59e0b" textAnchor="middle" letterSpacing="2" pointerEvents="none">FRETADO</text>
      </g>

      <g {...partProps('microbus-f-windshield')} data-name="Parabrisa Dianteiro">
        <path d="M68,64 L282,64 L282,150 L68,150 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />
        <g pointerEvents="none">
          <line x1="175" y1="64" x2="175" y2="150" stroke="#0f172a" strokeWidth="2.5" />
          <path d="M86,64 L120,64 L96,150 L62,150 Z" fill="#fff" opacity="0.18" />
          <path d="M210,64 L244,64 L220,150 L186,150 Z" fill="#fff" opacity="0.15" />
        </g>
      </g>

      <g pointerEvents="none">
        <rect x="120" y="210" width="110" height="28" rx="3" fill="#121824" stroke="#334155" strokeWidth="1.2" />
        <line x1="120" y1="217" x2="230" y2="217" stroke="#1e293b" strokeWidth="2" />
        <line x1="120" y1="224" x2="230" y2="224" stroke="#1e293b" strokeWidth="2" />
        <line x1="120" y1="231" x2="230" y2="231" stroke="#1e293b" strokeWidth="2" />
      </g>

      <g {...partProps('microbus-f-light-left')} data-name="Farol Dianteiro Esquerdo">
        <rect x="64" y="208" width="42" height="22" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <circle cx="76" cy="219" r="5" fill="#fef08a" opacity="0.9" pointerEvents="none" />
        <circle cx="92" cy="219" r="4" fill="#fde68a" opacity="0.85" pointerEvents="none" />
      </g>
      <g {...partProps('microbus-f-light-right')} data-name="Farol Dianteiro Direito">
        <rect x="244" y="208" width="42" height="22" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <circle cx="274" cy="219" r="5" fill="#fef08a" opacity="0.9" pointerEvents="none" />
        <circle cx="258" cy="219" r="4" fill="#fde68a" opacity="0.85" pointerEvents="none" />
      </g>

      <g {...partProps('microbus-f-bumper')} data-name="Para-choque Dianteiro">
        <path d="M55,242 L295,242 C295,242 295,268 286,270 L64,270 C55,268 55,242 55,242 Z" fill="#1e293b" stroke="#090d16" strokeWidth="1.8" />
        <rect x="66" y="248" width="14" height="8" rx="2" fill="#fef08a" stroke="#eab308" strokeWidth="1" pointerEvents="none" />
        <rect x="270" y="248" width="14" height="8" rx="2" fill="#fef08a" stroke="#eab308" strokeWidth="1" pointerEvents="none" />
        <g pointerEvents="none">
          <rect x="148" y="248" width="54" height="14" rx="1.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
          <rect x="149" y="249" width="52" height="3" fill="#3b82f6" />
          <text x="175" y="259" fontFamily="monospace" fontSize="8.5" fontWeight="900" fill="#000" textAnchor="middle" letterSpacing="1">AAA0A00</text>
        </g>
      </g>

      <g {...partProps('microbus-f-mirror-left')} data-name="Retrovisor Esquerdo">
        <path d="M70,28 Q34,12 38,58" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="38" cy="60" rx="8" ry="15" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <ellipse cx="38" cy="60" rx="5" ry="12" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
      </g>
      <g {...partProps('microbus-f-mirror-right')} data-name="Retrovisor Direito">
        <path d="M280,28 Q316,12 312,58" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="312" cy="60" rx="8" ry="15" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <ellipse cx="312" cy="60" rx="5" ry="12" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
      </g>
    </svg>
  )
}
