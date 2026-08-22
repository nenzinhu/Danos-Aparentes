'use client'

import type { Damage, ViewType } from '@/src/types'
import { VIEW_NAME, VIEW_TAB_SHORT } from '@/src/components/app/constants'
import { VIEW_PHOTO_ORDER } from '@/src/lib/viewPhotos'
import { ResolvedPhoto } from '@/src/components/ResolvedPhoto'
import PhotoAttachButtons from '@/src/components/PhotoAttachButtons'
import ViewDamageTagPanel from '@/src/components/app/ViewDamageTagPanel'
import { IconCamera } from '@/src/components/ui/AnimatedIcons'
import { buttonVariants } from '@/src/components/ui/buttonVariants'

export interface ViewPhotoCardProps {
  view: ViewType
  src?: string
  active: boolean
  replacing: boolean
  compact?: boolean
  tags: Damage[]
  analyzingView: ViewType | null
  busyView: ViewType | null
  decidedByName?: string
  onUpdateDamage?: (id: string, patch: Partial<Damage>) => void
  onReanalyze: (view: ViewType) => void
  onRequestReplace: (view: ViewType) => void
  onCancelReplace: () => void
  onRemove: (view: ViewType) => void
  onFile: (view: ViewType, file: File) => void
  onChangeView: (fromView: ViewType, toView: ViewType) => void
}

export default function ViewPhotoCard({
  view,
  src,
  active,
  replacing,
  compact,
  tags,
  analyzingView,
  busyView,
  decidedByName,
  onUpdateDamage,
  onReanalyze,
  onRequestReplace,
  onCancelReplace,
  onRemove,
  onFile,
  onChangeView,
}: ViewPhotoCardProps) {
  return (
    <div
      key={view}
      className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
        active
          ? 'ring-2 ring-[var(--primary)]/50'
          : src
            ? 'ring-1 ring-emerald-500/30'
            : 'ring-1 ring-[var(--card-border)]'
      }`}
    >
      {src && !replacing ? (
        <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-black/40">
          <ResolvedPhoto
            refOrDataUrl={src}
            alt={VIEW_NAME[view]}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <p className="text-[0.65rem] font-bold text-white/90 truncate">{VIEW_NAME[view]}</p>
          </div>
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            <button
              type="button"
              title="Reanalisar avarias nesta foto"
              disabled={analyzingView !== null}
              onClick={() => onReanalyze(view)}
              className="min-w-8 min-h-8 rounded-lg bg-black/55 text-sky-300 text-sm font-bold disabled:opacity-40"
              aria-label={`Reanalisar ${VIEW_NAME[view]}`}
            >
              {analyzingView === view ? '…' : '↻'}
            </button>
            <button
              type="button"
              onClick={() => onRequestReplace(view)}
              className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
                className: '!min-h-8 !px-2 !py-1 !text-[0.65rem] bg-black/55 text-white hover:text-white rounded-lg',
              })}
            >
              Substituir
            </button>
            <button
              type="button"
              onClick={() => onRemove(view)}
              className="min-w-8 min-h-8 rounded-lg bg-black/55 text-white text-xs font-bold"
              aria-label={`Remover foto ${VIEW_NAME[view]}`}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col ${compact ? 'aspect-[4/3] p-3' : 'aspect-[3/4] sm:aspect-[4/5] p-4'} items-center justify-center gap-2.5 bg-black/[0.12]`}>
          <IconCamera size={compact ? 22 : 32} className="text-[var(--text-muted)] opacity-70" />
          <p className="text-[0.7rem] font-bold text-[var(--text-main)] text-center">
            {VIEW_NAME[view]}
          </p>
          <PhotoAttachButtons
            disabled={busyView !== null}
            compressing={busyView === view}
            label={VIEW_NAME[view]}
            onFile={(file) => onFile(view, file)}
            className="flex-col gap-1.5 w-full"
          />
          {replacing && (
            <button
              type="button"
              onClick={onCancelReplace}
              className={buttonVariants({ variant: 'ghost', size: 'sm', className: '!text-[0.65rem]' })}
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {src && (
        <div className="px-2 pt-2 flex flex-wrap gap-1" role="tablist" aria-label="Trocar lado da foto (sentido de marcha)">
          {VIEW_PHOTO_ORDER.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={tab === view}
              title="Trocar o lado desta foto"
              onClick={() => onChangeView(view, tab)}
              className={`min-h-8 px-2 rounded-md text-[0.62rem] font-bold border transition-colors ${
                tab === view
                  ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]'
                  : 'border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {VIEW_TAB_SHORT[tab]}
            </button>
          ))}
        </div>
      )}

      {src && onUpdateDamage && tags.map((d) => (
        <div key={d.id} className="px-2 pb-2">
          <ViewDamageTagPanel
            damage={d}
            decidedByName={decidedByName}
            onUpdate={onUpdateDamage}
          />
        </div>
      ))}
    </div>
  )
}
