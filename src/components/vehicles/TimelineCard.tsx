'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORY_STYLE } from '@/src/lib/audit/timelinePresent'
import { resolvePhotoUrl } from '@/src/lib/photoStore'
import { categoryGlyph, statusIcon, type StoryItem } from './vehicleHistoryStories'

function TimelineThumb({ photoRef }: { photoRef: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (photoRef.startsWith('data:') || /^https?:/i.test(photoRef)) {
          if (!cancelled) setUrl(photoRef)
          return
        }
        const resolved = await resolvePhotoUrl(photoRef)
        if (!cancelled && resolved) setUrl(resolved)
      } catch {
        if (!cancelled) setUrl(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [photoRef])

  if (!url) {
    return (
      <div
        className="h-14 w-14 rounded-lg border border-[var(--card-border)] bg-[var(--panel-bg)] animate-pulse"
        aria-hidden
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="h-14 w-14 rounded-lg object-cover border border-[var(--card-border)]/80 shadow-sm transition-transform duration-200 motion-safe:group-hover:scale-[1.02]"
    />
  )
}

export function SkeletonCards() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando histórico">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--card-border)]/60 bg-[var(--card-bg-solid)]/40 p-5 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-3 w-24 rounded bg-[var(--card-border)]/50 mb-3" />
          <div className="h-5 w-2/3 rounded bg-[var(--card-border)]/40 mb-2" />
          <div className="h-3 w-full rounded bg-[var(--card-border)]/30" />
        </div>
      ))}
    </div>
  )
}

export default function TimelineCard({
  item,
  isOpen,
  isLatest,
  onToggle,
}: {
  item: StoryItem
  isOpen: boolean
  isLatest: boolean
  onToggle: () => void
}) {
  const style = CATEGORY_STYLE[item.category]

  return (
    <li className="relative pl-14 sm:pl-16 pb-6 last:pb-0">
      {/* Marcador premium */}
      <span className="absolute left-2 sm:left-2.5 top-5 flex h-9 w-9 items-center justify-center">
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full bg-sky-400/25 blur-[6px] ${
            isLatest ? 'motion-safe:animate-pulse' : ''
          }`}
        />
        <span
          className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/40 ${style.iconBg} text-[12px] font-black shadow-[0_0_14px_rgba(56,189,248,0.35)] ring-[5px] ring-[var(--bg-main)] transition-transform duration-200 motion-safe:group-hover:scale-105`}
          title={style.label}
        >
          {categoryGlyph(item.category)}
        </span>
      </span>

      <article
        className={`group rounded-2xl border border-[var(--card-border)]/80 bg-[var(--card-bg-solid)]/90 p-4 sm:p-5 shadow-sm shadow-black/10 transition-[transform,box-shadow,border-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/30 ${style.ring} ring-1`}
      >
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
              >
                {style.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                <span aria-hidden>{statusIcon(item.status)}</span>
                {item.statusLabel}
              </span>
              {item.aiResultLabel && (
                <span className="inline-flex rounded-full border border-[var(--primary)]/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                  {item.aiResultLabel}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)] [text-wrap:balance]">
              {item.title}
            </h3>
            <time className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              {item.whenDate}
              {item.whenTime ? ` · ${item.whenTime}` : ''}
              {item.responsible ? ` · ${item.responsible}` : ''}
            </time>
          </div>
          <button
            type="button"
            className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-200"
            aria-expanded={isOpen}
            onClick={onToggle}
          >
            {isOpen ? 'Recolher' : 'Expandir'}
          </button>
        </header>

        {/* Badges de métricas do evento */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.photoCount != null && item.photoCount > 0 && (
            <span className="rounded-md border border-[var(--card-border)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
              {item.photoCount} foto{item.photoCount === 1 ? '' : 's'}
            </span>
          )}
          {item.damageCount != null && item.damageCount > 0 && (
            <span className="rounded-md border border-[var(--card-border)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
              {item.damageCount} dano{item.damageCount === 1 ? '' : 's'}
            </span>
          )}
          {item.evidenceCount != null && item.evidenceCount > 0 && (
            <span className="rounded-md border border-[var(--card-border)]/70 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
              {item.evidenceCount} evidência{item.evidenceCount === 1 ? '' : 's'}
            </span>
          )}
          {item.stageHint?.trim() ? (
            <span className="rounded-md border border-sky-500/25 bg-sky-500/5 px-2 py-0.5 text-[10px] font-bold text-sky-300/90">
              {item.stageHint.trim()}
            </span>
          ) : null}
        </div>

        {isOpen && (
          <div className="mt-3 space-y-3">
            {item.description && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {item.description}
              </p>
            )}

            {item.bullets.length > 0 && (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {item.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-[var(--text-main)]/90"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]/80" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {item.aiBlock &&
              (item.aiBlock.partName ||
                item.aiBlock.confidence ||
                item.aiBlock.severityLabel) && (
                <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300 mb-2">
                    ✦ Análise de IA
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    {item.aiBlock.partName
                      ? `Novo dano identificado · ${item.aiBlock.partName}`
                      : 'Novo dano identificado'}
                  </p>
                  <dl className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {item.aiBlock.confidence != null && (
                      <div>
                        <dt className="text-[var(--text-muted)]">Confiança</dt>
                        <dd className="font-bold text-violet-200">
                          {item.aiBlock.confidence}%
                        </dd>
                      </div>
                    )}
                    {item.aiBlock.severityLabel && (
                      <div>
                        <dt className="text-[var(--text-muted)]">Severidade</dt>
                        <dd className="font-bold">{item.aiBlock.severityLabel}</dd>
                      </div>
                    )}
                    {item.aiBlock.partName && (
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-[var(--text-muted)]">Componente</dt>
                        <dd className="font-bold">{item.aiBlock.partName}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-2 text-[11px] text-violet-200/80">
                    Comparado automaticamente.
                  </p>
                </div>
              )}

            {item.photoRefs && item.photoRefs.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Evidências
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.photoRefs.map((ref) => (
                    <TimelineThumb key={ref} photoRef={ref} />
                  ))}
                </div>
              </div>
            )}

            {item.href && item.actionLabel && (
              <div className="pt-1">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-colors duration-200"
                >
                  {item.actionLabel}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </article>
    </li>
  )
}
