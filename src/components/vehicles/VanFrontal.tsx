'use client';
import { VehicleProps } from '../../types'

export default function VanFrontal({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
    <svg viewBox="0 0 400 300" width="100%">
      <ellipse cx="200" cy="275" rx="155" ry="10" className="shadow-ground" />
      <g pointerEvents="none">
        <rect x="62" y="220" width="28" height="45" rx="4" fill="#0f172a" />
        <rect x="310" y="220" width="28" height="45" rx="4" fill="#0f172a" />
      </g>
      <g {...partProps('van-f-windshield')} data-name="Parabrisa">
        <path d="M85,60 L315,60 L290,132 L110,132 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1.8" />
        <line x1="170" y1="132" x2="135" y2="105" stroke="#090d16" strokeWidth="2.2" pointerEvents="none" />
        <line x1="230" y1="132" x2="195" y2="105" stroke="#090d16" strokeWidth="2.2" pointerEvents="none" />
        <path d="M120,60 L160,60 L140,132 L100,132 Z" fill="#fff" opacity="0.2" pointerEvents="none" />
        <path d="M240,60 L280,60 L260,132 L220,132 Z" fill="#fff" opacity="0.2" pointerEvents="none" />
      </g>
      <g {...partProps('van-f-hood')} data-name="Grade Capô">
        <path d="M75,132 L325,132 C335,132 342,142 342,152 L345,190 L55,190 L58,152 C58,142 65,132 75,132 Z" fill="url(#metal-car-blue)" stroke="#090d16" strokeWidth="1" />
        <path d="M120,132 L130,175 M280,132 L270,175" stroke="#0f172a" strokeWidth="1.5" opacity="0.4" pointerEvents="none" />
        <path d="M175,132 L172,185 M225,132 L228,185" stroke="#0f172a" strokeWidth="1.5" opacity="0.4" pointerEvents="none" />
      </g>
      <g {...partProps('van-f-grille')} data-name="Grade Dianteira">
        <rect x="105" y="195" width="190" height="38" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="115" y1="202" x2="285" y2="202" stroke="#64748b" strokeWidth="2.2" pointerEvents="none" />
        <line x1="115" y1="210" x2="285" y2="210" stroke="#64748b" strokeWidth="2.2" pointerEvents="none" />
        <line x1="115" y1="218" x2="285" y2="218" stroke="#64748b" strokeWidth="2.2" pointerEvents="none" />
        <circle cx="200" cy="210" r="9" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" pointerEvents="none" />
        <circle cx="200" cy="210" r="6" fill="#0f172a" pointerEvents="none" />
      </g>
      <g {...partProps('van-f-light-left')} data-name="Farol Esquerdo">
        <path d="M50,188 L100,195 L98,218 L50,210 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <path d="M55,193 L95,198 L93,212 L55,206 Z" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.9" pointerEvents="none" />
        <circle cx="70" cy="201" r="4.5" fill="#fef08a" opacity="0.95" pointerEvents="none" />
        <circle cx="85" cy="203" r="4" fill="#cbd5e1" opacity="0.9" pointerEvents="none" />
      </g>
      <g {...partProps('van-f-light-right')} data-name="Farol Direito">
        <path d="M350,188 L300,195 L302,218 L350,210 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <path d="M345,193 L305,198 L307,212 L345,206 Z" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.9" pointerEvents="none" />
        <circle cx="330" cy="201" r="4.5" fill="#fef08a" opacity="0.95" pointerEvents="none" />
        <circle cx="315" cy="203" r="4" fill="#cbd5e1" opacity="0.9" pointerEvents="none" />
      </g>
      <g {...partProps('van-f-bumper')} data-name="Para-choque Dianteiro">
        <path d="M40,230 L360,230 C360,230 355,268 340,268 L60,268 C45,268 40,230 40,230 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
        <circle cx="70" cy="248" r="5" fill="#fef08a" opacity="0.9" stroke="#eab308" strokeWidth="0.8" pointerEvents="none" />
        <circle cx="330" cy="248" r="5" fill="#fef08a" opacity="0.9" stroke="#eab308" strokeWidth="0.8" pointerEvents="none" />
        <g pointerEvents="none">
          <rect x="170" y="240" width="60" height="15" rx="1.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
          <rect x="171" y="241" width="58" height="3" fill="#3b82f6" />
          <text x="200" y="251" fontFamily="monospace" fontSize="9" fontWeight="900" fill="#000" textAnchor="middle" letterSpacing="1.2">AAA0A00</text>
        </g>
      </g>
    </svg>
  )
}
