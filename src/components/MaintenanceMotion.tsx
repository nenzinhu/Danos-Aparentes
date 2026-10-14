'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import styles from '@/src/app/maintenance.module.css'

export default function MaintenanceMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('[data-reveal]', {
          autoAlpha: 0,
          y: 22,
          duration: 0.85,
          stagger: 0.1,
        })
        .from('[data-title-line]', {
          autoAlpha: 0,
          yPercent: 110,
          rotateX: -18,
          transformOrigin: '50% 100%',
          duration: 1.05,
          stagger: 0.12,
        }, 0.18)

      gsap.to('[data-scanline]', {
        yPercent: 850,
        duration: 5.5,
        repeat: -1,
        ease: 'none',
      })
      gsap.to('[data-orb="primary"]', {
        xPercent: 12,
        yPercent: 8,
        scale: 1.08,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('[data-orb="signal"]', {
        xPercent: -10,
        yPercent: -12,
        scale: 0.92,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, root)

    return () => context.revert()
  }, [])

  return <div ref={rootRef} className={styles.maintenanceRoot} data-maintenance-root>{children}</div>
}
