'use client'

import type { ViewType } from '@/src/types'
import { VIEW_TAB_SHORT } from '@/src/components/app/constants'
import { VIEW_PHOTO_ORDER } from '@/src/lib/viewPhotos'
import { canConfirmSideAssignments } from '@/src/lib/viewSideAssign'
import { ResolvedPhoto } from '@/src/components/ResolvedPhoto'
import Button from '@/src/components/ui/Button'
import { ButtonGroup } from '@/src/components/ui/ButtonGroup'

export type ConfirmItem = {
  photoRef: string
  view: ViewType | ''
  fromAi?: boolean
}

type Props = {
  items: ConfirmItem[]
  onChangeView: (photoRef: string, view: ViewType) => void
  onConfirm: () => void
  onRedo: () => void
  confirming?: boolean
}

export default function ViewSideConfirmPanel({
  items,
  onChangeView,
  onConfirm,
  onRedo,
  confirming = false,
}: Props) {
  const assignments = items
    .filter((i) => i.view)
    .map((i) => ({ photoRef: i.photoRef, view: i.view as ViewType }))
  const gate = canConfirmSideAssignments(assignments)
  const canConfirm = gate.ok && assignments.length === items.length && items.length > 0

  return (
    <div className="space-y-4">
      <div>
        <p className="ds-label">Assinale os lados</p>
        <p className="ds-caption mt-1">
          Para cada foto, escolha uma opção: Frontal, Traseira, Esquerda ou Direita. Cada lado só
          uma vez. Ao confirmar, a IA analisa as vistas em busca de avarias.
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
        {items.map((item, index) => (
          <li
            key={item.photoRef}
            className="rounded-2xl border border-[var(--card-border)] bg-black/[0.12] overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-black/40">
              <ResolvedPhoto
                refOrDataUrl={item.photoRef}
                alt={`Foto ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 text-[0.62rem] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white">
                Foto {index + 1}
              </span>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                Qual lado é esta foto?
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {VIEW_PHOTO_ORDER.map((view) => {
                  const selected = item.view === view
                  const takenByOther = items.some(
                    (o) => o.photoRef !== item.photoRef && o.view === view,
                  )
                  return (
                    <label
                      key={view}
                      className={`flex items-center gap-2 min-h-10 px-2.5 rounded-lg text-[0.75rem] font-bold border cursor-pointer transition-colors ${
                        selected
                          ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]'
                          : takenByOther
                            ? 'opacity-40 border-[var(--card-border)] text-[var(--text-muted)]'
                            : 'border-[var(--card-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        disabled={takenByOther && !selected}
                        onChange={() => onChangeView(item.photoRef, view)}
                      />
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                            : 'border-[var(--card-border)]'
                        }`}
                        aria-hidden="true"
                      >
                        {selected ? '✓' : ''}
                      </span>
                      <span>{VIEW_TAB_SHORT[view]}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!canConfirm && items.length > 0 && (
        <p className="text-xs text-[var(--signal)] font-semibold">
          {gate.ok ? 'Assinale o lado de todas as 4 fotos.' : gate.reason}
        </p>
      )}

      <ButtonGroup align="center" className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!canConfirm || confirming}
          onClick={onConfirm}
        >
          {confirming ? 'Confirmando…' : 'Confirmar lados e analisar avarias'}
        </Button>
        <Button type="button" variant="secondary" size="md" disabled={confirming} onClick={onRedo}>
          Refazer fotos
        </Button>
      </ButtonGroup>
    </div>
  )
}
