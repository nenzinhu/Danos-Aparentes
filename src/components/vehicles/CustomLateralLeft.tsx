'use client';
import { VehicleProps } from '../../types'

export default function CustomLateralLeft({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
    <svg viewBox="0 0 500 200" width="100%">
      <ellipse cx="250" cy="180" rx="200" ry="10" className="shadow-ground" />
      <g pointerEvents="none">
        <circle cx="120" cy="140" r="28" fill="url(#radial-wheel)" />
        <circle cx="120" cy="140" r="16" fill="url(#radial-calota)" />
      </g>
      <g pointerEvents="none">
        <circle cx="380" cy="140" r="28" fill="url(#radial-wheel)" />
        <circle cx="380" cy="140" r="16" fill="url(#radial-calota)" />
      </g>
      <path {...partProps('cust-ll-roof')} data-name="Teto / Parte Superior" d="M150,45 L350,45 L320,35 L180,35 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-ll-windows')} data-name="Lateral Superior (Área de Vidro)" d="M140,50 L360,50 L340,85 L160,85 Z" fill="url(#metal-glass)" opacity="0.75" />
      <path {...partProps('cust-ll-body-front')} data-name="Lateral Dianteira" d="M50,110 L250,110 L250,85 L80,85 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-ll-body-rear')} data-name="Lateral Traseira" d="M250,110 L450,110 L420,85 L250,85 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-ll-sill')} data-name="Saia / Parte Inferior" d="M150,145 L350,145 L350,153 L150,153 Z" fill="#1e293b" />
    </svg>
  )
}
