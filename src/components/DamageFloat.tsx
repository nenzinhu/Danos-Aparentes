'use client';
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Damage, DamageType, Severity } from '../types'
import { IconEraser, IconCamera, IconGallery, IconCheck, IconArrowLeft } from './ui/AnimatedIcons'
import { IconScratchDamageBadge, IconDentDamageBadge, IconBrokenGlassSphere } from './ui/DamageTypeIcons'
import {
  appendAiDecision,
  recordHumanDecision,
  type AiOriginalSuggestion,
} from '../lib/aiDecisions'
import {
  deriveEvidenceStatusFromDecision,
  formatEvidenceStatusLabel,
} from '../lib/evidenceStatus'
import { compressImage, fileToDataUrl } from '../lib/imageUtils'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { isNewDamage, type PreviousReportSummary } from '../lib/reportComparison'
import dynamic from 'next/dynamic'

const ThreeDamageCanvas = dynamic(() => import('./ThreeDamageCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-40 rounded-xl bg-black/20 animate-pulse" aria-hidden />
  ),
})

interface Props {
  partId?: string
  partName: string
  position: { x: number; y: number }
  currentType?: DamageType
  accessToken?: string
  previousReport?: PreviousReportSummary | null
  onChoose: (
    type: DamageType,
    typeName: string,
    severity: Severity,
    notes: string,
    photoFile?: File,
    evidence?: Pick<Damage, 'evidenceStatus' | 'evidenceDecidedBy' | 'evidenceDecidedAt' | 'aiDecisionId'>,
  ) => void
  onClear: () => void
  onClose: () => void
}

const EXIT_DURATION_MS = 200

const SEV: { value: Severity; label: string; color: string; bg: string; border: string }[] = [
  { value: 'low',    label: 'Leve',  color: 'text-slate-600',  bg: 'bg-slate-500/15',  border: 'border-slate-500/45' },
  { value: 'medium', label: 'Média', color: 'text-orange-600', bg: 'bg-orange-500/15', border: 'border-orange-500/45' },
  { value: 'high',   label: 'Grave', color: 'text-red-600',    bg: 'bg-red-500/15',    border: 'border-red-500/45' },
]

const TYPES = [
  { type: 'scratch' as const, label: 'Risco / Arranhado',    Badge: IconScratchDamageBadge, img: '/damage/porta-riscada.svg',  color: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  { type: 'dent' as const,    label: 'Amassado / Deformado', Badge: IconDentDamageBadge,    img: '/damage/porta-amassada.svg', color: 'text-amber-500',   bg: 'bg-amber-500/15',   border: 'border-amber-500/40' },
  { type: 'broken' as const,  label: 'Quebrado / Trincado',  Badge: IconBrokenGlassSphere,  img: '/damage/porta-trincada.svg', color: 'text-red-500',     bg: 'bg-red-500/15',     border: 'border-red-500/40' },
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

/**
 * `id` alimenta a trilha de auditoria (ai_decisions.decided_by, FK para
 * auth.users); `label` é o que aparece no badge "Confirmado por …" e no PDF,
 * por isso prefere nome/e-mail ao UUID.
 */
async function currentUserIdentity(): Promise<{ id: string; label: string }> {
  const fallback = { id: 'anonymous', label: 'anonymous' }
  if (!supabaseEnabled || !supabase) return fallback
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user?.id) return fallback
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const name = [meta.full_name, meta.name, user.email]
      .find(v => typeof v === 'string' && v.trim()) as string | undefined
    return { id: user.id, label: name?.trim() || user.id }
  } catch {
    return fallback
  }
}

export default function DamageFloat({ partId, partName, position, currentType, accessToken, previousReport = null, onChoose, onClear, onClose }: Props) {
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
  const [aiDecisionAppendPending, setAiDecisionAppendPending] = useState(false)
  const [aiOriginal, setAiOriginal] = useState<AiOriginalSuggestion | null>(null)
  const [pendingEvidence, setPendingEvidence] = useState<
    Pick<Damage, 'evidenceStatus' | 'evidenceDecidedBy' | 'evidenceDecidedAt' | 'aiDecisionId'> | null
  >(null)

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
    const { id: decidedBy } = await currentUserIdentity()
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

  async function handleConfirm() {
    if (!chosenType) return
    await persistFinalIfEdited()
    let evidence = pendingEvidence

    // Ignorar dismisses only the AI panel. If the inspector still saves the
    // damage manually, that saved damage is confirmed—not ignored.
    if (evidence?.evidenceStatus === 'ignorado') {
      const { label: decidedBy } = await currentUserIdentity()
      const decidedAt = new Date().toISOString()
      evidence = {
        ...evidence,
        evidenceStatus: deriveEvidenceStatusFromDecision('accept', true),
        evidenceDecidedBy: decidedBy,
        evidenceDecidedAt: decidedAt,
      }
      setPendingEvidence(evidence)
    }

    closeThen(() => onChoose(chosenType.type, chosenType.label, severity, notes, photoFile ?? undefined, evidence ?? undefined))
  }

  function handlePhotoFile(file: File) {
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    setEditedManually(false)
    setAiDecisionId(null)
    setAiDecisionAppendPending(false)
    setAiOriginal(null)
    setPendingEvidence(null)
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
      setPendingEvidence({ evidenceStatus: deriveEvidenceStatusFromDecision(undefined, true) })

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
      setAiDecisionAppendPending(true)
      const row = await appendAiDecision({ partName, suggestion })
      setAiDecisionId(row?.id ?? null)
      setAiDecisionAppendPending(false)
      if (row?.id) {
        setPendingEvidence((current) => current ? { ...current, aiDecisionId: row.id } : current)
      }
    } catch {
      setAiState({ status: 'error' })
    }
  }

  async function handleAcceptSuggestion() {
    if (aiDecisionAppendPending || aiState.status !== 'done' || !aiOriginal) return
    const match = TYPES.find(t => t.type === aiState.type)
    if (match) setChosenType({ type: match.type, label: match.label })
    setSeverity(aiState.severity)
    if (!notesTouched) setNotes(aiState.description)
    setEditedManually(false)
    setAiState({ status: 'idle' })

    const { label: decidedBy } = await currentUserIdentity()
    const decidedAt = new Date().toISOString()
    setPendingEvidence({
      evidenceStatus: deriveEvidenceStatusFromDecision('accept', true),
      evidenceDecidedBy: decidedBy,
      evidenceDecidedAt: decidedAt,
      ...(aiDecisionId ? { aiDecisionId } : {}),
    })

    if (aiDecisionId) {
      await recordHumanDecision({
        decisionId: aiDecisionId,
        original: aiOriginal,
        decision: {
          kind: 'accept',
          type: aiOriginal.type,
          severity: aiOriginal.severity,
          description: aiOriginal.description,
          decidedBy,
          decidedAt,
        },
        partName,
      })
    }
  }

  async function handleEditSuggestion() {
    if (aiDecisionAppendPending || aiState.status !== 'done' || !aiOriginal) return
    const match = TYPES.find(t => t.type === aiState.type)
    if (match) setChosenType({ type: match.type, label: match.label })
    setSeverity(aiState.severity)
    if (!notesTouched) setNotes(aiState.description)
    setEditedManually(true)

    const { label: decidedBy } = await currentUserIdentity()
    const decidedAt = new Date().toISOString()
    setPendingEvidence({
      evidenceStatus: deriveEvidenceStatusFromDecision('edit', true),
      evidenceDecidedBy: decidedBy,
      evidenceDecidedAt: decidedAt,
      ...(aiDecisionId ? { aiDecisionId } : {}),
    })
  }

  async function handleIgnoreSuggestion() {
    if (aiDecisionAppendPending) return
    if (!aiOriginal) {
      setAiState({ status: 'idle' })
      setEditedManually(false)
      return
    }
    if (aiDecisionId) {
      const { id: decidedBy } = await currentUserIdentity()
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
    setPendingEvidence({
      evidenceStatus: deriveEvidenceStatusFromDecision('ignore', true),
      ...(aiDecisionId ? { aiDecisionId } : {}),
    })
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
  const floatH = 350
  const left = Math.max(12, Math.min(position.x, window.innerWidth - floatW - 16))
  const top  = Math.max(12, Math.min(position.y, window.innerHeight - floatH - 16))

  const containerClass = isMobile
    ? `fixed z-[10000] left-0 right-0 bottom-0 w-full max-h-[85vh] overflow-y-auto p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] rounded-t-2xl border-t backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] motion-reduce:animate-none duration-300 ${
        isClosing ? 'animate-out fade-out slide-out-to-bottom-4 duration-200' : 'animate-in fade-in slide-in-from-bottom-4'
      }`
    : `fixed z-[10000] w-[280px] max-h-[85vh] overflow-y-auto p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl motion-reduce:animate-none duration-300 ${
        isClosing ? 'animate-out fade-out zoom-out-95 duration-200' : 'animate-in fade-in zoom-in-95 transition-all'
      }`

  const containerStyle = isMobile
    ? { background: 'var(--card-bg-solid)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }
    : { left, top, background: 'var(--card-bg-solid)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }

  const showSuggestionPanel = aiState.status === 'done' && !editedManually
  const typeForNewCheck = chosenType?.type ?? (aiState.status === 'done' ? aiState.type : currentType)
  const isNewVsPrevious = Boolean(
    previousReport &&
      partId &&
      typeForNewCheck &&
      isNewDamage({ partId, type: typeForNewCheck }, previousReport),
  )

  return (
    <>
      {/* Overlay protetor transparente no mobile para travar zoom/scroll do fundo */}
      {isMobile && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] animate-in fade-in duration-200"
          onClick={handleClose}
        />
      )}

      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Tipo de avaria — ${partName}`}
        tabIndex={-1}
        drag={!isMobile}
        dragMomentum={false}
        dragElastic={0.05}
        className={`${containerClass} outline-none custom-scrollbar select-none cursor-grab active:cursor-grabbing`}
        style={containerStyle}
      >
      {isMobile && (
        <div aria-hidden="true" className="mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-[var(--text-muted)]/40" />
      )}

      {/* Header com alça de arraste (drag handle) */}
      <div className="flex justify-between items-center gap-2 mb-3 cursor-grab active:cursor-grabbing select-none">
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <span aria-hidden="true" className="text-sm text-[var(--text-muted)] opacity-60">⠿</span>
          <div>
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] opacity-80">
              Tipo de avaria (Arraste)
            </div>
            <div className="font-outfit font-extrabold text-[0.95rem] leading-tight text-[var(--text-main)] truncate">
              {partName}
            </div>
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

      {previousReport && (
        <div
          className={`mb-3 rounded-lg border px-2.5 py-2 text-[0.68rem] leading-snug ${
            isNewVsPrevious
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-[var(--card-border)] bg-black/10 text-[var(--text-muted)]'
          }`}
        >
          {isNewVsPrevious ? (
            <>
              <span className="font-extrabold uppercase tracking-wide text-[0.62rem]">Nova</span>
              {' — '}
              Não existia na vistoria anterior. A IA analisa a foto; confirme como vistoriador.
            </>
          ) : step === 1 ? (
            <>Comparando com a vistoria anterior — marque o estado atual desta peça.</>
          ) : (
            <>Já constava na vistoria anterior (ou selecione o tipo para verificar).</>
          )}
        </div>
      )}

      {/* ── STEP 1: escolher tipo ── */}
      {step === 1 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t, i) => {
              const isActive = currentType === t.type
              return (
                <motion.button
                  key={t.type}
                  onClick={() => handlePickType(t.type, t.label)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-keyshortcuts={String(i + 1)}
                  className={`relative flex flex-col items-center justify-center gap-1 min-h-[68px] sm:min-h-[64px] px-1.5 pt-4 pb-1.5 rounded-xl border-2 font-outfit text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 ring-[var(--primary)] outline-none ${
                    isActive
                      ? `${t.bg} ${t.border} text-[var(--text-main)] shadow-[inset_0_0_0_1px_var(--primary)]`
                      : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] hover:border-[var(--text-muted)]/40'
                  }`}
                >
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-md border border-[var(--btn-secondary-border)] bg-[var(--card-bg-solid)] px-1.5 py-px font-mono-data text-[0.58rem] font-semibold tracking-wide text-[var(--text-muted)] tabular-nums">
                    [{i + 1}]
                  </span>
                  <div className={`flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-200 ${isActive ? 'scale-105' : ''}`}>
                    <img src={t.img} alt={t.label} className="w-full h-[36px] sm:h-[32px] object-contain drop-shadow" />
                  </div>
                  <span className="text-[0.68rem] sm:text-[0.62rem] tracking-tight leading-tight text-center text-[var(--text-main)] px-0.5 font-extrabold">
                    {t.label}
                  </span>
                  {isActive && (
                    <span className="text-[0.55rem] uppercase font-black tracking-widest text-[var(--primary)]">Ativo</span>
                  )}
                </motion.button>
              )
            })}
          </div>

          <motion.button
            onClick={() => closeThen(onClear)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-outfit text-xs font-bold transition-all duration-200 cursor-pointer bg-transparent hover:bg-[var(--btn-secondary-hover)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
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
              return t ? <img src={t.img} alt={t.label} className="h-7 w-auto shrink-0 object-contain drop-shadow" /> : null
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
                <img src={photoPreview} alt="Prévia da foto da avaria" className="w-full h-20 object-cover rounded-lg border border-white/10" />
                <button
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                    setAiState({ status: 'idle' })
                    setEditedManually(false)
                    setAiDecisionId(null)
                    setAiDecisionAppendPending(false)
                    setAiOriginal(null)
                    setPendingEvidence(null)
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
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/10 px-2.5 py-2 text-[0.72rem] font-bold text-sky-300">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin shrink-0" />
                ✓ IA analisando imagens…
              </div>
            )}
            {aiState.status === 'error' && (
              <div className="mt-2 ds-caption font-semibold">
                Não foi possível analisar a foto. Preencha manualmente.
              </div>
            )}
            {aiState.status === 'auth-required' && (
              <div className="mt-2 text-[0.7rem] font-bold text-amber-500">
                Classificação por IA é um recurso do plano pago —{' '}
                <a href="/planos" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  ver planos
                </a>
                . Preencha manualmente por enquanto.
              </div>
            )}
            {editedManually && (
              <div className="mt-2 text-[0.68rem] font-bold text-amber-500">
                Ajustado manualmente
              </div>
            )}
            {pendingEvidence?.evidenceStatus === 'confirmado' && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-1 text-[0.65rem] font-black text-emerald-300">
                  {formatEvidenceStatusLabel('confirmado', {
                    decidedBy: pendingEvidence.evidenceDecidedBy,
                    decidedAt: pendingEvidence.evidenceDecidedAt,
                  })}
                </span>
              </div>
            )}
            {aiState.status === 'done' && !showSuggestionPanel && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2">
                <span className="text-[0.7rem] font-bold text-emerald-300">
                  ✓ Detectando danos… Gerando descrição…
                </span>
                <button
                  type="button"
                  onClick={() => {/* panel already gated by showSuggestionPanel */}}
                  className="text-[0.65rem] font-bold text-sky-400 underline underline-offset-2"
                  hidden
                >
                  Ver análise
                </button>
              </div>
            )}
            {showSuggestionPanel && (
              <div className="mt-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="rounded-full border border-amber-500/35 bg-amber-500/15 px-2 py-1 text-[0.65rem] font-black text-amber-300">
                      {formatEvidenceStatusLabel('sugerido')}
                    </span>
                    <p className="mt-1 text-[0.62rem] font-semibold text-[var(--text-muted)]">
                      ainda não confirmado
                    </p>
                  </div>
                  {aiOriginal?.confidence != null && (
                    <span className="text-[0.65rem] font-bold tabular-nums text-[var(--text-muted)]">
                      Confiança {Math.round(Number(aiOriginal.confidence) <= 1 ? Number(aiOriginal.confidence) * 100 : Number(aiOriginal.confidence))}%
                    </span>
                  )}
                </div>
                <div className="text-[0.78rem] font-bold text-[var(--text-main)]">
                  {TYPES.find(t => t.type === aiState.type)?.label}
                  {' · '}
                  {SEV.find(s => s.value === aiState.severity)?.label}
                </div>
                {aiState.description && (
                  <div>
                    <p className="ds-label mb-0.5">Descrição sugerida</p>
                    <p className="text-[0.7rem] text-[var(--text-muted)] leading-snug">{aiState.description}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => void handleAcceptSuggestion()}
                    disabled={aiDecisionAppendPending}
                    className="min-h-9 px-3 rounded-lg text-[0.65rem] font-black uppercase tracking-wide bg-primary text-white cursor-pointer disabled:cursor-wait disabled:opacity-60"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEditSuggestion()}
                    disabled={aiDecisionAppendPending}
                    className="min-h-9 px-3 rounded-lg text-[0.65rem] font-black uppercase tracking-wide border border-[var(--btn-secondary-border)] text-[var(--text-main)] cursor-pointer disabled:cursor-wait disabled:opacity-60"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleIgnoreSuggestion()}
                    disabled={aiDecisionAppendPending}
                    className="min-h-9 px-2.5 rounded-lg text-[0.65rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer disabled:cursor-wait disabled:opacity-60"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar */}
          <motion.button
            onClick={() => void handleConfirm()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-outfit text-sm font-black transition-all duration-200 cursor-pointer ${
              isNewVsPrevious
                ? 'bg-red-500/15 hover:bg-red-500/25 border-red-500/40 hover:border-red-500/60 text-red-300'
                : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 hover:border-sky-500/60 text-sky-400'
            }`}
          >
            <IconCheck size={18} />
            <span>{isNewVsPrevious ? 'Confirmar como vistoriador' : 'Confirmar avaria'}</span>
          </motion.button>
        </>
      )}
    </motion.div>
  </>
)
}
