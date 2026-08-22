'use client'

interface Vehicle {
  src: string
  label: string
}

interface Props {
  size?: number
  className?: string
  vehicles?: Vehicle[]
}

const DEFAULT_VEHICLES: Vehicle[] = [
  { src: '/vehicles-img/car.webp', label: 'Carro' },
  { src: '/vehicles-img/moto.webp', label: 'Moto' },
  { src: '/vehicles-img/truck.webp', label: 'Caminhão' },
  { src: '/vehicles-img/bus.webp', label: 'Ônibus' },
  { src: '/vehicles-img/van.webp', label: 'Van' },
]

/** All 8 categories from the vehicle-type selector, in the same order. */
export const SELECTOR_VEHICLES: Vehicle[] = [
  { src: '/icons/vehicles/car.svg', label: 'Carro 4P' },
  { src: '/icons/vehicles/car2d.svg', label: 'Carro 2/3P' },
  { src: '/icons/vehicles/moto.svg', label: 'Moto' },
  { src: '/icons/vehicles/motoneta.svg', label: 'Motoneta' },
  { src: '/icons/vehicles/truck.svg', label: 'Caminhão' },
  { src: '/icons/vehicles/bus.svg', label: 'Ônibus' },
  { src: '/icons/vehicles/microbus.svg', label: 'Micro-ônibus' },
  { src: '/icons/vehicles/van.svg', label: 'Van' },
]

/** Badge lupa estático — sem loop GSAP na landing. */
export default function LupaVehicleReveal({
  size = 76,
  className,
  vehicles = DEFAULT_VEHICLES,
}: Props) {
  const vehicle = vehicles[0] ?? DEFAULT_VEHICLES[0]

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 overflow-visible">
        <g style={{ transformOrigin: '42px 42px' }}>
          <circle cx="42" cy="42" r="34" fill="var(--bg-main)" stroke="url(#lupa-rim)" strokeWidth="5" />
          <circle cx="42" cy="42" r="34" fill="none" stroke="#0B1B30" strokeOpacity="0.25" strokeWidth="1" />
        </g>
        <line x1="66" y1="66" x2="90" y2="90" stroke="#0B1B30" strokeWidth="7" strokeLinecap="round" />
        <line x1="66" y1="66" x2="90" y2="90" stroke="url(#lupa-rim)" strokeWidth="4" strokeLinecap="round" />
        <linearGradient id="lupa-rim" x1="8" x2="76" y1="8" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FBCEE" offset="0" />
          <stop stopColor="#4D8AFE" offset="1" />
        </linearGradient>
      </svg>

      <div
        className="absolute rounded-full overflow-hidden"
        style={{ width: size * 0.68, height: size * 0.68, left: size * 0.08, top: size * 0.08 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vehicle.src}
          alt=""
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  )
}
