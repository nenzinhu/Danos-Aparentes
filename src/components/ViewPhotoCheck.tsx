'use client';
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Damage, ViewType } from '../types'
import PhotoAttachButtons from './PhotoAttachButtons'
import { compressImage, fileToDataUrl } from '../lib/imageUtils'
import { storePhotoEvidence } from '../lib/photoEvidence'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '../lib/photoUploadProgress'
import { IconCheck } from './ui/AnimatedIcons'

/**
 * Verificação da vista por foto (IA) — aparece ao trocar a vista do diagrama
 * ou ao sair do diagrama com avarias marcadas. O inspetor anexa UMA foto do
 * lado inteiro do veículo; a IA confere se os danos visíveis batem com as
 * avarias marcadas e, ao confirmar, distribui a descrição nas peças da vista.
 */

interface VerifyPart {
  partId: string
  partName: string
  matched: boolean
  description: string
}

interface VerifyResponse {
  sideMatches: boolean
  summary: string
  parts: VerifyPart[]
  unmarkedFindings: string[]
}

type Phase =
  | { status: 'prompt' }
  | { status: 'analyzing' }
  | { status: 'result'; data: VerifyResponse; photoFile: File; preview: string }
  | { status: 'applying'; data: VerifyResponse; photoFile: File; preview: string }
  | { status: 'error'; message: string }
  | { status: 'auth-required' }

interface Props {
  vehicleName: string
  view: ViewType
  viewName: string
  /** Avarias marcadas na vista que está sendo deixada. */
  damages: Damage[]
  accessToken?: string
  onUpdateDamage: (id: string, patch: Partial<Damage>) => void
  onToast: (msg: string) => void
  /** Chamado quando a verificação termina (foto aplicada ou pulada) — segue a navegação. */
  onDone: () => void
  /** Fechar sem seguir — o inspetor continua na vista atual. */
  onCancel: () => void
}

export default function ViewPhotoCheck({
  vehicleName,
  view,
  viewName,
  damages,
  accessToken,
  onUpdateDamage,
  onToast,
  onDone,
  onCancel,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ status: 'prompt' })

  useEffect(() => {
    return () => {
      if ((phase.status === 'result' || phase.status === 'applying') && phase.preview) {
        URL.revokeObjectURL(phase.preview)
      }
    }
  }, [phase])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function analyze(file: File) {
    setPhase({ status: 'analyzing' })
    try {
      const compressed = await compressImage(file)
      const dataUrl = await fileToDataUrl(compressed)
      const res = await fetch('/api/view-photo-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          photo: dataUrl,
          view,
          vehicleName,
          damages: damages.map(d => ({ partId: d.partId, partName: d.partName, typeName: d.typeName })),
        }),
      })
      if (res.status === 401 || res.status === 403) {
        setPhase({ status: 'auth-required' })
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setPhase({ status: 'error', message: data?.error || 'Não foi possível analisar a foto agora.' })
        return
      }
      const data = await res.json() as VerifyResponse
      setPhase({ status: 'result', data, photoFile: file, preview: URL.createObjectURL(file) })
    } catch {
      setPhase({ status: 'error', message: 'Não foi possível analisar a foto agora.' })
    }
  }

  /** Confirmação humana: anexa a foto do lado e distribui as descrições nas peças que bateram. */
  async function applyResults() {
    if (phase.status !== 'result') return
    const { data, photoFile, preview } = phase
    setPhase({ status: 'applying', data, photoFile, preview })

    const matched = data.parts.filter(p => p.matched)
    startPhotoUploadProgress(Math.max(matched.length, 1), `Anexando foto da ${viewName}…`)
    try {
      let done = 0
      for (const part of matched) {
        const dmg = damages.find(d => d.partId === part.partId)
        if (!dmg) continue
        const patch: Partial<Damage> = {}
        if (part.description) {
          patch.notes = dmg.notes?.trim()
            ? `${dmg.notes.trim()}\nIA (foto da ${viewName}): ${part.description}`
            : part.description
        }
        try {
          updatePhotoUploadProgress({ phase: 'compressing', current: done, label: `Foto — ${dmg.partName}…` })
          const { optimizedRef } = await storePhotoEvidence(photoFile, { damageId: dmg.id })
          patch.photos = [...dmg.photos, optimizedRef]
          patch.photoNotes = [...(dmg.photoNotes ?? dmg.photos.map(() => '')), `Foto da ${viewName} — verificação IA`]
        } catch (error) {
          console.error('Erro ao anexar foto da vista:', error)
        }
        onUpdateDamage(dmg.id, patch)
        done += 1
        updatePhotoUploadProgress({ current: done })
      }
      onToast(`✅ Descrições distribuídas em ${done} peça${done === 1 ? '' : 's'} da ${viewName}`)
    } finally {
      finishPhotoUploadProgress()
    }
    onDone()
  }

  const matchedCount = phase.status === 'result' || phase.status === 'applying'
    ? phase.data.parts.filter(p => p.matched).length
    : 0

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Foto da ${viewName} — verificação por IA`}
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ background: 'var(--card-bg-solid)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }}
      >
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] opacity-80">
              Verificação por IA
            </div>
            <div className="mt-0.5 font-outfit font-extrabold text-[1rem] leading-tight text-[var(--text-main)]">
              Foto da {viewName}
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Fechar e continuar nesta vista"
            className="shrink-0 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {phase.status === 'prompt' && (
          <>
            <p className="text-[0.8rem] text-[var(--text-muted)] leading-relaxed mb-3">
              Você marcou <strong className="text-[var(--text-main)]">{damages.length} avaria{damages.length === 1 ? '' : 's'}</strong> na{' '}
              <strong className="text-[var(--text-main)]">{viewName}</strong>. Antes de sair desta vista, tire{' '}
              <strong className="text-[var(--text-main)]">uma foto só deste lado do veículo</strong> mostrando os danos —
              a IA confere se a foto bate com as avarias marcadas e distribui a descrição em cada peça.
            </p>
            <ul className="mb-4 space-y-1">
              {damages.map(d => (
                <li key={d.id} className="text-[0.72rem] font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  {d.partName} · {d.typeName}
                </li>
              ))}
            </ul>
            <PhotoAttachButtons label={`foto da ${viewName}`} onFile={analyze} />
            <button
              type="button"
              onClick={onDone}
              className="mt-3 w-full min-h-10 rounded-xl text-[0.75rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer hover:text-[var(--text-main)] transition-colors"
            >
              Pular — seguir sem foto deste lado
            </button>
          </>
        )}

        {phase.status === 'analyzing' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <span className="h-8 w-8 rounded-full border-[3px] border-sky-400/30 border-t-sky-400 animate-spin" />
            <div className="text-[0.8rem] font-bold text-sky-400">Analisando a foto da {viewName}…</div>
            <div className="text-[0.7rem] text-[var(--text-muted)]">Conferindo se os danos batem com as avarias marcadas</div>
          </div>
        )}

        {phase.status === 'error' && (
          <>
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[0.75rem] font-bold text-red-400">
              {phase.message}
            </div>
            <PhotoAttachButtons label={`foto da ${viewName}`} onFile={analyze} />
            <button
              type="button"
              onClick={onDone}
              className="mt-3 w-full min-h-10 rounded-xl text-[0.75rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer hover:text-[var(--text-main)] transition-colors"
            >
              Pular — seguir sem foto deste lado
            </button>
          </>
        )}

        {phase.status === 'auth-required' && (
          <>
            <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[0.75rem] font-bold text-amber-500">
              Verificação por IA é um recurso do plano pago —{' '}
              <a href="/planos" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                faça login/upgrade em /planos
              </a>{' '}
              para ativar.
            </div>
            <button
              type="button"
              onClick={onDone}
              className="w-full min-h-10 rounded-xl text-[0.75rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer hover:text-[var(--text-main)] transition-colors"
            >
              Seguir sem verificação
            </button>
          </>
        )}

        {(phase.status === 'result' || phase.status === 'applying') && (
          <>
            <img
              src={phase.preview}
              alt={`Foto da ${viewName}`}
              className="w-full h-28 object-cover rounded-lg border border-white/10 mb-3"
            />

            {!phase.data.sideMatches && (
              <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[0.72rem] font-bold text-amber-500">
                A foto não parece mostrar a {viewName} do veículo. Confira o lado fotografado antes de aplicar.
              </div>
            )}

            {phase.data.summary && (
              <div className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2.5">
                <div className="text-[0.62rem] font-bold uppercase tracking-wider text-sky-400 mb-1">
                  {matchedCount > 0 ? 'A foto bateu com as avarias' : 'A foto não bateu com as avarias'}
                </div>
                <p className="text-[0.72rem] text-[var(--text-main)] leading-snug">{phase.data.summary}</p>
              </div>
            )}

            <div className="mb-3 space-y-1.5">
              {phase.data.parts.map(p => (
                <div
                  key={p.partId}
                  className={`rounded-lg border px-2.5 py-2 ${
                    p.matched
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)]'
                  }`}
                >
                  <div className={`text-[0.7rem] font-black flex items-center gap-1.5 ${p.matched ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    {p.matched ? '✓' : '—'} {p.partName}
                    {!p.matched && <span className="font-bold opacity-70">(dano não visível na foto)</span>}
                  </div>
                  {p.matched && p.description && (
                    <p className="mt-0.5 text-[0.68rem] text-[var(--text-muted)] leading-snug">{p.description}</p>
                  )}
                </div>
              ))}
            </div>

            {phase.data.unmarkedFindings.length > 0 && (
              <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
                <div className="text-[0.62rem] font-bold uppercase tracking-wider text-amber-500 mb-1">
                  Possíveis danos não marcados no diagrama
                </div>
                <p className="text-[0.7rem] text-[var(--text-main)] leading-snug">
                  {phase.data.unmarkedFindings.join(' · ')}
                </p>
                <p className="mt-1 text-[0.62rem] text-[var(--text-muted)]">
                  Se procedente, volte ao diagrama e marque a peça — a IA não cria avarias sozinha.
                </p>
              </div>
            )}

            <motion.button
              type="button"
              disabled={phase.status === 'applying' || matchedCount === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => void applyResults()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-outfit text-sm font-black transition-all duration-200 cursor-pointer bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 hover:border-sky-500/60 text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phase.status === 'applying' ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-sky-400/40 border-t-sky-400 animate-spin" />
                  <span>Aplicando…</span>
                </>
              ) : (
                <>
                  <IconCheck size={18} />
                  <span>Confirmar — anexar foto e distribuir descrições ({matchedCount})</span>
                </>
              )}
            </motion.button>
            <button
              type="button"
              disabled={phase.status === 'applying'}
              onClick={onDone}
              className="mt-2 w-full min-h-10 rounded-xl text-[0.75rem] font-bold text-[var(--text-muted)] underline underline-offset-2 cursor-pointer hover:text-[var(--text-main)] transition-colors disabled:opacity-50"
            >
              Ignorar análise — seguir sem aplicar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
