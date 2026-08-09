'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  text: string
  className?: string
  fontSize: number
}

/**
 * A tiny magnifying glass sweeps left-to-right over the text; each letter
 * sits miniature/dim until the lupa passes it, then pops to full size —
 * fast enough that the word still reads clearly mid-loop.
 */
export default function GsapLetterScanText({ text, className = '', fontSize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lupaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const lupa = lupaRef.current
    if (!container || !lupa) return

    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[]
    if (!letters.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(letters, { scale: 1, opacity: 1 })
      gsap.set(lupa, { autoAlpha: 0 })
      return
    }

    gsap.set(letters, { scale: 0.55, opacity: 0.4, transformOrigin: 'center bottom' })

    const perStep = 0.11
    const growDuration = 0.16
    const shrinkDuration = 0.28

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, defaults: { ease: 'power1.inOut' } })

    letters.forEach((letter, i) => {
      const center = letter.offsetLeft + letter.offsetWidth / 2
      const t = i * perStep
      tl.to(lupa, { x: center, duration: perStep }, t)
      tl.to(letter, { scale: 1, opacity: 1, duration: growDuration, ease: 'back.out(2.5)' }, t)
      tl.to(letter, { scale: 0.55, opacity: 0.4, duration: shrinkDuration, ease: 'power2.in' }, t + perStep * 0.85)
    })

    // reset the lupa to the start instantly right before the loop repeats
    tl.set(lupa, { x: 0 }, '>')

    return () => { tl.kill() }
  }, [text])

  let letterIndex = -1

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`} style={{ fontSize }}>
      <div
        ref={lupaRef}
        className="absolute pointer-events-none"
        style={{ width: fontSize * 0.85, height: fontSize * 0.85, top: '50%', marginTop: -(fontSize * 0.425), left: 0 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          <circle cx="15" cy="15" r="11" fill="none" stroke="url(#letter-lupa-rim)" strokeWidth="3.2" />
          <line x1="23.5" y1="23.5" x2="33" y2="33" stroke="url(#letter-lupa-rim)" strokeWidth="3.6" strokeLinecap="round" />
          <linearGradient id="letter-lupa-rim" x1="4" x2="33" y1="4" y2="33" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2FBCEE" offset="0" />
            <stop stopColor="#4D8AFE" offset="1" />
          </linearGradient>
        </svg>
      </div>
      {text.split('').map((ch, i) => {
        const isSpace = ch === ' '
        if (!isSpace) letterIndex++
        const idx = letterIndex
        return (
          <span
            key={i}
            ref={isSpace ? undefined : (el) => { letterRefs.current[idx] = el }}
            style={{ display: 'inline-block', whiteSpace: isSpace ? 'pre' : undefined }}
          >
            {ch}
          </span>
        )
      })}
    </div>
  )
}
