'use client';
import { useState, useEffect, useDeferredValue } from 'react'
import { SavedReport } from '../types'
import { db } from '../lib/db'
import { supabaseEnabled } from '../lib/supabase'
import { subjectExportToJson } from '../lib/lgpd/subjectExport'
import { canExportLgpdForReport } from '../lib/auth/rbac'
import { useTenantContext } from '../hooks/useTenantContext'
import { SortKey, SavedReportsModalProps, SORT_OPTIONS } from './savedReports/types'
import { cloudStateOf, filterReports, sortReports, groupReportsByDate } from './savedReports/filterSort'
import { SaveIcon } from './savedReports/CloudBadge'
import { useSavedReportsKeyboard } from './savedReports/useSavedReportsKeyboard'
import { SavedReportItem } from './savedReports/SavedReportItem'
import { downloadReportPdf } from './savedReports/downloadReportPdf'

export default function SavedReportsModal({ isOpen, saved, onClose, onSave, onLoad, onCreateCorrection, onDelete, hasAccess, accessToken, userId }: SavedReportsModalProps) {
  const { role } = useTenantContext(userId)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [generatingQrId, setGeneratingQrId] = useState<string | null>(null)
  const [qrModal, setQrModal] = useState<{ plate: string; url: string } | null>(null)
  const [copiedSignatureId, setCopiedSignatureId] = useState<string | null>(null)
  const [correctingId, setCorrectingId] = useState<string | null>(null)

  const [workflowFilter, setWorkflowFilter] = useState<'all' | 'local' | 'cloud' | 'draft'>('all')
  const [expandedReportIds, setExpandedReportIds] = useState<Set<string>>(new Set())
  const [activeReportIndex, setActiveReportIndex] = useState<number>(-1)

  const deferredSearchQuery = useDeferredValue(searchQuery)

  // Lê a fila de sync ao abrir para marcar quem ainda não subiu para a nuvem
  useEffect(() => {
    if (!isOpen) return
    let active = true
    db.getSyncQueue()
      .then(queue => {
        if (!active) return
        setPendingIds(new Set(queue.filter(i => i.type === 'upsert').map(i => i.reportId)))
      })
      .catch(() => {})
    return () => { active = false }
  }, [isOpen, saved])

  // Limpa o estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setActiveReportIndex(-1)
        setExpandedReportIds(new Set())
      }, 0)
      return () => clearTimeout(timer)
    }
    return
  }, [isOpen])

  const getCloudState = (id: string) => cloudStateOf(id, pendingIds, supabaseEnabled)

  const filtered = filterReports(saved, {
    workflowFilter,
    searchQuery: deferredSearchQuery,
    cloudStateOf: getCloudState,
  })

  const sorted = sortReports(filtered, sortKey)

  useSavedReportsKeyboard({
    isOpen,
    sorted,
    activeReportIndex,
    setActiveReportIndex,
    setExpandedReportIds,
    onClose,
    onLoad,
  })

  // Scroll active report into view
  useEffect(() => {
    if (!isOpen) return
    if (activeReportIndex >= 0) {
      const activeEl = document.querySelector(`[data-report-index="${activeReportIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [isOpen, activeReportIndex])

  if (!isOpen) return null

  const groups = groupReportsByDate(sorted, sortKey)

  const handleCopySignatureLink = async (r: SavedReport) => {
    if (!accessToken) {
      alert('Faça login para gerar o link de assinatura.')
      return
    }
    try {
      const res = await fetch('/api/create-signature-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ inspectionId: r.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Não foi possível gerar o link de assinatura')
        return
      }
      const { url } = await res.json()
      await navigator.clipboard?.writeText(url)
      setCopiedSignatureId(r.id)
      setTimeout(() => setCopiedSignatureId(id => (id === r.id ? null : id)), 2000)
    } catch {
      alert('Não foi possível gerar o link de assinatura')
    }
  }

  const handleGenerateQr = async (r: SavedReport) => {
    const plate = r.vehicleInfo.plate
    if (!plate || !accessToken) return
    setGeneratingQrId(r.id)
    try {
      const res = await fetch('/api/vehicle-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ plate }),
      })
      if (!res.ok) return
      const data = await res.json()
      const url = `${window.location.origin}/historico/${data.token}`
      setQrModal({ plate, url })
    } catch (e) {
      console.error('Failed to generate vehicle QR:', e)
    } finally {
      setGeneratingQrId(null)
    }
  }

  const handleDownloadPdf = async (r: SavedReport) => {
    setDownloadingId(r.id)
    try {
      await downloadReportPdf(r, { hasAccess, accessToken })
    } catch (e) {
      console.error('Failed to generate PDF from modal:', e)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleExportSubjectData = (r: SavedReport) => {
    if (userId && !canExportLgpdForReport(role, userId, userId)) {
      alert('Exportação LGPD não permitida para este perfil.')
      return
    }
    try {
      const json = subjectExportToJson(r)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lgpd-export-${(r.publicCode || r.id).replace(/[^\w-]+/g, '_')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to export subject data:', e)
      alert('Não foi possível exportar os dados pessoais desta vistoria.')
    }
  }

  const handleCreateCorrection = async (r: SavedReport) => {
    if (!onCreateCorrection) return
    const reason = window.prompt(
      'Motivo da correção (obrigatório). Isso cria uma NOVA versão do laudo; o original permanece.',
    )
    if (reason == null) return
    if (!reason.trim()) {
      window.alert('Informe o motivo da correção.')
      return
    }
    setCorrectingId(r.id)
    try {
      await onCreateCorrection(r, reason.trim())
    } finally {
      setCorrectingId(null)
    }
  }

  const renderItem = (r: SavedReport, flatIdx: number) => {
    const isExpanded = expandedReportIds.has(r.id)
    const isActive = flatIdx === activeReportIndex

    const toggleExpand = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return
      setExpandedReportIds(prev => {
        const next = new Set(prev)
        if (next.has(r.id)) {
          next.delete(r.id)
        } else {
          next.add(r.id)
        }
        return next
      })
      setActiveReportIndex(flatIdx)
    }

    return (
      <SavedReportItem
        key={r.id}
        r={r}
        flatIdx={flatIdx}
        isActive={isActive}
        isExpanded={isExpanded}
        downloadingId={downloadingId}
        generatingQrId={generatingQrId}
        copiedSignatureId={copiedSignatureId}
        correctingId={correctingId}
        cloudState={getCloudState(r.id)}
        onToggleExpand={toggleExpand}
        onDownloadPdf={r2 => void handleDownloadPdf(r2)}
        onGenerateQr={r2 => void handleGenerateQr(r2)}
        onCopySignatureLink={r2 => void handleCopySignatureLink(r2)}
        onLoad={onLoad}
        onClose={onClose}
        onCreateCorrection={onCreateCorrection ? r2 => void handleCreateCorrection(r2) : undefined}
        onExportSubjectData={handleExportSubjectData}
        onDelete={onDelete}
      />
    )
  }
  return (
    <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}>
      <div style={{ width: '100%', maxWidth: 700, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>📦 Histórico Salvo</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{supabaseEnabled ? 'Local + nuvem (sincronizado)' : 'Armazenadas localmente (IndexedDB)'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onSave} style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 7 }}><SaveIcon /> Salvar Atual</button>
            <button onClick={onClose} style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem' }}>✖ Fechar</button>
          </div>
        </div>
        <div style={{ padding: '12px 18px', maxHeight: '60vh', overflowY: 'auto' }}>
          {saved.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por cliente, placa, modelo ou OS..."
                style={{
                  flex: 1,
                  minWidth: 180,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontFamily: 'Outfit,sans-serif',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <select
                value={workflowFilter}
                onChange={e => setWorkflowFilter(e.target.value as 'all' | 'local' | 'cloud' | 'draft')}
                title="Filtrar por Status de Nuvem"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: 'var(--input-color)',
                  fontFamily: 'Outfit,sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">☁️ Todos os status</option>
                <option value="draft">💻 Apenas prévias</option>
                <option value="local">📴 Apenas Local/Pendente</option>
                <option value="cloud">☁️ Sincronizados na Nuvem</option>
              </select>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                title="Ordenar"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: 'var(--input-color)',
                  fontFamily: 'Outfit,sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          {sorted.length === 0
             ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                 {saved.length === 0 ? 'Nenhuma vistoria salva.' : 'Nenhum resultado encontrado para a busca.'}
               </div>
             : (() => {
                 let flatIdxCounter = 0;
                 return groups.map((g, gi) => (
                   <div key={g.label ?? `g${gi}`}>
                     {g.label && (
                       <div style={{
                         position: 'sticky', top: 0, zIndex: 1,
                         fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
                         color: 'var(--text-muted)', background: 'rgba(15,23,42,0.97)',
                         padding: '6px 2px', margin: '4px 0',
                       }}>
                         {g.label} <span style={{ opacity: 0.6 }}>({g.items.length})</span>
                       </div>
                     )}
                     {g.items.map(r => {
                       const currentIdx = flatIdxCounter++;
                       return renderItem(r, currentIdx);
                     })}
                   </div>
                 ));
               })()
          }
        </div>
      </div>

      {qrModal && (
        <div
          role="presentation"
          style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', zIndex: 10000, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setQrModal(null) }}
          onKeyDown={e => { if (e.key === 'Escape') setQrModal(null) }}
        >
          <div style={{ width: '100%', maxWidth: 340, background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>Link público do veículo {qrModal.plate}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Qualquer pessoa com o link vê o histórico de vistorias, sem dados pessoais do proprietário.
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 12, wordBreak: 'break-all' }}>
              {qrModal.url}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button
                onClick={() => navigator.clipboard?.writeText(qrModal.url)}
                style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.8rem' }}
              >
                Copiar link
              </button>
              <button
                onClick={() => setQrModal(null)}
                style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 8, padding: '8px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.8rem' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
