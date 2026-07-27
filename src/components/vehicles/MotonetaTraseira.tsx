'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { FrontalWheelGraphic } from './WheelRim'

export default function MotonetaTraseira({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)

  return (
    <svg viewBox="0 0 300 300" width="100%">
      {/* Sombra projetada do veículo */}
      <ellipse cx="150" cy="275" rx="72" ry="10" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Carroceria Traseira larga cobrindo motor/CVT (sem escapamento aparente) */}
      <path {...partProps('sco-r-rear-body')} data-name="Carroceria Traseira" d="M95,225 C88,175 100,120 150,105 C200,120 212,175 205,225 C185,235 115,235 95,225 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M150,110 L150,220" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" pointerEvents="none" />

      {/* Bagageiro / Baú traseiro sobre o assento */}
      <path {...partProps('sco-r-top-case')} data-name="Bagageiro" d="M118,72 L182,72 C190,72 194,78 194,86 L194,104 C194,112 190,116 182,116 L118,116 C110,116 106,112 106,104 L106,86 C106,78 110,72 118,72 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="140" y="90" width="20" height="6" rx="2" fill="#475569" pointerEvents="none" />

      {/* Assento visto por trás (base do banco) */}
      <path {...partProps('sco-r-seat')} data-name="Assento" d="M120,118 L180,118 L186,132 L114,132 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" pointerEvents="none" />

      {/* Lanterna Traseira em barra de LED, larga e integrada */}
      <g {...partProps('sco-r-taillight')} data-name="Lanterna Traseira">
        <path d="M108,150 L192,150 L188,172 L112,172 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M112,153 L188,153 L185,169 L115,169 Z" fill="#ef4444" opacity="0.95" pointerEvents="none" />
        <line x1="120" y1="161" x2="180" y2="161" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" pointerEvents="none" />
      </g>

      {/* Sinalizadores traseiros embutidos */}
      <g {...partProps('sco-r-turn-left')} data-name="Sinalizador Traseiro Esquerdo">
        <ellipse cx="98" cy="178" rx="8" ry="6" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" transform="rotate(-10, 98, 178)" />
      </g>
      <g {...partProps('sco-r-turn-right')} data-name="Sinalizador Traseiro Direito">
        <ellipse cx="202" cy="178" rx="8" ry="6" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" transform="rotate(10, 202, 178)" />
      </g>

      {/* Placa de Identificação do Veículo (Mercosul) */}
      <g {...partProps('sco-r-plate')} data-name="Placa">
        <rect x="123" y="188" width="54" height="34" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="124" y="189" width="52" height="7" fill="#3b82f6" pointerEvents="none" />
        <text x="150" y="215" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#020617" textAnchor="middle" letterSpacing="2" pointerEvents="none">AAA</text>
      </g>

      {/* Guarda-lama traseiro fixo próximo ao pneu */}
      <path {...partProps('sco-r-fender')} data-name="Para-lama Traseiro" d="M128,222 L172,222 L178,238 L122,238 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" pointerEvents="none" />

      {/* Pneu Traseiro (menor, característico de motoneta) — centralizado no eixo da carroceria (x=150) */}
      <FrontalWheelGraphic x={136} y={238} width={28} height={54} />
      <rect {...partProps('sco-bb-wheel')} data-name="Roda Traseira" x="136" y="238" width="28" height="54" rx="14" />
    </svg>
  )
}
