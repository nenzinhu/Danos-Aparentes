import { VehicleProps } from '../../types'

export default function MotoTraseira({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
    <svg viewBox="0 0 300 300" width="100%">
      {/* Sombra projetada do veículo */}
      <ellipse cx="150" cy="275" rx="80" ry="10" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Assento Traseiro de Perfil / Rabeta Esportiva */}
      <path {...partProps('moto-r-seat')} data-name="Perfil Traseiro Assento" d="M110,95 C110,80 190,80 190,95 L180,125 C170,125 130,125 120,125 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
      {/* Carenagem da rabeta sob o banco */}
      <path d="M115,115 C115,108 185,108 185,115 L175,135 C170,135 130,135 125,135 Z" fill="url(#metal-moto-dark)" stroke="#1e293b" strokeWidth="1" pointerEvents="none" />

      {/* Lanterna Traseira de LED Vermelho */}
      <g {...partProps('moto-r-light')} data-name="Lanterna Traseira">
        {/* Moldura preta */}
        <polygon points="135,110 150,96 165,110 150,115" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        {/* Lente acrílica vermelha */}
        <polygon points="138,109 150,99 162,109 150,113" fill="#ef4444" />
        {/* Barra de luz em LED */}
        <line x1="142" y1="108" x2="158" y2="108" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" pointerEvents="none" />
      </g>

      {/* Sinalizadores Traseiros / Piscas de LED */}
      <g {...partProps('moto-r-turn-left')} data-name="Sinalizador Traseiro Esquerdo">
        {/* Haste de borracha flexível */}
        <line x1="125" y1="125" x2="98" y2="125" stroke="#1e293b" strokeWidth="4" />
        {/* Pisca laranja */}
        <polygon points="98,122 90,125 98,128" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" />
      </g>
      <g {...partProps('moto-r-turn-right')} data-name="Sinalizador Traseiro Direito">
        {/* Haste de borracha flexível */}
        <line x1="175" y1="125" x2="202" y2="125" stroke="#1e293b" strokeWidth="4" />
        {/* Pisca laranja */}
        <polygon points="202,122 210,125 202,128" fill="#fb923c" stroke="#d97706" strokeWidth="0.5" />
      </g>

      {/* Suporte de Placa / Para-lama Traseiro */}
      <path {...partProps('moto-r-fender')} data-name="Para-lama Traseiro" d="M130,135 L170,135 L178,210 L122,210 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      {/* Olho de gato refletor vermelho */}
      <rect x="144" y="145" width="12" height="4" fill="#ef4444" rx="1" pointerEvents="none" />

      {/* Placa de Identificação do Veículo (Mercosul) */}
      <g {...partProps('moto-r-plate')} data-name="Placa">
        {/* Corpo da placa */}
        <rect x="125" y="165" width="50" height="38" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        {/* Faixa azul Mercosul */}
        <rect x="126" y="166" width="48" height="8" fill="#3b82f6" pointerEvents="none" />
        <circle cx="132" cy="170" r="1" fill="#fff" pointerEvents="none" />
        <circle cx="168" cy="170" r="1" fill="#fff" pointerEvents="none" />
        {/* Texto da placa */}
        <text x="150" y="193" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#020617" textAnchor="middle" letterSpacing="2" pointerEvents="none">AAA</text>
        <text x="150" y="172" fontFamily="sans-serif" fontSize="4" fontWeight="bold" fill="#fff" textAnchor="middle" pointerEvents="none">BRASIL</text>
      </g>

      {/* Pneu Traseiro Super Largo visto por trás */}
      <g pointerEvents="none">
        <rect x="132" y="210" width="36" height="60" rx="12" fill="url(#radial-wheel)" />
        <rect x="135" y="210" width="30" height="60" rx="10" fill="none" stroke="#1e293b" strokeWidth="1" />
        {/* Sulcos em V invertidos do pneu */}
        <path d="M150,215 L150,265" stroke="#000" strokeWidth="3" strokeDasharray="8,6" opacity="0.8" />
        <path d="M138,225 L148,230 M162,225 L152,230 M138,245 L148,250 M162,245 L152,250" stroke="#000" strokeWidth="2" opacity="0.8" />
        {/* Detalhe do Escapamento (Saída de escapamento visível na lateral) */}
        <ellipse cx="182" cy="235" rx="10" ry="14" fill="#111827" stroke="#334155" strokeWidth="1" transform="rotate(15, 182, 235)" />
        <circle cx="182" cy="235" r="5" fill="#000" />
      </g>
      <rect {...partProps('moto-bb-wheel')} data-name="Roda Traseira" x="132" y="210" width="36" height="60" rx="12" />
    </svg>
  )
}
