'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Damage, VehicleInfo, ViewType } from '@/src/types'
import { VIEW_NAME } from '@/src/components/app/constants'
import { VIEW_PHOTO_ORDER, hasAllViewPhotos } from '@/src/lib/viewPhotos'
import { TYPE_LABEL } from '@/src/components/app/viewPhotosCaptureLogic'
import { ResolvedPhoto } from '@/src/components/ResolvedPhoto'
import { suggestViewDamageFromPhoto } from '@/src/lib/viewDamageSuggestClient'
import Button from '@/src/components/ui/Button'

type Props = {
  info: VehicleInfo
  damages: Damage[]
  accessToken?: string | null
  onToast?: (msg: string) => void
  onUseText?: (text: string) => void
}

const SEVERITY_PT: Record<string, string> = {
  low: 'leve',
  medium: 'moderada',
  high: 'grave',
}

/**
 * Aba "Análise das Fotografias": compõe um laudo textual das avarias a partir
 * das fotos dos 4 lados (já analisadas pela IA) e dos danos marcados no diagrama.
 */
export default function DamageTextGenerator({ info, damages, accessToken, onToast, onUseText }: Props) {
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')
  const viewPhotos = info.viewPhotos || {}
  const complete = hasAllViewPhotos(info)

  const damagesByView = useMemo(() => {
    const map: Partial<Record<ViewType, Damage[]>> = {}
    for (const d of damages) {
      if (d.view) (map[d.view] ||= []).push(d)
    }
    return map
  }, [damages])

  const buildText = useCallback(
    (extraByView?: Partial<Record<ViewType, { type: string; severity: string; description: string }>>) => {
      const lines: string[] = []
      lines.push('RELATÓRIO DE AVARIAS (ANÁLISE POR FOTOGRAFIA)')
      if (info.plate) lines.push(`Veículo: ${info.plate}${info.brand ? ` — ${info.brand}` : ''}`)
      lines.push('')

      let total = 0
      for (const view of VIEW_PHOTO_ORDER) {
        const labeled = damagesByView[view] || []
        const ai = extraByView?.[view]
        type Row = { partName: string; typeName: string; severity: string; notes?: string }
        const items: Row[] = labeled.map((d) => ({
          partName: d.partName,
          typeName: d.typeName || TYPE_LABEL[d.type] || d.type,
          severity: d.severity,
          notes: d.notes,
        }))
        if (ai && !labeled.length) {
          items.push({
            partName: VIEW_NAME[view],
            typeName: TYPE_LABEL[ai.type as Damage['type']] || ai.type,
            severity: ai.severity,
            notes: ai.description,
          })
        }
        if (!items.length) continue
        lines.push(`${VIEW_NAME[view].toUpperCase()}:`)
        for (const it of items) {
          total += 1
          const sev = SEVERITY_PT[String(it.severity)] || it.severity
          const desc = it.notes?.trim() ? ` — ${it.notes.trim()}` : ''
          lines.push(`• ${it.partName}: ${it.typeName?.toLowerCase() || it.typeName} (${sev})${desc}`)
        }
        lines.push('')
      }

      if (total === 0) {
        lines.push('Nenhuma avaria aparente identificada nas fotografias dos 4 lados.')
      } else {
        lines.push(`Total de avarias identificadas: ${total}.`)
      }
      return lines.join('\n').trim()
    },
    [damagesByView, info.brand, info.plate],
  )

  const handleGenerate = useCallback(async () => {
    if (!complete) {
      onToast?.('Capture e confirme as 4 fotos antes de gerar o texto.')
      return
    }
    setBusy(true)
    try {
      // Preenche com IA as vistas que ainda não têm dano marcado no diagrama.
      const extras: Partial<Record<ViewType, { type: string; severity: string; description: string }>> = {}
      for (const view of VIEW_PHOTO_ORDER) {
        if ((damagesByView[view]?.length ?? 0) > 0) continue
        const ref = viewPhotos[view]
        if (!ref) continue
        try {
          const s = await suggestViewDamageFromPhoto({ photoRef: ref, partName: VIEW_NAME[view], accessToken })
          if (s && !s.noDamage) extras[view] = { type: s.type, severity: s.severity, description: s.description }
        } catch {
          /* ignora vista individual que falhar */
        }
      }
      setText(buildText(extras))
      onToast?.('Texto de danos gerado a partir das fotografias.')
    } catch {
      onToast?.('Não foi possível gerar o texto agora.')
    } finally {
      setBusy(false)
    }
  }, [complete, damagesByView, viewPhotos, accessToken, buildText, onToast])

  return (
    <div className="glass-card p-5 sm:p-7 space-y-5">
      <div>
        <p className="ds-label">Análise das Fotografias</p>
        <p className="ds-h3 mt-0.5">Gerar texto de danos do veículo</p>
        <p className="ds-caption mt-1">
          As 4 fotos dos lados são lidas pela IA e transformadas em um laudo textual das avarias,
          pronto para copiar ou anexar ao dossiê.
        </p>
      </div>

      {/* Pré-visualização dos 4 lados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VIEW_PHOTO_ORDER.map((view) => {
          const ref = viewPhotos[view]
          const count = damagesByView[view]?.length ?? 0
          return (
            <div
              key={view}
              className="relative rounded-xl overflow-hidden aspect-[3/4] bg-black/40 ring-1 ring-[var(--card-border)]"
            >
              {ref ? (
                <ResolvedPhoto refOrDataUrl={ref} alt={VIEW_NAME[view]} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[0.62rem] font-bold text-[var(--text-muted)] px-2 text-center">
                  {VIEW_NAME[view]}
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 text-[0.6rem] font-bold bg-black/55 text-white px-1.5 py-0.5 rounded">
                {VIEW_NAME[view]} · {count} {count === 1 ? 'ava.' : 'ava.'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" size="md" onClick={handleGenerate} disabled={busy || !complete}>
          {busy ? 'Gerando…' : 'Gerar texto de danos'}
        </Button>
        {text && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                navigator.clipboard?.writeText(text)
                onToast?.('Texto copiado.')
              }}
            >
              Copiar
            </Button>
            {onUseText && (
              <Button type="button" variant="secondary" size="md" onClick={() => onUseText(text)}>
                Usar no dossiê
              </Button>
            )}
          </>
        )}
      </div>

      {text && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-48 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] p-3 text-[0.8rem] font-outfit leading-relaxed text-[var(--input-color)] outline-none focus:border-[var(--primary)]/50"
          placeholder="O texto das avarias aparece aqui…"
        />
      )}
    </div>
  )
}
