'use client';
import { VehicleProps } from '../../types'

export default function CustomTraseira({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
    <svg viewBox="0 0 400 300" width="100%">
      <ellipse cx="200" cy="275" rx="140" ry="10" className="shadow-ground" />
      <path {...partProps('cust-r-glass')} data-name="Vidro Traseiro" d="M90,65 L310,65 L280,130 L120,130 Z" fill="url(#metal-glass)" opacity="0.8" />
      <path {...partProps('cust-r-top')} data-name="Traseira Superior" d="M80,130 L320,130 L340,210 L60,210 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-r-bottom')} data-name="Traseira Inferior" d="M50,210 L350,210 L335,265 L65,265 Z" fill="#1e293b" />
      <rect {...partProps('cust-r-light-left')} data-name="Lanterna Esquerda" x="60" y="175" width="45" height="22" rx="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
      <rect {...partProps('cust-r-light-right')} data-name="Lanterna Direita" x="295" y="175" width="45" height="22" rx="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
    </svg>
  )
}
