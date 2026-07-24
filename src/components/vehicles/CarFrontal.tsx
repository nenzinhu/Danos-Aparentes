'use client';
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'
import { FrontalWheelGraphic } from './WheelRim'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(DrawSVGPlugin)
}

export default function CarFrontal({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover, { motion: 'pro' })
  const svgRef = useRef<SVGSVGElement>(null)

  // One-shot professional entrance: parts rise in, outline draws once.
  useEffect(() => {
    const root = svgRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const parts = root.querySelectorAll<SVGElement>('.part')
    if (!parts.length) return

    const strokable = Array.from(parts).flatMap(part => {
      if (part.tagName.toLowerCase() === 'g') {
        return Array.from(part.querySelectorAll<SVGElement>('path, rect, circle, ellipse, polygon'))
          .filter(t => t.getAttribute('pointer-events') !== 'none')
      }
      return [part]
    })

    const ctx = gsap.context(() => {
      gsap.set(parts, { transformOrigin: '50% 50%', transformBox: 'fill-box' })

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from(parts, {
        autoAlpha: 0,
        y: 10,
        scale: 0.97,
        duration: 0.45,
        stagger: 0.04,
      })

      if (strokable.length) {
        tl.fromTo(
          strokable,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            duration: 0.7,
            stagger: 0.03,
            ease: 'power2.inOut',
            onComplete: () => gsap.set(strokable, { clearProps: 'strokeDasharray,strokeDashoffset' }),
          },
          '-=0.25',
        )
      }
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <svg ref={svgRef} viewBox="0 0 400 300" width="100%">
      {/* Sombra projetada */}
      <ellipse cx="200" cy="275" rx="160" ry="12" fill="#000" opacity="0.35" filter="url(#shadow-filter)" />

      {/* Pneus dianteiros visíveis */}
      <FrontalWheelGraphic x={42} y={210} width={26} height={60} />
      <FrontalWheelGraphic x={332} y={210} width={26} height={60} />

      {/* Teto (Visualização Frontal) */}
      <path d="M120,60 L280,60 C280,60 250,30 200,30 C150,30 120,60 120,60 Z" fill="url(#metal-car-blue)" opacity="0.95" stroke="#1e293b" />

      {/* Parabrisa com reflexo degradê e limpadores de parabrisa */}
      <path {...partProps('car-f-windshield')} data-name="Parabrisa" d="M108,62 L292,62 L268,128 L132,128 Z" fill="url(#metal-glass)" opacity="0.85" stroke="#0f172a" strokeWidth="1.5" />
      {/* Limpadores de Parabrisa */}
      <g pointerEvents="none" stroke="#000" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <line x1="160" y1="124" x2="210" y2="105" />
        <line x1="220" y1="124" x2="270" y2="105" />
      </g>

      {/* Capô Musculoso com Vincos Aerodinâmicos */}
      <path {...partProps('car-f-hood')} data-name="Capô" d="M102,128 L298,128 L328,198 C328,198 250,210 200,210 C150,210 72,198 72,198 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      {/* Vincos no capô */}
      <path d="M142,128 C145,150 162,185 178,198" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none" pointerEvents="none" />
      <path d="M143,128 C146,150 163,185 179,198" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" pointerEvents="none" />
      <path d="M258,128 C255,150 238,185 222,198" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none" pointerEvents="none" />
      <path d="M257,128 C254,150 237,185 221,198" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" pointerEvents="none" />

      {/* Faróis com DRL (Luz de LED) e Lente Projetora */}
      {/* Esquerdo */}
      <g {...partProps('car-f-headlight-left')} data-name="Farol Esquerdo">
        <path d="M72,198 L122,205 L118,218 L68,208 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <path d="M74,200 L120,206 L116,215 L70,209 Z" fill="#e2e8f0" opacity="0.9" pointerEvents="none" />
        <circle cx="82" cy="205" r="5" fill="#fef08a" filter="drop-shadow(0px 0px 3px #fef08a)" pointerEvents="none" />
        <circle cx="102" cy="209" r="4" fill="#60a5fa" filter="drop-shadow(0px 0px 2px #60a5fa)" pointerEvents="none" />
        <path d="M75,207 Q95,212 114,209" fill="none" stroke="#fff" strokeWidth="1.5" pointerEvents="none" />
      </g>
      {/* Direito */}
      <g {...partProps('car-f-headlight-right')} data-name="Farol Direito">
        <path d="M328,198 L278,205 L282,218 L332,208 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <path d="M326,200 L280,206 L284,215 L330,209 Z" fill="#e2e8f0" opacity="0.9" pointerEvents="none" />
        <circle cx="318" cy="205" r="5" fill="#fef08a" filter="drop-shadow(0px 0px 3px #fef08a)" pointerEvents="none" />
        <circle cx="298" cy="209" r="4" fill="#60a5fa" filter="drop-shadow(0px 0px 2px #60a5fa)" pointerEvents="none" />
        <path d="M325,207 Q305,212 286,209" fill="none" stroke="#fff" strokeWidth="1.5" pointerEvents="none" />
      </g>

      {/* Grade Esportiva Colmeia (Honey Grille) com Emblema Central */}
      <g {...partProps('car-f-grille')} data-name="Grade Dianteira">
        <rect x="126" y="200" width="148" height="28" rx="4" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
        <path d="M130,204 L270,204 M130,210 L270,210 M130,216 L270,216 M130,222 L270,222" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" pointerEvents="none" />
        <circle cx="200" cy="214" r="5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" pointerEvents="none" />
        <circle cx="200" cy="214" r="2" fill="#cbd5e1" pointerEvents="none" />
      </g>

      {/* Para-choque Dianteiro Aerodinâmico com Entradas de Ar e Faróis de Milha */}
      <path {...partProps('car-f-bumper')} data-name="Para-choque Dianteiro" d="M64,208 C80,212 120,226 126,228 L274,228 C280,226 320,212 336,208 L348,228 C340,255 310,268 200,268 C90,268 60,255 52,228 Z" fill="url(#metal-car-blue)" stroke="#1e293b" strokeWidth="1" />
      {/* Entrada de ar inferior */}
      <rect x="135" y="238" width="130" height="18" rx="3" fill="#090d16" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" pointerEvents="none" />
      {/* Faróis de Milha Esquerda/Direita */}
      <circle cx="95" cy="245" r="4" fill="#0f172a" pointerEvents="none" />
      <circle cx="95" cy="245" r="2.5" fill="#e2e8f0" opacity="0.9" pointerEvents="none" />
      <circle cx="305" cy="245" r="4" fill="#0f172a" pointerEvents="none" />
      <circle cx="305" cy="245" r="2.5" fill="#e2e8f0" opacity="0.9" pointerEvents="none" />

      {/* Retrovisores Dianteiros com Setas Visíveis */}
      <path {...partProps('car-f-mirror-left')} data-name="Retrovisor Esquerdo" d="M96,98 L60,98 C52,98 48,92 52,86 L94,92 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <rect x="56" y="91" width="15" height="2" rx="1" fill="#fbbf24" pointerEvents="none" />

      <path {...partProps('car-f-mirror-right')} data-name="Retrovisor Direito" d="M304,98 L340,98 C348,98 352,92 348,86 L306,92 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <rect x="329" y="91" width="15" height="2" rx="1" fill="#fbbf24" pointerEvents="none" />
    </svg>
  )
}
