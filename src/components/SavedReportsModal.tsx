'use client';
import { useState, useEffect, useDeferredValue } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SavedReport, VehicleType, Damage } from '../types'
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

function getVehicleType(desc: string, damages: Damage[]): VehicleType {
  if (damages && damages.length > 0) {
    const type = damages[0].vehicle
    if (type) return type
  }
  const text = (desc || '').toLowerCase()
  if (text.includes('moto')) return 'moto'
  if (text.includes('caminh')) return 'truck'
  if (text.includes('ônibus') || text.includes('onibus') || text.includes('ônibus / micro-ônibus')) return 'bus'
  if (text.includes('van') || text.includes('utilit')) return 'van'
  return 'car'
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

  if (!isOpen) return null

  const cloudStateOf = (id: string): CloudState => {
    if (!supabaseEnabled) return 'local'
    return pendingIds.has(id) ? 'pending' : 'cloud'
  }

  const filtered = saved.filter(r => {
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
      const vType = getVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
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

  const renderItem = (r: SavedReport) => {
    const vType = getVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
    const detail = [
      r.vehicleInfo.owner || 'Proprietário não informado',
      r.vehicleInfo.city || null,
      r.vehicleInfo.phone || null,
    ].filter(Boolean).join(' • ')
    return (
      <div key={r.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 9, background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <VehicleIconSvg type={vType} size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.vehicleInfo.brand || 'Veículo'} — {r.vehicleInfo.plate || 'S/P'}</span>
            <CloudBadge state={cloudStateOf(r.id)} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.8 }}>{r.damages.length} avaria(s) • {new Date(r.savedAt).toLocaleString('pt-BR')}</div>
        </div>
        <button
          onClick={() => handleDownloadPdf(r)}
          disabled={downloadingId !== null}
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#10b981',
            cursor: 'pointer',
            fontFamily: 'Outfit,sans-serif',
            fontWeight: 700,
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
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
            padding: '6px 12px',
            color: '#a855f7',
            cursor: 'pointer',
            fontFamily: 'Outfit,sans-serif',
            fontWeight: 700,
            fontSize: '0.78rem',
            flexShrink: 0,
            opacity: generatingQrId !== null && generatingQrId !== r.id ? 0.5 : 1,
          }}
        >
          {generatingQrId === r.id ? '⏳' : '🏷️ QR'}
        </button>
        <button onClick={() => onLoad(r)} style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>Carregar</button>
        <button onClick={() => onDelete(r.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 }}>🗑️</button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 700, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>📦 Vistorias Salvas</div>
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
             : groups.map((g, gi) => (
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
                {g.items.map(renderItem)}
              </div>
            ))}
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
