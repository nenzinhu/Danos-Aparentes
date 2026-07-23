'use client';
import { useState, useEffect, useDeferredValue } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SavedReport, VehicleType, Damage } from '../types'
import { resolveVehicleType } from '../lib/vehicleTypeInference'
import { generatePdf } from '../lib/pdf'
import { captureSvgs } from './ReportActions'
import { VehicleIconSvg } from './VehicleSelector'
import { db } from '../lib/db'
import { supabaseEnabled } from '../lib/supabase'

function SaveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" style={{ flexShrink: 0 }} aria-hidden="true" fill="currentColor">
      <path fillRule="evenodd" d="M61.44,0A61.44,61.44,0,1,1,0,61.44,61.44,61.44,0,0,1,61.44,0Zm10.9,49.72a3.63,3.63,0,1,1,5.09,5.18L63.63,68.53a3.64,3.64,0,0,1-5.1,0L44.93,55.1A3.63,3.63,0,0,1,50,49.91l7.49,7.42.08-26.13a3.64,3.64,0,0,1,7.27.06l-.08,25.93,7.56-7.47ZM32.5,83.09l0-14.22a3.64,3.64,0,0,1,7.27.07l0,10.35q21.66,0,43.3,0l0-10.42a3.64,3.64,0,1,1,7.27.07l0,14.15h0a3.64,3.64,0,0,1-3.6,3.47q-25.32,0-50.59,0a3.63,3.63,0,0,1-3.6-3.47Z" />
    </svg>
  )
}

type SortKey = 'recent' | 'old' | 'owner' | 'plate'
type CloudState = 'cloud' | 'pending' | 'local'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Mais recentes' },
  { key: 'old', label: 'Mais antigas' },
  { key: 'owner', label: 'Cliente A–Z' },
  { key: 'plate', label: 'Placa A–Z' },
]

interface Props {
  isOpen: boolean
  saved: SavedReport[]
  onClose: () => void
  onSave: () => void
  onLoad: (r: SavedReport) => void
  onDelete: (id: string) => void
  hasAccess?: boolean
  accessToken?: string
}

// Cabeçalho do grupo: "Hoje", "Ontem" ou "Mês de Ano"
function dateBucket(ts: number): string {
  const d = new Date(ts)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const ONE_DAY = 86400000
  const today = startOf(new Date())
  const day = startOf(d)
  if (day === today) return 'Hoje'
  if (day === today - ONE_DAY) return 'Ontem'
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const CLOUD_BADGE: Record<CloudState, { icon: string; text: string; color: string; bg: string; border: string }> = {
  cloud:   { icon: '☁️', text: 'Na nuvem', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)' },
  pending: { icon: '⏳', text: 'Pendente', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  local:   { icon: '📴', text: 'Local',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
}

function CloudBadge({ state }: { state: CloudState }) {
  const b = CLOUD_BADGE[state]
  return (
    <span
      title={state === 'cloud' ? 'Sincronizada na nuvem' : state === 'pending' ? 'Aguardando envio para a nuvem' : 'Salva apenas neste dispositivo'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
        fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif',
        color: b.color, background: b.bg, border: `1px solid ${b.border}`,
        borderRadius: 999, padding: '2px 8px', lineHeight: 1.4,
      }}
    >
      <span aria-hidden="true">{b.icon}</span> {b.text}
    </span>
  )
}

export default function SavedReportsModal({ isOpen, saved, onClose, onSave, onLoad, onDelete, hasAccess, accessToken }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [generatingQrId, setGeneratingQrId] = useState<string | null>(null)
  const [qrModal, setQrModal] = useState<{ plate: string; url: string } | null>(null)
  const [copiedSignatureId, setCopiedSignatureId] = useState<string | null>(null)

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
  }, [isOpen])

  const cloudStateOf = (id: string): CloudState => {
    if (!supabaseEnabled) return 'local'
    return pendingIds.has(id) ? 'pending' : 'cloud'
  }

  const filtered = saved.filter(r => {
    if (workflowFilter === 'draft') {
      if (r.status !== 'draft') return false
    } else if (workflowFilter !== 'all') {
      const state = cloudStateOf(r.id)
      if (workflowFilter === 'local' && state === 'cloud') return false
      if (workflowFilter === 'cloud' && state !== 'cloud') return false
    }

    const q = deferredSearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (r.vehicleInfo.owner || '').toLowerCase().includes(q) ||
      (r.vehicleInfo.plate || '').toLowerCase().includes(q) ||
      (r.vehicleInfo.brand || '').toLowerCase().includes(q) ||
      (r.vehicleInfo.ref || '').toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'old': return a.savedAt - b.savedAt
      case 'owner': return (a.vehicleInfo.owner || '').localeCompare(b.vehicleInfo.owner || '', 'pt-BR')
      case 'plate': return (a.vehicleInfo.plate || '').localeCompare(b.vehicleInfo.plate || '', 'pt-BR')
      case 'recent':
      default: return b.savedAt - a.savedAt
    }
  })

  // Keyboard navigation controller
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const inInput = document.activeElement?.tagName === 'INPUT'

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveReportIndex(prev => (prev < sorted.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveReportIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (activeReportIndex >= 0 && activeReportIndex < sorted.length) {
          const activeReport = sorted[activeReportIndex]
          setExpandedReportIds(prev => {
            const next = new Set(prev)
            if (next.has(activeReport.id)) {
              next.delete(activeReport.id)
            } else {
              next.add(activeReport.id)
            }
            return next
          })
        }
      } else if (e.key === ' ') {
        if (!inInput) {
          e.preventDefault()
          if (activeReportIndex >= 0 && activeReportIndex < sorted.length) {
            const activeReport = sorted[activeReportIndex]
            setExpandedReportIds(prev => {
              const next = new Set(prev)
              if (next.has(activeReport.id)) {
                next.delete(activeReport.id)
              } else {
                next.add(activeReport.id)
              }
              return next
            })
          }
        }
      } else if (e.key.toLowerCase() === 'l') {
        if (!inInput && activeReportIndex >= 0 && activeReportIndex < sorted.length) {
          e.preventDefault()
          onLoad(sorted[activeReportIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, sorted, activeReportIndex, onClose, onLoad])

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

  // Agrupa por data só quando a ordenação é por data; senão, lista plana
  const isDateSort = sortKey === 'recent' || sortKey === 'old'
  const groups: { label: string | null; items: SavedReport[] }[] = []
  if (isDateSort) {
    let cur: { label: string | null; items: SavedReport[] } | null = null
    for (const r of sorted) {
      const label = dateBucket(r.savedAt)
      if (!cur || cur.label !== label) { cur = { label, items: [] }; groups.push(cur) }
      cur.items.push(r)
    }
  } else {
    groups.push({ label: null, items: sorted })
  }

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
      const vType = resolveVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
      const svgData = await captureSvgs(vType, r.damages)
      const companyName = hasAccess ? (localStorage.getItem('company_name') || '') : ''
      const companyLogo = hasAccess ? (localStorage.getItem('company_logo') || '') : ''
      const pdfTheme = (localStorage.getItem('vistoria_pdf_theme') as 'modern' | 'editorial') || 'modern'
      await generatePdf(r.vehicleInfo, r.damages, svgData, { companyName, companyLogo, pdfTheme })
    } catch (e) {
      console.error('Failed to generate PDF from modal:', e)
    } finally {
      setDownloadingId(null)
    }
  }

  const renderItem = (r: SavedReport, flatIdx: number) => {
    const vType = resolveVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
    const detail = [
      r.vehicleInfo.owner || 'Proprietário não informado',
      r.vehicleInfo.city || null,
      r.vehicleInfo.phone || null,
    ].filter(Boolean).join(' • ')
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

    const viewLabels: Record<string, string> = {
      'lateral-left': 'Lat. Esq.',
      'lateral-right': 'Lat. Dir.',
      'frontal': 'Frontal',
      'traseira': 'Traseira',
    }
    const severityLabels: Record<string, string> = {
      low: 'Leve',
      medium: 'Média',
      high: 'Grave',
    }
    const severityColors: Record<string, string> = {
      low: '#94a3b8',
      medium: '#f97316',
      high: '#ef4444',
    }

    return (
      <div
        key={r.id}
        data-report-index={flatIdx}
        onClick={toggleExpand}
        style={{
          background: isActive ? 'rgba(0,170,255,0.06)' : 'rgba(0,0,0,0.2)',
          border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '10px 12px',
          marginBottom: 8,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.65rem', color: isExpanded ? 'var(--primary)' : 'rgba(255,255,255,0.25)', width: 10, display: 'inline-block', textAlign: 'center', userSelect: 'none' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
            <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <VehicleIconSvg type={vType} size={20} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                {r.vehicleInfo.brand || 'Veículo'} — {r.vehicleInfo.plate || 'S/P'}
              </span>
              {r.status === 'draft' && (
                <span
                  title="Prévia cadastral — abra no celular para continuar a vistoria"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                    fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                    color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                    borderRadius: 999, padding: '2px 8px', lineHeight: 1.4,
                  }}
                >
                  💻 Prévia
                </span>
              )}
              <CloudBadge state={cloudStateOf(r.id)} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {detail}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.8 }}>
              {r.damages.length} avaria(s) • {new Date(r.savedAt).toLocaleString('pt-BR')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => handleDownloadPdf(r)}
              disabled={downloadingId !== null}
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 8,
                padding: '5px 10px',
                color: '#10b981',
                cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                opacity: downloadingId !== null && downloadingId !== r.id ? 0.5 : 1
              }}
            >
              {downloadingId === r.id ? '⏳' : '📄 PDF'}
            </button>
            <button
              onClick={() => handleGenerateQr(r)}
              disabled={generatingQrId !== null || !r.vehicleInfo.plate}
              title="Gerar QR para colar no veículo"
              style={{
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: 8,
                padding: '5px 10px',
                color: '#a855f7',
                cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem',
                opacity: generatingQrId !== null && generatingQrId !== r.id ? 0.5 : 1,
              }}
            >
              {generatingQrId === r.id ? '⏳' : '🏷️ QR'}
            </button>
            <button
              onClick={() => handleCopySignatureLink(r)}
              disabled={cloudStateOf(r.id) !== 'cloud'}
              title={cloudStateOf(r.id) === 'cloud' ? 'Copiar link de assinatura remota' : 'Aguarde a vistoria sincronizar com a nuvem'}
              style={{
                background: 'rgba(236,72,153,0.1)',
                border: '1px solid rgba(236,72,153,0.2)',
                borderRadius: 8,
                padding: '5px 10px',
                color: '#ec4899',
                cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem',
                opacity: cloudStateOf(r.id) !== 'cloud' ? 0.5 : 1,
              }}
            >
              {copiedSignatureId === r.id ? '✓ Copiado' : '🖊️ Assinatura'}
            </button>
            <button
              onClick={() => onLoad(r)}
              style={{
                background: 'rgba(0,170,255,0.1)',
                border: '1px solid rgba(0,170,255,0.2)',
                borderRadius: 8,
                padding: '5px 10px',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            >
              Carregar
            </button>
            <button
              onClick={() => onDelete(r.id)}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                padding: '5px 8px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.72rem'
              }}
            >
              🗑️
            </button>
          </div>
        </div>

        {isExpanded && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              📋 DETALHES DAS AVARIAS
            </div>
            {r.damages.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, paddingLeft: 6 }}>
                ✨ Nenhuma avaria registrada neste laudo.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.damages.map((d, idx) => (
                  <div key={d.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.72rem', paddingLeft: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', userSelect: 'none' }}>├─</span>
                    <span style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: severityColors[d.severity] || '#fff',
                      marginTop: 6,
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, color: '#cbd5e1' }}>
                        {viewLabels[d.view] || d.view} • {d.partName} ({d.typeName})
                      </span>
                      <span style={{ marginLeft: 6, fontWeight: 800, color: severityColors[d.severity] }}>
                        [{severityLabels[d.severity]}]
                      </span>
                      {d.photos && d.photos.length > 0 && (
                        <span style={{ marginLeft: 6, color: 'var(--primary)', fontWeight: 800, fontSize: '0.68rem' }} title={`${d.photos.length} foto(s)`}>
                          📷 {d.photos.length}
                        </span>
                      )}
                      {d.notes && (
                        <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          &quot;{d.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 700, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>📦 Vistorias Salvas</div>
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', zIndex: 10000, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setQrModal(null) }}
        >
          <div style={{ width: '100%', maxWidth: 340, background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>QR do veículo {qrModal.plate}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Cole este QR no veículo (para-brisa, porta-luvas). Qualquer pessoa que escanear vê o histórico
              de vistorias, sem dados pessoais do proprietário.
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'inline-block' }}>
              <QRCodeSVG value={qrModal.url} size={200} />
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
