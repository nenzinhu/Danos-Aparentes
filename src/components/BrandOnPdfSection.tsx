'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LandingCtaLink from './LandingCtaLink'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const FRAME_CLASS =
  'relative w-full h-[min(52vw,420px)] sm:h-[440px] rounded-lg border border-[var(--card-border)]/60 overflow-hidden bg-[var(--bg-main)]'

const PRO_LINES = [
  'Profissionalismo em cada entrega',
  'Organização que o cliente percebe',
  'Marca própria. Laudo institucional.',
]

/**
 * Destaque na landing: nome + logo da empresa no PDF (white-label).
 * Parte 2: "Seu logo aqui" no topo do laudo — pulsa, avança e volta em loop.
 */
export default function BrandOnPdfSection() {
  const rootRef = useRef<HTMLElement>(null)
  const logoChipRef = useRef<HTMLDivElement>(null)
  const logoInnerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])

  useGSAP(
    () => {
      const root = rootRef.current
      const chip = logoChipRef.current
      const inner = logoInnerRef.current
      if (!root || !chip || !inner) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(chip, { autoAlpha: 1, y: 0, scale: 1 })
        gsap.set('.brand-pdf-copy > *', { autoAlpha: 1, y: 0 })
        const lines = lineRefs.current.filter(Boolean) as HTMLSpanElement[]
        gsap.set(lines, { autoAlpha: 0, y: 0 })
        if (lines[0]) gsap.set(lines[0], { autoAlpha: 1 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(chip, { autoAlpha: 0, scale: 0.85, y: 18 })
        gsap.set('.brand-pdf-kicker', { autoAlpha: 0, y: 12 })
        // H2 permanece visível no HTML/DOM (SEO/AEO) — só anima subtítulo e chip
        gsap.set('.brand-pdf-sub', { autoAlpha: 0, y: 16 })
        gsap.set(lineRefs.current.filter(Boolean), { autoAlpha: 0, y: 10 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
          defaults: { ease: 'power3.out' },
        })

        tl.to('.brand-pdf-kicker', { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
          .to('.brand-pdf-sub', { autoAlpha: 1, y: 0, duration: 0.55 }, 0.2)
          .to(
            chip,
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.7,
              ease: 'back.out(1.5)',
            },
            0.4,
          )

        // Loop: pulsa + vem pra frente + retorna (cabeçalho do PDF)
        const loop = gsap.timeline({
          repeat: -1,
          defaults: { ease: 'sine.inOut' },
          delay: 1.15,
        })

        loop
          .to(chip, {
            scale: 1.18,
            y: -14,
            duration: 1.15,
          })
          .to(
            inner,
            {
              boxShadow: '0 0 40px 10px rgba(37, 99, 235, 0.75)',
              borderColor: '#60a5fa',
              duration: 1.15,
            },
            0,
          )
          .to(chip, {
            scale: 1,
            y: 0,
            duration: 1.15,
          })
          .to(
            inner,
            {
              boxShadow: '0 0 22px 4px rgba(37, 99, 235, 0.45)',
              borderColor: '#3b82f6',
              duration: 1.15,
            },
            '<',
          )
          .to({}, { duration: 0.35 })

        // Frases de profissionalismo em ciclo suave
        const lines = lineRefs.current.filter(Boolean) as HTMLSpanElement[]
        if (lines.length > 1) {
          gsap.set(lines[0], { autoAlpha: 1, y: 0 })
          const cycle = gsap.timeline({ repeat: -1, repeatDelay: 0.35, delay: 1.4 })
          for (let i = 0; i < lines.length; i++) {
            const cur = lines[i]
            const next = lines[(i + 1) % lines.length]
            cycle
              .to({}, { duration: 2.1 })
              .to(cur, { autoAlpha: 0, y: -8, duration: 0.4, ease: 'power2.in' })
              .fromTo(
                next,
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
                '-=0.12',
              )
          }
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="marca-no-pdf"
      className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 z-10 relative border-t border-[var(--card-border)]/40 text-left scroll-mt-24"
    >
      <div className="brand-pdf-copy text-center mb-12 flex flex-col items-center">
        <div className="brand-pdf-kicker inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-3">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Marca própria no laudo
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>

        <h2 className="brand-pdf-title font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] max-w-4xl">
          Seu nome e sua logo no PDF
          <span
            className="block mt-3 sm:mt-4 relative h-8 sm:h-10 overflow-hidden text-[var(--signal-bright)]"
            aria-hidden="true"
          >
            {PRO_LINES.map((line, i) => (
              <span
                key={line}
                ref={(el) => {
                  lineRefs.current[i] = el
                }}
                className="absolute inset-x-0 top-0 text-base sm:text-xl lg:text-2xl font-bold tracking-tight normal-case"
              >
                {line}
              </span>
            ))}
          </span>
        </h2>

        <p className="brand-pdf-sub text-sm sm:text-base text-[var(--text-muted)] mt-6 max-w-2xl leading-relaxed">
          Configure a identidade uma vez. A logo entra no cabeçalho do PDF — organização visual que
          transmite método, não improviso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        <figure className="h-full flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)] font-bold">
              01 · Configuração
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-semibold">Identidade da Empresa</span>
          </div>
          <div className="p-3 sm:p-4 flex-1 flex items-center justify-center">
            <div className={FRAME_CLASS}>
              <Image
                src="/identidade-empresa-config-pdf.webp"
                alt="Tela Identidade da Empresa: nome, logotipo, cor da marca e alinhamento no PDF"
                width={960}
                height={720}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain object-center p-2"
              />
            </div>
          </div>
          <figcaption className="px-4 py-3 text-[12px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]">
            Defina <strong className="text-[var(--text-main)]">nome</strong>,{' '}
            <strong className="text-[var(--text-main)]">logo</strong>, cor e alinhamento. A prévia do
            cabeçalho atualiza na hora.
          </figcaption>
        </figure>

        <figure className="h-full flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] overflow-hidden shadow-xl">
          <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)] font-bold">
              02 · Resultado
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-semibold">Laudo em PDF</span>
          </div>
          <div className="p-3 sm:p-4 flex-1 flex items-center justify-center">
            <div className={`${FRAME_CLASS} bg-white`}>
              <Image
                src="/exemplo-laudo-pdf-marca.webp"
                alt="Exemplo de relatório de vistoria veicular em PDF com logo e nome da empresa no cabeçalho"
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain object-top p-2"
              />

              {/* Wrapper fixa o centro; GSAP anima só o chip interno */}
              <div
                className="pointer-events-none absolute z-10 left-1/2 top-[5%] sm:top-[6%] -translate-x-1/2"
                aria-hidden="true"
              >
                <div ref={logoChipRef} className="will-change-transform">
                  <div
                    ref={logoInnerRef}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-md border-2 border-[#3b82f6] bg-[#0b1220]/95 backdrop-blur-sm"
                    style={{ boxShadow: '0 0 22px 4px rgba(37, 99, 235, 0.45)' }}
                  >
                    <span
                      className="block font-display text-[11px] sm:text-sm font-black uppercase tracking-[0.12em] text-transparent whitespace-nowrap"
                      style={{
                        WebkitTextStroke: '1.2px #60a5fa',
                        textShadow: '0 0 12px rgba(96, 165, 250, 0.65)',
                      }}
                    >
                      Seu logo aqui
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <figcaption className="px-4 py-3 text-[12px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]">
            No topo do PDF, a marca <strong className="text-[var(--text-main)]">pulsa e se destaca</strong>{' '}
            — como se a logo entrasse no laudo, pronta para a sua identidade.
          </figcaption>
        </figure>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <LandingCtaLink
          id="home-brand-pdf-cta"
          eventSource="home"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15"
        >
          Personalizar meu laudo →
        </LandingCtaLink>
        <Link
          href="/blog/laudo-com-logo-da-empresa-no-pdf"
          className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Ler o guia: logo e nome no PDF →
        </Link>
      </div>
    </section>
  )
}
