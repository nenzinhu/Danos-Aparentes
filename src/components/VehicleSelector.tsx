'use client';
import React, { memo } from 'react'
import { VehicleType } from '../types'

export const VEHICLES: { id: VehicleType; label: string; svgContent: string; viewBox: string }[] = [
  {
    id: 'car', label: 'Carro 4P', viewBox: '0 0 38 22',
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
    id: 'car2d', label: 'Carro 2P', viewBox: '0 0 38 22',
    svgContent: `
      <defs>
        <linearGradient id="vg2-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#44ccff"/>
          <stop offset="45%" stop-color="#0099ee"/>
          <stop offset="100%" stop-color="#0044aa"/>
        </linearGradient>
        <linearGradient id="vg2-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#aaf0ff" stop-opacity=".95"/>
          <stop offset="100%" stop-color="#00aadd" stop-opacity=".6"/>
        </linearGradient>
        <linearGradient id="vg2-wheel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#55ddff"/>
          <stop offset="100%" stop-color="#0055bb"/>
        </linearGradient>
      </defs>
      <ellipse cx="19" cy="19" rx="15" ry="2.2" fill="#00bbff" opacity=".2"/>
      <path d="M5 13.5 C5 13.5 8 6 12 5 L15 4 L23 4 L26 5 C30 6 33 13.5 33 13.5 L33 16 C33 17 32 17 31 17 L7 17 C6 17 5 17 5 16 Z" fill="url(#vg2-body)"/>
      <path d="M12 9 L18 6 L24 6 L27 9 Z" fill="white" opacity=".18"/>
      <path d="M10 9 L15 5.5 L23 5.5 L28 9 Z" fill="url(#vg2-glass)" opacity=".9"/>
      <path d="M6 12.5 L32 12.5" stroke="white" stroke-width="0.7" opacity=".22"/>
      <line x1="20" y1="9" x2="20" y2="17" stroke="white" stroke-width="0.6" opacity=".35"/>
      <circle cx="11" cy="17" r="3.6" fill="#050f24" stroke="url(#vg2-wheel)" stroke-width="2"/>
      <circle cx="11" cy="17" r="1.4" fill="#55ddff" opacity=".7"/>
      <circle cx="27" cy="17" r="3.6" fill="#050f24" stroke="url(#vg2-wheel)" stroke-width="2"/>
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
    id: 'microbus', label: 'Micro-ônibus', viewBox: '0 0 40 24',
    svgContent: `
      <defs>
        <linearGradient id="vg-mbus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#33ccff"/>
          <stop offset="55%" stop-color="#0077dd"/>
          <stop offset="100%" stop-color="#003399"/>
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="21" rx="15" ry="2" fill="#00bbff" opacity=".18"/>
      <rect x="5" y="5" width="30" height="14" rx="3" fill="url(#vg-mbus)"/>
      <path d="M6 6 L34 6" stroke="white" stroke-width="0.9" opacity=".22"/>
      <rect x="7" y="8" width="6" height="5" rx="1" fill="#aaf0ff" opacity=".6"/>
      <rect x="15" y="8" width="6" height="5" rx="1" fill="#aaf0ff" opacity=".55"/>
      <rect x="23" y="8" width="5" height="5" rx="1" fill="#aaf0ff" opacity=".5"/>
      <rect x="29" y="7" width="5" height="7" rx="1" fill="#aaf0ff" opacity=".5"/>
      <circle cx="12" cy="19" r="3.4" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="12" cy="19" r="1.3" fill="#55ddff" opacity=".7"/>
      <circle cx="28" cy="19" r="3.4" fill="#050f24" stroke="#33bbff" stroke-width="2"/>
      <circle cx="28" cy="19" r="1.3" fill="#55ddff" opacity=".7"/>
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
      className="block shrink-0 drop-shadow-[0_0_4px_#00ccff] brightness-[1.3]"
      style={{ width: size, height: size * 0.6 }}
      dangerouslySetInnerHTML={{ __html: v.svgContent }}
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
    <div className="relative flex bg-slate-950/80 border border-sky-500/20 rounded-[18px] p-[5px] gap-[3px] backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,100,200,0.12),inset_0_1px_0_rgba(255,255,255,0.04)] font-outfit">
      {/* sliding pill */}
      <div
        className="absolute top-[5px] h-[calc(100%-10px)] rounded-[13px] bg-gradient-to-br from-blue-800 via-blue-700 to-sky-700 shadow-[0_0_0_1px_rgba(0,210,255,0.4),0_4px_20px_rgba(0,160,255,0.55),0_0_30px_rgba(0,200,255,0.2)] transition-all duration-[0.38s] ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none z-0"
        style={{
          width: `calc((100% - 10px - (${numItems} - 1) * 3px) / ${numItems})`,
          left: `calc(5px + ${idx} * ((100% - 10px - (${numItems} - 1) * 3px) / ${numItems} + 3px))`
        }}
      />

      {VEHICLES.map((v, i) => {
        const isActive = current === v.id
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`relative z-10 bg-transparent border-none py-2 px-3 pb-[7px] rounded-[13px] cursor-pointer flex flex-col items-center gap-1.5 flex-1 transition-colors duration-200 min-w-0 ${
              isActive ? 'text-white' : 'text-slate-400'
            }`}
          >
            <svg
              viewBox={v.viewBox}
              xmlns="http://www.w3.org/2000/svg"
              className={`block shrink-0 transition-all duration-300 ${
                isActive
                  ? 'opacity-100 scale-110 -translate-y-0.5 filter brightness-[1.6] saturate-[1.4] drop-shadow-[0_0_4px_#00ccff] drop-shadow-[0_0_10px_rgba(0,210,255,0.85)]'
                  : 'opacity-40 filter saturate-[0.25] brightness-[0.65]'
              }`}
              style={{ width: 36, height: 21 }}
              dangerouslySetInnerHTML={{ __html: v.svgContent }}
            />
            <span className={`text-[0.7rem] font-bold tracking-tight uppercase whitespace-nowrap ${
              isActive ? 'drop-shadow-[0_0_8px_rgba(0,220,255,0.8)]' : ''
            }`}>
              {v.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(VehicleSelectorComponent)

