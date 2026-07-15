'use client'

import { FIELD_LABELS, inputClasses, type CustomFieldDef } from './constants'
import { TrashIcon } from './icons'

interface Props {
  anyHidden: boolean
  filterOpen: boolean
  onToggleOpen: () => void
  fieldOrder: string[]
  visibleFields: Record<string, boolean>
  onToggleField: (key: string) => void
  onMoveField: (key: string, dir: -1 | 1) => void
  onFilterAll: (show: boolean) => void
  draggedFieldKey: string | null
  dragOverFieldKey: string | null
  onDragFieldStart: (key: string) => void
  onDragFieldOver: (key: string) => void
  onDragFieldLeave: (key: string) => void
  onDropField: (key: string) => void
  onDragFieldEnd: () => void
  customFieldDefs: CustomFieldDef[]
  newFieldName: string
  onNewFieldNameChange: (v: string) => void
  onAddCustomField: () => void
  onRemoveCustomField: (id: string) => void
  onMoveCustomField: (id: string, dir: -1 | 1) => void
  draggedCustomId: string | null
  dragOverCustomId: string | null
  onDragCustomStart: (id: string) => void
  onDragCustomOver: (id: string) => void
  onDragCustomLeave: (id: string) => void
  onDropCustom: (id: string) => void
  onDragCustomEnd: () => void
  filterRef: React.RefObject<HTMLDivElement | null>
}

export default function FieldVisibilityPanel(props: Props) {
  const {
    anyHidden,
    filterOpen,
    onToggleOpen,
    fieldOrder,
    visibleFields,
    onToggleField,
    onMoveField,
    onFilterAll,
    draggedFieldKey,
    dragOverFieldKey,
    onDragFieldStart,
    onDragFieldOver,
    onDragFieldLeave,
    onDropField,
    onDragFieldEnd,
    customFieldDefs,
    newFieldName,
    onNewFieldNameChange,
    onAddCustomField,
    onRemoveCustomField,
    onMoveCustomField,
    draggedCustomId,
    dragOverCustomId,
    onDragCustomStart,
    onDragCustomOver,
    onDragCustomLeave,
    onDropCustom,
    onDragCustomEnd,
    filterRef,
  } = props

  const hiddenCount = Object.values(visibleFields).filter((v) => !v).length

  return (
    <div ref={filterRef} className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`
              ${anyHidden ? 'bg-sky-500/15 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(0,200,255,0.2)]' : 'bg-sky-500/10 border-sky-500/20 text-slate-400'}
              border rounded-lg px-3 py-1.5 cursor-pointer font-extrabold text-[0.75rem] flex items-center gap-1.5 backdrop-blur-sm transition-all  
            `}
      >
        ⚙️ Campos{' '}
        {anyHidden
          ? `(${hiddenCount} oculto${hiddenCount > 1 ? 's' : ''})`
          : ''}
      </button>
      {filterOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-[500] bg-slate-950/95 border border-sky-500/25 rounded-2xl p-4 min-w-[230px] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          <div className="text-[0.72rem] font-black text-sky-500 tracking-widest uppercase mb-1">
            ⚙️ Campos Visíveis
          </div>
          <div className="text-[0.62rem] text-slate-500 font-semibold mb-2 select-none">
            Arraste pelo ⠿ ou use as setas ↑ ↓ para reordenar
          </div>
          <div className="flex flex-col gap-1">
            {fieldOrder.map((key, i) => (
              <div
                key={key}
                draggable
                onDragStart={() => onDragFieldStart(key)}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (draggedFieldKey && draggedFieldKey !== key) onDragFieldOver(key)
                }}
                onDragLeave={() => onDragFieldLeave(key)}
                onDrop={(e) => {
                  e.preventDefault()
                  onDropField(key)
                }}
                onDragEnd={onDragFieldEnd}
                className={`flex items-center gap-1.5 rounded-md transition-colors ${
                  draggedFieldKey === key ? 'opacity-40' : ''
                } ${dragOverFieldKey === key ? 'bg-sky-500/15 ring-1 ring-sky-500/40' : ''}`}
              >
                <span
                  className="w-4 h-6 flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing shrink-0 select-none"
                  title="Arraste para reordenar"
                  aria-hidden="true"
                >
                  ⠿
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-[0.78rem] text-slate-300 font-semibold select-none flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={visibleFields[key] !== false}
                    onChange={() => onToggleField(key)}
                    className="accent-sky-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                  />
                  <span className="truncate">{FIELD_LABELS[key]}</span>
                </label>
                <div className="inline-flex rounded-md border border-sky-500/25 overflow-hidden divide-x divide-sky-500/20 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMoveField(key, -1)}
                    disabled={i === 0}
                    title="Mover para cima"
                    aria-label={`Mover ${FIELD_LABELS[key]} para cima`}
                    className="bg-sky-500/10 text-sky-300 w-6 h-6 flex items-center justify-center text-[0.65rem] leading-none cursor-pointer hover:bg-sky-500/25 active:bg-sky-500/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-sky-500/10"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveField(key, 1)}
                    disabled={i === fieldOrder.length - 1}
                    title="Mover para baixo"
                    aria-label={`Mover ${FIELD_LABELS[key]} para baixo`}
                    className="bg-sky-500/10 text-sky-300 w-6 h-6 flex items-center justify-center text-[0.65rem] leading-none cursor-pointer hover:bg-sky-500/25 active:bg-sky-500/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-sky-500/10"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-sky-500/10">
            <button
              type="button"
              onClick={() => onFilterAll(true)}
              className="flex-1 bg-sky-500/10 border border-sky-500/25 text-sky-500 rounded-md p-1.5 text-[0.72rem] font-black cursor-pointer hover:bg-sky-500/20 transition-colors"
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => onFilterAll(false)}
              className="flex-1 bg-red-500/10 border border-red-500/25 text-red-500 rounded-md p-1.5 text-[0.72rem] font-black cursor-pointer hover:bg-red-500/20 transition-colors"
            >
              Nenhum
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-500/10">
            <div className="text-[0.72rem] font-black text-sky-500 tracking-widest uppercase mb-3">
              ➕ Campos Personalizados
            </div>
            {customFieldDefs.length > 0 && (
              <div className="flex flex-col gap-1 mb-2.5">
                {customFieldDefs.length > 1 && (
                  <div className="text-[0.62rem] text-slate-500 font-semibold mb-1 select-none">
                    Arraste pelo ⠿ ou use as setas ↑ ↓ para reordenar
                  </div>
                )}
                {customFieldDefs.map((d, i) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={() => onDragCustomStart(d.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (draggedCustomId && draggedCustomId !== d.id) onDragCustomOver(d.id)
                    }}
                    onDragLeave={() => onDragCustomLeave(d.id)}
                    onDrop={(e) => {
                      e.preventDefault()
                      onDropCustom(d.id)
                    }}
                    onDragEnd={onDragCustomEnd}
                    className={`flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg pl-2 pr-1.5 py-1 transition-colors ${
                      draggedCustomId === d.id ? 'opacity-40' : ''
                    } ${dragOverCustomId === d.id ? 'bg-sky-500/15 ring-1 ring-sky-500/40' : ''}`}
                  >
                    <span
                      className="w-4 h-6 flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing shrink-0 select-none"
                      title="Arraste para reordenar"
                      aria-hidden="true"
                    >
                      ⠿
                    </span>
                    <span className="flex-1 text-[0.78rem] text-slate-200 font-semibold truncate">
                      {d.label}
                    </span>
                    <div className="inline-flex rounded-md border border-sky-500/25 overflow-hidden divide-x divide-sky-500/20">
                      <button
                        type="button"
                        onClick={() => onMoveCustomField(d.id, -1)}
                        disabled={i === 0}
                        title="Mover para cima"
                        aria-label={`Mover ${d.label} para cima`}
                        className="bg-sky-500/10 text-sky-300 w-7 h-7 flex items-center justify-center text-xs leading-none cursor-pointer hover:bg-sky-500/25 active:bg-sky-500/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-sky-500/10"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveCustomField(d.id, 1)}
                        disabled={i === customFieldDefs.length - 1}
                        title="Mover para baixo"
                        aria-label={`Mover ${d.label} para baixo`}
                        className="bg-sky-500/10 text-sky-300 w-7 h-7 flex items-center justify-center text-xs leading-none cursor-pointer hover:bg-sky-500/25 active:bg-sky-500/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-sky-500/10"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Excluir o campo "${d.label}"? Ele será removido de todas as vistorias.`,
                          )
                        )
                          onRemoveCustomField(d.id)
                      }}
                      title="Excluir campo"
                      aria-label={`Excluir ${d.label}`}
                      className="ml-0.5 w-7 h-7 flex items-center justify-center rounded-md text-red-400/70 cursor-pointer hover:bg-red-500/15 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                value={newFieldName}
                onChange={(e) => onNewFieldNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onAddCustomField()
                  }
                }}
                placeholder="Nome do novo campo"
                className={`${inputClasses} flex-1 p-1.5 text-[0.78rem]`}
              />
              <button
                type="button"
                onClick={onAddCustomField}
                disabled={!newFieldName.trim()}
                className={`
                        rounded-md px-3 py-1.5 text-[0.72rem] font-black transition-all
                        ${
                          newFieldName.trim()
                            ? 'bg-green-500/15 border border-green-500/40 text-green-500 cursor-pointer hover:bg-green-500/25'
                            : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                        }
                      `}
              >
                + Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
