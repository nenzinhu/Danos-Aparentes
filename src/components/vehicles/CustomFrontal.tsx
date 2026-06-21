'use client';
import { VehicleProps } from '../../types'

export default function CustomFrontal({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
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
      <path {...partProps('cust-f-glass')} data-name="Vidro Frontal / Parabrisa" d="M90,65 L310,65 L280,130 L120,130 Z" fill="url(#metal-glass)" opacity="0.8" />
      <path {...partProps('cust-f-top')} data-name="Frente Superior" d="M80,130 L320,130 L340,195 L60,195 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-f-grille')} data-name="Grade / Para-choque" d="M50,195 L350,195 L335,260 L65,260 Z" fill="#1e293b" />
      <rect {...partProps('cust-f-light-left')} data-name="Farol Esquerdo" x="65" y="200" width="40" height="20" rx="3" fill="#fef9c3" stroke="#1e293b" strokeWidth="1" />
      <rect {...partProps('cust-f-light-right')} data-name="Farol Direito" x="295" y="200" width="40" height="20" rx="3" fill="#fef9c3" stroke="#1e293b" strokeWidth="1" />
    </svg>
  )
}
