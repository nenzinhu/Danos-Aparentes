'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'

export default function MotoLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)


  return (
    <svg viewBox="0 0 500 250" width="100%">
      {/* Sombra projetada do veículo */}
      <ellipse cx="250" cy="215" rx="180" ry="12" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Roda Traseira Detalhada */}
      <g pointerEvents="none">
        {/* Pneu Largo */}
        <circle cx="100" cy="160" r="46" fill="url(#radial-wheel)" />
        <circle cx="100" cy="160" r="41" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        {/* Ranhuras do Pneu */}
        <circle cx="100" cy="160" r="43" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,8" opacity="0.85" />
        {/* Coroa de transmissão metálica */}
        <circle cx="100" cy="160" r="28" fill="#475569" stroke="#334155" strokeWidth="1" />
        {/* Detalhes da coroa (dentes e furos) */}
        <circle cx="100" cy="160" r="25" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="3,3" />
        <circle cx="100" cy="160" r="20" fill="#94a3b8" />
        {/* Eixo central */}
        <circle cx="100" cy="160" r="10" fill="#64748b" />
        <circle cx="100" cy="160" r="4" fill="#cbd5e1" />
      </g>
      <circle {...partProps('moto-ll-wheel-rear')} data-name="Roda Traseira" cx="100" cy="160" r="46" />

      {/* Suspensão Traseira e Balança */}
      <g pointerEvents="none">
        <path d="M100,160 L220,150 L200,115 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        {/* Amortecedor traseiro monochoque (Mola amarela) */}
        <rect x="180" y="100" width="12" height="40" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" transform="rotate(-30, 180, 100)" />
        <path d="M175,105 L195,115" stroke="#1e293b" strokeWidth="2" />
        <path d="M178,110 L198,120" stroke="#1e293b" strokeWidth="2" />
        <path d="M181,115 L201,125" stroke="#1e293b" strokeWidth="2" />
      </g>

      {/* Roda Dianteira Detalhada */}
      <g pointerEvents="none">
        {/* Pneu */}
        <circle cx="400" cy="160" r="46" fill="url(#radial-wheel)" />
        <circle cx="400" cy="160" r="41" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        {/* Ranhuras do Pneu */}
        <circle cx="400" cy="160" r="43" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,8" opacity="0.85" />
        {/* Disco de freio ventilado */}
        <circle cx="400" cy="160" r="30" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        <circle cx="400" cy="160" r="26" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,4" />
        {/* Pinça de freio esportiva vermelha */}
        <path d="M418,140 A30,30 0 0,0 426,155 L432,152 A36,36 0 0,1 422,135 Z" fill="#ef4444" />
        {/* Aro de liga leve */}
        <circle cx="400" cy="160" r="23" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
        <circle cx="400" cy="160" r="19" fill="url(#radial-calota)" />
        {/* Raios esportivos duplos */}
        <path d="M400,160 L400,138 M400,160 L420,150 M400,160 L412,176 M400,160 L388,176 M400,160 L380,150" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="400" cy="160" r="6" fill="#475569" />
      </g>
      <circle {...partProps('moto-ll-wheel-front')} data-name="Roda Dianteira" cx="400" cy="160" r="46" />

      {/* Chassi Tubular exposto em Treliça */}
      <g pointerEvents="none">
        <path d="M150,75 L200,60 L270,115 L220,150 Z" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
        <path d="M150,75 L220,115 M200,60 L220,150" stroke="#0f172a" strokeWidth="3" />
      </g>

      {/* Garfo Dianteiro / Amortecedores Invertidos (Dourado/Preto) */}
      <g pointerEvents="none">
        {/* Bengala superior dourada */}
        <line x1="390" y1="145" x2="362" y2="40" stroke="#fbbf24" strokeWidth="6.5" strokeLinecap="round" />
        {/* Bengala inferior cromada */}
        <line x1="400" y1="160" x2="388" y2="135" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
        {/* Mesa superior e guidão base */}
        <line x1="365" y1="42" x2="358" y2="42" stroke="#475569" strokeWidth="3" />
      </g>

      {/* Guidão Esquerdo */}
      <path {...partProps('moto-ll-handlebars')} data-name="Guidão" d="M362,40 L345,34 L335,35" fill="none" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Espelho Retrovisor Esquerdo */}
      <g {...partProps('moto-ll-mirror')} data-name="Espelho Retrovisor Esquerdo">
        {/* Haste */}
        <path d="M352,36 Q342,22 344,14" fill="none" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        {/* Espelho oval */}
        <ellipse cx="344" cy="14" rx="10" ry="6" fill="#1e293b" stroke="#475569" strokeWidth="1" transform="rotate(-15, 344, 14)" />
        <ellipse cx="343" cy="14" rx="8" ry="4" fill="url(#metal-glass)" opacity="0.7" pointerEvents="none" transform="rotate(-15, 344, 14)" />
      </g>

      {/* Radiador de resfriamento */}
      <rect x="330" y="80" width="12" height="35" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" pointerEvents="none" />
      <line x1="333" y1="84" x2="333" y2="111" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1,1" pointerEvents="none" />
      <line x1="337" y1="84" x2="337" y2="111" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1,1" pointerEvents="none" />

      {/* Motor Esportivo de Alta Cilindrada Detalhado */}
      <g {...partProps('moto-ll-engine')} data-name="Tampa do Motor Esquerda">
        {/* Bloco do Motor principal */}
        <rect x="200" y="105" width="85" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        {/* Aletas de Resfriamento */}
        <line x1="205" y1="115" x2="280" y2="115" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        <line x1="205" y1="123" x2="280" y2="123" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        <line x1="205" y1="131" x2="280" y2="131" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        <line x1="205" y1="139" x2="280" y2="139" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        {/* Cárter redondo detalhado */}
        <circle cx="255" cy="148" r="16" fill="#334155" stroke="#475569" strokeWidth="1" />
        <circle cx="255" cy="148" r="12" fill="#0f172a" pointerEvents="none" />
        {/* Parafusos do motor */}
        <circle cx="243" cy="138" r="1.5" fill="#94a3b8" pointerEvents="none" />
        <circle cx="267" cy="138" r="1.5" fill="#94a3b8" pointerEvents="none" />
        <circle cx="267" cy="158" r="1.5" fill="#94a3b8" pointerEvents="none" />
        <circle cx="243" cy="158" r="1.5" fill="#94a3b8" pointerEvents="none" />
      </g>

      {/* Carenagem Lateral Esquerda (Design Moderno Esportivo) */}
      <path {...partProps('moto-ll-fairing')} data-name="Carenagem Lateral Esquerda" d="M190,75 L285,75 L275,115 L210,115 Z M285,75 L330,78 L320,115 L275,115 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1" />
      {/* Emblema / Detalhe na carenagem */}
      <path d="M220,85 L260,85 L250,92 L215,92 Z" fill="#ef4444" opacity="0.85" pointerEvents="none" />

      {/* Tanque de Combustível Aerodinâmico */}
      <path {...partProps('moto-ll-fuel-tank')} data-name="Tanque de Combustível" d="M175,75 C190,40 250,38 312,50 C325,52 332,65 325,75 C310,95 240,105 175,75 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      {/* Proteção de Tanque (Tank Pad) */}
      <path d="M220,55 C235,55 245,62 245,72 C225,78 210,68 220,55 Z" fill="#1e293b" opacity="0.9" pointerEvents="none" />

      {/* Assento Esportivo Anatômico (Bipartido) */}
      <path {...partProps('moto-ll-seat')} data-name="Assento" d="M170,75 C210,75 240,78 255,75 C240,95 185,100 152,80 L168,75 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      {/* Assento do Garupa */}
      <path d="M138,82 C150,70 172,70 178,74 L152,80 Z" fill="#111827" stroke="#1e293b" strokeWidth="1" pointerEvents="none" />

      {/* Escapamento Esportivo Cromado e Fibra de Carbono */}
      <g {...partProps('moto-ll-exhaust')} data-name="Escapamento">
        {/* Curva do coletor (Cromada) */}
        <path d="M210,145 Q205,182 250,185 L320,180" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />
        <path d="M210,145 Q205,182 250,185 L320,180" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" pointerEvents="none" />
        {/* Silenciador / Ponteira (Preto/Carbono com ponta cromada) */}
        <path d="M315,181 L410,142 C415,140 422,143 420,150 L412,162 C410,166 403,166 398,165 L315,181 Z" fill="#111827" stroke="#334155" strokeWidth="1" />
        {/* Abraçadeira cromada */}
        <rect x="350" y="158" width="6" height="20" fill="#94a3b8" transform="rotate(-23, 350, 158)" pointerEvents="none" />
        {/* Bocal de saída */}
        <ellipse cx="414" cy="151" rx="3" ry="6" fill="#334155" transform="rotate(-23, 414, 151)" pointerEvents="none" />
      </g>

      {/* Para-lama Dianteiro Rente ao Pneu */}
      <path {...partProps('moto-ll-fender-front')} data-name="Para-lama Dianteiro" d="M365,122 C370,110 395,108 425,116 L422,126 C400,118 380,122 375,132 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1" />

      {/* Detalhe da lanterna traseira vermelha visível */}
      <path d="M125,83 L132,80 L134,88 Z" fill="#f87171" stroke="#dc2626" strokeWidth="0.5" pointerEvents="none" />
      {/* Detalhe do farol dianteiro de LED visível */}
      <path d="M344,48 C344,48 338,55 342,62 L347,60 Z" fill="#fef08a" opacity="0.9" pointerEvents="none" />
    </svg>
  )
}
