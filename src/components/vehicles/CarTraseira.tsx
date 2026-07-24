'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { FrontalWheelGraphic } from './WheelRim'

export default function CarTraseira({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)


  return (
    <svg viewBox="0 0 400 300" width="100%">
      {/* Sombra projetada */}
      <ellipse cx="200" cy="275" rx="160" ry="12" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Pneus visíveis traseiros */}
      <FrontalWheelGraphic x={42} y={210} width={26} height={60} />
      <FrontalWheelGraphic x={332} y={210} width={26} height={60} />

      {/* Teto e Colunas Traseiras */}
      <path d="M120,60 L280,60 C280,60 260,30 200,30 C140,30 120,60 120,60 Z" fill="url(#metal-car-blue)" stroke="#1e293b" />

      {/* Vidro Traseiro com desembaçador visível e brake light */}
      <path {...partProps('car-r-window')} data-name="Vidro Traseiro" d="M116,62 L284,62 L266,128 L134,128 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1.5" />
      {/* Desembaçador (Linhas horizontais finas) */}
      <g stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.5" pointerEvents="none">
        <line x1="125" y1="80" x2="275" y2="80" />
        <line x1="129" y1="95" x2="271" y2="95" />
        <line x1="133" y1="110" x2="267" y2="110" />
      </g>
      {/* Brake Light (LED vermelho superior) */}
      <rect x="180" y="64" width="40" height="3" fill="#ef4444" opacity="0.9" pointerEvents="none" rx="1" />

      {/* Tampa do Porta-malas (Trunk) com Aerofólio integrado */}
      <path {...partProps('car-r-trunk')} data-name="Tampa do Porta-malas" d="M102,128 L298,128 L324,208 C324,208 260,215 200,215 C140,215 76,208 76,208 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      {/* Linha de aerofólio integrado */}
      <path d="M102,130 C150,126 250,126 298,130" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" pointerEvents="none" />

      {/* Lanternas Traseiras de LED Modernas com Barra Traseira Contínua */}
      <g pointerEvents="none">
        <rect x="74" y="165" width="252" height="10" rx="3" fill="#dc2626" opacity="0.4" />
        <line x1="74" y1="170" x2="326" y2="170" stroke="#f87171" strokeWidth="3" />
      </g>
      {/* Lanterna Traseira Esquerda */}
      <g {...partProps('car-r-light-left')} data-name="Lanterna Traseira Esquerda">
        <path d="M74,160 L134,160 L130,178 L74,175 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M76,162 L132,162 L128,175 L76,173 Z" fill="#ef4444" opacity="0.95" pointerEvents="none" />
        <rect x="78" y="165" width="15" height="4" fill="#fff" opacity="0.9" pointerEvents="none" />
        <rect x="98" y="165" width="15" height="4" fill="#f59e0b" opacity="0.9" pointerEvents="none" />
      </g>
      {/* Lanterna Traseira Direita */}
      <g {...partProps('car-r-light-right')} data-name="Lanterna Traseira Direita">
        <path d="M326,160 L266,160 L270,178 L326,175 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M324,162 L268,162 L272,175 L324,173 Z" fill="#ef4444" opacity="0.95" pointerEvents="none" />
        <rect x="307" y="165" width="15" height="4" fill="#fff" opacity="0.9" pointerEvents="none" />
        <rect x="287" y="165" width="15" height="4" fill="#f59e0b" opacity="0.9" pointerEvents="none" />
      </g>

      {/* Placa do Veículo Mercosul detalhada */}
      <g pointerEvents="none">
        <rect x="165" y="180" width="70" height="22" rx="2" fill="#fff" stroke="#475569" strokeWidth="1" />
        <rect x="165" y="180" width="70" height="5" fill="#3b82f6" />
        <text x="200" y="196" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#000" textAnchor="middle">BRA3R12</text>
      </g>

      {/* Para-choque Traseiro Esportivo com Escapamento Cromado Duplo */}
      <path {...partProps('car-r-bumper')} data-name="Para-choque Traseiro" d="M68,188 C80,192 120,204 126,206 L274,206 C280,204 320,192 332,188 L348,228 C340,252 310,268 200,268 C90,268 60,252 52,228 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />

      {/* Difusor Traseiro Preto */}
      <path d="M120,246 C150,252 250,252 280,246 L274,264 C250,268 150,268 126,264 Z" fill="#090d16" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" pointerEvents="none" />
      {/* Sensores de Ré */}
      <circle cx="100" cy="225" r="2.5" fill="#000" pointerEvents="none" />
      <circle cx="160" cy="227" r="2.5" fill="#000" pointerEvents="none" />
      <circle cx="240" cy="227" r="2.5" fill="#000" pointerEvents="none" />
      <circle cx="300" cy="225" r="2.5" fill="#000" pointerEvents="none" />

      {/* Escapamento Duplo Cromado */}
      <rect x="88" y="244" width="22" height="10" rx="2" fill="#cbd5e1" stroke="#000" strokeWidth="1" pointerEvents="none" />
      <ellipse cx="99" cy="249" rx="8" ry="3" fill="#000" pointerEvents="none" />
      <rect x="290" y="244" width="22" height="10" rx="2" fill="#cbd5e1" stroke="#000" strokeWidth="1" pointerEvents="none" />
      <ellipse cx="301" cy="249" rx="8" ry="3" fill="#000" pointerEvents="none" />
    </svg>
  )
}
