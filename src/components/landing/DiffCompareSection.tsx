'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Reveal from '../Reveal'

const PDF_FILE = '/landing/antes-depois-laudo.pdf'

type PdfPage = {
  /** 1-based page inside the unified PDF */
  pdfPage: number
  preview: string
  alt: string
  label: string
}

const ANTES_PAGES: PdfPage[] = [
  {
    pdfPage: 1,
    preview: '/landing/pdf-antes-p1-sm.webp',
    label: 'Página 1',
    alt: 'PDF de entrada página 1: veículo sem avarias, checklist, geo e fotos dos 4 lados',
  },
  {
    pdfPage: 2,
    preview: '/landing/pdf-antes-p2-sm.webp',
    label: 'Página 2',
    alt: 'PDF de entrada página 2: verificação digital com QR Code e hash SHA-256',
  },
]

const DEPOIS_PAGES: PdfPage[] = [
  {
    pdfPage: 3,
    preview: '/landing/pdf-depois-p1-sm.webp',
    label: 'Página 1',
    alt: 'PDF de retorno página 1: avaria grave na porta dianteira esquerda marcada no SVG',
  },
  {
    pdfPage: 4,
    preview: '/landing/pdf-depois-p2-sm.webp',
    label: 'Página 2',
    alt: 'PDF de retorno página 2: foto da avaria, assinaturas e verificação digital',
  },
]

function pdfPageUrl(page: number) {
  return `${PDF_FILE}#page=${page}`
}

export default function DiffCompareSection() {
  return (
    <section
      id="comparacao"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Comparação
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Saiba o que mudou entre duas vistorias.
        </h2>
        <p className="mt-4 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Identifique diferenças entre diferentes momentos do histórico do veículo — o PDF de entrada e o de retorno
          mostram o antes e o depois.
        </p>
        <a
          href={PDF_FILE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center px-5 rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)]/70 text-xs font-bold uppercase tracking-wide text-[var(--text-main)] hover:border-[var(--signal-bright)]/50 focus-visible:ring-2 ring-[var(--primary)] outline-none"
        >
          Abrir PDF completo
        </a>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Reveal>
          <PdfReportCarousel
            tone="antes"
            title="Relatório de entrada"
            badge="Sem avarias"
            pages={ANTES_PAGES}
            caption="PDF de entrada: identificação, checklist, geo e fotos dos 4 lados — zero danos."
          />
        </Reveal>
        <Reveal delay={80}>
          <PdfReportCarousel
            tone="depois"
            title="Relatório de retorno"
            badge="1 grave"
            pages={DEPOIS_PAGES}
            caption="PDF de retorno: alerta grave, SVG marcado, foto, assinaturas e QR."
          />
        </Reveal>
      </div>

      <Reveal delay={100} className="mt-8">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/5 px-5 py-5 sm:px-6">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-rose-400">O que mudou</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-main)]">
            Porta dianteira esquerda · Amassado / Deformado · Grave
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Na entrada não havia dano. No retorno, o laudo em PDF documenta a avaria nova com evidência fotográfica,
            assinaturas e verificação por QR / hash.
          </p>
        </div>
      </Reveal>
    </section>
  )
}

function PdfReportCarousel({
  tone,
  title,
  badge,
  pages,
  caption,
}: {
  tone: 'antes' | 'depois'
  title: string
  badge: string
  pages: PdfPage[]
  caption: string
}) {
  const [page, setPage] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const current = pages[page]
  const isAntes = tone === 'antes'

  const go = useCallback(
    (dir: -1 | 1) => {
      setPage((p) => (p + dir + pages.length) % pages.length)
    },
    [pages.length],
  )

  return (
    <article
      className={`rounded-2xl border overflow-hidden bg-[var(--panel-bg)]/40 ${
        isAntes ? 'border-emerald-500/25' : 'border-rose-500/30'
      }`}
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--card-border)]">
        <div>
          <p
            className={`font-mono-data text-[10px] uppercase tracking-[0.18em] ${
              isAntes ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isAntes ? 'Antes' : 'Depois'}
          </p>
          <h3 className="text-sm font-bold text-[var(--text-main)]">{title}</h3>
        </div>
        <span
          className={`shrink-0 rounded-lg border px-2.5 py-1 font-mono-data text-[9px] uppercase tracking-wider ${
            isAntes
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          }`}
        >
          {badge}
        </span>
      </header>

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--card-border)] bg-black/10">
        <button
          type="button"
          onClick={() => go(-1)}
          className="min-h-9 min-w-9 rounded-lg border border-[var(--card-border)] text-[var(--text-main)] text-sm font-bold hover:bg-white/5 focus-visible:ring-2 ring-[var(--primary)] outline-none"
          aria-label="Página anterior"
        >
          ‹
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Páginas do PDF">
          {pages.map((p, i) => (
            <button
              key={p.pdfPage}
              type="button"
              role="tab"
              aria-selected={i === page}
              onClick={() => setPage(i)}
              className={`min-h-9 px-3 rounded-lg border text-[11px] font-bold uppercase tracking-wide focus-visible:ring-2 ring-[var(--primary)] outline-none transition-colors ${
                i === page
                  ? isAntes
                    ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-300'
                    : 'border-rose-500/45 bg-rose-500/15 text-rose-300'
                  : 'border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          className="min-h-9 min-w-9 rounded-lg border border-[var(--card-border)] text-[var(--text-main)] text-sm font-bold hover:bg-white/5 focus-visible:ring-2 ring-[var(--primary)] outline-none"
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>

      {/* Native PDF viewer (desktop) */}
      <div className="relative hidden md:block w-full bg-[#525659] aspect-[3/4] sm:aspect-[4/5]">
        <iframe
          key={current.pdfPage}
          title={`${title} — ${current.label}`}
          src={pdfPageUrl(current.pdfPage)}
          className="absolute inset-0 w-full h-full border-0 bg-white"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="rounded-lg bg-black/75 px-2.5 py-1.5 font-mono-data text-[10px] uppercase tracking-wider text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={`Zoom — ${title} ${current.label}`}
          >
            Zoom
          </button>
          <a
            href={pdfPageUrl(current.pdfPage)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black/75 px-2.5 py-1.5 font-mono-data text-[10px] uppercase tracking-wider text-white"
          >
            Abrir PDF
          </a>
        </div>
      </div>

      {/* Preview WebP (mobile + fallback) */}
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="relative md:hidden block w-full bg-white aspect-[3/4] cursor-zoom-in group focus-visible:ring-2 ring-[var(--primary)] ring-inset outline-none"
        aria-label={`Toque para zoom — ${title} ${current.label}`}
      >
        <Image
          src={current.preview}
          alt={current.alt}
          fill
          quality={85}
          priority={page === 0}
          className="object-contain object-top"
          sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1200px) 45vw, 524px"
        />
        <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2.5 py-1.5 font-mono-data text-[10px] uppercase tracking-wider text-white">
          Toque para zoom · PDF
        </span>
      </button>

      <p className="px-4 py-3 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]">
        {caption}
      </p>

      {zoomOpen && (
        <PdfZoomLightbox
          pages={pages}
          initialIndex={page}
          onClose={() => setZoomOpen(false)}
          onPageChange={setPage}
        />
      )}
    </article>
  )
}

function PdfZoomLightbox({
  pages,
  initialIndex,
  onClose,
  onPageChange,
}: {
  pages: PdfPage[]
  initialIndex: number
  onClose: () => void
  onPageChange: (i: number) => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const page = pages[index]

  const setIndexSync = useCallback(
    (i: number) => {
      setIndex(i)
      onPageChange(i)
      setScale(1)
    },
    [onPageChange],
  )

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') {
        setIndex((i) => {
          const n = (i - 1 + pages.length) % pages.length
          onPageChange(n)
          setScale(1)
          return n
        })
      }
      if (e.key === 'ArrowRight') {
        setIndex((i) => {
          const n = (i + 1) % pages.length
          onPageChange(n)
          setScale(1)
          return n
        })
      }
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(4, Number((s + 0.25).toFixed(2))))
      if (e.key === '-' || e.key === '_') setScale((s) => Math.max(1, Number((s - 0.25).toFixed(2))))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onPageChange, pages.length])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Zoom do PDF"
      className="fixed inset-0 z-[99999] bg-black/95 flex flex-col"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          {pages.map((p, i) => (
            <button
              key={p.pdfPage}
              type="button"
              onClick={() => setIndexSync(i)}
              className={`min-h-10 px-3 rounded-lg border text-xs font-bold uppercase tracking-wide ${
                i === index
                  ? 'border-sky-400/50 bg-sky-500/20 text-sky-300'
                  : 'border-white/15 text-white/70 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(1, Number((s - 0.25).toFixed(2))))}
            className="min-h-10 min-w-10 rounded-lg border border-white/20 text-white text-lg font-bold"
            aria-label="Diminuir zoom"
          >
            −
          </button>
          <span className="font-mono-data text-xs text-white/80 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(4, Number((s + 0.25).toFixed(2))))}
            className="min-h-10 min-w-10 rounded-lg border border-white/20 text-white text-lg font-bold"
            aria-label="Aumentar zoom"
          >
            +
          </button>
          <a
            href={pdfPageUrl(page.pdfPage)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-10 px-3 rounded-lg border border-white/20 text-xs font-bold uppercase tracking-wide text-white/90 hover:bg-white/10"
          >
            Abrir PDF
          </a>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 min-w-10 rounded-lg border border-white/20 text-white text-xl"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto overscroll-contain p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="min-h-full flex items-start justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.preview}
            alt={page.alt}
            width={1787}
            height={2525}
            loading="lazy"
            decoding="async"
            className="max-w-none origin-top rounded-md shadow-2xl bg-white select-none"
            style={{
              width: `${Math.round(1100 * scale)}px`,
              height: 'auto',
            }}
            draggable={false}
          />
        </div>
      </div>
      <p className="shrink-0 text-center py-2 font-mono-data text-[10px] uppercase tracking-wider text-white/50">
        Scroll · + / − · Esc · PDF nativo em Abrir PDF
      </p>
    </div>
  )
}
