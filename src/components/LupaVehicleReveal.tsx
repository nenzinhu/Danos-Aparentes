'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

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
  { src: '/vehicles-img/car.png', label: 'Carro' },
  { src: '/vehicles-img/moto.png', label: 'Moto' },
  { src: '/vehicles-img/truck.png', label: 'Caminhão' },
  { src: '/vehicles-img/bus.png', label: 'Ônibus' },
  { src: '/vehicles-img/van.png', label: 'Van' },
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

export default function LupaVehicleReveal({ size = 76, className, vehicles = DEFAULT_VEHICLES }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<SVGGElement>(null)
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const imgs = imgRefs.current.filter(Boolean) as HTMLImageElement[]
    if (!imgs.length) return

    gsap.set(imgs, { opacity: 0, scale: 0.55 })
    gsap.set(imgs[0], { opacity: 1, scale: 0.7 })

    const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'power2.inOut' } })

    imgs.forEach((img, i) => {
      const hold = 0.95
      tl.to(img, { scale: 1.08, duration: 0.55, ease: 'power3.out' }, `>`)
      tl.to(glassRef.current, { scale: 1.06, duration: 0.28, yoyo: true, repeat: 1, ease: 'power2.inOut' }, '<')
      tl.to({}, { duration: hold })

      const next = imgs[(i + 1) % imgs.length]
      tl.to(img, { opacity: 0, scale: 0.85, duration: 0.4 }, '>')
      tl.fromTo(next, { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 0.7, duration: 0.4 }, '<')
    })

    // Off-screen loops keep costing frames for nothing — pause the timeline
    // whenever the badge scrolls out of view and resume when it's back.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tl.play()
      else tl.pause()
    }, { threshold: 0 })
    if (rootRef.current) observer.observe(rootRef.current)

    return () => { observer.disconnect(); tl.kill() }
  }, [vehicles])

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 overflow-visible">
        <g ref={glassRef} style={{ transformOrigin: '42px 42px' }}>
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
        ref={lensRef}
        className="absolute rounded-full overflow-hidden"
        style={{ width: size * 0.68, height: size * 0.68, left: size * 0.08, top: size * 0.08 }}
      >
        {vehicles.map((v, i) => (
          <img
            key={`${v.src}-${i}`}
            ref={(el) => { imgRefs.current[i] = el }}
            src={v.src}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
          />
        ))}
      </div>
    </div>
  )
}
