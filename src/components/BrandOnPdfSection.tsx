'use client'

import { useRef } from 'react'
import Link from 'next/link'
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
 * Frames iguais + GSAP: "Seu logo aqui" entra no cabeçalho do laudo.
 */
export default function BrandOnPdfSection() {
  const rootRef = useRef<HTMLElement>(null)
  const logoChipRef = useRef<HTMLDivElement>(null)
  const pdfFrameRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])

  useGSAP(
    () => {
      const root = rootRef.current
      const chip = logoChipRef.current
      const pdfFrame = pdfFrameRef.current
      if (!root || !chip || !pdfFrame) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(chip, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 })
        gsap.set('.brand-pdf-copy > *', { autoAlpha: 1, y: 0 })
        gsap.set('.brand-pdf-title-word', { yPercent: 0, autoAlpha: 1 })
        const lines = lineRefs.current.filter(Boolean) as HTMLSpanElement[]
        gsap.set(lines, { autoAlpha: 0, y: 0 })
        if (lines[0]) gsap.set(lines[0], { autoAlpha: 1 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(chip, {
          autoAlpha: 0,
          scale: 0.72,
          x: -120,
          y: 40,
          rotate: -6,
        })
        gsap.set('.brand-pdf-kicker', { autoAlpha: 0, y: 12 })
        gsap.set('.brand-pdf-title-word', { yPercent: 110, autoAlpha: 0 })
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
          .to(
            '.brand-pdf-title-word',
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.7,
              stagger: 0.06,
              ease: 'power4.out',
            },
            0.1,
          )
          .to('.brand-pdf-sub', { autoAlpha: 1, y: 0, duration: 0.55 }, 0.35)

        // Chip "Seu logo aqui" voa da config e pousa no cabeçalho do PDF
        tl.to(
          chip,
          {
            autoAlpha: 1,
            scale: 1.08,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 0.85,
            ease: 'power2.out',
          },
          0.45,
        )
          .to(
            chip,
            {
              scale: 1,
              duration: 0.45,
              ease: 'back.out(1.6)',
            },
            '-=0.2',
          )
          .to(
            chip,
            {
              boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)',
              duration: 0.6,
            },
            '-=0.1',
          )

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

        // Leve “encaixe” no PDF: escala sutil do frame ao receber a marca
        tl.fromTo(
          pdfFrame,
          { scale: 1 },
          { scale: 1.015, duration: 0.35, yoyo: true, repeat: 1, ease: 'power1.inOut' },
          0.9,
        )
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  const titleWords = ['Seu', 'nome', 'e', 'sua', 'logo', 'no', 'PDF']

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

        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] max-w-4xl">
          <span className="inline-flex flex-wrap justify-center gap-x-[0.28em] overflow-hidden">
            {titleWords.map((word) => (
              <span key={word} className="brand-pdf-title-word inline-block">
                {word}
              </span>
            ))}
          </span>
          <span className="sr-only">: profissionalismo em cada entrega</span>
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
              <img
                src="/nom.png"
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
            <div ref={pdfFrameRef} className={`${FRAME_CLASS} bg-white`}>
              <img
                src="/pdf.png"
                alt="Exemplo de relatório de vistoria veicular em PDF com logo e nome da empresa no cabeçalho"
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain object-top p-2"
              />

              {/* Chip GSAP: "Seu logo aqui" pousa no cabeçalho do laudo */}
              <div
                ref={logoChipRef}
                className="pointer-events-none absolute z-10 left-[8%] top-[7%] sm:left-[10%] sm:top-[8%]"
                aria-hidden="true"
              >
                <div
                  className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-md border-2 border-[#3b82f6] bg-[#0b1220]/95 backdrop-blur-sm shadow-[0_0_28px_rgba(37,99,235,0.55)]"
                  style={{ boxShadow: '0 0 32px 4px rgba(37, 99, 235, 0.55)' }}
                >
                  <span
                    className="block font-display text-[11px] sm:text-sm font-black uppercase tracking-[0.12em] text-transparent"
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
          <figcaption className="px-4 py-3 text-[12px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]">
            A marca <strong className="text-[var(--text-main)]">entra no topo do PDF</strong> — diagrama,
            tabela, assinaturas e QR no mesmo padrão institucional.
          </figcaption>
        </figure>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <LandingCtaLink className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5">
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
