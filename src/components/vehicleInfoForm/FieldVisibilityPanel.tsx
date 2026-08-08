'use client'

import { useState, useRef, useCallback } from 'react'
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
        <div className="space-y-3">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onFilterAll(true)}
              className="flex-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 rounded-xl py-2 px-3 text-[0.75rem] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              ✓ Exibir Todos os Campos
            </button>
            <button
              type="button"
              onClick={() => onFilterAll(false)}
              className="flex-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl py-2 px-3 text-[0.75rem] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              ✕ Ocultar Todos
            </button>
          </div>

          {/* Reorderable List */}
          <div className={`grid gap-2 pr-1 custom-scrollbar ${isModal ? 'grid-cols-1 md:grid-cols-2 max-h-[55vh] overflow-y-auto' : 'max-h-[320px] overflow-y-auto'}`}>
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
                    flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-150 group touch-none select-none
                    ${
                      isDragging
                        ? 'opacity-40 bg-sky-500/20 border-sky-400 scale-[0.98]'
                        : isOver
                        ? 'bg-sky-500/25 border-sky-400 ring-2 ring-sky-400/50 scale-[1.01]'
                        : isVisible
                        ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/90 hover:border-slate-700'
                        : 'bg-slate-950/50 border-slate-900/80 opacity-55 hover:opacity-90'
                    }
                  `}
                >
                  {/* GSAP Touch / Mouse Drag Handle */}
                  <div
                    className="w-6 h-8 flex items-center justify-center text-slate-500 group-hover:text-sky-400 cursor-grab active:cursor-grabbing shrink-0 text-lg font-mono transition-colors rounded-lg hover:bg-sky-500/10"
                    title="Segure e arraste com o dedo ou mouse"
                  >
                    ⠿
                  </div>

                  {/* Checkbox & Label */}
                  <label className="flex items-center gap-3 cursor-pointer text-[0.82rem] select-none flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => onToggleField(key)}
                      className="accent-sky-500 w-4 h-4 rounded cursor-pointer shrink-0"
                    />
                    <span
                      className={`field-mgr-label truncate font-semibold ${
                        isVisible ? 'text-slate-100' : 'text-slate-400 line-through'
                      }`}
                    >
                      {FIELD_LABELS[key] ?? key}
                    </span>
                  </label>

                  {/* Up / Down Reorder Buttons */}
                  <div className="inline-flex rounded-lg border border-slate-700/60 overflow-hidden divide-x divide-slate-700/60 shrink-0 shadow-sm">
                    <button
                      type="button"
                      onClick={() => onMoveField(key, -1)}
                      disabled={i === 0}
                      title="Mover para cima"
                      aria-label={`Mover ${FIELD_LABELS[key]} para cima`}
                      className="bg-slate-800/90 hover:bg-sky-500/30 text-sky-300 active:bg-sky-500/50 w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveField(key, 1)}
                      disabled={i === fieldOrder.length - 1}
                      title="Mover para baixo"
                      aria-label={`Mover ${FIELD_LABELS[key]} para baixo`}
                      className="bg-slate-800/90 hover:bg-sky-500/30 text-sky-300 active:bg-sky-500/50 w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
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
      <div className="space-y-4">
        {/* Custom Field Add Form */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-3.5 space-y-2 shadow-inner">
          <label className="text-[0.75rem] font-black text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
            <span>✨ Adicionar Novo Campo Personalizado</span>
          </label>
          <div className="flex gap-2">
            <input
              value={newFieldName}
              onChange={(e) => onNewFieldNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (newFieldName.trim()) onAddCustomField()
                }
              }}
              placeholder="Ex: Nível de Combustível, Odômetro, Chassi..."
              className={`${inputClasses} flex-1 px-3.5 py-2 text-[0.82rem] bg-slate-950/90 border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-sky-400`}
            />
            <button
              type="button"
              onClick={onAddCustomField}
              disabled={!newFieldName.trim()}
              className={`
                rounded-xl px-4 py-2 text-[0.78rem] font-black transition-all flex items-center gap-1 shrink-0 shadow-md
                ${
                  newFieldName.trim()
                    ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer active:scale-95 shadow-sky-500/25'
                    : 'bg-slate-800 text-slate-600 border border-slate-700/50 cursor-not-allowed'
                }
              `}
            >
              + Criar Campo
            </button>
          </div>
        </div>

        {/* Custom Fields List */}
        {customFieldDefs.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <p className="text-[0.8rem] text-slate-300 font-bold">Nenhum campo personalizado cadastrado.</p>
            <p className="text-[0.7rem] text-slate-500 mt-1">Adicione novos campos personalizados acima para adaptar a vistoria ao fluxo da sua empresa.</p>
          </div>
        ) : (
          <div className={`grid gap-2 pr-1 custom-scrollbar ${isModal ? 'grid-cols-1 md:grid-cols-2 max-h-[50vh] overflow-y-auto' : 'max-h-[260px] overflow-y-auto'}`}>
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
                    flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-150 group touch-none select-none bg-slate-900/80 border-slate-800 hover:border-slate-700
                    ${
                      isDragging
                        ? 'opacity-40 bg-sky-500/20 border-sky-400 scale-[0.98]'
                        : isOver
                        ? 'bg-sky-500/25 border-sky-400 ring-2 ring-sky-400/50 scale-[1.01]'
                        : ''
                    }
                  `}
                >
                  <div
                    className="w-6 h-8 flex items-center justify-center text-slate-500 group-hover:text-sky-400 cursor-grab active:cursor-grabbing shrink-0 text-lg font-mono transition-colors rounded-lg hover:bg-sky-500/10"
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
                      className="flex-1 px-2 py-1 text-[0.82rem] bg-slate-950 border border-sky-400/60 rounded-lg text-slate-100 outline-none focus:ring-2 ring-sky-400/40"
                      aria-label={`Renomear ${d.label}`}
                    />
                  ) : (
                    <span className="field-mgr-label flex-1 text-[0.82rem] text-slate-100 font-bold truncate">
                      {d.label}
                    </span>
                  )}

                  <div className="inline-flex rounded-lg border border-slate-700/60 overflow-hidden divide-x divide-slate-700/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => onMoveCustomField(d.id, -1)}
                      disabled={i === 0}
                      title="Mover para cima"
                      aria-label={`Mover ${d.label} para cima`}
                      className="bg-slate-800/90 hover:bg-sky-500/30 text-sky-300 w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveCustomField(d.id, 1)}
                      disabled={i === customFieldDefs.length - 1}
                      title="Mover para baixo"
                      aria-label={`Mover ${d.label} para baixo`}
                      className="bg-slate-800/90 hover:bg-sky-500/30 text-sky-300 w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>

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
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/30"
                  >
                    <TrashIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomId(d.id)
                      setEditingCustomLabel(d.label)
                    }}
                    title="Renomear campo"
                    aria-label={`Renomear ${d.label}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-colors border border-transparent hover:border-sky-500/30"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
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
              ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.3)] ring-1 ring-sky-400/40'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
          }
          border rounded-xl px-3.5 py-2 cursor-pointer font-bold text-[0.78rem] flex items-center gap-2 backdrop-blur-md transition-all shadow-md active:scale-95
        `}
      >
        <IconSettings size={15} className={anyHidden ? 'text-sky-400 animate-spin-slow' : 'text-slate-400'} />
        <span>Campos</span>
        {anyHidden ? (
          <span className="bg-sky-500/30 text-sky-200 px-1.5 py-0.5 rounded-full text-[0.68rem] font-extrabold border border-sky-400/40">
            {hiddenCount} oculto{hiddenCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[0.68rem] text-slate-500 font-semibold">({totalStandard})</span>
        )}
      </button>

      {/* Quick Dropdown Panel */}
      {filterOpen && (
        <div className="field-manager-panel absolute top-[calc(100%+10px)] right-0 z-[600] w-[min(335px,calc(100vw-1.5rem))] sm:w-[365px] bg-slate-950/98 border border-sky-500/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <div>
              <div className="text-[0.82rem] font-black text-sky-400 tracking-wide uppercase flex items-center gap-1.5">
                <span>⚙️ Gerenciar Campos</span>
              </div>
              <p className="text-[0.68rem] text-slate-400 font-medium mt-0.5 select-none">
                Segure no <span className="text-slate-200 font-bold">⠿</span> com o dedo ou mouse para arrastar
              </p>
            </div>
            
            {/* Button to open Large Full Modal */}
            <button
              type="button"
              onClick={() => {
                onToggleOpen()
                setIsFullModalOpen(true)
              }}
              className="bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl px-2.5 py-1 text-[0.68rem] font-extrabold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="Abrir gerenciador em tela inteira"
            >
              🖥️ Tela Cheia
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 mb-3 gap-1 select-none">
            <button
              type="button"
              onClick={() => setActiveTab('standard')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[0.73rem] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'standard'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>📋 Padrão</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] ${activeTab === 'standard' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                {visibleStandard}/{totalStandard}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[0.73rem] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>✨ Personalizados</span>
              {customFieldDefs.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] ${activeTab === 'custom' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                  {customFieldDefs.length}
                </span>
              )}
            </button>
          </div>

          {/* List Content */}
          {renderFieldList(false)}
        </div>
      )}

      {/* Large Modal / Full Page Drawer */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="field-manager-panel w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-sky-500/30 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                  <span className="text-sky-400">⚙️ Gerenciador de Campos em Tela Cheia</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Segure com o dedo no celular ou clique e arraste com o mouse nos ícones <span className="text-sky-300 font-bold">⠿</span> para organizar a ordem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ✕ Concluído
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 gap-2 max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('standard')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'standard'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📋 Campos Padrão ({visibleStandard}/{totalStandard})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200'
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
            <div className="pt-3 border-t border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFullModalOpen(false)}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer"
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
