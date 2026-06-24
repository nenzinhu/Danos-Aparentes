'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'

export default function CarLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)


  return (
    <svg viewBox="0 0 520 220" width="100%">
      <ellipse cx="260" cy="188" rx="230" ry="14" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />
      <path d="M75,160 A45,45 0 0,1 165,160 Z" fill="#0f172a" />
      <path d="M355,160 A45,45 0 0,1 445,160 Z" fill="#0f172a" />
      <g pointerEvents="none">
        <circle cx="120" cy="160" r="38" fill="url(#radial-wheel)" />
        <circle cx="120" cy="160" r="34" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="120" cy="160" r="36" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4,6" opacity="0.8" />
        <circle cx="120" cy="160" r="25" fill="#94a3b8" />
        <circle cx="120" cy="160" r="23" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,3" />
        <path d="M136,144 A25,25 0 0,0 142,160 L148,160 A31,31 0 0,1 140,140 Z" fill="#ef4444" />
        <circle cx="120" cy="160" r="26" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
        <circle cx="120" cy="160" r="22" fill="url(#radial-calota)" />
        <path d="M120,160 L120,138 M120,160 L141,153 M120,160 L133,178 M120,160 L107,178 M120,160 L99,153" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <path d="M120,160 L120,138 M120,160 L141,153 M120,160 L133,178 M120,160 L107,178 M120,160 L99,153" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="120" cy="160" r="5" fill="#475569" />
        <circle cx="120" cy="160" r="2" fill="#e2e8f0" />
      </g>
      <circle {...partProps('car-ll-wheel-front')} data-name="Roda Dianteira Esquerda" cx="120" cy="160" r="38" />
      <g pointerEvents="none">
        <circle cx="400" cy="160" r="38" fill="url(#radial-wheel)" />
        <circle cx="400" cy="160" r="34" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="400" cy="160" r="36" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4,6" opacity="0.8" />
        <circle cx="400" cy="160" r="25" fill="#94a3b8" />
        <circle cx="400" cy="160" r="23" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,3" />
        <path d="M416,144 A25,25 0 0,0 422,160 L428,160 A31,31 0 0,1 420,140 Z" fill="#ef4444" />
        <circle cx="400" cy="160" r="26" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
        <circle cx="400" cy="160" r="22" fill="url(#radial-calota)" />
        <path d="M400,160 L400,138 M400,160 L421,153 M400,160 L413,178 M400,160 L387,178 M400,160 L379,153" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <path d="M400,160 L400,138 M400,160 L421,153 M400,160 L413,178 M400,160 L387,178 M400,160 L379,153" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="400" cy="160" r="5" fill="#475569" />
        <circle cx="400" cy="160" r="2" fill="#e2e8f0" />
      </g>
      <circle {...partProps('car-ll-wheel-rear')} data-name="Roda Traseira Esquerda" cx="400" cy="160" r="38" />
      <path {...partProps('car-ll-glass-front')} data-name="Vidro Dianteiro Esquerdo" d="M190,80 L248,42 L318,42 L318,80 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1" />
      <path {...partProps('car-ll-glass-rear')} data-name="Vidro Traseiro Esquerdo" d="M322,42 L378,42 L418,80 L322,80 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1" />
      <rect x="318" y="42" width="4" height="38" fill="#0f172a" pointerEvents="none" />
      <path d="M189,80 L247,42" stroke="#0f172a" strokeWidth="3" fill="none" pointerEvents="none" />
      <path d="M378,42 L419,80" stroke="#0f172a" strokeWidth="3" fill="none" pointerEvents="none" />
      <path {...partProps('car-ll-roof')} data-name="Teto" d="M230,42 L388,42 C395,42 400,40 395,33 C380,24 350,22 280,24 C245,25 220,33 230,42 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1.5" />
      <path {...partProps('car-ll-fender-front')} data-name="Para-lama Dianteiro Esquerdo" d="M32,118 C30,105 40,88 78,80 C110,78 135,80 160,80 C160,122 155,135 152,150 C145,125 130,118 120,118 C100,118 90,128 85,150 L32,150 C30,138 31,125 32,118 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-ll-door-front')} data-name="Porta Dianteira Esquerda" d="M160,80 L275,80 L275,160 L160,160 C160,160 162,145 152,150 C155,135 160,122 160,80 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-ll-door-rear')} data-name="Porta Traseira Esquerda" d="M275,80 L380,80 C380,122 385,135 382,150 C372,145 370,160 370,160 L275,160 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-ll-fender-rear')} data-name="Para-lama Traseiro Esquerdo" d="M380,80 C410,80 445,82 478,92 C492,105 488,125 482,132 C480,138 470,148 448,150 C445,128 435,118 400,118 C388,118 382,125 382,150 C385,135 380,122 380,80 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      <path {...partProps('car-ll-sill')} data-name="Soleira Esquerda" d="M152,160 L370,160 L370,168 L152,168 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <g {...partProps('car-ll-mirror')} data-name="Retrovisor Esquerdo">
        <path d="M162,76 C150,76 142,66 148,60 C154,54 165,65 162,76 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        <path d="M160,74 C152,74 146,67 150,63 C154,59 162,67 160,74 Z" fill="url(#metal-car-blue)" pointerEvents="none" />
        <path d="M145,67 Q150,65 154,67" stroke="#fbbf24" strokeWidth="1.5" fill="none" pointerEvents="none" />
      </g>
      <path d="M50,96 C100,92 180,95 240,95 C300,95 380,92 460,98" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" pointerEvents="none" />
      <path d="M170,148 L360,148" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" pointerEvents="none" />
      <path d="M170,149 L360,149" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" pointerEvents="none" />
      <g pointerEvents="none">
        <rect x="245" y="88" width="16" height="4" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <line x1="245" y1="90" x2="261" y2="90" stroke="#000" strokeWidth="1" />
        <rect x="290" y="88" width="16" height="4" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        <line x1="290" y1="90" x2="306" y2="90" stroke="#000" strokeWidth="1" />
      </g>
      <path d="M32,118 C33,114 36,110 42,108 C39,118 35,123 32,118 Z" fill="#fef08a" opacity="0.8" pointerEvents="none" />
      <path d="M478,92 C478,96 476,102 473,104 C476,96 478,94 478,92 Z" fill="#f87171" pointerEvents="none" />
    </svg>
  )
}
