'use client';
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Damage, Severity, ViewType } from '../types'
import { compressImage, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY } from '../lib/imageUtils'
import { storePhoto, deletePhotoRef, resolvePhotoUrl } from '../lib/photoStore'
import {
  finishPhotoUploadProgress,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from '../lib/photoUploadProgress'
import { ResolvedPhoto } from './ResolvedPhoto'
import PhotoAttachButtons from './PhotoAttachButtons'
import SpeechButton from './SpeechButton'
import { isNewDamage, type PreviousReportSummary } from '../lib/reportComparison'

interface Props {
  damages: Damage[]
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<Damage>) => void
  /** Laudo anterior do mesmo veículo (por placa), usado para marcar avarias novas. */
  previousReport?: PreviousReportSummary | null
  accessToken?: string
  onToast?: (msg: string) => void
}

interface AiSuggestion {
  severity: Severity
  description: string
}

async function photoRefToDataUrl(ref: string): Promise<string> {
  const resolved = await resolvePhotoUrl(ref)
  if (!resolved) {
    throw new Error('Foto da avaria não encontrada neste aparelho')
  }
  if (resolved.startsWith('data:')) return resolved
  const res = await fetch(resolved)
  if (!res.ok) {
    throw new Error('Não foi possível carregar a foto para análise')
  }
  const blob = await res.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const SEV_LABEL = { low: 'Leve', medium: 'Média', high: 'Grave' } satisfies Record<Severity, string>
const SEV_COLOR = { low: '#94a3b8', medium: '#f97316', high: '#ef4444' } satisfies Record<Severity, string>
const VIEW_LABEL = {
  'lateral-left': 'Lat. Esq.', 'lateral-right': 'Lat. Dir.', frontal: 'Frontal', traseira: 'Traseira'
} satisfies Record<ViewType, string>

export default function DamageList({ damages, onRemove, onUpdate, previousReport, accessToken, onToast }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [photoViewer, setPhotoViewer] = useState<string | null>(null)
  const [compressingId, setCompressingId] = useState<string | null>(null)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, AiSuggestion>>({})
  const prefersReducedMotion = useReducedMotion()

  async function handleAnalyze(d: Damage) {
    if (!d.photos[0]) {
      onToast?.('❌ Adicione uma foto da avaria antes de analisar')
      return
    }
    if (!accessToken) {
      onToast?.('❌ Entre na sua conta para usar a análise por IA')
      return
    }
    setAnalyzingId(d.id)
    try {
      const photo = await photoRefToDataUrl(d.photos[0])
      const res = await fetch('/api/damage-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ photo, partName: d.partName }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        onToast?.(`❌ ${err.error || 'Não foi possível analisar a foto'}`)
        return
      }
      const data = await res.json()
      setSuggestions(prev => ({ ...prev, [d.id]: { severity: data.severity, description: data.description } }))
      setExpandedId(d.id)
    } catch (e) {
      console.error('Failed to analyze damage photo:', e)
      onToast?.(e instanceof Error ? `❌ ${e.message}` : '❌ Falha ao analisar a foto')
    } finally {
      setAnalyzingId(null)
    }
  }

  function applySuggestion(d: Damage) {
    const suggestion = suggestions[d.id]
    if (!suggestion) return
    const currentNotes = d.notes || ''
    const space = currentNotes ? (currentNotes.endsWith(' ') ? '' : ' ') : ''
    onUpdate(d.id, {
      severity: suggestion.severity,
      notes: currentNotes + space + suggestion.description,
    })
    setSuggestions(prev => {
      const next = { ...prev }
      delete next[d.id]
      return next
    })
  }

  function discardSuggestion(id: string) {
    setSuggestions(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function handlePhoto(id: string, file: File) {
    setCompressingId(id)
    startPhotoUploadProgress(1, 'Preparando foto da avaria…')
    try {
      updatePhotoUploadProgress({
        phase: 'compressing',
        label: 'Comprimindo imagem…',
      })
      const compressedBlob = await compressImage(file, LOCAL_PHOTO_MAX_WIDTH, LOCAL_PHOTO_QUALITY)
      updatePhotoUploadProgress({
        phase: 'uploading',
        current: 0,
        label: 'Salvando foto localmente…',
      })
      const photoRef = await storePhoto(compressedBlob)
      updatePhotoUploadProgress({ current: 1 })
      const dmg = damages.find(d => d.id === id)
      if (!dmg) return
      onUpdate(id, {
        photos: [...dmg.photos, photoRef],
        photoNotes: [...(dmg.photoNotes ?? []), ''],
      })
    } catch (error) {
      console.error('Error compressing image:', error)
    } finally {
      finishPhotoUploadProgress()
      setCompressingId(null)
    }
  }

  function updatePhotoNote(dmgId: string, photoIdx: number, note: string) {
    const dmg = damages.find(d => d.id === dmgId)
    if (!dmg) return
    const notes = [...(dmg.photoNotes ?? dmg.photos.map(() => ''))]
    notes[photoIdx] = note
    onUpdate(dmgId, { photoNotes: notes })
  }

  function removePhoto(dmgId: string, photoIdx: number) {
    const dmg = damages.find(d => d.id === dmgId)
    if (!dmg) return
    const removed = dmg.photos[photoIdx]
    if (removed) void deletePhotoRef(removed)
    onUpdate(dmgId, {
      photos: dmg.photos.filter((_, i) => i !== photoIdx),
      photoNotes: (dmg.photoNotes ?? []).filter((_, i) => i !== photoIdx),
    })
  }

  if (damages.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] py-8 text-[0.9rem]">
        Nenhuma avaria registrada.<br />
        <span className="text-[0.8rem]">Clique em uma peça no SVG para começar.</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {damages.map(d => {
          const photoNotes = d.photoNotes ?? d.photos.map(() => '')
          const sevColor = SEV_COLOR[d.severity]
          const isNew = previousReport ? isNewDamage(d, previousReport) : false

          return (
            <div 
              key={d.id} 
              className="bg-black/20 border border-white/5 rounded-xl overflow-hidden"
              style={{ borderLeft: `3px solid ${sevColor}` }}
            >
              {/* Header row */}
              <div 
                className="flex items-center gap-2.5 p-2.5 cursor-pointer select-none"
                onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ background: sevColor }} 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[0.85rem] text-[var(--text-main)] truncate flex items-center gap-1.5">
                    {d.partName}
                    {isNew && (
                      <span className="shrink-0 text-[0.62rem] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">
                        Nova
                      </span>
                    )}
                  </div>
                  <div className="text-[0.72rem] text-[var(--text-muted)]">
                    {d.typeName} • <span style={{ color: sevColor }} className="font-bold">{SEV_LABEL[d.severity]}</span> • {VIEW_LABEL[d.view] || d.view}
                  </div>
                </div>
                {d.photos.length > 0 && (
                  <span className="text-[0.72rem] text-[var(--primary)] bg-sky-500/10 px-1.5 py-0.5 rounded-md font-medium">📷 {d.photos.length}</span>
                )}
                {d.photos.length > 0 && !suggestions[d.id] && (
                  <button
                    onClick={e => { e.stopPropagation(); handleAnalyze(d) }}
                    disabled={analyzingId !== null}
                    className="shrink-0 text-[0.72rem] font-extrabold px-2.5 py-1 rounded-full text-white shadow-md shadow-fuchsia-500/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', backgroundSize: '200% 200%' }}
                  >
                    {analyzingId === d.id ? '⏳' : '✨ IA'}
                  </button>
                )}
                {d.photos.length > 0 && suggestions[d.id] && (
                  <span className="shrink-0 text-[0.68rem] font-extrabold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                    ✨ Sugestão pronta
                  </span>
                )}
                <span className="text-[0.7rem] text-[var(--text-muted)]">{expandedId === d.id ? '▲' : '▼'}</span>
                <button 
                  onClick={e => { e.stopPropagation(); onRemove(d.id) }}
                  className="text-red-500 hover:text-red-400 cursor-pointer text-[0.85rem] px-1.5 shrink-0 transition-colors"
                >✕</button>
              </div>

              {/* Expanded */}
              <AnimatePresence initial={false}>
                {expandedId === d.id && (
                  <motion.div
                    key="expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                <div className="px-3 pb-3 border-t border-white/[0.04] space-y-3 pt-2.5">
                  {/* Severity selector */}
                  <div>
                    <div className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase mb-1.5">Grau de Dano</div>
                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as Severity[]).map(sev => (
                        <button 
                          key={sev} 
                          onClick={() => onUpdate(d.id, { severity: sev })} 
                          className={`flex-1 py-3 rounded-xl font-outfit text-[0.85rem] font-extrabold border transition-all ${
                            d.severity === sev 
                              ? 'bg-[var(--severity-color)]/10 text-[var(--severity-color)] border-[var(--severity-color)]' 
                              : 'bg-white/[0.02] text-[var(--text-muted)] border-white/[0.08] hover:border-white/20'
                          }`}
                          style={{ 
                            '--severity-color': SEV_COLOR[sev]
                          } as any}
                        >
                          {SEV_LABEL[sev]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Análise por IA */}
                  {d.photos.length > 0 && (
                    <div>
                      {suggestions[d.id] ? (
                        <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-2.5 space-y-2">
                          <div className="text-[0.68rem] font-bold text-sky-400 uppercase">
                            Sugestão da IA: {SEV_LABEL[suggestions[d.id].severity]}
                          </div>
                          <p className="text-[0.78rem] text-[var(--text-main)]">{suggestions[d.id].description}</p>
                          <p className="text-[0.65rem] text-[var(--text-muted)] italic">
                            Sugestão automática — não substitui a avaliação do vistoriador.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => applySuggestion(d)}
                              className="flex-1 py-1.5 rounded-lg text-[0.75rem] font-bold bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 transition-colors"
                            >
                              Usar esta sugestão
                            </button>
                            <button
                              onClick={() => discardSuggestion(d.id)}
                              className="flex-1 py-1.5 rounded-lg text-[0.75rem] font-bold bg-white/[0.03] text-[var(--text-muted)] hover:bg-white/[0.06] transition-colors"
                            >
                              Descartar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAnalyze(d)}
                          disabled={analyzingId !== null}
                          className="w-full py-1.5 rounded-lg text-[0.75rem] font-bold border border-sky-500/25 bg-sky-500/5 text-sky-400 hover:bg-sky-500/10 transition-colors disabled:opacity-50"
                        >
                          {analyzingId === d.id ? '⏳ Analisando…' : '🤖 Analisar com IA'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase">Observação sobre este dano</div>
                      <SpeechButton
                        onTranscript={(text) => {
                          const current = d.notes || ''
                          const space = current ? (current.endsWith(' ') ? '' : ' ') : ''
                          onUpdate(d.id, { notes: current + space + text })
                        }}
                      />
                    </div>
                    <textarea 
                      value={d.notes} 
                      onChange={e => onUpdate(d.id, { notes: e.target.value })}
                      placeholder="Observação sobre este dano..."
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-2.5 text-[var(--input-color)] font-outfit text-[0.82rem] resize-none min-height-[52px] outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>

                  {/* Photos */}
                  <div className="space-y-2">
                    <div className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase">
                      Fotos ({d.photos.length})
                    </div>
                    <div className="flex flex-col gap-2">
                      {d.photos.map((p, i) => (
                        <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-2 flex gap-2.5 items-start">
                          <div className="relative shrink-0 group">
                            <ResolvedPhoto
                              refOrDataUrl={p}
                              alt=""
                              onClick={() => setPhotoViewer(p)}
                              className="w-[72px] h-[72px] object-cover rounded-lg cursor-zoom-in border border-white/10 block hover:opacity-80 transition-opacity"
                            />
                            <button 
                              onClick={() => removePhoto(d.id, i)}
                              className="absolute -top-1.5 -right-1.5 bg-black/80 hover:bg-red-600 rounded-full text-white w-5 h-5 text-[0.65rem] flex items-center justify-center font-black transition-colors shadow-lg"
                            >✕</button>
                          </div>
                          {/* Caption/Tag */}
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                              🏷️ Tag / Descrição da Foto
                            </div>
                            <textarea
                              value={photoNotes[i] ?? ''}
                              onChange={e => updatePhotoNote(d.id, i, e.target.value)}
                              placeholder="Ex.: Amassado na porta..."
                              rows={2}
                              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-1.5 text-[var(--input-color)] font-outfit text-[0.78rem] resize-none outline-none focus:border-sky-500/40 transition-colors"
                            />
                          </div>
                        </div>
                      ))}

                      <PhotoAttachButtons
                        label="foto da avaria"
                        compressing={compressingId === d.id}
                        onFile={file => handlePhoto(d.id, file)}
                      />
                    </div>
                  </div>
                </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Photo viewer modal */}
      {photoViewer && (
        <div 
          onClick={() => setPhotoViewer(null)} 
          className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center cursor-zoom-out p-4"
        >
          <ResolvedPhoto
            refOrDataUrl={photoViewer}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
          />
          <button 
            onClick={() => setPhotoViewer(null)} 
            className="fixed top-4 right-4 bg-black/80 border border-white/20 rounded-full w-11 h-11 text-white text-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >✕</button>
        </div>
      )}
    </>
  )
}
