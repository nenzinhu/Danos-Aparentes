import { VehicleProps } from '../../types'

export default function VanLateralRight({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
      <ellipse cx="260" cy="188" rx="220" ry="11" className="shadow-ground" />
      <g pointerEvents="none">
        <rect x="390" y="145" width="20" height="15" fill="#1e293b" />
        <rect x="110" y="145" width="20" height="15" fill="#1e293b" />
      </g>
      <g pointerEvents="none">
        <circle cx="400" cy="155" r="32" fill="url(#radial-wheel)" />
        <circle cx="400" cy="155" r="29" fill="none" stroke="#000" strokeWidth="2.2" strokeDasharray="5,5" opacity="0.8" />
        <circle cx="400" cy="155" r="21" fill="url(#radial-calota)" stroke="#475569" strokeWidth="0.8" />
        <path d="M400,155 L400,134 M400,155 L421,155 M400,155 L400,176 M400,155 L379,155 M400,155 L415,140 M400,155 L385,170 M400,155 L415,170 M400,155 L385,140" stroke="#cbd5e1" strokeWidth="1.8" />
        <circle cx="400" cy="155" r="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        <circle cx="400" cy="155" r="3" fill="#cbd5e1" />
        <circle cx="120" cy="155" r="32" fill="url(#radial-wheel)" />
        <circle cx="120" cy="155" r="29" fill="none" stroke="#000" strokeWidth="2.2" strokeDasharray="5,5" opacity="0.8" />
        <circle cx="120" cy="155" r="21" fill="url(#radial-calota)" stroke="#475569" strokeWidth="0.8" />
        <path d="M120,155 L120,134 M120,155 L141,155 M120,155 L120,176 M120,155 L99,155 M120,155 L135,140 M120,155 L105,170 M120,155 L135,170 M120,155 L105,140" stroke="#cbd5e1" strokeWidth="1.8" />
        <circle cx="120" cy="155" r="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        <circle cx="120" cy="155" r="3" fill="#cbd5e1" />
      </g>
      <circle {...partProps('van-rr-wheel-front')} data-name="Roda Dianteira Direita" cx="400" cy="155" r="32" />
      <circle {...partProps('van-rr-wheel-rear')} data-name="Roda Traseira Direita" cx="120" cy="155" r="32" />
      <path {...partProps('van-lr-roof')} data-name="Teto da Van" d="M295,50 L55,50 C52,50 48,52 48,56 L48,62 L295,62 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('van-lr-sill')} data-name="Soleira da Van" d="M368,160 L102,160 L102,168 L368,168 Z" fill="#1e293b" />
      <path {...partProps('van-lr-fender-front')} data-name="Para-lama Dianteiro" d="M475,120 L360,120 L360,82 L450,82 C465,82 475,95 475,120 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('van-lr-fender-rear')} data-name="Para-lama Traseiro" d="M102,82 L45,82 C40,82 35,92 38,120 L102,120 Z" fill="url(#metal-car-blue)" />
      <g {...partProps('van-lr-door-front')} data-name="Porta Dianteira Direita">
        <path d="M360,82 L265,82 L265,160 L360,160 Z" fill="url(#metal-car-blue)" stroke="#090d16" strokeWidth="1.5" />
        <rect x="270" y="112" width="12" height="5" rx="1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" pointerEvents="none" />
        <rect x="350" y="98" width="6" height="3" rx="0.5" fill="#f97316" pointerEvents="none" />
      </g>
      <g {...partProps('van-lr-panel-side')} data-name="Painel Lateral / Porta Corrediça">
        <path d="M265,82 L102,82 L102,160 L265,160 Z" fill="url(#metal-car-blue)" stroke="#090d16" strokeWidth="1.5" />
        <line x1="265" y1="120" x2="102" y2="120" stroke="#0f172a" strokeWidth="1.8" pointerEvents="none" opacity="0.6" />
        <rect x="251" y="110" width="5" height="15" rx="1.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" pointerEvents="none" />
      </g>
      <g {...partProps('van-lr-glass-front')} data-name="Vidro Dianteiro">
        <path d="M355,82 L355,65 Q355,62 350,62 L300,62 L270,82 Z" fill="url(#metal-glass)" opacity="0.8" stroke="#090d16" strokeWidth="1.2" />
        <line x1="335" y1="62" x2="335" y2="82" stroke="#000" strokeWidth="2.5" pointerEvents="none" />
        <path d="M350,62 L330,62 L325,82 L345,82 Z" fill="#fff" opacity="0.25" pointerEvents="none" />
      </g>
      <g {...partProps('van-lr-glass-side')} data-name="Vidro Lateral do Salão">
        <path d="M262,82 L262,62 L105,62 L105,82 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#090d16" strokeWidth="1.2" />
        <line x1="185" y1="62" x2="185" y2="82" stroke="#0f172a" strokeWidth="3" pointerEvents="none" />
        <path d="M240,62 L210,62 L220,82 L250,82 Z" fill="#fff" opacity="0.18" pointerEvents="none" />
        <path d="M165,62 L135,62 L145,82 L175,82 Z" fill="#fff" opacity="0.18" pointerEvents="none" />
      </g>
      <g {...partProps('van-lr-mirror')} data-name="Retrovisor Direito">
        <path d="M360,86 L372,88 L372,82 Z" fill="#0f172a" />
        <rect x="370" y="72" width="8" height="18" rx="2.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <rect x="372" y="73" width="5" height="16" rx="1.5" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
      </g>
      <g pointerEvents="none">
        <line x1="265" y1="84" x2="75" y2="84" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="265" y1="84" x2="75" y2="84" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.4" />
      </g>
    </svg>
  )
}
