'use client';
import { useState, useDeferredValue } from 'react'
import { SavedReport, VehicleType, Damage } from '../types'
import { generatePdf } from '../lib/pdf'
import { captureSvgs } from './ReportActions'

function SaveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" style={{ flexShrink: 0 }} aria-hidden="true" fill="currentColor">
      <path fillRule="evenodd" d="M61.44,0A61.44,61.44,0,1,1,0,61.44,61.44,61.44,0,0,1,61.44,0Zm10.9,49.72a3.63,3.63,0,1,1,5.09,5.18L63.63,68.53a3.64,3.64,0,0,1-5.1,0L44.93,55.1A3.63,3.63,0,0,1,50,49.91l7.49,7.42.08-26.13a3.64,3.64,0,0,1,7.27.06l-.08,25.93,7.56-7.47ZM32.5,83.09l0-14.22a3.64,3.64,0,0,1,7.27.07l0,10.35q21.66,0,43.3,0l0-10.42a3.64,3.64,0,1,1,7.27.07l0,14.15h0a3.64,3.64,0,0,1-3.6,3.47q-25.32,0-50.59,0a3.63,3.63,0,0,1-3.6-3.47Z" />
    </svg>
  )
}

interface Props {
  isOpen: boolean
  saved: SavedReport[]
  onClose: () => void
  onSave: () => void
  onLoad: (r: SavedReport) => void
  onDelete: (id: string) => void
  hasAccess?: boolean
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

export default function SavedReportsModal({ isOpen, saved, onClose, onSave, onLoad, onDelete, hasAccess }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  
  const deferredSearchQuery = useDeferredValue(searchQuery)

  if (!isOpen) return null

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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 700, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>📦 Vistorias Salvas</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Armazenadas localmente (IndexedDB)</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onSave} style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '8px 14px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 7 }}><SaveIcon /> Salvar Atual</button>
            <button onClick={onClose} style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.82rem' }}>✖ Fechar</button>
          </div>
        </div>
        <div style={{ padding: '12px 18px', maxHeight: '60vh', overflowY: 'auto' }}>
          {saved.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por cliente, placa, modelo ou OS..."
                style={{
                  width: '100%',
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
            </div>
          )}

          {filtered.length === 0
             ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                 {saved.length === 0 ? 'Nenhuma vistoria salva.' : 'Nenhum resultado encontrado para a busca.'}
               </div>
             : filtered.map(r => (
              <div key={r.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.vehicleInfo.brand || 'Veículo'} — {r.vehicleInfo.plate || 'S/P'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.vehicleInfo.owner || 'Proprietário não informado'} • {r.damages.length} avaria(s) • {new Date(r.savedAt).toLocaleString('pt-BR')}</div>
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
                    opacity: downloadingId !== null && downloadingId !== r.id ? 0.5 : 1
                  }}
                >
                  {downloadingId === r.id ? '⏳' : '📄 PDF'}
                </button>
                <button onClick={() => onLoad(r)} style={{ background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.78rem' }}>Carregar</button>
                <button onClick={() => onDelete(r.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem' }}>🗑️</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
