'use client'

import Link from 'next/link'
import Reveal from './Reveal'
import LandingCtaLink from './LandingCtaLink'

/**
 * Destaque na landing: nome + logo da empresa no PDF (white-label).
 * Usa os exemplos reais em /nom.png (configuração) e /pdf.png (laudo gerado).
 */
export default function BrandOnPdfSection() {
  return (
    <section
      id="marca-no-pdf"
      className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 z-10 relative border-t border-[var(--card-border)]/40 text-left scroll-mt-24"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-3">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Marca própria no laudo
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] max-w-4xl">
          Seu nome e sua logo no PDF:{' '}
          <span className="text-[var(--signal-bright)]">profissionalismo em cada entrega</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-2xl leading-relaxed">
          Configure a identidade da empresa uma vez. Todo laudo sai com cabeçalho white-label —
          organização visual que transmite método, não improviso.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        <Reveal>
          <figure className="h-full flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between gap-2">
              <span className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)] font-bold">
                01 · Configuração
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-semibold">Identidade da Empresa</span>
            </div>
            <div className="p-3 sm:p-4 bg-[var(--bg-main)]/40 flex-1 flex items-center justify-center">
              <img
                src="/nom.png"
                alt="Tela Identidade da Empresa: nome, logotipo, cor da marca e alinhamento no PDF"
                width={960}
                height={720}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-lg border border-[var(--card-border)]/60 object-contain"
              />
            </div>
            <figcaption className="px-4 py-3 text-[12px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]">
              Defina <strong className="text-[var(--text-main)]">nome</strong>,{' '}
              <strong className="text-[var(--text-main)]">logo</strong>, cor e alinhamento. A prévia do
              cabeçalho atualiza na hora.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={80}>
          <figure className="h-full flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between gap-2">
              <span className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)] font-bold">
                02 · Resultado
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-semibold">Laudo em PDF</span>
            </div>
            <div className="p-3 sm:p-4 bg-[var(--bg-main)]/40 flex-1 flex items-center justify-center">
              <img
                src="/pdf.png"
                alt="Exemplo de relatório de vistoria veicular em PDF com logo e nome da empresa no cabeçalho"
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
                className="w-full h-auto max-h-[520px] object-contain rounded-lg border border-[var(--card-border)]/60 bg-white"
              />
            </div>
            <figcaption className="px-4 py-3 text-[12px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--card-border)]">
              O PDF sai com a <strong className="text-[var(--text-main)]">sua marca no topo</strong>,
              diagrama de avarias, tabela técnica, assinaturas e QR de verificação.
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <Reveal delay={120} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <LandingCtaLink className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5">
          Personalizar meu laudo →
        </LandingCtaLink>
        <Link
          href="/blog/laudo-com-logo-da-empresa-no-pdf"
          className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Ler o guia: logo e nome no PDF →
        </Link>
      </Reveal>
    </section>
  )
}
