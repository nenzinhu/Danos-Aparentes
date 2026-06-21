'use client';
import { VehicleProps } from '../../types'

export default function VanLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
      {/* sombra no chão */}
      <ellipse cx="260" cy="192" rx="225" ry="11" className="shadow-ground" />

      {/* lateral esquerda = espelho da direita */}
      <g transform="matrix(-1 0 0 1 520 0)">
        {/* poços escuros das rodas (atrás de tudo) */}
        <g pointerEvents="none">
          <path d="M81,158 A39,39 0 0,1 159,158 Z" fill="#0b1120" />
          <path d="M361,158 A39,39 0 0,1 439,158 Z" fill="#0b1120" />
        </g>

        {/* Teto alto */}
        <path {...partProps('van-ll-roof')} data-name="Teto da Van"
          d="M40,64 L40,54 Q40,46 50,46 L384,46 Q393,46 396,55 L388,64 Z"
          fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="0.6" />

        {/* Painel lateral de carga (sólido, com vincos em relevo) */}
        <g {...partProps('van-ll-panel-side')} data-name="Painel Lateral de Carga">
          <path d="M40,64 L330,64 L330,158 L159,158 A39,39 0 0,0 81,158 L40,158 Z"
            fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1.4" />
          <g pointerEvents="none">
            <line x1="46" y1="126" x2="324" y2="126" stroke="#1e293b" strokeWidth="2" opacity="0.45" />
            <line x1="46" y1="124" x2="324" y2="124" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.35" />
            <g fill="none">
              <rect x="54" y="72" width="108" height="42" rx="7" stroke="#1e293b" strokeWidth="1.6" opacity="0.5" />
              <rect x="56" y="74" width="104" height="38" rx="6" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.35" />
              <rect x="176" y="72" width="142" height="42" rx="7" stroke="#1e293b" strokeWidth="1.6" opacity="0.5" />
              <rect x="178" y="74" width="138" height="38" rx="6" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.35" />
            </g>
          </g>
        </g>

        {/* Para-lama / arco traseiro */}
        <path {...partProps('van-ll-fender-rear')} data-name="Para-lama Traseiro"
          d="M81,158 A39,39 0 0,1 159,158 L152,158 A32,32 0 0,0 88,158 Z"
          fill="#1e293b" stroke="#1e293b" strokeWidth="1" />

        {/* Porta da cabine */}
        <g {...partProps('van-ll-door-front')} data-name="Porta Dianteira Esquerda">
          <path d="M330,92 L400,92 L400,119 A39,39 0 0,0 361,158 L330,158 Z"
            fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1.4" />
          <rect x="340" y="110" width="15" height="5" rx="1.5" fill="#0b1120" stroke="#cbd5e1" strokeWidth="0.5" pointerEvents="none" />
        </g>

        {/* Capô / focinho dianteiro */}
        <path {...partProps('van-ll-fender-front')} data-name="Para-lama Dianteiro"
          d="M400,92 L470,92 L484,93 Q498,96 498,116 L498,140 Q498,156 484,157 L439,157 A39,39 0 0,0 400,119 Z"
          fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1.2" />

        {/* Soleira */}
        <path {...partProps('van-ll-sill')} data-name="Soleira da Van"
          d="M160,158 L360,158 L360,166 L160,166 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="0.6" />

        {/* arco dianteiro (moldura preta) */}
        <path d="M361,158 A39,39 0 0,1 439,158 L432,158 A32,32 0 0,0 368,158 Z" fill="#1e293b" pointerEvents="none" />

        {/* Rodas */}
        <g pointerEvents="none">
          <circle cx="400" cy="158" r="32" fill="url(#radial-wheel)" />
          <circle cx="400" cy="158" r="29" fill="none" stroke="#000" strokeWidth="2.2" strokeDasharray="5,5" opacity="0.8" />
          <circle cx="400" cy="158" r="21" fill="url(#radial-calota)" stroke="#475569" strokeWidth="0.8" />
          <path d="M400,158 L400,137 M400,158 L421,158 M400,158 L400,179 M400,158 L379,158 M400,158 L415,143 M400,158 L385,173 M400,158 L415,173 M400,158 L385,143" stroke="#cbd5e1" strokeWidth="1.8" />
          <circle cx="400" cy="158" r="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          <circle cx="400" cy="158" r="3" fill="#cbd5e1" />
          <circle cx="120" cy="158" r="32" fill="url(#radial-wheel)" />
          <circle cx="120" cy="158" r="29" fill="none" stroke="#000" strokeWidth="2.2" strokeDasharray="5,5" opacity="0.8" />
          <circle cx="120" cy="158" r="21" fill="url(#radial-calota)" stroke="#475569" strokeWidth="0.8" />
          <path d="M120,158 L120,137 M120,158 L141,158 M120,158 L120,179 M120,158 L99,158 M120,158 L135,143 M120,158 L105,173 M120,158 L135,173 M120,158 L105,143" stroke="#cbd5e1" strokeWidth="1.8" />
          <circle cx="120" cy="158" r="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          <circle cx="120" cy="158" r="3" fill="#cbd5e1" />
        </g>
        <circle {...partProps('van-ll-wheel-front')} data-name="Roda Dianteira Esquerda" cx="400" cy="158" r="32" />
        <circle {...partProps('van-ll-wheel-rear')} data-name="Roda Traseira Esquerda" cx="120" cy="158" r="32" />

        {/* Vidro da porta (cabine) */}
        <g {...partProps('van-ll-glass-side')} data-name="Vidro da Porta">
          <path d="M334,90 L334,66 Q334,62 339,62 L390,62 L392,90 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1.2" />
          <path d="M380,64 L360,64 L356,82 L376,82 Z" fill="#fff" opacity="0.2" pointerEvents="none" />
        </g>

        {/* Para-brisa */}
        <g {...partProps('van-ll-glass-front')} data-name="Vidro Dianteiro">
          <path d="M404,90 L402,64 Q402,62 407,62 L442,62 Q452,62 458,70 L470,90 Z" fill="url(#metal-glass)" opacity="0.8" stroke="#1e293b" strokeWidth="1.2" />
          <path d="M440,66 L418,66 L424,86 L448,86 Z" fill="#fff" opacity="0.22" pointerEvents="none" />
        </g>

        {/* coluna A */}
        <line x1="397" y1="62" x2="400" y2="90" stroke="#1e293b" strokeWidth="3.5" pointerEvents="none" />

        {/* Retrovisor */}
        <g {...partProps('van-ll-mirror')} data-name="Retrovisor Esquerdo">
          <path d="M400,86 L412,88 L412,82 Z" fill="#0f172a" />
          <rect x="410" y="70" width="9" height="18" rx="2.5" fill="#1e293b" stroke="#1e293b" strokeWidth="1" />
          <rect x="411.5" y="71.5" width="6" height="15" rx="1.5" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
        </g>

        {/* detalhes: lanterna, farol, pisca, linha de caráter */}
        <g pointerEvents="none">
          <rect x="41" y="106" width="6" height="34" rx="2" fill="#dc2626" stroke="#1e293b" strokeWidth="0.6" />
          <rect x="42" y="108" width="3" height="14" rx="1" fill="#fca5a5" opacity="0.7" />
          <path d="M498,116 L488,116 Q484,116 484,122 L484,132 Q484,136 490,136 L498,134 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="0.6" opacity="0.9" />
          <rect x="486" y="138" width="10" height="5" rx="1.5" fill="#f97316" />
          <line x1="44" y1="100" x2="356" y2="100" stroke="#fff" strokeWidth="0.8" opacity="0.18" />
        </g>
      </g>
    </svg>
  )
}
