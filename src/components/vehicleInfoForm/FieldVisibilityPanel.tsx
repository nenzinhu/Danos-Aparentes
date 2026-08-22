'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CustomFieldDef } from './constants'
import { IconSettings } from '../ui/AnimatedIcons'
import { StandardFieldList, CustomFieldList } from './FieldVisibilityLists'

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

  const hiddenCount = Object.values(visibleFields).filter((v) => !v).length
  const totalStandard = fieldOrder.length
  const visibleStandard = totalStandard - hiddenCount

  const standardListProps = {
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
  }

  const customListProps = {
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
  }

  const renderFieldList = (isModal = false) =>
    activeTab === 'standard' ? (
      <StandardFieldList isModal={isModal} {...standardListProps} />
    ) : (
      <CustomFieldList isModal={isModal} {...customListProps} />
    )

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
