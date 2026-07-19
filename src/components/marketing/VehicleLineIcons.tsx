/** Silhuetas lineais profissionais para seletor de veículos na landing. */

import type { ReactElement, ReactNode } from 'react'
import type { VehicleType } from '@/src/types'

type IconProps = { size?: number; className?: string; active?: boolean }

function Frame({ size = 22, className = '', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function CarLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 12.5h24" />
      <path d="M6.5 12.5 9 7.5h9.5l4 5" />
      <path d="M9.2 7.5 11 5h6.2l2.2 2.5" />
      <circle cx="10" cy="13.2" r="1.7" />
      <circle cx="22.5" cy="13.2" r="1.7" />
      <path d="M14.5 7.6v4.2" />
    </Frame>
  )
}

export function Car2dLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 12.8h24" />
      <path d="M6 12.8 9.2 7.2h8.8l4.5 5.6" />
      <path d="M9.5 7.2 12.2 4.8h5.2l2.3 2.4" />
      <circle cx="10.5" cy="13.4" r="1.7" />
      <circle cx="21.5" cy="13.4" r="1.7" />
    </Frame>
  )
}

export function MotoLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <circle cx="8" cy="13.5" r="2.4" />
      <circle cx="24" cy="13.5" r="2.4" />
      <path d="M10.4 13.2h6.2l3.2-4.8h2.8" />
      <path d="M16.6 13.2 14.2 8.2h-2.4" />
      <path d="M14.2 8.2 16 5.8h3.2" />
      <path d="M20.2 8.4h3.2l1.2 2.4" />
    </Frame>
  )
}

export function TruckLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M3.5 13h16.5V6.2H3.5z" />
      <path d="M20 9.2h5.2l2.3 3.8H20z" />
      <path d="M22.2 9.2V7.4h2" />
      <circle cx="8.2" cy="13.6" r="1.7" />
      <circle cx="24.2" cy="13.6" r="1.7" />
      <path d="M11.5 6.2v6.8" />
    </Frame>
  )
}

export function VanLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 13.2h23.5V6.4H11.2L7.4 9.6H4z" />
      <path d="M11.2 6.4v6.8" />
      <path d="M16.5 6.4v6.8" />
      <circle cx="9.2" cy="13.8" r="1.6" />
      <circle cx="22.5" cy="13.8" r="1.6" />
    </Frame>
  )
}

export function BusLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4 14V6.2c0-.7.6-1.2 1.3-1.2h21.4c.7 0 1.3.5 1.3 1.2V14" />
      <path d="M4 10.2h24" />
      <path d="M8.5 5v5.2" />
      <path d="M13.5 5v5.2" />
      <path d="M18.5 5v5.2" />
      <path d="M23.5 5v5.2" />
      <circle cx="9" cy="14.2" r="1.5" />
      <circle cx="23" cy="14.2" r="1.5" />
    </Frame>
  )
}

export function MicrobusLineIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4.5 13.4h22.5V6.6H12L8.4 9.4H4.5z" />
      <path d="M12 6.6v6.8" />
      <path d="M17.2 6.6v6.8" />
      <path d="M21.8 6.6v6.8" />
      <circle cx="9.5" cy="13.9" r="1.55" />
      <circle cx="22.2" cy="13.9" r="1.55" />
    </Frame>
  )
}

const MAP: Partial<Record<VehicleType, (p: IconProps) => ReactElement>> = {
  car: CarLineIcon,
  car2d: Car2dLineIcon,
  moto: MotoLineIcon,
  motoneta: MotoLineIcon,
  truck: TruckLineIcon,
  van: VanLineIcon,
  bus: BusLineIcon,
  microbus: MicrobusLineIcon,
}

export function VehicleLineIcon({ type, size = 22, className = '' }: { type: VehicleType; size?: number; className?: string }) {
  const Comp = MAP[type] || CarLineIcon
  return <Comp size={size} className={className} />
}

export function ScratchIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 20 20 4" />
      <path d="M8 20 20 8" />
    </svg>
  )
}

export function DentIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c-3 4-6 6.5-6 10a6 6 0 0 0 12 0c0-3.5-3-6-6-10Z" />
    </svg>
  )
}

export function BrokenIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 3 4 6-5 3 6 9 1-7 5-2-5-9Z" />
    </svg>
  )
}
