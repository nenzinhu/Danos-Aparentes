'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'

export default function BusLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)


  return (
    <svg viewBox="0 0 600 220" width="100%">
      {/* Sombra projetada no chão */}
      <ellipse cx="300" cy="200" rx="275" ry="12" className="shadow-ground" />

      {/* Detalhes mecânicos de fundo e eixos (Atrás das rodas) */}
      <g pointerEvents="none">
        <rect x="110" y="160" width="20" height="15" fill="#1e293b" />
        <rect x="440" y="160" width="60" height="15" fill="#1e293b" />
      </g>

      {/* Roda Dianteira Realista */}
      <g pointerEvents="none">
        <circle cx="120" cy="165" r="31" fill="url(#radial-wheel)" />
        {/* Frisos do pneu */}
        <circle cx="120" cy="165" r="28" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,6" opacity="0.8" />
        {/* Aro cromado profundo de ônibus */}
        <circle cx="120" cy="165" r="20" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" />
        <circle cx="120" cy="165" r="14" fill="#1e293b" />
        {/* Furos de refrigeração da calota clássica de ônibus */}
        <circle cx="120" cy="165" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,3" />
        <circle cx="120" cy="165" r="4" fill="#cbd5e1" />
      </g>
      <circle {...partProps('bus-ll-wheel-front')} data-name="Roda Dianteira Esquerda" cx="120" cy="165" r="31" />

      {/* Rodas Traseiras Duplas Detalhadas */}
      <g pointerEvents="none">
        {/* Roda Traseira Interna (Deslocada) */}
        <circle cx="475" cy="165" r="31" fill="#090d16" />
        {/* Roda Traseira Externa */}
        <circle cx="482" cy="165" r="31" fill="url(#radial-wheel)" />
        {/* Frisos do pneu */}
        <circle cx="482" cy="165" r="28" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,6" opacity="0.8" />
        {/* Cubo de eixo pesado traseiro de ônibus */}
        <circle cx="482" cy="165" r="20" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" />
        {/* Tampa do cubo saliente */}
        <rect x="477" y="160" width="10" height="10" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        <circle cx="482" cy="165" r="4" fill="#cbd5e1" />
      </g>
      <circle {...partProps('bus-ll-wheel-rear-1')} data-name="Roda Traseira Esquerda (Tração)" cx="482" cy="165" r="31" />

      {/* Roda Traseira Auxiliar (Direcional/Terceiro Eixo) */}
      <g pointerEvents="none">
        <circle cx="415" cy="165" r="31" fill="url(#radial-wheel)" />
        <circle cx="415" cy="165" r="28" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6,6" opacity="0.8" />
        <circle cx="415" cy="165" r="20" fill="url(#radial-calota)" stroke="#475569" strokeWidth="1" />
        <circle cx="415" cy="165" r="14" fill="#1e293b" />
        <circle cx="415" cy="165" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,3" />
        <circle cx="415" cy="165" r="4" fill="#cbd5e1" />
      </g>
      <circle {...partProps('bus-ll-wheel-rear-2')} data-name="Roda Traseira Esquerda (Auxiliar)" cx="415" cy="165" r="31" />

      {/* Carroceria / Lateral Completa do Ônibus */}
      <path {...partProps('bus-ll-body')} data-name="Carroceria / Lateral" d="M40,30 L550,30 C558,30 562,35 562,42 L562,162 C562,168 558,172 550,172 L508,172 Q508,135 472,135 Q436,135 436,172 L395,172 Q395,135 360,135 Q325,135 325,172 L146,172 Q146,135 110,135 Q74,135 74,172 L45,172 C41,172 40,168 40,162 L40,42 C40,35 41,30 40,30 Z" fill="url(#grad-metal)" />

      {/* Detalhes Estéticos sobre a Carroceria */}
      <g pointerEvents="none">
        {/* Moldura preta superior das janelas e colunas do teto */}
        <rect x="42" y="32" width="518" height="63" rx="8" fill="#0f172a" opacity="0.9" />
        {/* Linha divisória horizontal cromada entre andares */}
        <line x1="40" y1="95" x2="562" y2="95" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Vinco aerodinâmico na saia lateral inferior */}
        <line x1="42" y1="130" x2="560" y2="130" stroke="#1e293b" strokeWidth="1.5" />
        {/* Grade do radiador/motor traseiro lateral */}
        <rect x="525" y="115" width="28" height="42" rx="3" fill="#121824" stroke="#334155" strokeWidth="1" />
        <line x1="528" y1="120" x2="550" y2="120" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="528" y1="125" x2="550" y2="125" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="528" y1="130" x2="550" y2="130" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="528" y1="135" x2="550" y2="135" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="528" y1="140" x2="550" y2="140" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="528" y1="145" x2="550" y2="145" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="528" y1="150" x2="550" y2="150" stroke="#1e293b" strokeWidth="1.5" />
        {/* Luzes de posição laterais laranja (LEDs) */}
        <circle cx="80" cy="130" r="2.5" fill="#f97316" />
        <circle cx="200" cy="130" r="2.5" fill="#f97316" />
        <circle cx="320" cy="130" r="2.5" fill="#f97316" />
        <circle cx="440" cy="130" r="2.5" fill="#f97316" />
        {/* Saia lateral / spoilers de rodas */}
        <path d="M40,162 L45,172 L72,172 L72,165" fill="#1e293b" stroke="#090d16" strokeWidth="1" />
        <path d="M562,162 L550,172 L510,172 L510,165" fill="#1e293b" stroke="#090d16" strokeWidth="1" />
      </g>

      {/* Janelas dos Passageiros (Vidros Colados Duplos com Reflexo) */}
      <g {...partProps('bus-ll-windows')} data-name="Janelas dos Passageiros">
        {/* Janelas do Piso Superior */}
        <path d="M92,36 L545,36 L545,62 L92,62 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />
        {/* Janelas do Piso Inferior */}
        <path d="M155,100 L390,100 L390,124 L155,124 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1" />

        {/* Divisórias e Brilho Reflexivo */}
        <g pointerEvents="none">
          {/* Colunas verticais superiores */}
          <line x1="165" y1="36" x2="165" y2="62" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="240" y1="36" x2="240" y2="62" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="315" y1="36" x2="315" y2="62" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="390" y1="36" x2="390" y2="62" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="465" y1="36" x2="465" y2="62" stroke="#0f172a" strokeWidth="2.5" />
          {/* Colunas verticais inferiores */}
          <line x1="230" y1="100" x2="230" y2="124" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="310" y1="100" x2="310" y2="124" stroke="#0f172a" strokeWidth="2.5" />
          {/* Reflexos diagonais superiores */}
          <path d="M110,36 L150,36 L120,62 L80,62 Z" fill="#ffffff" opacity="0.15" />
          <path d="M260,36 L300,36 L270,62 L230,62 Z" fill="#ffffff" opacity="0.15" />
          <path d="M410,36 L450,36 L420,62 L380,62 Z" fill="#ffffff" opacity="0.15" />
          {/* Reflexos inferiores */}
          <path d="M180,100 L210,100 L190,124 L160,124 Z" fill="#ffffff" opacity="0.15" />
          <path d="M300,100 L330,100 L310,124 L280,124 Z" fill="#ffffff" opacity="0.15" />
        </g>
      </g>

      {/* Parabrisa Dianteiro (Lateral) */}
      <g {...partProps('bus-ll-windshield')} data-name="Parabrisa Dianteiro (Lateral)">
        {/* Vidro inclinado aerodinâmico do motorista */}
        <path d="M42,36 L90,36 L90,92 L52,92 C46,92 42,88 42,80 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#1e293b" strokeWidth="1.2" />
        <path d="M45,38 L88,38 L88,90 L52,90 C47,90 45,86 45,80 Z" fill="none" stroke="#000" strokeWidth="1.5" opacity="0.5" pointerEvents="none" />
        {/* Reflexo diagonal do parabrisa */}
        <path d="M44,36 L64,36 L52,92 L32,92 Z" fill="#ffffff" opacity="0.25" pointerEvents="none" />
      </g>

      {/* Porta de Passageiros Pantográfica */}
      <g {...partProps('bus-ll-door')} data-name="Porta de Passageiros">
        {/* Base da Porta */}
        <rect x="420" y="96" width="38" height="74" rx="4" fill="url(#grad-metal)" stroke="#0f172a" strokeWidth="2" />
        {/* Janelas da Porta */}
        <rect x="424" y="100" width="13" height="30" rx="2" fill="url(#metal-glass)" stroke="#000" strokeWidth="1.2" opacity="0.85" />
        <rect x="441" y="100" width="13" height="30" rx="2" fill="url(#metal-glass)" stroke="#000" strokeWidth="1.2" opacity="0.85" />
        <rect x="424" y="135" width="13" height="24" rx="2" fill="url(#metal-glass)" stroke="#000" strokeWidth="1.2" opacity="0.85" />
        <rect x="441" y="135" width="13" height="24" rx="2" fill="url(#metal-glass)" stroke="#000" strokeWidth="1.2" opacity="0.85" />
        {/* Detalhes da porta (borracha central e trinco) */}
        <line x1="439" y1="96" x2="439" y2="170" stroke="#0f172a" strokeWidth="1.5" pointerEvents="none" />
        <rect x="437" y="130" width="4" height="8" rx="1" fill="#475569" pointerEvents="none" />
      </g>

      {/* Bagageiro / Portas de Carga */}
      <g {...partProps('bus-ll-luggage')} data-name="Bagageiro / Portas de Carga">
        {/* Painéis de bagageiros inferiores */}
        <rect x="150" y="130" width="70" height="36" rx="2" fill="url(#grad-metal)" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="224" y="130" width="70" height="36" rx="2" fill="url(#grad-metal)" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="298" y="130" width="70" height="36" rx="2" fill="url(#grad-metal)" stroke="#1e293b" strokeWidth="1.5" />
        {/* Fechaduras / Trincos dos bagageiros */}
        <rect x="180" y="134" width="10" height="4" rx="1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" pointerEvents="none" />
        <rect x="254" y="134" width="10" height="4" rx="1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" pointerEvents="none" />
        <rect x="328" y="134" width="10" height="4" rx="1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" pointerEvents="none" />
      </g>
    </svg>
  )
}
