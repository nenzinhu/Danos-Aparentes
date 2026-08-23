'use client'

import Reveal from '../Reveal'
import { B2B_HERO_MICRO } from '@/src/lib/b2bPositioning'

export default function HeroMicroMessage() {
  return (
    <section
      id="micro-mensagem"
      className="w-full max-w-6xl mx-auto py-12 sm:py-14 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {B2B_HERO_MICRO.map((line, i) => (
            <span key={line} className="flex items-center gap-3">
              <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
                {line}
              </p>
              {i < B2B_HERO_MICRO.length - 1 && (
                <span aria-hidden className="hidden sm:inline text-[var(--signal-bright)] text-2xl font-black">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Inspeções isoladas viram a memória digital contínua e verificável do veículo.
        </p>
      </Reveal>
    </section>
  )
}
