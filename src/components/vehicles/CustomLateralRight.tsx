'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { LateralWheelGraphic } from './WheelRim'

export default function CustomLateralRight({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)


  return (
    <svg viewBox="0 0 500 200" width="100%">
      <ellipse cx="250" cy="180" rx="200" ry="10" className="shadow-ground" />
      <LateralWheelGraphic cx={380} cy={140} r={28} />
      <LateralWheelGraphic cx={120} cy={140} r={28} />
      <path {...partProps('cust-lr-roof')} data-name="Teto / Parte Superior" d="M350,45 L150,45 L180,35 L320,35 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-lr-windows')} data-name="Lateral Superior (Área de Vidro)" d="M360,50 L140,50 L160,85 L340,85 Z" fill="url(#metal-glass)" opacity="0.75" />
      <path {...partProps('cust-lr-body-front')} data-name="Lateral Dianteira" d="M450,110 L250,110 L250,85 L420,85 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-lr-body-rear')} data-name="Lateral Traseira" d="M250,110 L50,110 L80,85 L250,85 Z" fill="url(#metal-car-blue)" />
      <path {...partProps('cust-lr-sill')} data-name="Saia / Parte Inferior" d="M350,145 L150,145 L150,153 L350,153 Z" fill="#1e293b" />
    </svg>
  )
}
