'use client';
import React, { memo } from 'react'
import { VehicleType } from '../types'

export const VEHICLES: { id: VehicleType; label: string; shortLabel: string; icon: string }[] = [
  { id: 'car', label: 'Carro 4P', shortLabel: '4P', icon: '/icons/vehicles/car.svg' },
  { id: 'car2d', label: 'Carro 2/3P', shortLabel: '2/3P', icon: '/icons/vehicles/car2d.svg' },
  { id: 'moto', label: 'Moto', shortLabel: 'Moto', icon: '/icons/vehicles/moto.svg' },
  { id: 'motoneta', label: 'Motoneta', shortLabel: 'Motoneta', icon: '/icons/vehicles/motoneta.svg' },
  { id: 'truck', label: 'Caminhão', shortLabel: 'Caminhão', icon: '/icons/vehicles/truck.svg' },
  { id: 'bus', label: 'Ônibus', shortLabel: 'Ônibus', icon: '/icons/vehicles/bus.svg' },
  { id: 'microbus', label: 'Micro-ônibus', shortLabel: 'Micro', icon: '/icons/vehicles/microbus.svg' },
  { id: 'van', label: 'Van', shortLabel: 'Van', icon: '/icons/vehicles/van.svg' },
]

const iconClass = (active: boolean) =>
  `block shrink-0 transition-all duration-300 object-contain ${
    active
      ? 'opacity-100 scale-110 -translate-y-0.5 brightness-[1.6] saturate-[1.4] drop-shadow-[0_0_4px_#00ccff] drop-shadow-[0_0_10px_rgba(0,210,255,0.85)]'
      : 'opacity-55 saturate-[0.45] brightness-[0.85]'
  }`

function VehicleTypeIcon({ type, active, size = 32 }: { type: VehicleType; active: boolean; size?: number }) {
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
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de veículo"
      className="theme-segment grid grid-cols-4 gap-1.5 bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-[18px] p-1.5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(0,100,200,0.08)] font-outfit w-full"
    >
      {VEHICLES.map(v => {
        const isActive = current === v.id
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={v.label}
            title={v.label}
            onClick={() => onChange(v.id)}
            className={`relative min-w-0 py-2 px-1 rounded-[13px] cursor-pointer flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 motion-reduce:active:scale-100 ${
              isActive
                ? 'theme-segment-active text-white bg-gradient-to-br from-blue-800 via-blue-700 to-sky-700 shadow-[0_0_0_1px_rgba(0,210,255,0.4),0_4px_16px_rgba(0,160,255,0.45)]'
                : 'theme-segment-idle text-[var(--text-muted)] bg-transparent hover:bg-white/[0.04]'
            }`}
          >
            <VehicleTypeIcon type={v.id} active={isActive} size={30} />
            <span
              className={`text-[0.62rem] sm:text-[0.68rem] font-bold tracking-tight uppercase leading-tight text-center truncate max-w-full ${
                isActive ? 'drop-shadow-[0_0_8px_rgba(0,220,255,0.8)]' : ''
              }`}
            >
              <span className="sm:hidden">{v.shortLabel}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(VehicleSelectorComponent)
