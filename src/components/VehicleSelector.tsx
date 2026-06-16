import { useRef, useLayoutEffect } from 'react'
import { VehicleType } from '../types'

export const VEHICLES: { id: VehicleType; label: string; svgContent: string; viewBox: string }[] = [
  {
    id: 'car', label: 'Carro', viewBox: '0 0 38 22',
    svgContent: `
      <defs>
        <linearGradient id="vg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#44ccff"/>
          <stop offset="45%" stop-color="#0099ee"/>
          <stop offset="100%" stop-color="#0044aa"/>
        </linearGradient>
        <linearGradient id="vg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#aaf0ff" stop-opacity=".95"/>
          <stop offset="100%" stop-color="#00aadd" stop-opacity=".6"/>
        </linearGradient>
        <linearGradient id="vg-wheel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#55ddff"/>
          <stop offset="100%" stop-color="#0055bb"/>
        </linearGradient>
      </defs>
      <ellipse cx="19" cy="19" rx="15" ry="2.2" fill="#00bbff" opacity=".2"/>
      <path d="M5 13.5 C5 13.5 8 6 12 5 L15 4 L23 4 L26 5 C30 6 33 13.5 33 13.5 L33 16 C33 17 32 17 31 17 L7 17 C6 17 5 17 5 16 Z" fill="url(#vg-body)"/>
      <path d="M13 9 L18 6 L24 6 L26 9 Z" fill="white" opacity=".18"/>
      <path d="M10 9 L15 5.5 L23 5.5 L28 9 Z" fill="url(#vg-glass)" opacity=".9"/>
      <path d="M6 12.5 L32 12.5" stroke="white" stroke-width="0.7" opacity=".22"/>
      <circle cx="11" cy="17" r="3.6" fill="#050f24" stroke="url(#vg-wheel)" stroke-width="2"/>
      <circle cx="11" cy="17" r="1.4" fill="#55ddff" opacity=".7"/>
      <circle cx="27" cy="17" r="3.6" fill="#050f24" stroke="url(#vg-wheel)" stroke-width="2"/>
      <circle cx="27" cy="17" r="1.4" fill="#55ddff" opacity=".7"/>
    `
  },
  {
    id: 'moto', label: 'Moto', viewBox: '0 0 38 24',
    svgContent: `
      <defs>
        <linearGradient id="vg-moto" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#55eeff"/>
          <stop offset="100%" stop-color="#0055cc"/>
        </linearGradient>
      </defs>
      <ellipse cx="19" cy="21" rx="14" ry="2" fill="#00bbff" opacity=".18"/>
      <circle cx="8" cy="17" r="5.2" fill="#050f24" stroke="url(#vg-moto)" stroke-width="2"/>
      <circle cx="8" cy="17" r="1.8" fill="#55eeff" opacity=".65"/>
      <circle cx="30" cy="17" r="5.2" fill="#050f24" stroke="url(#vg-moto)" stroke-width="2"/>
      <circle cx="30" cy="17" r="1.8" fill="#55eeff" opacity=".65"/>
      <path d="M8 17 L15 10 L21 8 L30 17" fill="none" stroke="url(#vg-moto)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M20 8 L24 5.5 L28 7.5" fill="none" stroke="#55eeff" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M13 12 L20 9 L25 11 L22 14 L14 14 Z" fill="#0088dd" opacity=".7"/>
      <path d="M14 11 L20 9 L23 10.5" stroke="white" stroke-width="0.7" opacity=".3" fill="none"/>
    `
  },
  {
    id: 'truck', label: 'Caminhão', viewBox: '0 0 44 24',
    svgContent: `
      <defs>
        <linearGradient id="vg-truck-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2299ee"/>
          <stop offset="100%" stop-color="#003399"/>
        </linearGradient>
        <linearGradient id="vg-truck-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#55ddff"/>
          <stop offset="100%" stop-color="#0066cc"/>
        </linearGradient>
      </defs>
      <ellipse cx="22" cy="21" rx="19" ry="2" fill="#00bbff" opacity=".18"/>
      <rect x="2" y="7" width="24" height="11" rx="1.5" fill="url(#vg-truck-box)"/>
      <line x1="2" y1="11" x2="26" y2="11" stroke="white" stroke-width="0.6" opacity=".2"/>
      <path d="M3 8 L25 8" stroke="white" stroke-width="0.8" opacity=".18"/>
      <path d="M26 10 L38 10 L38 18 L26 18 Z" fill="url(#vg-truck-cab)"/>
      <path d="M26 10 L33 6 L38 6 L38 10 Z" fill="#aaf0ff" opacity=".4"/>
      <path d="M27 11 L37 11" stroke="white" stroke-width="0.6" opacity=".2"/>
      <circle cx="8" cy="18" r="3.6" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="8" cy="18" r="1.4" fill="#55ddff" opacity=".7"/>
      <circle cx="19" cy="18" r="3.6" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="19" cy="18" r="1.4" fill="#55ddff" opacity=".7"/>
      <circle cx="34" cy="18" r="3.6" fill="#050f24" stroke="#55eeff" stroke-width="2"/>
      <circle cx="34" cy="18" r="1.4" fill="#55eeff" opacity=".7"/>
    `
  },
  {
    id: 'bus', label: 'Ônibus', viewBox: '0 0 40 24',
    svgContent: `
      <defs>
        <linearGradient id="vg-bus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#33ccff"/>
          <stop offset="55%" stop-color="#0077dd"/>
          <stop offset="100%" stop-color="#003399"/>
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="21" rx="16" ry="2" fill="#00bbff" opacity=".18"/>
      <rect x="2" y="4" width="36" height="15" rx="3.5" fill="url(#vg-bus)"/>
      <path d="M3 5 L37 5" stroke="white" stroke-width="0.9" opacity=".22"/>
      <rect x="4" y="7" width="7" height="5" rx="1" fill="#aaf0ff" opacity=".6"/>
      <rect x="13" y="7" width="7" height="5" rx="1" fill="#aaf0ff" opacity=".55"/>
      <rect x="22" y="7" width="7" height="5" rx="1" fill="#aaf0ff" opacity=".55"/>
      <rect x="31" y="7" width="5" height="5" rx="1" fill="#aaf0ff" opacity=".5"/>
      <circle cx="10" cy="19" r="3.6" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="10" cy="19" r="1.4" fill="#55ddff" opacity=".7"/>
      <circle cx="30" cy="19" r="3.6" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="30" cy="19" r="1.4" fill="#55ddff" opacity=".7"/>
    `
  },
  {
    id: 'van', label: 'Van', viewBox: '0 0 40 24',
    svgContent: `
      <defs>
        <linearGradient id="vg-van-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#33bbff"/>
          <stop offset="100%" stop-color="#004dbb"/>
        </linearGradient>
        <linearGradient id="vg-van-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#55eeff"/>
          <stop offset="100%" stop-color="#0077cc"/>
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="21" rx="16" ry="2" fill="#00bbff" opacity=".18"/>
      <rect x="2" y="6" width="30" height="12" rx="2.5" fill="url(#vg-van-body)"/>
      <path d="M3 7 L30 7" stroke="white" stroke-width="0.9" opacity=".2"/>
      <rect x="6" y="8.5" width="9" height="5.5" rx="1.2" fill="#aaf0ff" opacity=".55"/>
      <rect x="18" y="8.5" width="9" height="5.5" rx="1.2" fill="#aaf0ff" opacity=".5"/>
      <path d="M7 9.5 L14 9.5" stroke="white" stroke-width="0.8" opacity=".5"/>
      <path d="M19 9.5 L26 9.5" stroke="white" stroke-width="0.8" opacity=".45"/>
      <path d="M32 8.5 L37 8.5 L37 18 L32 18 Z" fill="url(#vg-van-cab)"/>
      <path d="M32 8.5 L37 8.5 L37 12 Z" fill="#aaf0ff" opacity=".35"/>
      <circle cx="10" cy="18" r="3.6" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="10" cy="18" r="1.4" fill="#55ddff" opacity=".7"/>
      <circle cx="26" cy="18" r="3.6" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="26" cy="18" r="1.4" fill="#55ddff" opacity=".7"/>
    `
  },
]

// Reusable icon component for card titles and other places
export function VehicleIconSvg({ type, size = 28 }: { type: VehicleType; size?: number }) {
  const v = VEHICLES.find(x => x.id === type) ?? VEHICLES[0]
  return (
    <svg
      viewBox={v.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size * 0.6, display: 'block', flexShrink: 0, filter: 'brightness(1.3) drop-shadow(0 0 4px #00ccff)' }}
      dangerouslySetInnerHTML={{ __html: v.svgContent }}
    />
  )
}

interface Props {
  current: VehicleType
  onChange: (v: VehicleType) => void
}

export default function VehicleSelector({ current, onChange }: Props) {
  const pillRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  function updatePill() {
    const idx = VEHICLES.findIndex(v => v.id === current)
    const btn = btnRefs.current[idx]
    const pill = pillRef.current
    if (btn && pill) {
      pill.style.transform = `translateX(${btn.offsetLeft - 5}px)`
      pill.style.width = `${btn.offsetWidth}px`
    }
  }

  useLayoutEffect(() => {
    updatePill()
  })

  return (
    <div style={{
      position: 'relative', display: 'flex',
      background: 'rgba(4,10,28,0.82)', border: '1px solid rgba(0,170,255,0.22)',
      borderRadius: 18, padding: 5, gap: 3,
      backdropFilter: 'blur(18px)', overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(0,100,200,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {/* sliding pill */}
      <div ref={pillRef} style={{
        position: 'absolute', top: 5, left: 5,
        height: 'calc(100% - 10px)', borderRadius: 13,
        background: 'linear-gradient(145deg,#0055bb,#0099ee 50%,#00ccff)',
        boxShadow: '0 0 0 1px rgba(0,210,255,0.4), 0 4px 20px rgba(0,160,255,0.55), 0 0 30px rgba(0,200,255,0.2)',
        transition: 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1), width 0.32s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {VEHICLES.map((v, i) => {
        const isActive = current === v.id
        return (
          <button
            key={v.id}
            ref={el => { btnRefs.current[i] = el }}
            onClick={() => onChange(v.id)}
            style={{
              position: 'relative', zIndex: 1,
              background: 'transparent', border: 'none',
              padding: '8px 12px 7px', borderRadius: 13,
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5, flex: 1,
              color: isActive ? '#ffffff' : 'rgba(180,210,240,0.62)',
              fontSize: '0.73rem', fontWeight: 800,
              letterSpacing: '0.02em',
              fontFamily: 'Outfit,sans-serif',
              textShadow: isActive ? '0 0 6px rgba(0,220,255,0.95), 0 0 14px rgba(0,180,255,0.7)' : 'none',
              whiteSpace: 'nowrap', minWidth: 0,
              transition: 'color 0.22s',
            }}
          >
            <svg
              viewBox={v.viewBox}
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: 36, height: 21, display: 'block', flexShrink: 0,
                opacity: isActive ? 1 : 0.42,
                filter: isActive
                  ? 'brightness(1.6) saturate(1.4) drop-shadow(0 0 4px #00ccff) drop-shadow(0 0 10px rgba(0,210,255,0.85))'
                  : 'saturate(0.25) brightness(0.65)',
                transform: isActive ? 'scale(1.14) translateY(-2px)' : 'none',
                transition: 'filter 0.28s ease, opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              dangerouslySetInnerHTML={{ __html: v.svgContent }}
            />
            <span>{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}
