'use client'

import { useState } from 'react'
import { FIELD_LABELS, inputClasses, type CustomFieldDef } from './constants'
import { TrashIcon } from './icons'
import { useFieldDrag } from './useFieldDrag'

export function StandardFieldList({
  isModal = false,
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
}: {
  isModal?: boolean
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
}) {
  const {
    itemRefs,
    activeTouchDragKey,
    setActiveTouchDragKey,
    animateDragStart,
    animateDragEnd,
    handleTouchMove,
  } = useFieldDrag()

  return (
    <div className="flex flex-col min-h-0 flex-1 gap-3">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onFilterAll(true)}
          className="bg-[var(--primary)]/15 hover:bg-[var(--primary)]/25 border border-[var(--primary)]/30 text-[var(--primary)] rounded-xl py-2 px-2 text-[0.72rem] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 min-w-0"
        >
          <span className="truncate">✓ Exibir Todos</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterAll(false)}
          className="bg-[var(--severity-high)]/15 hover:bg-[var(--severity-high)]/25 border border-[var(--severity-high)]/30 text-[var(--severity-high)] rounded-xl py-2 px-2 text-[0.72rem] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 min-w-0"
        >
          <span className="truncate">✕ Ocultar Todos</span>
        </button>
      </div>

      {/* Reorderable List */}
      <div className={`grid gap-2 pr-1 custom-scrollbar min-h-0 ${isModal ? 'grid-cols-1 md:grid-cols-2 max-h-[55vh] overflow-y-auto' : 'flex-1 overflow-y-auto content-start'}`}>
        {fieldOrder.map((key, i) => {
          const isVisible = visibleFields[key] !== false
          const isDragging = draggedFieldKey === key || activeTouchDragKey === key
          const isOver = dragOverFieldKey === key

          return (
            <div
              key={key}
              data-field-key={key}
              role="listitem"
              ref={(el) => { itemRefs.current[key] = el }}
              draggable
              onDragStart={() => {
                onDragFieldStart(key)
                animateDragStart(itemRefs.current[key])
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedFieldKey && draggedFieldKey !== key) onDragFieldOver(key)
              }}
              onDragLeave={() => onDragFieldLeave(key)}
              onDrop={(e) => {
                e.preventDefault()
                onDropField(key)
              }}
              onDragEnd={() => {
                onDragFieldEnd()
                animateDragEnd(itemRefs.current[key])
              }}
              onTouchStart={() => {
                setActiveTouchDragKey(key)
                onDragFieldStart(key)
                animateDragStart(itemRefs.current[key])
              }}
              onTouchMove={(e) => handleTouchMove(e, key, onDragFieldOver, onDropField)}
              onTouchEnd={() => {
                setActiveTouchDragKey(null)
                onDragFieldEnd()
                animateDragEnd(itemRefs.current[key])
              }}
              className={`
                flex items-center gap-2 p-2 rounded-xl border transition-all duration-150 group touch-none select-none min-w-0
                ${
                  isDragging
                    ? 'opacity-40 bg-[var(--primary)]/20 border-sky-400 scale-[0.98]'
                    : isOver
                    ? 'bg-[var(--primary)]/25 border-sky-400 ring-2 ring-sky-400/50 scale-[1.01]'
                    : isVisible
                    ? 'bg-[var(--card-bg-solid)] border-[var(--card-border)] hover:bg-[var(--color-hover)]/90 hover:border-[var(--card-border)]'
                    : 'bg-[var(--card-bg-solid)]/50 border-[var(--card-border)] opacity-55 hover:opacity-90'
                }
              `}
            >
              {/* GSAP Touch / Mouse Drag Handle */}
              <div
                className="w-5 h-9 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] cursor-grab active:cursor-grabbing shrink-0 text-lg font-mono transition-colors rounded-lg hover:bg-[var(--primary)]/10"
                title="Segure e arraste com o dedo ou mouse"
              >
                ⠿
              </div>

              {/* Checkbox & Label */}
              <label className="flex items-center gap-2.5 cursor-pointer text-[0.82rem] select-none flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleField(key)}
                  className="accent-sky-500 w-4 h-4 rounded cursor-pointer shrink-0"
                />
                <span
                  className={`field-mgr-label truncate font-semibold ${
                    isVisible ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] line-through'
                  }`}
                >
                  {FIELD_LABELS[key] ?? key}
                </span>
              </label>

              {/* Up / Down Reorder Buttons */}
              <div className="inline-flex rounded-lg border border-[var(--card-border)]/60 overflow-hidden divide-x divide-[var(--card-border)] shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={() => onMoveField(key, -1)}
                  disabled={i === 0}
                  title="Mover para cima"
                  aria-label={`Mover ${FIELD_LABELS[key]} para cima`}
                  className="bg-[var(--card-bg)] hover:bg-[var(--primary)]/30 text-[var(--primary)] active:bg-[var(--primary)]/50 w-9 h-9 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMoveField(key, 1)}
                  disabled={i === fieldOrder.length - 1}
                  title="Mover para baixo"
                  aria-label={`Mover ${FIELD_LABELS[key]} para baixo`}
                  className="bg-[var(--card-bg)] hover:bg-[var(--primary)]/30 text-[var(--primary)] active:bg-[var(--primary)]/50 w-9 h-9 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  ↓
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CustomFieldList({
  isModal = false,
  customFieldDefs,
  newFieldName,
  onNewFieldNameChange,
  onAddCustomField,
  onRemoveCustomField,
  onMoveCustomField,
  onRenameCustomField,
  draggedCustomId,
  dragOverCustomId,
  onDragCustomStart,
  onDragCustomOver,
  onDragCustomLeave,
  onDropCustom,
  onDragCustomEnd,
}: {
  isModal?: boolean
  customFieldDefs: CustomFieldDef[]
  newFieldName: string
  onNewFieldNameChange: (v: string) => void
  onAddCustomField: () => void
  onRemoveCustomField: (id: string) => void
  onMoveCustomField: (id: string, dir: -1 | 1) => void
  onRenameCustomField: (id: string, newLabel: string) => void
  draggedCustomId: string | null
  dragOverCustomId: string | null
  onDragCustomStart: (id: string) => void
  onDragCustomOver: (id: string) => void
  onDragCustomLeave: (id: string) => void
  onDropCustom: (id: string) => void
  onDragCustomEnd: () => void
}) {
  const {
    itemRefs,
    activeTouchDragKey,
    setActiveTouchDragKey,
    animateDragStart,
    animateDragEnd,
    handleTouchMove,
  } = useFieldDrag()

  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
  const [editingCustomLabel, setEditingCustomLabel] = useState('')

  return (
    <div className="flex flex-col min-h-0 flex-1 gap-3">
      {/* Custom Field Add Form */}
      <div className="bg-[var(--card-bg)] border border-[var(--primary)]/30 rounded-2xl p-3 space-y-2 shadow-inner shrink-0">
        <label className="text-[0.72rem] font-black text-[var(--primary)] uppercase tracking-wide flex items-center gap-1.5">
          <span>✨ Novo Campo Personalizado</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            value={newFieldName}
            onChange={(e) => onNewFieldNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (newFieldName.trim()) onAddCustomField()
              }
            }}
            placeholder="Ex: Odômetro, Chassi..."
            className={`${inputClasses} flex-1 basis-[min(160px,100%)] px-3 py-2 text-[0.82rem] bg-[var(--card-bg-solid)] border-[var(--card-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] rounded-xl focus:border-sky-400`}
          />
          <button
            type="button"
            onClick={onAddCustomField}
            disabled={!newFieldName.trim()}
            className={`
              rounded-xl px-4 py-2 text-[0.78rem] font-black transition-all flex items-center justify-center gap-1 shrink-0 shadow-md
              ${
                newFieldName.trim()
                  ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-slate-950 cursor-pointer active:scale-95 shadow-[var(--primary-glow)]'
                  : 'bg-slate-800 text-slate-600 border border-[var(--card-border)]/50 cursor-not-allowed'
              }
            `}
          >
            + Criar
          </button>
        </div>
      </div>

      {/* Custom Fields List */}
      {customFieldDefs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[var(--card-border)] rounded-2xl bg-slate-900/30">
          <p className="text-[0.8rem] text-[var(--text-main)] font-bold">Nenhum campo personalizado cadastrado.</p>
          <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">Adicione novos campos personalizados acima para adaptar a vistoria ao fluxo da sua empresa.</p>
        </div>
      ) : (
        <div className={`grid gap-2 pr-1 custom-scrollbar min-h-0 ${isModal ? 'grid-cols-1 md:grid-cols-2 max-h-[50vh] overflow-y-auto' : 'flex-1 overflow-y-auto content-start'}`}>
          {customFieldDefs.map((d, i) => {
            const isDragging = draggedCustomId === d.id || activeTouchDragKey === d.id
            const isOver = dragOverCustomId === d.id

            return (
              <div
                key={d.id}
                data-field-key={d.id}
                role="listitem"
                ref={(el) => { itemRefs.current[d.id] = el }}
                draggable
                onDragStart={() => {
                  onDragCustomStart(d.id)
                  animateDragStart(itemRefs.current[d.id])
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (draggedCustomId && draggedCustomId !== d.id) onDragCustomOver(d.id)
                }}
                onDragLeave={() => onDragCustomLeave(d.id)}
                onDrop={(e) => {
                  e.preventDefault()
                  onDropCustom(d.id)
                }}
                onDragEnd={() => {
                  onDragCustomEnd()
                  animateDragEnd(itemRefs.current[d.id])
                }}
                onTouchStart={() => {
                  setActiveTouchDragKey(d.id)
                  onDragCustomStart(d.id)
                  animateDragStart(itemRefs.current[d.id])
                }}
                onTouchMove={(e) => handleTouchMove(e, d.id, onDragCustomOver, onDropCustom)}
                onTouchEnd={() => {
                  setActiveTouchDragKey(null)
                  onDragCustomEnd()
                  animateDragEnd(itemRefs.current[d.id])
                }}
                className={`
                  flex items-center gap-2 p-2 rounded-xl border transition-all duration-150 group touch-none select-none min-w-0 bg-[var(--card-bg-solid)] border-[var(--card-border)] hover:border-[var(--card-border)]
                  ${
                    isDragging
                      ? 'opacity-40 bg-[var(--primary)]/20 border-sky-400 scale-[0.98]'
                      : isOver
                      ? 'bg-[var(--primary)]/25 border-sky-400 ring-2 ring-sky-400/50 scale-[1.01]'
                      : ''
                  }
                `}
              >
                <div
                  className="w-5 h-9 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] cursor-grab active:cursor-grabbing shrink-0 text-lg font-mono transition-colors rounded-lg hover:bg-[var(--primary)]/10"
                  title="Segure e arraste com o dedo ou mouse"
                >
                  ⠿
                </div>

                {editingCustomId === d.id ? (
                  <input
                    autoFocus
                    value={editingCustomLabel}
                    onChange={(e) => setEditingCustomLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        onRenameCustomField(d.id, editingCustomLabel)
                        setEditingCustomId(null)
                      } else if (e.key === 'Escape') {
                        setEditingCustomId(null)
                      }
                    }}
                    onBlur={() => {
                      onRenameCustomField(d.id, editingCustomLabel)
                      setEditingCustomId(null)
                    }}
                    className="flex-1 px-2 py-1 text-[0.82rem] bg-[var(--bg-main)] border border-[var(--primary)]/60 rounded-lg text-[var(--text-main)] outline-none focus:ring-2 ring-sky-400/40"
                    aria-label={`Renomear ${d.label}`}
                  />
                ) : (
                  <span className="field-mgr-label flex-1 text-[0.82rem] text-[var(--text-main)] font-bold truncate">
                    {d.label}
                  </span>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <div className="inline-flex rounded-lg border border-[var(--card-border)]/60 overflow-hidden divide-x divide-[var(--card-border)] shrink-0">
                    <button
                      type="button"
                      onClick={() => onMoveCustomField(d.id, -1)}
                      disabled={i === 0}
                      title="Mover para cima"
                      aria-label={`Mover ${d.label} para cima`}
                      className="bg-[var(--card-bg)] hover:bg-[var(--primary)]/30 text-[var(--primary)] w-9 h-9 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveCustomField(d.id, 1)}
                      disabled={i === customFieldDefs.length - 1}
                      title="Mover para baixo"
                      aria-label={`Mover ${d.label} para baixo`}
                      className="bg-[var(--card-bg)] hover:bg-[var(--primary)]/30 text-[var(--primary)] w-9 h-9 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomId(d.id)
                      setEditingCustomLabel(d.label)
                    }}
                    title="Renomear campo"
                    aria-label={`Renomear ${d.label}`}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] transition-colors border border-transparent hover:border-[var(--primary)]/30 shrink-0"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Excluir o campo "${d.label}"? Ele será removido do formulário.`,
                        )
                      ) {
                        onRemoveCustomField(d.id)
                      }
                    }}
                    title="Excluir campo"
                    aria-label={`Excluir ${d.label}`}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--severity-high)] hover:bg-[var(--severity-high)]/20 hover:text-[var(--severity-high)] transition-colors border border-transparent hover:border-[var(--severity-high)]/30 shrink-0"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
