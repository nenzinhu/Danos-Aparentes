'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { FIELD_LABELS, inputClasses, type CustomFieldDef } from './constants'
import { TrashIcon } from './icons'
import { IconSettings } from '../ui/AnimatedIcons'

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
  onRenameCustomField: (id: string, newLabel: string) => void
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
    onRenameCustomField,
    draggedCustomId,
    dragOverCustomId,
    onDragCustomStart,
    onDragCustomOver,
    onDragCustomLeave,
    onDropCustom,
    onDragCustomEnd,
    filterRef,
  } = props

  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard')
  const [isFullModalOpen, setIsFullModalOpen] = useState(false)
  const [activeTouchDragKey, setActiveTouchDragKey] = useState<string | null>(null)
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
  const [editingCustomLabel, setEditingCustomLabel] = useState('')

  /**
   * O shell autenticado do /app é `position:relative; z-index:1`, o que cria um
   * stacking context: qualquer z-index interno fica preso dentro dele e perde
   * para irmãos de nível superior (ex.: o banner de cookies, z-index 99990).
   * No mobile o painel vira bottom sheet e precisa ficar acima de tudo, então
   * ele é renderizado via portal em document.body. No desktop segue como
   * dropdown ancorado ao botão (inline), onde o empilhamento local basta.
   */
  const [isSheet, setIsSheet] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setIsSheet(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Trava o scroll do body enquanto o bottom sheet estiver aberto
  useEffect(() => {
    if (!isSheet || !filterOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isSheet, filterOpen])

  /**
   * No desktop o painel é `absolute` logo abaixo do botão; se o botão estiver
   * baixo na página, uma altura fixa estoura o rodapé da viewport. Publica a
   * distância do topo do painel em --fm-top para o max-height poder respeitá-la.
   */
  useEffect(() => {
    if (isSheet || !filterOpen) return
    const anchor = filterRef.current
    if (!anchor) return
    const update = () => {
      const r = anchor.getBoundingClientRect()
      anchor.style.setProperty('--fm-top', `${Math.max(0, r.bottom + 10)}px`)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isSheet, filterOpen, filterRef])
  
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const hiddenCount = Object.values(visibleFields).filter((v) => !v).length
  const totalStandard = fieldOrder.length
  const visibleStandard = totalStandard - hiddenCount

  // GSAP animation handlers
  const animateDragStart = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    gsap.to(el, {
      scale: 1.04,
      rotationZ: 1.5,
      boxShadow: '0 12px 30px rgba(14,165,233,0.4)',
      borderColor: 'rgba(56,189,248,0.8)',
      backgroundColor: 'rgba(14,165,233,0.18)',
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [])

  const animateDragEnd = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    gsap.to(el, {
      scale: 1,
      rotationZ: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      borderColor: '',
      backgroundColor: '',
      duration: 0.35,
      ease: 'elastic.out(1, 0.6)',
    })
  }, [])

  // Touch drag-and-drop reordering handler for mobile
  const handleTouchMove = (e: React.TouchEvent, currentKey: string, list: string[], isCustom = false) => {
    const touch = e.touches[0]
    if (!touch) return

    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!targetEl) return

    const card = targetEl.closest('[data-field-key]')
    if (card) {
      const targetKey = card.getAttribute('data-field-key')
      if (targetKey && targetKey !== currentKey) {
        if (isCustom) {
          onDragCustomOver(targetKey)
          onDropCustom(targetKey)
        } else {
          onDragFieldOver(targetKey)
          onDropField(targetKey)
        }
      }
    }
  }

  const renderFieldList = (isModal = false) => {
    if (activeTab === 'standard') {
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
                  onTouchMove={(e) => handleTouchMove(e, key, fieldOrder, false)}
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
                  onTouchMove={(e) => handleTouchMove(e, d.id, customFieldDefs.map((c) => c.id), true)}
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

  return (
    <div ref={filterRef} className="relative">
      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={onToggleOpen}
        className={`
          ${
            anyHidden
              ? 'bg-[var(--primary)]/20 border-sky-500/60 text-[var(--primary)] shadow-[0_0_15px_rgba(14,165,233,0.3)] ring-1 ring-sky-400/40'
              : 'bg-[var(--card-bg-solid)] border-[var(--card-border)]/60 text-[var(--text-main)] hover:bg-[var(--color-hover)] hover:text-white hover:border-slate-600'
          }
          border rounded-xl px-3.5 py-2 cursor-pointer font-bold text-[0.78rem] flex items-center gap-2 backdrop-blur-md transition-all shadow-md active:scale-95
        `}
      >
        <IconSettings size={15} className={anyHidden ? 'text-[var(--primary)] animate-spin-slow' : 'text-[var(--text-muted)]'} />
        <span>Campos</span>
        {anyHidden ? (
          <span className="bg-[var(--primary)]/30 text-[var(--primary-hover)] px-1.5 py-0.5 rounded-full text-[0.68rem] font-extrabold border border-sky-400/40">
            {hiddenCount} oculto{hiddenCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[0.68rem] text-[var(--text-muted)] font-semibold">({totalStandard})</span>
        )}
      </button>

      {/* Quick Panel — bottom sheet no mobile (via portal), dropdown no desktop */}
      {filterOpen && (() => {
        const panel = (
          <>
            {/* Backdrop só no mobile, para fechar tocando fora */}
            <div
              className="fixed inset-0 z-[99991] bg-[var(--bg-main)]/60 backdrop-blur-sm sm:hidden"
              onClick={onToggleOpen}
              aria-hidden="true"
            />
          <div
            className="field-manager-panel
              fixed inset-x-0 bottom-0 z-[99992] w-full max-h-[85dvh] rounded-t-2xl rounded-b-none border-x-0 border-b-0
                            sm:absolute sm:inset-auto sm:top-[calc(100%+10px)] sm:right-0 sm:bottom-auto sm:z-[600] sm:w-[365px] sm:max-h-[min(70vh,560px)] sm:[max-height:min(70vh,560px,calc(100vh-var(--fm-top,0px)-1.5rem))] sm:rounded-2xl sm:border sm:overflow-hidden
              flex flex-col
              bg-[var(--bg-main)] border border-[var(--primary)]/30 p-4 shadow-[0_-10px_50px_rgba(0,0,0,0.8)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            {/* Grabber visual do bottom sheet (mobile) */}
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-700 sm:hidden shrink-0" aria-hidden="true" />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-[var(--card-border)]/80 shrink-0">
              <div className="min-w-0">
                <div className="text-[0.82rem] font-black text-[var(--primary)] tracking-wide uppercase flex items-center gap-1.5">
                  <span className="truncate">⚙️ Gerenciar Campos</span>
                </div>
                <p className="text-[0.68rem] text-[var(--text-muted)] font-medium mt-0.5 select-none">
                  Segure no <span className="text-slate-200 font-bold">⠿</span> para arrastar
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Tela cheia: só faz sentido no desktop */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleOpen()
                    setIsFullModalOpen(true)
                  }}
                  className="hidden sm:flex bg-[var(--primary)]/15 hover:bg-[var(--primary)]/30 border border-[var(--primary)]/40 text-[var(--primary)] rounded-xl px-2.5 py-1 text-[0.68rem] font-extrabold transition-all items-center gap-1 cursor-pointer active:scale-95"
                  title="Abrir gerenciador em tela inteira"
                >
                  🖥️ Tela Cheia
                </button>
                {/* Fechar: essencial no bottom sheet */}
                <button
                  type="button"
                  onClick={onToggleOpen}
                  aria-label="Fechar gerenciador de campos"
                  className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--card-border)] bg-slate-900 text-[var(--text-main)] active:scale-95"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--card-border)]/80 mb-3 gap-1 select-none shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('standard')}
                className={`flex-1 min-w-0 py-2 px-2 rounded-lg text-[0.73rem] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'standard'
                    ? 'bg-[var(--primary)] text-slate-950 shadow-md shadow-[var(--primary-glow)] font-black'
                    : 'text-[var(--text-muted)] hover:text-slate-200 hover:bg-[var(--color-hover)]/50'
                }`}
              >
                <span className="truncate">📋 Padrão</span>
                <span className={`px-1.5 rounded-full text-[0.62rem] shrink-0 ${activeTab === 'standard' ? 'bg-[var(--bg-main)]/20 text-slate-950 font-black' : 'bg-slate-800 text-[var(--text-muted)]'}`}>
                  {visibleStandard}/{totalStandard}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 min-w-0 py-2 px-2 rounded-lg text-[0.73rem] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'custom'
                    ? 'bg-[var(--primary)] text-slate-950 shadow-md shadow-[var(--primary-glow)] font-black'
                    : 'text-[var(--text-muted)] hover:text-slate-200 hover:bg-[var(--color-hover)]/50'
                }`}
              >
                <span className="truncate">✨ Personalizados</span>
                {customFieldDefs.length > 0 && (
                  <span className={`px-1.5 rounded-full text-[0.62rem] shrink-0 ${activeTab === 'custom' ? 'bg-[var(--bg-main)]/20 text-slate-950 font-black' : 'bg-slate-800 text-[var(--text-muted)]'}`}>
                    {customFieldDefs.length}
                  </span>
                )}
              </button>
            </div>

            {/* List Content */}
            {renderFieldList(false)}

            {/* Ação de fechar fixa no rodapé (mobile) */}
            <div className="pt-3 mt-3 border-t border-[var(--card-border)]/80 shrink-0 sm:hidden pb-[env(safe-area-inset-bottom)]">
              <button
                type="button"
                onClick={onToggleOpen}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-slate-950 font-black py-2.5 rounded-xl text-[0.8rem] transition-all shadow-lg shadow-[var(--primary-glow)] active:scale-95"
              >
                Concluído
              </button>
            </div>
          </div>
          </>
        )

        // No mobile o sheet precisa escapar do stacking context do shell do /app
        return isSheet && typeof document !== 'undefined'
          ? createPortal(panel, document.body)
          : panel
      })()}

      {/* Large Modal / Full Page Drawer */}
      {isFullModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gerenciador de Campos em Tela Cheia"
          className="fixed inset-0 z-[999] bg-[var(--bg-main)]/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="field-manager-panel w-full max-w-4xl max-h-[90vh] bg-[var(--bg-main)] border border-[var(--primary)]/30 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]/80">
              <div>
                <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                  <span className="text-[var(--primary)]">⚙️ Gerenciador de Campos em Tela Cheia</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Segure com o dedo no celular ou clique e arraste com o mouse nos ícones <span className="text-[var(--primary)] font-bold">⠿</span> para organizar a ordem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullModalOpen(false)}
                className="bg-slate-900 hover:bg-[var(--color-hover)] border border-[var(--card-border)] text-[var(--text-main)] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ✕ Concluído
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-[var(--card-bg)] p-1.5 rounded-2xl border border-[var(--card-border)]/80 gap-2 max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('standard')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'standard'
                    ? 'bg-[var(--primary)] text-slate-950 font-black shadow-lg shadow-[var(--primary-glow)]'
                    : 'text-[var(--text-muted)] hover:text-slate-200'
                }`}
              >
                <span>📋 Campos Padrão ({visibleStandard}/{totalStandard})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-[var(--primary)] text-slate-950 font-black shadow-lg shadow-[var(--primary-glow)]'
                    : 'text-[var(--text-muted)] hover:text-slate-200'
                }`}
              >
                <span>✨ Personalizados ({customFieldDefs.length})</span>
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {renderFieldList(true)}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[var(--card-border)]/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFullModalOpen(false)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-[var(--primary-glow)] active:scale-95 cursor-pointer"
              >
                Salvar e Voltar para a Vistoria
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
