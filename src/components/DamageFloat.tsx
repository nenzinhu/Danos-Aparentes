'use client';
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DamageType, Severity } from '../types'
import { IconEraser, IconCamera, IconGallery, IconCheck, IconArrowLeft } from './ui/AnimatedIcons'
import { IconScratchDamage, IconDentDamage, IconBrokenDamage } from './ui/DamageTypeIcons'
import {
  appendAiDecision,
  recordHumanDecision,
  type AiOriginalSuggestion,
} from '../lib/aiDecisions'
import { compressImage, fileToDataUrl } from '../lib/imageUtils'
import { supabase, supabaseEnabled } from '../lib/supabase'

interface Props {
  partName: string
  position: { x: number; y: number }
  currentType?: DamageType
  accessToken?: string
  onChoose: (type: DamageType, typeName: string, severity: Severity, notes: string, photoFile?: File) => void
  onClear: () => void
  onClose: () => void
}

const EXIT_DURATION_MS = 200

const SEV: { value: Severity; label: string; color: string; bg: string; border: string }[] = [
  { value: 'low',    label: 'Leve',  color: 'text-slate-600',  bg: 'bg-slate-500/15',  border: 'border-slate-500/45' },
  { value: 'medium', label: 'Média', color: 'text-orange-600', bg: 'bg-orange-500/15', border: 'border-orange-500/45' },
  { value: 'high',   label: 'Grave', color: 'text-red-600',    bg: 'bg-red-500/15',    border: 'border-red-500/45' },
]

const TYPES: {
  type: DamageType
  label: string
  short: string
  hint: string
  Icon: typeof IconScratchDamage
  color: string
  accent: string
  bg: string
  border: string
  well: string
}[] = [
  {
    type: 'scratch',
    label: 'Risco / Arranhado',
    short: 'Risco',
    hint: 'Arranhado · abrasão',
    Icon: IconScratchDamage,
    color: 'text-amber-500',
    accent: 'bg-amber-500',
    bg: 'bg-amber-500/12',
    border: 'border-amber-500/45',
    well: 'bg-amber-500/10 ring-amber-500/25',
  },
  {
    type: 'dent',
    label: 'Amassado / Deformado',
    short: 'Amassado',
    hint: 'Deformado · impacto',
    Icon: IconDentDamage,
    color: 'text-orange-500',
    accent: 'bg-orange-500',
    bg: 'bg-orange-500/12',
    border: 'border-orange-500/45',
    well: 'bg-orange-500/10 ring-orange-500/25',
  },
  {
    type: 'broken',
    label: 'Quebrado / Trincado',
    short: 'Quebrado',
    hint: 'Trincado · fratura',
    Icon: IconBrokenDamage,
    color: 'text-red-500',
    accent: 'bg-red-500',
    bg: 'bg-red-500/12',
    border: 'border-red-500/45',
    well: 'bg-red-500/10 ring-red-500/25',
  },
]

type AiClassifyState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; type: DamageType; severity: Severity; description: string }
  | { status: 'error' }
  | { status: 'auth-required' }

type ClassifyApiResponse = {
  type: DamageType
  severity: Severity
  description: string
  confidence?: number | null
  model?: string
  modelVersion?: string
  analyzedAt?: string
}

async function currentUserId(): Promise<string> {
  if (!supabaseEnabled || !supabase) return 'anonymous'
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || 'anonymous'
  } catch {
    return 'anonymous'
  }
}

export default function DamageFloat({ partName, position, currentType, accessToken, onChoose, onClear, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // step 1: pick type | step 2: details
  const [step, setStep] = useState<1 | 2>(1)
  const [chosenType, setChosenType] = useState<{ type: DamageType; label: string } | null>(null)
  const [severity, setSeverity] = useState<Severity>('low')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [aiState, setAiState] = useState<AiClassifyState>({ status: 'idle' })
  const [notesTouched, setNotesTouched] = useState(false)
  const [editedManually, setEditedManually] = useState(false)
  const [aiDecisionId, setAiDecisionId] = useState<string | null>(null)
  const [aiOriginal, setAiOriginal] = useState<AiOriginalSuggestion | null>(null)

  const closeThen = (action: () => void) => {
    if (isClosing) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { action(); return }
    setIsClosing(true)
    setTimeout(action, EXIT_DURATION_MS)
  }
  const handleClose = () => closeThen(onClose)

  function handlePickType(type: DamageType, label: string) {
    setChosenType({ type, label })
    setStep(2)
  }

  async function persistFinalIfEdited() {
    if (!aiDecisionId || !aiOriginal || !editedManually || !chosenType) return
    const decidedBy = await currentUserId()
    await recordHumanDecision({
      decisionId: aiDecisionId,
      original: aiOriginal,
      decision: {
        kind: 'edit',
        type: chosenType.type,
        severity,
        description: notes,
        decidedBy,
      },
      partName,
    })
  }

  function handleConfirm() {
    if (!chosenType) return
    void persistFinalIfEdited()
    closeThen(() => onChoose(chosenType.type, chosenType.label, severity, notes, photoFile ?? undefined))
  }

  function handlePhotoFile(file: File) {
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    setEditedManually(false)
    setAiDecisionId(null)
    setAiOriginal(null)
    void classifyWithAi(file)
  }

  async function classifyWithAi(file: File) {
    setAiState({ status: 'loading' })
    try {
      const compressed = await compressImage(file)
      const dataUrl = await fileToDataUrl(compressed)
      const res = await fetch('/api/damage-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ photo: dataUrl, partName }),
      })
      if (res.status === 401 || res.status === 403) {
        setAiState({ status: 'auth-required' })
        return
      }
      if (!res.ok) {
        setAiState({ status: 'error' })
        return
      }
      const data = await res.json() as ClassifyApiResponse
      // Do NOT auto-apply severity/notes — Aceitar / Editar / Ignorar decides.
      setAiState({ status: 'done', type: data.type, severity: data.severity, description: data.description })

      const suggestion: AiOriginalSuggestion = {
        type: data.type,
        severity: data.severity,
        description: data.description,
        confidence: data.confidence ?? null,
        model: data.model || 'unknown',
        modelVersion: data.modelVersion || data.model || 'unknown',
        analyzedAt: data.analyzedAt || new Date().toISOString(),
        rawPayload: { ...data },
      }
      setAiOriginal(suggestion)
      const row = await appendAiDecision({ partName, suggestion })
      setAiDecisionId(row?.id ?? null)
    } catch {
      setAiState({ status: 'error' })
    }
  }

  async function handleAcceptSuggestion() {
    if (aiState.status !== 'done' || !aiOriginal) return
    const match = TYPES.find(t => t.type === aiState.type)
    if (match) setChosenType({ type: match.type, label: match.label })
    setSeverity(aiState.severity)
    if (!notesTouched) setNotes(aiState.description)
    setEditedManually(false)
    setAiState({ status: 'idle' })

    if (aiDecisionId) {
      const decidedBy = await currentUserId()
      await recordHumanDecision({
        decisionId: aiDecisionId,
        original: aiOriginal,
        decision: {
          kind: 'accept',
          type: aiOriginal.type,
          severity: aiOriginal.severity,
          description: aiOriginal.description,
          decidedBy,
        },
        partName,
      })
    }
  }

  async function handleEditSuggestion() {
    if (aiState.status !== 'done' || !aiOriginal) return
    const match = TYPES.find(t => t.type === aiState.type)
    if (match) setChosenType({ type: match.type, label: match.label })
    setSeverity(aiState.severity)
    if (!notesTouched) setNotes(aiState.description)
    setEditedManually(true)

    if (aiDecisionId) {
      const decidedBy = await currentUserId()
      await recordHumanDecision({
        decisionId: aiDecisionId,
        original: aiOriginal,
        decision: {
          kind: 'edit',
          type: aiOriginal.type,
          severity: aiOriginal.severity,
          description: aiOriginal.description,
          decidedBy,
        },
        partName,
      })
    }
  }

  async function handleIgnoreSuggestion() {
    if (!aiOriginal) {
      setAiState({ status: 'idle' })
      setEditedManually(false)
      return
    }
    if (aiDecisionId) {
      const decidedBy = await currentUserId()
      await recordHumanDecision({
        decisionId: aiDecisionId,
        original: aiOriginal,
        decision: { kind: 'ignore', decidedBy },
        partName,
      })
    }
    setAiState({ status: 'idle' })
    setEditedManually(false)
    setAiDecisionId(null)
    setAiOriginal(null)
  }

  // cleanup object URL
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { handleClose(); return }
      if (step === 1 && /^[1-3]$/.test(e.key)) {
        const t = TYPES[Number(e.key) - 1]
        if (t) { e.preventDefault(); handlePickType(t.type, t.label) }
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handleClose()
    }
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
      prev?.focus?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, onClose])

  const floatW = 280
  const left = Math.max(8, Math.min(position.x, window.innerWidth - floatW))
  const top  = Math.max(8, Math.min(position.y, window.innerHeight - 380))

  const containerClass = isMobile
    ? `fixed z-[10000] left-0 right-0 bottom-0 w-full p-4 pb-[max(1rem,env(safe-area-inset-bottom))] rounded-t-2xl border-t backdrop-blur-xl shadow-2xl motion-reduce:animate-none duration-300 ${
        isClosing ? 'animate-out fade-out slide-out-to-bottom-4 duration-200' : 'animate-in fade-in slide-in-from-bottom-4'
      }`
    : `fixed z-[10000] w-[280px] p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl motion-reduce:animate-none duration-300 ${
        isClosing ? 'animate-out fade-out zoom-out-95 duration-200' : 'animate-in fade-in zoom-in-95 transition-all'
      }`

  const containerStyle = isMobile
    ? { background: 'var(--card-bg-solid)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }
    : { left, top, background: 'var(--card-bg-solid)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }

  const showSuggestionPanel = aiState.status === 'done' && !editedManually

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Tipo de avaria — ${partName}`}
      tabIndex={-1}
      className={`${containerClass} outline-none`}
      style={containerStyle}
    >
      {isMobile && (
        <div aria-hidden="true" className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[var(--text-muted)]/40" />
      )}

      {/* Header: subtle category + emphasized part name */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] opacity-80">
            Tipo de avaria
          </div>
          <div className="mt-0.5 font-outfit font-extrabold text-[0.95rem] leading-tight text-[var(--text-main)] truncate">
            {partName}
          </div>
        </div>
        <button
          onClick={handleClose}
          aria-label="Fechar"
          className="shrink-0 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer focus-visible:ring-2 ring-[var(--primary)] outline-none"
        >
          ✕
        </button>
      </div>

      {/* ── STEP 1: escolher tipo ── */}
      {step === 1 && (
        <>
          <div className="flex flex-col gap-2" role="listbox" aria-label="Tipos de avaria">
            {TYPES.map((t, i) => {
              const isActive = currentType === t.type
              return (
                <motion.button
                  key={t.type}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handlePickType(t.type, t.label)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.22, ease: 'easeOut' }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  aria-keyshortcuts={String(i + 1)}
                  className={`group relative flex items-center gap-3 min-h-[56px] sm:min-h-[52px] w-full overflow-hidden rounded-xl border-2 pl-0 pr-3 font-outfit text-left transition-colors duration-200 cursor-pointer focus-visible:ring-2 ring-[var(--primary)] outline-none ${
                    isActive
                      ? `${t.bg} ${t.border} text-[var(--text-main)]`
                      : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] hover:border-[var(--text-muted)]/35'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1 ${isActive ? t.accent : 'bg-transparent group-hover:bg-[var(--text-muted)]/25'} transition-colors`}
                  />
                  <div
                    className={`ml-3 flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${t.well} ${t.color} transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-[1.03]'}`}
                  >
                    <t.Icon size={36} animated={isActive} className="h-9 w-auto" />
                  </div>
                  <div className="min-w-0 flex-1 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.88rem] sm:text-[0.82rem] font-extrabold tracking-tight text-[var(--text-main)] leading-none">
                        {t.short}
                      </span>
                      {isActive && (
                        <span className="rounded px-1.5 py-0.5 text-[0.55rem] uppercase font-black tracking-widest text-[var(--primary)] bg-[var(--primary)]/10">
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block text-[0.68rem] sm:text-[0.62rem] font-medium leading-tight text-[var(--text-muted)]">
                      {t.hint}
                    </span>
                  </div>
                  <kbd className="hidden sm:inline-flex shrink-0 items-center justify-center rounded-md border border-[var(--btn-secondary-border)] bg-[var(--card-bg-solid)] px-1.5 min-w-[1.4rem] h-6 font-mono-data text-[0.58rem] font-semibold text-[var(--text-muted)] tabular-nums opacity-70 group-hover:opacity-100 transition-opacity">
                    {i + 1}
                  </kbd>
                </motion.button>
              )
            })}
          </div>

          <motion.button
            onClick={() => closeThen(onClear)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 w-full flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl border border-dashed font-outfit text-xs font-bold transition-all duration-200 cursor-pointer bg-transparent hover:bg-[var(--btn-secondary-hover)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <IconEraser className="text-[var(--text-muted)]" size={15} />
            <span>Sem avaria / Limpar</span>
          </motion.button>
        </>
      )}

      {/* ── STEP 2: detalhes (severidade + nota + foto) ── */}
      {step === 2 && chosenType && (
        <>
          {/* Tipo selecionado (readonly, clicável para voltar) */}
          <motion.button
            onClick={() => setStep(1)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="min-h-11 sm:min-h-9 w-full flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[0.72rem] text-[var(--text-muted)] hover:bg-[var(--btn-secondary-hover)] transition-colors cursor-pointer"
          >
            <IconArrowLeft size={14} className="text-[var(--text-muted)] shrink-0" />
            {(() => {
              const t = TYPES.find(t => t.type === chosenType.type)
              return t ? <t.Icon size={16} className={`h-4 w-auto shrink-0 ${t.color}`} /> : null
            })()}
            <span className="font-bold text-[var(--text-main)]">{chosenType.label}</span>
            <span className="ml-auto opacity-50 text-[10px]">alterar</span>
          </motion.button>

          {/* Severidade */}
          <div className="mb-2.5">
            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Grau do dano</div>
            <div className="grid grid-cols-3 gap-1">
              {SEV.map(s => (
                <motion.button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`min-h-11 sm:min-h-9 py-2 rounded-lg text-[0.72rem] font-extrabold border transition-all cursor-pointer ${
                    severity === s.value
                      ? `${s.bg} ${s.border} ${s.color}`
                      : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:bg-[var(--btn-secondary-hover)]'
                  }`}
                >
                  {s.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div className="mb-2.5">
            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Observação <span className="normal-case font-normal opacity-60">(opcional)</span></div>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setNotesTouched(true) }}
              placeholder="Ex.: Arranhão profundo na lateral…"
              rows={2}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1.5 text-[var(--input-color)] text-[0.78rem] font-outfit resize-none outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>

          {/* Foto */}
          <div className="mb-3">
            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Foto <span className="normal-case font-normal opacity-60">(opcional)</span></div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); e.target.value = '' }}
            />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="preview" className="w-full h-20 object-cover rounded-lg border border-white/10" />
                <button
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                    setAiState({ status: 'idle' })
                    setEditedManually(false)
                    setAiDecisionId(null)
                    setAiOriginal(null)
                  }}
                  className="absolute -top-1.5 -right-1.5 bg-black/80 hover:bg-red-600 rounded-full text-white w-5 h-5 text-[0.65rem] flex items-center justify-center font-black transition-colors"
                >✕</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click() } }}
                  className="min-h-11 sm:min-h-9 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-sky-500/30 bg-sky-500/5 text-sky-400 text-[0.72rem] font-bold hover:bg-sky-500/10 transition-colors cursor-pointer"
                >
                  <IconCamera size={15} />
                  <span>Câmera</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click() } }}
                  className="min-h-11 sm:min-h-9 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[0.72rem] font-bold hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <IconGallery size={15} />
                  <span>Galeria</span>
                </motion.button>
              </div>
            )}

            {aiState.status === 'loading' && (
              <div className="mt-2 flex items-center gap-1.5 text-[0.7rem] font-bold text-sky-400">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin" />
                Analisando foto…
              </div>
            )}
            {aiState.status === 'error' && (
              <div className="mt-2 text-[0.7rem] font-bold text-[var(--text-muted)]">
                Não foi possível analisar a foto agora. Preencha manualmente.
              </div>
            )}
            {aiState.status === 'auth-required' && (
              <div className="mt-2 text-[0.7rem] font-bold text-amber-500">
                Classificação por IA é um recurso do plano pago —{' '}
                <a href="/planos" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  faça login/upgrade em /planos
                </a>{' '}
                para ativar. Preencha manualmente por enquanto.
              </div>
            )}
            {editedManually && (
              <div className="mt-2 text-[0.68rem] font-bold text-amber-500">
                ajustado manualmente
              </div>
            )}
            {showSuggestionPanel && (
              <div className="mt-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-2 space-y-1.5">
                <div className="text-[0.65rem] font-bold text-sky-400">
                  Sugestão — revise antes de confirmar
                </div>
                <div className="text-[0.68rem] font-bold text-[var(--text-main)]">
                  {TYPES.find(t => t.type === aiState.type)?.label}
                  {' · '}
                  {SEV.find(s => s.value === aiState.severity)?.label}
                </div>
                {aiState.description && (
                  <p className="text-[0.65rem] text-[var(--text-muted)] leading-snug">{aiState.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => void handleAcceptSuggestion()}
                    className="min-h-9 px-2.5 rounded-lg text-[0.65rem] font-black uppercase tracking-wide bg-sky-500/20 border border-sky-500/40 text-sky-400 cursor-pointer"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEditSuggestion()}
                    className="min-h-9 px-2.5 rounded-lg text-[0.65rem] font-black uppercase tracking-wide bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleIgnoreSuggestion()}
                    className="min-h-9 px-2.5 rounded-lg text-[0.65rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer"
                  >
                    Ignorar sugestão
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar */}
          <motion.button
            onClick={handleConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-outfit text-sm font-black transition-all duration-200 cursor-pointer bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 hover:border-sky-500/60 text-sky-400"
          >
            <IconCheck size={18} />
            <span>Confirmar avaria</span>
          </motion.button>
        </>
      )}
    </div>
  )
}
