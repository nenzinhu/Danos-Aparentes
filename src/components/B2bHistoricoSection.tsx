'use client'

import Link from 'next/link'
import { B2B_CATEGORY_SHORT, B2B_TRIAL_CTA, type B2bVertical } from '@/src/lib/b2bPositioning'
import LandingCtaLink from '@/src/components/LandingCtaLink'
import { buttonVariants } from '@/src/components/ui/Button'

export type { B2bVertical }

const COPY: Record<
  B2bVertical,
  { beforeTitle: string; afterTitle: string; beforeNote: string; afterNote: string; headline: string; sub: string }
> = {
  locadoras: {
    headline: 'Linha do tempo por placa: retirada × devolução no mesmo padrão',
    sub: 'A plataforma compara o estado do carro entre as duas inspeções — não uma foto solta no WhatsApp.',
    beforeTitle: 'Retirada',
    afterTitle: 'Devolução',
    beforeNote: 'Estado registrado no ato da entrega ao cliente',
    afterNote: 'Mesmas peças, mesmas vistas — diferença fica evidente',
  },
  oficinas: {
    headline: 'Linha do tempo por placa: entrada × saída da oficina',
    sub: 'Compare o que já estava avariado na entrada com o estado na entrega do serviço.',
    beforeTitle: 'Entrada',
    afterTitle: 'Saída',
    beforeNote: 'Avarias pré-existentes marcadas no diagrama',
    afterNote: 'Cliente assina o mesmo padrão visual',
  },
  frotas: {
    headline: 'Linha do tempo veicular: estado da frota ao longo do tempo',
    sub: 'Cada placa acumula inspeções comparáveis — sem planilha solta por motorista.',
    beforeTitle: 'Inspeção anterior',
    afterTitle: 'Inspeção atual',
    beforeNote: 'Snapshot anterior do mesmo veículo',
    afterNote: 'Diferenças destacadas no mesmo diagrama',
  },
  seguradoras: {
    headline: 'Cadeia de evidências: do prévio ao sinistro',
    sub: 'Dossiê verificável + linha do tempo veicular — contexto para avaria pré-existente.',
    beforeTitle: 'Inspeção prévia',
    afterTitle: 'Após sinistro',
    beforeNote: 'Hash + QR no momento da contratação',
    afterNote: 'Compare estados com prova documental forte',
  },
}

/** Peças ilustrativas (marketing) — não são dados reais de cliente. */
const MOCK_PARTS = [
  { id: 'porta-de', label: 'Porta D/E', before: 'ok' as const, after: 'medio' as const },
  { id: 'paralama-de', label: 'Paralama D/E', before: 'leve' as const, after: 'leve' as const },
  { id: 'para-choque-t', label: 'Para-choque T', before: 'ok' as const, after: 'grave' as const },
]

function SeverityDot({ level }: { level: 'ok' | 'leve' | 'medio' | 'grave' }) {
  const color =
    level === 'ok'
      ? 'bg-[var(--success)]/80'
      : level === 'leve'
        ? 'bg-[var(--signal)]'
        : level === 'medio'
          ? 'bg-orange-500'
          : 'bg-[var(--severity-high)]'
  const label = level === 'ok' ? 'OK' : level === 'leve' ? 'Leve' : level === 'medio' ? 'Média' : 'Grave'
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
      <span className={`w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
      {label}
    </span>
  )
}

export default function B2bHistoricoSection({
  vertical,
  showProductLink = true,
}: {
  vertical: B2bVertical
  /** Link para a landing /historico (desligar na própria página). */
  showProductLink?: boolean
}) {
  const c = COPY[vertical]

  return (
    <section
      className="mt-16 sm:mt-20 mb-4"
      aria-labelledby={`historico-heading-${vertical}`}
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
          {B2B_CATEGORY_SHORT}
        </p>
        <h2
          id={`historico-heading-${vertical}`}
          className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-snug"
        >
          {c.headline}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">{c.sub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch max-w-4xl mx-auto">
        <article className="glass-card border border-[var(--card-border)]/50 p-5 sm:p-6 flex flex-col">
          <header className="mb-4">
            <p className="text-[10px] font-mono-data uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Antes
            </p>
            <h3 className="font-display text-lg font-bold mt-1">{c.beforeTitle}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">{c.beforeNote}</p>
          </header>
          <ul className="space-y-3 flex-1">
            {MOCK_PARTS.map(p => (
              <li
                key={`b-${p.id}`}
                className="flex items-center justify-between gap-3 border-b border-[var(--card-border)]/30 pb-2"
              >
                <span className="text-sm font-medium text-[var(--text-main)]">{p.label}</span>
                <SeverityDot level={p.before} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] text-[var(--text-muted)] font-mono-data">
            Exemplo ilustrativo · placa ABC1D23
          </p>
        </article>

        <div
          className="hidden md:flex flex-col items-center justify-center px-1"
          aria-hidden="true"
        >
          <span className="text-[var(--signal-bright)] text-2xl font-bold">→</span>
          <span className="text-[9px] font-mono-data uppercase tracking-wider text-[var(--text-muted)] mt-2">
            Compara
          </span>
        </div>

        <div className="md:hidden text-center text-[var(--signal-bright)] text-sm font-bold py-1" aria-hidden="true">
          ↓ Compara
        </div>

        <article className="glass-card border border-[var(--signal-bright)]/35 p-5 sm:p-6 flex flex-col ring-1 ring-[var(--signal-bright)]/15">
          <header className="mb-4">
            <p className="text-[10px] font-mono-data uppercase tracking-[0.16em] text-[var(--signal-bright)]">
              Depois
            </p>
            <h3 className="font-display text-lg font-bold mt-1">{c.afterTitle}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">{c.afterNote}</p>
          </header>
          <ul className="space-y-3 flex-1">
            {MOCK_PARTS.map(p => (
              <li
                key={`a-${p.id}`}
                className="flex items-center justify-between gap-3 border-b border-[var(--card-border)]/30 pb-2"
              >
                <span className="text-sm font-medium text-[var(--text-main)]">{p.label}</span>
                <SeverityDot level={p.after} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] text-[var(--text-muted)] font-mono-data">
            Diferenças no mesmo padrão de diagrama
          </p>
        </article>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <LandingCtaLink
          id={`${vertical}-historico-cta`}
          eventSource={vertical}
          className={buttonVariants({ variant: 'primary', size: 'md' })}
        >
          {B2B_TRIAL_CTA}
        </LandingCtaLink>
        <Link
          href="/app/vehicles"
          className={buttonVariants({ variant: 'secondary', size: 'md' })}
        >
          Ver histórico no app →
        </Link>
        {showProductLink && (
          <Link
            href="/historico"
            className="text-xs font-bold text-[var(--primary)] hover:underline sm:ml-1"
          >
            O que é o histórico?
          </Link>
        )}
      </div>
    </section>
  )
}
