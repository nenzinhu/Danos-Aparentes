'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { LateralWheelGraphic } from './WheelRim'

export default function MotonetaLateralRight({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)

  return (
    <svg viewBox="0 0 500 250" width="100%">
      {/* Sombra projetada do veículo */}
      <ellipse cx="250" cy="215" rx="170" ry="12" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Rodas pequenas (aro baixo, típico de scooter) */}
      <LateralWheelGraphic cx={390} cy={178} r={34} caliperSide="right" />
      <circle {...partProps('sco-lr-wheel-rear')} data-name="Roda Traseira" cx="390" cy="178" r="34" />
      <LateralWheelGraphic cx={110} cy={178} r={34} caliperSide="right" />
      <circle {...partProps('sco-lr-wheel-front')} data-name="Roda Dianteira" cx="110" cy="178" r="34" />

      {/* Assoalho / Plataforma de apoio dos pés (característica que define a motoneta) */}
      <path {...partProps('sco-lr-floorboard')} data-name="Assoalho" d="M150,152 L350,152 L344,170 L156,170 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      <path d="M165,157 L335,157" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" pointerEvents="none" />

      {/* Escapamento compacto sob o assoalho */}
      <g {...partProps('sco-lr-exhaust')} data-name="Escapamento">
        <rect x="292" y="172" width="58" height="13" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
        <ellipse cx="296" cy="178" rx="4" ry="5.5" fill="#334155" pointerEvents="none" />
      </g>

      {/* Carroceria Traseira (cobre motor/CVT — sem partes mecânicas expostas) */}
      <path {...partProps('sco-lr-rear-body')} data-name="Carroceria Traseira" d="M426,168 C432,120 412,84 362,80 C324,77 302,96 307,132 L314,168 C340,175 400,175 426,168 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      {/* Linha de estilo da carroceria */}
      <path d="M410,120 C390,110 350,108 322,118" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" pointerEvents="none" />

      {/* Lanterna Traseira integrada à carroceria */}
      <g {...partProps('sco-lr-taillight')} data-name="Lanterna Traseira">
        <path d="M428,98 L414,94 L411,124 L425,127 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M426,101 L416,98 L414,121 L424,124 Z" fill="#ef4444" opacity="0.95" pointerEvents="none" />
      </g>

      {/* Bagageiro / Baú traseiro (opcional, comum em motonetas de entrega) */}
      <path {...partProps('sco-lr-top-case')} data-name="Bagageiro" d="M440,72 L388,70 C382,70 380,75 380,80 L380,96 C380,101 384,104 390,104 L438,104 C444,104 446,99 446,94 L446,80 C446,75 444,72 440,72 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

      {/* Assento corrido (banco único e baixo, sem tanque exposto) */}
      <path {...partProps('sco-lr-seat')} data-name="Assento" d="M384,80 C384,66 280,64 274,80 C274,90 310,96 335,96 C360,96 384,92 384,80 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Escudo Frontal / Perna-de-força (cobre as pernas do condutor — sem tanque entre as pernas) */}
      <path {...partProps('sco-lr-front-shield')} data-name="Escudo Frontal" d="M170,168 C178,120 170,66 138,44 C118,30 92,38 93,64 L101,150 C112,164 148,171 170,168 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      {/* Aba inferior do escudo (protege os pés do vento) */}
      <path d="M160,152 C145,164 115,166 104,153 L108,168 C122,175 152,174 164,166 Z" fill="#1e293b" opacity="0.9" pointerEvents="none" />

      {/* Para-lama dianteiro colado à roda */}
      <path {...partProps('sco-lr-front-fender')} data-name="Para-lama Dianteiro" d="M138,158 C138,144 84,142 72,158 L77,168 C92,159 120,161 128,170 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1" />

      {/* Farol Dianteiro embutido no escudo */}
      <g {...partProps('sco-lr-headlight')} data-name="Farol Dianteiro">
        <ellipse cx="122" cy="88" rx="17" ry="15" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="122" cy="88" rx="13" ry="11" fill="url(#metal-glass)" opacity="0.9" pointerEvents="none" />
        <circle cx="122" cy="88" r="6" fill="#fef08a" opacity="0.85" pointerEvents="none" />
      </g>

      {/* Sinaleira dianteira embutida na carenagem */}
      <g {...partProps('sco-lr-turn-front')} data-name="Sinalizador Dianteiro">
        <ellipse cx="99" cy="70" rx="6" ry="5" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" transform="rotate(20, 99, 70)" />
      </g>

      {/* Guidão + Retrovisor, visíveis acima do escudo */}
      <g {...partProps('sco-lr-handlebars')} data-name="Guidão">
        <path d="M148,42 L115,32" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="138" y="38" width="14" height="7" rx="2" fill="#0f172a" transform="rotate(18, 148, 42)" pointerEvents="none" />
      </g>
      <g {...partProps('sco-lr-mirror')} data-name="Espelho Retrovisor">
        <path d="M112,32 Q104,20 106,12" fill="none" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        <ellipse cx="106" cy="12" rx="9" ry="6" fill="#1e293b" stroke="#475569" strokeWidth="1" transform="rotate(-15, 106, 12)" />
        <ellipse cx="107" cy="12" rx="7" ry="4" fill="url(#metal-glass)" opacity="0.7" pointerEvents="none" transform="rotate(-15, 106, 12)" />
      </g>

      {/* Painel/velocímetro simples visível acima do guidão */}
      <rect x="120" y="52" width="22" height="12" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" pointerEvents="none" />
      <rect x="123" y="54" width="16" height="8" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
    </svg>
  )
}
