'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { SavedReport } from '@/src/types'
import {
  compareInspections,
  comparisonStorageId,
  getStoredComparison,
  hydrateComparisonFromCloud,
  offlineCompareGate,
  parseCompareDeepLink,
  recordComparisonDecision,
  saveComparisonCreated,
  savedReportToInspection,
  tenantScopeKey,
  type ComparisonItem,
  type ComparisonResult,
  type StoredComparisonReview,
} from '@/src/lib/vehicleEvidence'
import { appendAuditEvent } from '@/src/lib/audit/auditLog'
import { suggestCompareDamageFromPhoto, type CompareAiSuggestion } from '@/src/lib/vehicleEvidence/compareAiSuggest'
import EvidenceThumb from './EvidenceThumb'

function categoryPill(cat: ComparisonItem['category']) {
  const base = 'inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide'
  switch (cat) {
    case 'new':
      return <span className={`${base} bg-red-500/15 text-red-300 border border-red-500/30`}>Novo dano</span>
    case 'unchanged':
      return <span className={`${base} bg-slate-500/15 text-slate-300 border border-slate-500/30`}>Existente</span>
    case 'severityChanged':
      return <span className={`${base} bg-amber-500/15 text-amber-300 border border-amber-500/30`}>Alterado</span>
    case 'removedOrRepaired':
      return <span className={`${base} bg-violet-500/15 text-violet-300 border border-violet-500/30`}>Não identificado</span>
    case 'uncertain':
      return <span className={`${base} bg-orange-500/15 text-orange-300 border border-orange-500/30`}>Incerto</span>
  }
}

function labelReport(r?: SavedReport): string {
  if (!r) return '—'
  const date = new Date(r.savedAt).toLocaleDateString('pt-BR')
  return `${date} · ${r.publicCode || r.id.slice(0, 8)} · ${r.status ?? 'complete'}`
}

export default function VehicleCompareView({
  vehicleId,
  plate,
  reports,
  userId,
  tenantId,
  accessToken,
  onHydrated,
}: {
  vehicleId: string
  plate: string
  reports: SavedReport[]
  userId: string
  tenantId: string | null
  accessToken?: string
  onHydrated?: () => void | Promise<void>
}) {
  const searchParams = useSearchParams()
  const deepLink = useMemo(
    () => parseCompareDeepLink(searchParams),
    [searchParams],
  )

  const sorted = useMemo(
    () => [...reports].sort((a, b) => a.savedAt - b.savedAt),
    [reports],
  )

  const defaultPrev = deepLink.prevId && sorted.some((r) => r.id === deepLink.prevId)
    ? deepLink.prevId
    : (sorted[sorted.length - 2]?.id ?? '')
  const defaultCurr = deepLink.currId && sorted.some((r) => r.id === deepLink.currId)
    ? deepLink.currId
    : (sorted[sorted.length - 1]?.id ?? '')

  const [prevId, setPrevId] = useState(defaultPrev)
  const [currId, setCurrId] = useState(defaultCurr)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [review, setReview] = useState<StoredComparisonReview | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [requireSynced, setRequireSynced] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [aiBusyKey, setAiBusyKey] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, CompareAiSuggestion>>({})
  const [hydrateBusy, setHydrateBusy] = useState(false)

  const scope = tenantScopeKey(tenantId, userId)

  useEffect(() => {
    if (reports.length >= 2) return
    let cancelled = false
    setHydrateBusy(true)
    void import('@/src/lib/vehicleEvidence/hydrateVehicleReports')
      .then(({ hydrateVehicleReportsLocally }) =>
        hydrateVehicleReportsLocally(userId, vehicleId, accessToken),
      )
      .then(async (result) => {
        if (cancelled) return
        if (result.written > 0) await onHydrated?.()
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setHydrateBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [vehicleId, userId, reports.length, onHydrated, accessToken])

  useEffect(() => {
    if (deepLink.prevId && sorted.some((r) => r.id === deepLink.prevId)) {
      setPrevId(deepLink.prevId)
    }
    if (deepLink.currId && sorted.some((r) => r.id === deepLink.currId)) {
      setCurrId(deepLink.currId)
    }
  }, [deepLink.prevId, deepLink.currId, sorted])

  useEffect(() => {
    if (!prevId || !currId || prevId === currId) return
    const comparisonId = comparisonStorageId(prevId, currId)
    const local = getStoredComparison(comparisonId)
    if (local) setReview(local)
    let cancelled = false
    void hydrateComparisonFromCloud({
      comparisonId,
      vehicleId,
      previousInspectionId: prevId,
      currentInspectionId: currId,
      tenantId: scope,
    }).then((hydrated) => {
      if (!cancelled && hydrated) setReview(hydrated)
    })
    return () => {
      cancelled = true
    }
  }, [prevId, currId, vehicleId, scope])

  function runCompare() {
    setError(null)
    if (!prevId || !currId) {
      setError('Selecione duas vistorias.')
      return
    }
    if (prevId === currId) {
      setError('Selecione vistorias diferentes.')
      return
    }
    const prev = sorted.find((r) => r.id === prevId)
    const curr = sorted.find((r) => r.id === currId)
    if (!prev || !curr) {
      setError('Vistoria não encontrada localmente.')
      return
    }

    const gate = offlineCompareGate(prev, curr, { requireSynced })
    if (!gate.ok) {
      setResult(null)
      setReview(null)
      setError(gate.reason)
      return
    }

    try {
      const previous = savedReportToInspection(prev, { vehicleId, tenantId, userId })
      const current = savedReportToInspection(curr, { vehicleId, tenantId, userId })
      const comparison = compareInspections(previous, current)
      const stored = saveComparisonCreated({
        vehicleId,
        previousInspectionId: prev.id,
        currentInspectionId: curr.id,
        tenantId: scope,
        userId,
        result: comparison,
      })
      setResult(comparison)
      setReview(stored)
    } catch (e) {
      setResult(null)
      setReview(null)
      setError(e instanceof Error ? e.message : 'Falha ao comparar')
    }
  }

  async function exportComparativePdf() {
    if (!result) return
    setPdfBusy(true)
    setError(null)
    try {
      const { generateComparativePdf } = await import('@/src/lib/pdf/comparativeReport')
      const prev = sorted.find((r) => r.id === result.previousInspectionId)
      const curr = sorted.find((r) => r.id === result.currentInspectionId)
      const { hash } = await generateComparativePdf({
        plate,
        brand: prev?.vehicleInfo.brand || curr?.vehicleInfo.brand,
        previousLabel: labelReport(prev),
        currentLabel: labelReport(curr),
        result,
      })
      void appendAuditEvent({
        event_type: 'comparison_exported',
        inspection_id: result.currentInspectionId,
        metadata: {
          vehicle_id: vehicleId,
          comparison_hash: hash,
          kind: 'comparative_pdf',
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao gerar PDF comparativo')
    } finally {
      setPdfBusy(false)
    }
  }

  async function askAiSuggest(item: ComparisonItem) {
    const photoRef = item.current?.photoRefs?.[0]
    const partName = item.current?.partName || item.previous?.partName || 'peça'
    if (!photoRef) {
      setError('Item sem foto atual para classificar.')
      return
    }
    setAiBusyKey(item.identityKey)
    setError(null)
    try {
      const suggestion = await suggestCompareDamageFromPhoto({
        photoRef,
        partName,
        accessToken,
      })
      if (!suggestion) {
        setError('Sugestão de IA indisponível (rede, cota ou assinatura).')
        return
      }
      setAiSuggestions((prev) => ({ ...prev, [item.identityKey]: suggestion }))
      void appendAuditEvent({
        event_type: 'ai_analysis',
        inspection_id: result?.currentInspectionId,
        metadata: {
          vehicle_id: vehicleId,
          identity_key: item.identityKey,
          source: 'comparison_assist',
          suggested_type: suggestion.type,
          suggested_severity: suggestion.severity,
        },
      })
    } finally {
      setAiBusyKey(null)
    }
  }

  async function decide(item: ComparisonItem, decision: 'accept' | 'edit' | 'ignore') {
    if (!result) return
    const comparisonId = comparisonStorageId(result.previousInspectionId, result.currentInspectionId)
    let justification: string | undefined
    if (decision === 'edit') {
      const note = typeof window !== 'undefined'
        ? window.prompt('Justificativa da edição (opcional):', '')
        : ''
      if (note === null) return
      justification = note || 'Editado na revisão humana'
    } else if (decision === 'accept') {
      justification = 'Confirmado'
    } else {
      justification = 'Ignorado'
    }

    setBusyKey(item.identityKey)
    try {
      const updated = await recordComparisonDecision({
        comparisonId,
        itemIdentityKey: item.identityKey,
        decision,
        userId,
        justification,
        category: item.category,
      })
      setReview(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao registrar decisão')
    } finally {
      setBusyKey(null)
    }
  }

  // Hydrate stored review if user reloads after compare
  function ensureReviewHydrated() {
    if (!result || review) return
    const id = comparisonStorageId(result.previousInspectionId, result.currentInspectionId)
    const stored = getStoredComparison(id)
    if (stored) setReview(stored)
  }

  if (sorted.length < 2) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          {hydrateBusy
            ? 'Sincronizando vistorias da nuvem…'
            : 'É preciso ter pelo menos duas vistorias deste veículo para comparar.'}
        </p>
        <Link href={`/app/vehicles/${encodeURIComponent(vehicleId)}`} className="inline-block mt-4 text-sm font-bold text-sky-400 hover:underline">
          ← Voltar ao histórico
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" onFocus={ensureReviewHydrated}>
      <div>
        <Link
          href={`/app/vehicles/${encodeURIComponent(vehicleId)}`}
          className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          ← {plate}
        </Link>
        <h1 className="font-display text-3xl font-bold mt-2">Comparação de vistorias</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Resultado derivado — laudos emitidos permanecem imutáveis.
        </p>
      </div>

      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-muted)]">
          Anterior
          <select
            value={prevId}
            onChange={(e) => setPrevId(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-solid)] text-[var(--text-main)] text-sm font-normal px-3 py-2"
          >
            <option value="">Selecione</option>
            {sorted.map((r) => (
              <option key={r.id} value={r.id}>{labelReport(r)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-muted)]">
          Atual
          <select
            value={currId}
            onChange={(e) => setCurrId(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg-solid)] text-[var(--text-main)] text-sm font-normal px-3 py-2"
          >
            <option value="">Selecione</option>
            {sorted.map((r) => (
              <option key={r.id} value={r.id}>{labelReport(r)}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={runCompare}
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 transition-colors"
        >
          Comparar
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <input
          type="checkbox"
          checked={requireSynced}
          onChange={(e) => setRequireSynced(e.target.checked)}
        />
        Exigir sincronização na nuvem (senão compara com dados locais)
      </label>

      {error && (
        <p className="text-sm text-amber-300 border border-amber-500/30 rounded-lg px-3 py-2 bg-amber-500/10">
          {error}
        </p>
      )}

      {result && (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Anterior</p>
              <p className="text-sm font-bold mt-1">
                {labelReport(sorted.find((r) => r.id === result.previousInspectionId))}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Atual</p>
              <p className="text-sm font-bold mt-1">
                {labelReport(sorted.find((r) => r.id === result.currentInspectionId))}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold mb-2">Resumo</h2>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--card-bg-solid)] border border-[var(--card-border)]">
                {result.summary.unchanged} existentes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300">
                {result.summary.newDamages} novos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300">
                {result.summary.severityChanged} alterados
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-300">
                {result.summary.removedOrRepaired} não identificados
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-300">
                {result.summary.uncertain} incertos
              </span>
            </div>
            <button
              type="button"
              disabled={pdfBusy}
              onClick={() => { void exportComparativePdf() }}
              className="mt-3 px-4 py-2.5 rounded-lg text-xs font-bold border border-[var(--card-border)] hover:border-sky-500/40 disabled:opacity-50"
            >
              {pdfBusy ? 'Gerando PDF…' : 'Baixar PDF comparativo'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {result.items.map((item) => {
              const decided = review?.decisions.find((d) => d.itemIdentityKey === item.identityKey)
              return (
                <div
                  key={`${item.identityKey}-${item.category}`}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {categoryPill(item.category)}
                    <h3 className="text-sm font-bold">
                      {item.current?.partName || item.previous?.partName || 'Peça'}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{item.message}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Tipo: {item.current?.typeName || item.previous?.typeName || '—'}
                    {item.previousSeverity && item.currentSeverity && item.previousSeverity !== item.currentSeverity
                      ? ` · Severidade: ${item.previousSeverity} → ${item.currentSeverity}`
                      : item.currentSeverity
                        ? ` · Severidade: ${item.currentSeverity}`
                        : item.previousSeverity
                          ? ` · Severidade: ${item.previousSeverity}`
                          : ''}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <EvidenceThumb photoRef={item.previous?.photoRefs?.[0]} label="Antes" />
                    <EvidenceThumb photoRef={item.current?.photoRefs?.[0]} label="Depois" />
                  </div>

                  {aiSuggestions[item.identityKey] && (
                    <p className="text-xs text-sky-300/90 border border-sky-500/25 rounded-lg px-3 py-2 bg-sky-500/10">
                      Sugestão IA (assistiva): {aiSuggestions[item.identityKey].type} ·{' '}
                      {aiSuggestions[item.identityKey].severity}
                      {aiSuggestions[item.identityKey].description
                        ? ` — ${aiSuggestions[item.identityKey].description}`
                        : ''}
                      {' · '}Humano decide com Confirmar / Editar / Ignorar.
                    </p>
                  )}

                  {decided ? (
                    <p className="text-xs text-[var(--text-muted)]">
                      Decisão: <strong className="text-[var(--text-main)]">{decided.decision}</strong>
                      {' · '}
                      {new Date(decided.timestamp).toLocaleString('pt-BR')}
                      {decided.justification ? ` · ${decided.justification}` : ''}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyKey === item.identityKey}
                        onClick={() => { void decide(item, 'accept') }}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        disabled={busyKey === item.identityKey}
                        onClick={() => { void decide(item, 'edit') }}
                        className="px-3 py-2 rounded-lg text-xs font-bold border border-[var(--card-border)] hover:border-sky-500/40 disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={busyKey === item.identityKey}
                        onClick={() => { void decide(item, 'ignore') }}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-50"
                      >
                        Ignorar
                      </button>
                      {item.current?.photoRefs?.[0] && accessToken && (
                        <button
                          type="button"
                          disabled={aiBusyKey === item.identityKey}
                          onClick={() => { void askAiSuggest(item) }}
                          className="px-3 py-2 rounded-lg text-xs font-bold border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
                          title="Classifica a foto atual — não cria avaria sozinha"
                        >
                          {aiBusyKey === item.identityKey ? 'IA…' : 'Sugerir (IA)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
