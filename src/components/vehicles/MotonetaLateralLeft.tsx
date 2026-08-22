'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { LateralWheelGraphic } from './WheelRim'

export default function MotonetaLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)

  return (
    <svg viewBox="0 0 500 250" width="100%">
      {/* Sombra projetada do veículo */}
      <ellipse cx="250" cy="215" rx="170" ry="12" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Rodas pequenas (aro baixo, típico de scooter) */}
      <LateralWheelGraphic cx={110} cy={178} r={34} caliperSide="left" />
      <circle {...partProps('sco-ll-wheel-rear')} data-name="Roda Traseira" cx="110" cy="178" r="34" />
      <LateralWheelGraphic cx={390} cy={178} r={34} caliperSide="left" />
      <circle {...partProps('sco-ll-wheel-front')} data-name="Roda Dianteira" cx="390" cy="178" r="34" />

      {/* Assoalho / Plataforma de apoio dos pés (característica que define a motoneta) */}
      <path {...partProps('sco-ll-floorboard')} data-name="Assoalho" d="M150,152 L350,152 L344,170 L156,170 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      <path d="M165,157 L335,157" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" pointerEvents="none" />

      {/* Escapamento compacto sob o assoalho */}
      <g {...partProps('sco-ll-exhaust')} data-name="Escapamento">
        <rect x="150" y="172" width="58" height="13" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
        <ellipse cx="204" cy="178" rx="4" ry="5.5" fill="#334155" pointerEvents="none" />
      </g>

      {/* Carroceria Traseira (cobre motor/CVT — sem partes mecânicas expostas) */}
      <path {...partProps('sco-ll-rear-body')} data-name="Carroceria Traseira" d="M74,168 C68,120 88,84 138,80 C176,77 198,96 193,132 L186,168 C160,175 100,175 74,168 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      {/* Linha de estilo da carroceria */}
      <path d="M90,120 C110,110 150,108 178,118" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" pointerEvents="none" />

      {/* Lanterna Traseira integrada à carroceria */}
      <g {...partProps('sco-ll-taillight')} data-name="Lanterna Traseira">
        <path d="M72,98 L86,94 L89,124 L75,127 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M74,101 L84,98 L86,121 L76,124 Z" fill="#ef4444" opacity="0.95" pointerEvents="none" />
      </g>

      {/* Bagageiro / Baú traseiro (opcional, comum em motonetas de entrega) */}
      <path {...partProps('sco-ll-top-case')} data-name="Bagageiro" d="M60,72 L112,70 C118,70 120,75 120,80 L120,96 C120,101 116,104 110,104 L62,104 C56,104 54,99 54,94 L54,80 C54,75 56,72 60,72 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

      {/* Assento corrido (banco único e baixo, sem tanque exposto) */}
      <path {...partProps('sco-ll-seat')} data-name="Assento" d="M116,80 C116,66 220,64 226,80 C226,90 190,96 165,96 C140,96 116,92 116,80 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

      {/* Escudo Frontal / Perna-de-força (cobre as pernas do condutor — sem tanque entre as pernas) */}
      <path {...partProps('sco-ll-front-shield')} data-name="Escudo Frontal" d="M330,168 C322,120 330,66 362,44 C382,30 408,38 407,64 L399,150 C388,164 352,171 330,168 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1.5" />
      {/* Aba inferior do escudo (protege os pés do vento) */}
      <path d="M340,152 C355,164 385,166 396,153 L392,168 C378,175 348,174 336,166 Z" fill="#1e293b" opacity="0.9" pointerEvents="none" />

      {/* Para-lama dianteiro colado à roda */}
      <path {...partProps('sco-ll-front-fender')} data-name="Para-lama Dianteiro" d="M362,158 C362,144 416,142 428,158 L423,168 C408,159 380,161 372,170 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1" />

      {/* Farol Dianteiro embutido no escudo */}
      <g {...partProps('sco-ll-headlight')} data-name="Farol Dianteiro">
        <ellipse cx="378" cy="88" rx="17" ry="15" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="378" cy="88" rx="13" ry="11" fill="url(#metal-glass)" opacity="0.9" pointerEvents="none" />
        <circle cx="378" cy="88" r="6" fill="#fef08a" opacity="0.85" pointerEvents="none" />
      </g>

      {/* Sinaleira dianteira embutida na carenagem */}
      <g {...partProps('sco-ll-turn-front')} data-name="Sinalizador Dianteiro">
        <ellipse cx="401" cy="70" rx="6" ry="5" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" transform="rotate(-20, 401, 70)" />
      </g>

      {/* Guidão + Retrovisor, visíveis acima do escudo */}
      <g {...partProps('sco-ll-handlebars')} data-name="Guidão">
        <path d="M352,42 L385,32" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="348" y="38" width="14" height="7" rx="2" fill="#0f172a" transform="rotate(-18, 352, 42)" pointerEvents="none" />
      </g>
      <g {...partProps('sco-ll-mirror')} data-name="Espelho Retrovisor">
        <path d="M388,32 Q396,20 394,12" fill="none" stroke="#475569" strokeWidth="2" pointerEvents="none" />
        <ellipse cx="394" cy="12" rx="9" ry="6" fill="#1e293b" stroke="#475569" strokeWidth="1" transform="rotate(15, 394, 12)" />
        <ellipse cx="393" cy="12" rx="7" ry="4" fill="url(#metal-glass)" opacity="0.7" pointerEvents="none" transform="rotate(15, 394, 12)" />
      </g>

      {/* Painel/velocímetro simples visível acima do guidão */}
      <rect x="358" y="52" width="22" height="12" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" pointerEvents="none" />
      <rect x="361" y="54" width="16" height="8" fill="url(#metal-glass)" opacity="0.75" pointerEvents="none" />
    </svg>
  )
}
