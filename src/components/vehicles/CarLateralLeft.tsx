'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { LateralWheelGraphic } from './WheelRim'

export default function CarLateralLeft({
  damages,
  selectedPartId,
  onPartClick,
  onPartHover,
  hideWheels = false,
}: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)

  return (
    <svg viewBox="0 0 520 220" width="100%">
      {/* Fundo de estúdio — gradiente de iluminação 3D (ilusão de espaço 3D) */}
      <rect x="0" y="0" width="520" height="220" fill="url(#studio-bg)" />
      {/* Halo de luz de estúdio atrás do veículo */}
      <ellipse cx="260" cy="120" rx="260" ry="95" fill="#0ea5e9" opacity="0.06" filter="url(#soft-blur)" />

      {/* Sombra de contato no chão — suave e realista */}
      <ellipse cx="260" cy="190" rx="232" ry="13" fill="#000" opacity="0.30" filter="url(#shadow-filter)" />
      <ellipse cx="260" cy="192" rx="150" ry="6" fill="#000" opacity="0.34" filter="url(#shadow-filter)" />

      {/* Arcos de roda (caixa de roda) */}
      <path d="M75,160 A45,45 0 0,1 165,160 Z" fill="#070b14" />
      <path d="M355,160 A45,45 0 0,1 445,160 Z" fill="#070b14" />

      {!hideWheels && (
        <>
          <LateralWheelGraphic cx={120} cy={160} r={38} caliperSide="left" />
          <circle {...partProps('car-ll-wheel-front')} data-name="Roda Dianteira Esquerda" cx="120" cy="160" r="38" />
          <LateralWheelGraphic cx={400} cy={160} r={38} caliperSide="left" />
          <circle {...partProps('car-ll-wheel-rear')} data-name="Roda Traseira Esquerda" cx="400" cy="160" r="38" />
        </>
      )}

      {/* Vidros laterais com profundidade */}
      <path {...partProps('car-ll-glass-front')} data-name="Vidro Dianteiro Esquerdo" d="M190,80 L248,42 L318,42 L318,80 Z" fill="url(#metal-glass)" opacity="0.92" stroke="#0f172a" strokeWidth="1" />
      <path {...partProps('car-ll-glass-rear')} data-name="Vidro Traseiro Esquerdo" d="M322,42 L378,42 L418,80 L322,80 Z" fill="url(#metal-glass)" opacity="0.92" stroke="#0f172a" strokeWidth="1" />
      {/* Reflexo diagonal no vidro */}
      <path d="M205,78 L240,46 L255,46 L222,78 Z" fill="#e0f7ff" opacity="0.25" pointerEvents="none" />
      <path d="M335,78 L368,48 L380,48 L350,78 Z" fill="#e0f7ff" opacity="0.22" pointerEvents="none" />
      <rect x="318" y="42" width="4" height="38" fill="#0f172a" pointerEvents="none" />
      <path d="M189,80 L247,42" stroke="#0f172a" strokeWidth="3" fill="none" pointerEvents="none" />
      <path d="M378,42 L419,80" stroke="#0f172a" strokeWidth="3" fill="none" pointerEvents="none" />

      {/* Corpo principal (grupo) com drop shadow para profundidade */}
      <g filter="url(#drop-shadow)">
        {/* Teto com brilho de topo */}
        <path {...partProps('car-ll-roof')} data-name="Teto" d="M230,42 L388,42 C395,42 400,40 395,33 C380,24 350,22 280,24 C245,25 220,33 230,42 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1.5" />
        {/* Para-lama dianteiro */}
        <path {...partProps('car-ll-fender-front')} data-name="Para-lama Dianteiro Esquerdo" d="M32,118 C30,105 40,88 78,80 C110,78 135,80 160,80 C160,122 155,135 152,150 C145,125 130,118 120,118 C100,118 90,128 85,150 L32,150 C30,138 31,125 32,118 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
        {/* Porta dianteira */}
        <path {...partProps('car-ll-door-front')} data-name="Porta Dianteira Esquerda" d="M160,80 L275,80 L275,160 L160,160 C160,160 162,145 152,150 C155,135 160,122 160,80 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
        {/* Porta traseira */}
        <path {...partProps('car-ll-door-rear')} data-name="Porta Traseira Esquerda" d="M275,80 L380,80 C380,122 385,135 382,150 C372,145 370,160 370,160 L275,160 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
        {/* Para-lama traseiro */}
        <path {...partProps('car-ll-fender-rear')} data-name="Para-lama Traseiro Esquerdo" d="M380,80 C410,80 445,82 478,92 C492,105 488,125 482,132 C480,138 470,148 448,150 C445,128 435,118 400,118 C388,118 382,125 382,150 C385,135 380,122 380,80 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
        {/* Soleira */}
        <path {...partProps('car-ll-sill')} data-name="Soleira Esquerda" d="M152,160 L370,160 L370,168 L152,168 Z" fill="#0b1220" stroke="#1e293b" strokeWidth="1" />
      </g>

      {/* Reflexo de cintura (sheen) sobre o corpo — simula curvatura da lataria */}
      <path d="M32,118 C60,104 90,98 120,96 C180,92 280,94 380,96 C430,98 470,104 482,110 C470,112 430,110 380,110 C280,109 180,107 120,110 C90,112 60,116 32,118 Z" fill="url(#body-sheen)" pointerEvents="none" />
      {/* Vinco de porta */}
      <path d="M275,84 L275,158" stroke="#04263b" strokeWidth="1.5" opacity="0.55" fill="none" pointerEvents="none" />
      <path d="M168,84 C170,120 170,140 166,156" stroke="#bae6fd" strokeWidth="1" opacity="0.32" fill="none" pointerEvents="none" />

      {/* Maçanetas — partes clicáveis com nome + volume de metal (cromado) */}
      <g {...partProps('car-ll-handle-front')} data-name="Maçaneta Dianteira Esquerda" pointerEvents="all">
        <rect x="262" y="102" width="16" height="7" rx="3.5" fill="url(#chrome-handle)" stroke="#1e293b" strokeWidth="0.6" />
        <rect x="265" y="103.5" width="7" height="1.6" rx="0.8" fill="#f8fafc" opacity="0.85" pointerEvents="none" />
      </g>
      <g {...partProps('car-ll-handle-rear')} data-name="Maçaneta Traseira Esquerda" pointerEvents="all">
        <rect x="372" y="102" width="16" height="7" rx="3.5" fill="url(#chrome-handle)" stroke="#1e293b" strokeWidth="0.6" />
        <rect x="375" y="103.5" width="7" height="1.6" rx="0.8" fill="#f8fafc" opacity="0.85" pointerEvents="none" />
      </g>

      {/* Retrovisor */}
      <g {...partProps('car-ll-mirror')} data-name="Retrovisor Esquerdo">
        <path d="M162,76 C150,76 142,66 148,60 C154,54 165,65 162,76 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
        <path d="M160,74 C152,74 146,67 150,63 C154,59 162,67 160,74 Z" fill="#0f172a" pointerEvents="none" />
        <path d="M145,67 Q150,65 154,67" stroke="#fbbf24" strokeWidth="1.5" fill="none" pointerEvents="none" />
      </g>

      {/* Linha de solo (sombra + luz suave) */}
      <path d="M170,148 L360,148" stroke="rgba(0,0,0,0.28)" strokeWidth="2" fill="none" pointerEvents="none" />
      <path d="M170,149 L360,149" stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none" pointerEvents="none" />

      {/* Detalhes: limpador, fechadura */}
      <g pointerEvents="none">
        <rect x="245" y="88" width="16" height="4" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <line x1="245" y1="90" x2="261" y2="90" stroke="#000" strokeWidth="1" />
        <rect x="290" y="88" width="16" height="4" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <line x1="290" y1="90" x2="306" y2="90" stroke="#000" strokeWidth="1" />
      </g>

      {/* Farol dianteiro com brilho */}
      <path d="M32,118 C33,114 36,110 42,108 C39,118 35,123 32,118 Z" fill="#fef08a" opacity="0.9" pointerEvents="none" />
      <circle cx="37" cy="115" r="2" fill="#fffbeb" opacity="0.9" pointerEvents="none" />
      {/* Lanterna traseira com brilho */}
      <path d="M478,92 C478,96 476,102 473,104 C476,96 478,94 478,92 Z" fill="#f87171" pointerEvents="none" />
      <circle cx="476" cy="98" r="1.6" fill="#fecaca" opacity="0.9" pointerEvents="none" />
    </svg>
  )
}
