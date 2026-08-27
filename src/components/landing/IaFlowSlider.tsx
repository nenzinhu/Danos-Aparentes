'use client'
import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Reveal from '../Reveal'

const SLIDES = [
  {
    kind: 'image' as const,
    badge: 'INTELIGÊNCIA ARTIFICIAL',
    title: 'A IA é protagonista: de evidência a histórico em segundos',
    body: 'Analisa imagens, detecta danos, gera descrições e atualiza o histórico — com revisão humana e rastreabilidade completa.',
    image: '/landing/ia-sugestiva-confirma.webp',
    imageAlt:
      'Tela do app: IA sugere classificação de avaria (amassado grave na traseira) com opções Aceitar, Editar ou Ignorar',
  },
  {
    kind: 'step' as const,
    n: '01',
    title: 'Marque o dano',
    body: 'O responsável seleciona a área diretamente no diagrama do veículo.',
  },
  {
    kind: 'step' as const,
    n: '02',
    title: 'Anexe evidências',
    body: 'Fotos e documentos ficam vinculados ao dano e à Identidade do Veículo.',
  },
  {
    kind: 'step' as const,
    n: '03',
    title: 'A IA analisa',
    body: 'IA analisando imagens… Detectando danos… Gerando descrição…',
    quote: '“Possível amassado localizado na região central da porta dianteira direita.”',
  },
  {
    kind: 'step' as const,
    n: '04',
    title: 'Revisão humana',
    body: 'Aprova, edita ou rejeita. A inteligência acelera — a auditoria permanece humana.',
    actions: true,
  },
  {
    kind: 'step' as const,
    n: '05',
    title: 'Evidência validada',
    body: 'Porta dianteira direita · Amassado — entra no dossiê após confirmação.',
    validated: true,
  },
  {
    kind: 'step' as const,
    n: '06',
    title: 'Atualizando histórico...',
    body: 'O registro vira uma nova camada na Memória Digital do Veículo.',
  },
]

export default function IaFlowSlider() {
  const [index, setIndex] = useState(0)
  const total = SLIDES.length
  const wrapRef = useRef<HTMLDivElement>(null)

  const go = useCallback(
    (next: number) => {
      const clamped = (next + total) % total
      setIndex(clamped)
    },
    [total],
  )

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
    },
    [go, index],
  )

  const slide = SLIDES[index]

  return (
    <section
      id="ia-assistente"
      className="w-full z-10 relative border-t border-[var(--card-border)]/40 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--signal)_8%,transparent)_0%,transparent_50%)]"
    >
      <div className="max-w-6xl mx-auto py-20 px-6">
        <Reveal className="text-center mb-10 flex flex-col items-center">
          <p className="font-mono-data text-[12px] tracking-[0.28em] text-[var(--signal-bright)] uppercase mb-3">
            Inteligência · Análise de Imagens
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
            IA que acelera. Você continua no controle.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Analisa imagens, detecta danos, gera descrições e atualiza o histórico — com revisão
            humana e rastreabilidade completa.
          </p>
        </Reveal>

        <div
          ref={wrapRef}
          className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden"
          role="group"
          aria-roledescription="carousel"
          aria-label="Fluxo de análise por IA"
          onKeyDown={onKey}
          tabIndex={0}
        >
          <div className="min-h-[22rem] sm:min-h-[26rem] flex items-center">
            {slide.kind === 'image' ? (
              <div className="relative w-full aspect-[5992/3584] bg-[var(--bg-main)]">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  quality={92}
                  className="object-contain object-top"
                  sizes="(max-width: 1024px) 100vw, 640px"
                  priority={false}
                />
              </div>
            ) : (
              <div className="w-full px-8 py-12 flex flex-col items-center text-center">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)]">
                  {slide.n} · {slide.title}
                </p>
                <p className="mt-4 text-lg sm:text-xl text-[var(--text-main)] leading-relaxed max-w-xl">
                  {slide.body}
                </p>
                {'quote' in slide && slide.quote && (
                  <p className="mt-4 text-base text-[var(--text-main)] leading-relaxed italic max-w-lg">
                    {slide.quote}
                  </p>
                )}
                {'actions' in slide && slide.actions && (
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    {[
                      { label: 'Aprovar', cls: 'border-[var(--success)]/40 text-[var(--success)] bg-[var(--success)]/10' },
                      { label: 'Editar', cls: 'border-amber-500/40 text-[var(--signal)]' },
                      { label: 'Rejeitar', cls: 'border-[var(--severity-high)]/40 text-[var(--severity-high)]' },
                    ].map((b) => (
                      <span
                        key={b.label}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wide ${b.cls}`}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}
                {'validated' in slide && slide.validated && (
                  <p className="mt-4 text-xs font-bold text-[var(--success)]">Validado pelo vistoriador</p>
                )}
              </div>
            )}
          </div>

          {/* Controles */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Próximo slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label="Selecionar slide">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none ${
                  i === index ? 'bg-[var(--signal-bright)]' : 'bg-[var(--card-border)] hover:bg-[var(--text-muted)]'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          A análise da IA é uma sugestão de apoio à documentação. A confirmação final é sempre feita
          pelo vistoriador.
        </p>
      </div>
    </section>
  )
}
