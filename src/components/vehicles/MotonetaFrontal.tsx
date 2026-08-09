'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { FrontalWheelGraphic } from './WheelRim'

export default function MotonetaFrontal({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)

  return (
    <svg viewBox="0 0 300 300" width="100%">
      {/* Sombra projetada do veículo */}
      <ellipse cx="150" cy="275" rx="72" ry="10" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Escudo Frontal (perna-de-força) — carroceria larga e lisa, sem tanque/motor à vista */}
      <path {...partProps('sco-f-front-shield')} data-name="Escudo Frontal" d="M95,225 C88,170 100,110 150,95 C200,110 212,170 205,225 C185,235 115,235 95,225 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      {/* Linha de estilo central */}
      <path d="M150,100 L150,220" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" pointerEvents="none" />

      {/* Guidão embutido com manoplas e manetes */}
      <g {...partProps('sco-f-handlebars')} data-name="Guidão">
        <path d="M85,68 Q150,88 215,68" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <rect x="82" y="61" width="20" height="8" rx="2" fill="#0f172a" transform="rotate(-8, 92, 65)" pointerEvents="none" />
        <rect x="198" y="61" width="20" height="8" rx="2" fill="#0f172a" transform="rotate(8, 208, 65)" pointerEvents="none" />
        <path d="M92,71 L74,64" stroke="#cbd5e1" strokeWidth="2.5" pointerEvents="none" />
        <path d="M208,71 L226,64" stroke="#cbd5e1" strokeWidth="2.5" pointerEvents="none" />
      </g>

      {/* Painel digital central simples */}
      <rect x="136" y="72" width="28" height="14" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <rect x="139" y="74" width="22" height="10" fill="url(#metal-glass)" opacity="0.8" pointerEvents="none" />

      {/* Retrovisores */}
      <g pointerEvents="none">
        <path d="M100,70 Q88,52 90,44" fill="none" stroke="#475569" strokeWidth="2" />
        <ellipse cx="90" cy="44" rx="11" ry="6" fill="#1e293b" stroke="#475569" strokeWidth="1.5" transform="rotate(-18, 90, 44)" />
        <ellipse cx="89" cy="44" rx="9" ry="4" fill="url(#metal-glass)" opacity="0.6" transform="rotate(-18, 90, 44)" />
        <path d="M200,70 Q212,52 210,44" fill="none" stroke="#475569" strokeWidth="2" />
        <ellipse cx="210" cy="44" rx="11" ry="6" fill="#1e293b" stroke="#475569" strokeWidth="1.5" transform="rotate(18, 210, 44)" />
        <ellipse cx="211" cy="44" rx="9" ry="4" fill="url(#metal-glass)" opacity="0.6" transform="rotate(18, 210, 44)" />
      </g>

      {/* Farol Dianteiro único e integrado ao escudo */}
      <g {...partProps('sco-f-headlight')} data-name="Farol Dianteiro">
        <ellipse cx="150" cy="120" rx="30" ry="24" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <ellipse cx="150" cy="120" rx="25" ry="19" fill="url(#metal-glass)" opacity="0.9" />
        <circle cx="150" cy="120" r="11" fill="#fef08a" opacity="0.85" />
        <circle cx="150" cy="120" r="4" fill="#fff" />
      </g>

      {/* Sinalizadores dianteiros embutidos na carroceria (sem hastes salientes) */}
      <g {...partProps('sco-f-turn-left')} data-name="Sinalizador Dianteiro Esquerdo">
        <ellipse cx="107" cy="150" rx="9" ry="7" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" transform="rotate(-15, 107, 150)" />
      </g>
      <g {...partProps('sco-f-turn-right')} data-name="Sinalizador Dianteiro Direito">
        <ellipse cx="193" cy="150" rx="9" ry="7" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" transform="rotate(15, 193, 150)" />
      </g>

      {/* Para-lama Dianteiro */}
      <path {...partProps('sco-f-front-fender')} data-name="Para-lama Dianteiro" d="M118,205 C118,190 182,190 182,205 L188,220 C188,220 170,225 150,225 C130,225 112,220 112,220 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1" />

      {/* Pneu Dianteiro (menor, característico de motoneta) — centralizado no eixo do escudo (x=150) */}
      <FrontalWheelGraphic x={137} y={215} width={26} height={56} />
      <rect {...partProps('sco-ff-wheel')} data-name="Roda Dianteira" x="137" y="215" width="26" height="56" rx="13" />
    </svg>
  )
}
