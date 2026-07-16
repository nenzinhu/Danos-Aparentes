'use client';
import React, { memo } from 'react'
import { VehicleType } from '../types'

export const VEHICLES: { id: VehicleType; label: string; icon: string }[] = [
  { id: 'car', label: 'Carro 4P', icon: '/icons/vehicles/car.svg' },
  { id: 'car2d', label: 'Carro 2/3P', icon: '/icons/vehicles/car2d.svg' },
  { id: 'moto', label: 'Moto', icon: '/icons/vehicles/moto.svg' },
  { id: 'motoneta', label: 'Motoneta', icon: '/icons/vehicles/moto.svg' },
  { id: 'truck', label: 'Caminhão', icon: '/icons/vehicles/truck.svg' },
  { id: 'bus', label: 'Ônibus', icon: '/icons/vehicles/bus.svg' },
  { id: 'microbus', label: 'Micro-ônibus', icon: '/icons/vehicles/microbus.svg' },
  { id: 'van', label: 'Van', icon: '/icons/vehicles/van.svg' },
]

const iconClass = (active: boolean) =>
  `block shrink-0 transition-all duration-300 object-contain ${
    active
      ? 'opacity-100 scale-110 -translate-y-0.5 brightness-[1.6] saturate-[1.4] drop-shadow-[0_0_4px_#00ccff] drop-shadow-[0_0_10px_rgba(0,210,255,0.85)]'
      : 'opacity-55 saturate-[0.45] brightness-[0.85]'
  }`

function VehicleTypeIcon({ type, active, size = 36 }: { type: VehicleType; active: boolean; size?: number }) {
  const v = VEHICLES.find(x => x.id === type) ?? VEHICLES[0]
  const height = Math.round(size * 0.58)
  return (
    <span
      role="img"
      aria-hidden
      className={iconClass(active)}
      style={{
        width: size,
        height,
        backgroundImage: `url(${v.icon})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
  )
}

export function VehicleIconSvg({ type, size = 28 }: { type: VehicleType; size?: number }) {
  const v = VEHICLES.find(x => x.id === type) ?? VEHICLES[0]
  const height = Math.round(size * 0.6)
  return (
    <span
      role="img"
      aria-hidden
      className="block shrink-0 drop-shadow-[0_0_4px_#00ccff] brightness-[1.3] object-contain"
      style={{
        width: size,
        height,
        backgroundImage: `url(${v.icon})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
  )
}

interface Props {
  current: VehicleType
  onChange: (v: VehicleType) => void
}

function VehicleSelectorComponent({ current, onChange }: Props) {
  const idx = Math.max(0, VEHICLES.findIndex(v => v.id === current))
  const numItems = VEHICLES.length

  return (
    <div className="theme-segment relative flex bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-[18px] p-[5px] gap-[3px] backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,100,200,0.08)] font-outfit">
      <div
        className="absolute top-[5px] h-[calc(100%-10px)] rounded-[13px] bg-gradient-to-br from-blue-800 via-blue-700 to-sky-700 shadow-[0_0_0_1px_rgba(0,210,255,0.4),0_4px_20px_rgba(0,160,255,0.55),0_0_30px_rgba(0,200,255,0.2)] transition-all duration-[0.38s] ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none z-0"
        style={{
          width: `calc((100% - 10px - (${numItems} - 1) * 3px) / ${numItems})`,
          left: `calc(5px + ${idx} * ((100% - 10px - (${numItems} - 1) * 3px) / ${numItems} + 3px))`,
        }}
      />

      {VEHICLES.map(v => {
        const isActive = current === v.id
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`relative z-10 bg-transparent border-none py-2 px-3 pb-[7px] rounded-[13px] cursor-pointer flex flex-col items-center gap-1.5 flex-1 transition-all duration-200 active:scale-90 motion-reduce:active:scale-100 min-w-0 ${
              isActive ? 'theme-segment-active text-white' : 'theme-segment-idle text-[var(--text-muted)]'
            }`}
          >
            <VehicleTypeIcon type={v.id} active={isActive} />
            <span
              className={`text-[0.7rem] font-bold tracking-tight uppercase whitespace-nowrap ${
                isActive ? 'drop-shadow-[0_0_8px_rgba(0,220,255,0.8)]' : ''
              }`}
            >
              {v.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(VehicleSelectorComponent)
