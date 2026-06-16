import { useState, useEffect, useRef } from 'react'
import { VehicleInfo, CustomField } from '../types'

function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function InspectionDataIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 341.39" style={{ flexShrink: 0 }} aria-hidden="true" fill="currentColor">
      <path d="M3.62 302.83c-2 0-3.62-1.62-3.62-3.62 0-1.04.14-2.05.39-3.06 5.8-46 41.82-58.27 67.37-64.9 12.79-3.31 44.6-15.93 31.92-33.3-7.1-9.74-13.53-16.58-19.97-26.87-4.65-6.86-7.1-12.99-7.1-17.89 0-5.23 2.77-11.35 8.32-12.74-.73-10.53-.98-24.38-.48-35.65 1.76-19.35 15.64-33.61 33.57-39.93 7.09-2.7 3.66-13.49 11.5-13.72 18.38-.5 48.51 15.19 60.28 27.92 6.86 7.35 11.26 17.15 12 30.14l-.74 32.46c3.43.98 5.64 3.19 6.62 6.62.98 3.92 0 9.31-3.43 16.91 0 .24-.25.24-.25.49-7.56 12.46-15.44 20.72-24.1 32.26-3.86 5.16-3.11 10.09.1 14.53-4.51 2.63-8.92 5.66-13.15 9.22-16.79 14.09-29.76 35.09-34.32 68.53-.9 3.91-1.25 8.64-.6 12.6H3.62zm415.6-73.61c-.03-3.56-.36-6.1 4.05-6.04l14.28.18c4.61-.03 5.84 1.43 5.79 5.75v19.48h19.36c3.55-.03 6.09-.36 6.03 4.05l-.17 14.29c.02 4.61-1.44 5.83-5.76 5.78h-19.46v19.47c.05 4.32-1.18 5.78-5.79 5.75l-14.28.18c-4.41.06-4.08-2.48-4.05-6.04v-19.36h-19.49c-4.31.05-5.77-1.17-5.75-5.78l-.17-14.29c-.07-4.41 2.48-4.08 6.03-4.05h19.38v-19.37zm12.05-49.31c22.29 0 42.48 9.04 57.08 23.65 14.61 14.61 23.65 34.81 23.65 57.09 0 22.3-9.04 42.48-23.65 57.09-14.6 14.61-34.8 23.65-57.08 23.65-22.3 0-42.48-9.04-57.09-23.65l-.45-.48c-14.35-14.59-23.2-34.59-23.2-56.61 0-22.26 9.04-42.45 23.66-57.06 14.6-14.64 34.79-23.68 57.08-23.68zm45.31 35.42c-11.59-11.59-27.61-18.76-45.31-18.76-17.7 0-33.74 7.17-45.33 18.76-11.6 11.57-18.76 27.6-18.76 45.32 0 17.53 7.01 33.41 18.36 44.94l.41.38c11.59 11.6 27.61 18.77 45.32 18.77 17.69 0 33.72-7.17 45.31-18.77 11.6-11.59 18.77-27.62 18.77-45.32 0-17.69-7.17-33.73-18.77-45.32zm-322.65 87.54c-2.44 0-4.42-1.98-4.42-4.43 0-1.25.17-2.5.48-3.73 7.08-56.13 40.73-68.33 71.87-76.34 14.95-3.84 44.78-18.85 41.16-38.2-7.54-6.99-15.03-16.65-16.33-31.06l-.91.02c-2.09-.03-4.11-.51-6-1.57-4.16-2.37-6.44-6.91-7.54-12.08-2.3-15.79-2.89-23.85 5.53-27.38l.07-.03c-1.04-19.48 2.25-48.14-17.76-54.2 39.5-48.81 85.05-75.37 119.24-31.94 38.1 2 55.09 55.96 31.43 86.17h-1c8.42 3.53 7.15 12.58 5.53 27.38-1.1 5.17-3.38 9.71-7.54 12.08-1.89 1.06-3.91 1.54-6 1.57l-.91-.02c-1.3 14.41-8.81 24.07-16.35 31.06-1.22 6.55 1.37 12.58 5.93 17.87-13.43 17.3-21.41 39.03-21.41 62.61 0 15.05 3.25 29.35 9.09 42.22H153.93z" />
    </svg>
  )
}

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  onVehicleTypeDetected?: (type: 'car' | 'moto' | 'truck' | 'van' | 'bus') => void
}

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const VEHICLE_TYPES = ['Passeio (Carro)', 'SUV / Crossover', 'Pickup / Caminhonete', 'Motocicleta', 'Caminhão', 'Van / Utilitário', 'Ônibus / Micro-ônibus', 'Outro']
const TOKEN = '622283d1f02d343efd13800a14dd0ab8'

interface FoundData {
  brand: string
  color: string
  city: string
  state: string
  vehicleTypeDesc: string
  svgType: 'car' | 'moto' | 'truck' | 'van' | 'bus'
  ano: string
  especie: string
}

const FIELD_LABELS: Record<string, string> = {
  profile: 'Perfil do Relatório',
  ref: 'Nº da OS',
  owner: 'Proprietário / Cliente',
  phone: 'Telefone',
  brand: 'Marca / Modelo',
  plate: 'Placa do Veículo',
  color: 'Cor do Veículo',
  vehicleTypeDesc: 'Tipo do Veículo',
  city: 'Cidade de Emplacamento',
  state: 'Estado (UF)',
}

function loadFieldFilter(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem('vistoria_field_filter')
    if (saved) return JSON.parse(saved)
  } catch {}
  return Object.fromEntries(Object.keys(FIELD_LABELS).map(k => [k, true]))
}

function saveFieldFilter(state: Record<string, boolean>) {
  localStorage.setItem('vistoria_field_filter', JSON.stringify(state))
}

interface CustomFieldDef { id: string; label: string }

function loadCustomFieldDefs(): CustomFieldDef[] {
  try {
    const saved = localStorage.getItem('vistoria_custom_field_defs')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveCustomFieldDefs(defs: CustomFieldDef[]) {
  localStorage.setItem('vistoria_custom_field_defs', JSON.stringify(defs))
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, padding: '8px 10px', color: 'var(--text-main)',
  fontFamily: 'Outfit,sans-serif', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
}

export default function VehicleInfoForm({ info, onChange, collapsed, onToggleCollapse, onVehicleTypeDetected }: Props) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(loadFieldFilter)
  const [filterOpen, setFilterOpen] = useState(false)
  const [plateStatus, setPlateStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle')
  const [foundData, setFoundData] = useState<FoundData | null>(null)
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>(loadCustomFieldDefs)
  const [newFieldName, setNewFieldName] = useState('')
  const filterRef = useRef<HTMLDivElement>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const anyHidden = Object.values(visibleFields).some(v => !v)

  function addCustomField() {
    const label = newFieldName.trim()
    if (!label) return
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const next = [...customFieldDefs, { id, label }]
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields: CustomField[] = [...(info.customFields || []), { id, label, value: '' }]
    onChange({ ...info, customFields: fields })
    setNewFieldName('')
  }

  function removeCustomField(id: string) {
    const next = customFieldDefs.filter(d => d.id !== id)
    setCustomFieldDefs(next); saveCustomFieldDefs(next)
    const fields = (info.customFields || []).filter(f => f.id !== id)
    onChange({ ...info, customFields: fields })
  }

  function setCustomFieldValue(id: string, label: string, value: string) {
    const existing = info.customFields || []
    const has = existing.some(f => f.id === id)
    const fields = has
      ? existing.map(f => f.id === id ? { ...f, value } : f)
      : [...existing, { id, label, value }]
    onChange({ ...info, customFields: fields })
  }

  function customFieldValue(id: string): string {
    return (info.customFields || []).find(f => f.id === id)?.value || ''
  }

  useEffect(() => {
    if (!filterOpen) return
    function onDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [filterOpen])

  function set(field: keyof VehicleInfo, value: string) {
    onChange({ ...info, [field]: value })
  }

  function toggleField(key: string) {
    const next = { ...visibleFields, [key]: !visibleFields[key] }
    setVisibleFields(next); saveFieldFilter(next)
  }

  function filterAll(show: boolean) {
    const next = Object.fromEntries(Object.keys(FIELD_LABELS).map(k => [k, show]))
    setVisibleFields(next); saveFieldFilter(next)
  }

  function show(key: string) { return visibleFields[key] !== false }

  function onPlateChange(value: string) {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
    set('plate', clean)
    setPlateStatus('idle')
    setFoundData(null)
    if (lookupTimer.current) clearTimeout(lookupTimer.current)
    if (clean.length === 7) {
      lookupTimer.current = setTimeout(() => lookupPlate(clean), 600)
    }
  }

  async function lookupPlate(plate: string) {
    setPlateStatus('loading')
    try {
      const res = await fetch(`https://wdapi2.com.br/consulta/${plate}/${TOKEN}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.erro || data.error || data.message?.toLowerCase().includes('not found')) throw new Error('not found')

      const marca = (data.MARCA || data.marca || '').trim()
      const modelo = (data.MODELO || data.modelo || data.SUBMODELO || '').trim()
      const anoVal = String(data.anoModelo || data.ano || data.ANO || '').trim()
      const cor = (data.cor || data.COR || '').trim()
      const cidade = (data.municipio || data.MUNICIPIO || data.cidade || '').trim()
      const uf = (data.uf || data.UF || data.estado || '').trim().toUpperCase()
      const especieRaw = [data.especie, data.ESPECIE].filter(Boolean).join(' ')
      const tipoRaw = [data.tipo, data.TIPO, data.carroceria, data.CARROCERIA, data.especie, data.ESPECIE, data.categoria, data.CATEGORIA].filter(Boolean).join(' ').toLowerCase()

      let vtypeVal = 'Passeio (Carro)'
      let svgType: 'car' | 'moto' | 'truck' | 'van' | 'bus' = 'car'

      if (tipoRaw.includes('motoneta') || tipoRaw.includes('motociclet') || tipoRaw.includes('moto') || tipoRaw.includes('ciclomotor') || tipoRaw.includes('triciclo')) {
        vtypeVal = 'Motocicleta'; svgType = 'moto'
      } else if (tipoRaw.includes('caminh') || tipoRaw.includes('trator') || tipoRaw.includes('reboque') || tipoRaw.includes('semi-reboque')) {
        vtypeVal = 'Caminhão'; svgType = 'truck'
      } else if (tipoRaw.includes('ônibus') || tipoRaw.includes('onibus') || tipoRaw.includes('micro') || tipoRaw.includes('microônibus')) {
        vtypeVal = 'Ônibus / Micro-ônibus'; svgType = 'bus'
      } else if (tipoRaw.includes('van') || tipoRaw.includes('utilitário') || tipoRaw.includes('utilitario') || tipoRaw.includes('furgão') || tipoRaw.includes('furgao')) {
        vtypeVal = 'Van / Utilitário'; svgType = 'van'
      } else if (tipoRaw.includes('caminhonete') || tipoRaw.includes('pickup')) {
        vtypeVal = 'Pickup / Caminhonete'
      } else if (tipoRaw.includes('suv') || tipoRaw.includes('crossover')) {
        vtypeVal = 'SUV / Crossover'
      }

      const brandText = [marca, modelo, anoVal].filter(Boolean).join(' ')
      const colorText = cor ? cor.charAt(0).toUpperCase() + cor.slice(1).toLowerCase() : ''
      const cityText = cidade ? cidade.charAt(0).toUpperCase() + cidade.slice(1).toLowerCase() : ''

      const fd: FoundData = {
        brand: brandText, color: colorText, city: cityText, state: uf,
        vehicleTypeDesc: vtypeVal, svgType, ano: anoVal, especie: especieRaw || vtypeVal,
      }
      setFoundData(fd)

      const updates: Partial<VehicleInfo> = {}
      if (brandText && !info.brand) updates.brand = brandText
      if (colorText && !info.color) updates.color = colorText
      if (cityText && !info.city) updates.city = cityText
      if (uf && !info.state) updates.state = uf
      if (!info.vehicleTypeDesc) updates.vehicleTypeDesc = vtypeVal

      // usa o parâmetro `plate` (valor fresco) em vez de `info.plate`, que pode
      // estar "atrasado" (closure antiga) se o usuário digitou mais caracteres
      // enquanto a consulta da API estava em andamento — evita reverter a placa
      // para uma versão com menos de 7 caracteres.
      onChange({ ...info, ...updates, plate })
      if (onVehicleTypeDetected) onVehicleTypeDetected(svgType)

      setPlateStatus('found')
    } catch {
      setPlateStatus('error')
      setFoundData(null)
    }
  }

  const summary = [info.owner, info.plate, info.brand].filter(Boolean).join(' • ')

  // ── Collapsed view ──────────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 7 }}><InspectionDataIcon /> Dados da Vistoria</div>
          {summary && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{summary}</div>}
        </div>
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} style={{ background: 'rgba(0,170,255,0.07)', border: '1px solid rgba(0,170,255,0.22)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#7a9bbf', fontFamily: 'Outfit,sans-serif', fontSize: '0.75rem', fontWeight: 700 }}>
            ▼ Expandir
          </button>
        )}
      </div>
    )
  }

  // ── Plate status colors ─────────────────────────────────────────
  const plateBorder =
    plateStatus === 'found' ? '1.5px solid rgba(34,197,94,0.6)' :
    plateStatus === 'error' ? '1.5px solid rgba(239,68,68,0.5)' :
    plateStatus === 'loading' ? '1.5px solid rgba(234,179,8,0.5)' :
    '1.5px solid rgba(0,170,255,0.35)'

  const plateGlow =
    plateStatus === 'found' ? '0 0 18px rgba(34,197,94,0.25)' :
    plateStatus === 'error' ? '0 0 18px rgba(239,68,68,0.2)' :
    plateStatus === 'loading' ? '0 0 18px rgba(234,179,8,0.2)' :
    '0 0 18px rgba(0,170,255,0.15)'

  // ── Full expanded view ──────────────────────────────────────────
  return (
    <div>
      {/* ── Form header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🧾 Dados da Vistoria</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button onClick={() => setFilterOpen(o => !o)} style={{
              background: anyHidden ? 'rgba(0,170,255,0.14)' : 'rgba(0,170,255,0.07)',
              border: `1px solid ${anyHidden ? 'rgba(0,212,255,0.5)' : 'rgba(0,170,255,0.22)'}`,
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: anyHidden ? '#00d4ff' : '#7a9bbf',
              fontFamily: 'Outfit,sans-serif', fontSize: '0.75rem', fontWeight: 800,
              boxShadow: anyHidden ? '0 0 10px rgba(0,200,255,0.2)' : 'none',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              ⚙️ Campos {anyHidden ? `(${Object.values(visibleFields).filter(v => !v).length} oculto${Object.values(visibleFields).filter(v => !v).length > 1 ? 's' : ''})` : ''}
            </button>
            {filterOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 500,
                background: 'rgba(6,13,26,0.97)', border: '1px solid rgba(0,170,255,0.25)',
                borderRadius: 14, padding: '14px 16px', minWidth: 230,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#00aaff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                  ⚙️ Campos Visíveis
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(FIELD_LABELS).map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.78rem', color: 'rgba(200,220,240,0.85)', fontWeight: 600, userSelect: 'none' }}>
                      <input type="checkbox" checked={visibleFields[key] !== false} onChange={() => toggleField(key)}
                        style={{ accentColor: '#00aaff', width: 14, height: 14, cursor: 'pointer' }} />
                      {label}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,170,255,0.1)' }}>
                  <button onClick={() => filterAll(true)} style={{ flex: 1, background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.25)', color: '#00aaff', borderRadius: 7, padding: 5, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>Todos</button>
                  <button onClick={() => filterAll(false)} style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: 7, padding: 5, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>Nenhum</button>
                </div>

                {/* ── Campos personalizados ── */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,170,255,0.1)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#00aaff', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                    ➕ Campos Personalizados
                  </div>
                  {customFieldDefs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                      {customFieldDefs.map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ flex: 1, fontSize: '0.78rem', color: 'rgba(200,220,240,0.85)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                          <button
                            type="button"
                            onClick={() => { if (window.confirm(`Excluir o campo "${d.label}"? Ele será removido de todas as vistorias.`)) removeCustomField(d.id) }}
                            title="Excluir campo"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 6px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      value={newFieldName}
                      onChange={e => setNewFieldName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomField() } }}
                      placeholder="Nome do novo campo"
                      style={{ ...inputStyle, flex: 1, padding: '6px 8px', fontSize: '0.78rem' }}
                    />
                    <button
                      type="button"
                      onClick={addCustomField}
                      disabled={!newFieldName.trim()}
                      style={{
                        background: newFieldName.trim() ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${newFieldName.trim() ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: newFieldName.trim() ? '#22c55e' : 'var(--text-muted)',
                        borderRadius: 7, padding: '5px 12px', fontSize: '0.72rem', fontWeight: 800,
                        cursor: newFieldName.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >+ Criar e Salvar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} style={{ background: 'rgba(0,170,255,0.07)', border: '1px solid rgba(0,170,255,0.22)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#7a9bbf', fontFamily: 'Outfit,sans-serif', fontSize: '0.75rem', fontWeight: 700 }}>
              ▲ Minimizar
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BLOCO DE BUSCA POR PLACA — em destaque
      ══════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,90,200,0.14) 0%, rgba(0,40,120,0.10) 100%)',
        border: '1px solid rgba(0,170,255,0.28)',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 18,
        boxShadow: '0 4px 24px rgba(0,100,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* glow top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(0,200,255,0.6),transparent)', pointerEvents: 'none' }} />

        {/* Label destaque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,170,255,0.12)', border: '1px solid rgba(0,170,255,0.3)',
            borderRadius: 100, padding: '3px 12px',
            fontSize: '0.7rem', fontWeight: 900, color: '#00d4ff',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 6px #00d4ff', display: 'inline-block', animation: 'none' }} />
            Consulta de Placa — API Automática
          </div>
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: 0, maxWidth: 280 }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Placa do Veículo
            </label>
            {/* Plate styled like a real Mercosul plate */}
            <div style={{ position: 'relative', display: 'block', width: '100%' }}>
              <input
                value={info.plate}
                onChange={e => onPlateChange(e.target.value)}
                placeholder="ABC1D23"
                maxLength={7}
                autoComplete="off"
                spellCheck={false}
                style={{
                  width: '100%',
                  maxWidth: 240,
                  minWidth: 0,
                  background: 'rgba(2,8,20,0.85)',
                  border: plateBorder,
                  borderRadius: 10,
                  padding: '12px 10px',
                  color: '#ffffff',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  outline: 'none',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  boxShadow: plateBorder + ', ' + plateGlow,
                  transition: 'border 0.25s, box-shadow 0.25s',
                }}
              />
              {/* Status badge inline */}
              {plateStatus === 'loading' && (
                <div style={{ position: 'absolute', top: -10, right: -10, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.5)', color: '#eab308', borderRadius: 100, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap' }}>⏳</div>
              )}
              {plateStatus === 'found' && (
                <div style={{ position: 'absolute', top: -10, right: -10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.5)', color: '#22c55e', borderRadius: 100, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800 }}>✓</div>
              )}
              {plateStatus === 'error' && (
                <div style={{ position: 'absolute', top: -10, right: -10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: 100, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800 }}>✗</div>
              )}
            </div>
          </div>

          {/* Status + hint */}
          <div style={{ flex: 1, minWidth: 160, paddingBottom: 2 }}>
            {plateStatus === 'idle' && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Digite a placa completa (7 caracteres) para buscar automaticamente os dados do veículo.
              </div>
            )}
            {plateStatus === 'loading' && (
              <div style={{ fontSize: '0.82rem', color: '#eab308', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                Consultando base de dados...
              </div>
            )}
            {plateStatus === 'found' && foundData && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  ✓ Veículo Encontrado
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {foundData.brand && <Chip icon="🚘" label={foundData.brand} color="#00aaff" />}
                  {foundData.color && <Chip icon="🎨" label={foundData.color} color="#a78bfa" />}
                  {foundData.especie && <Chip icon="🏷️" label={foundData.especie} color="#f97316" />}
                  {foundData.city && foundData.state && <Chip icon="📍" label={`${foundData.city} / ${foundData.state}`} color="#22c55e" />}
                </div>
              </div>
            )}
            {plateStatus === 'error' && (
              <div style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 700 }}>
                ✗ Placa não encontrada na base de dados.
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: 4 }}>Preencha os dados manualmente abaixo.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Perfil + OS ── */}
      {(show('profile') || show('ref')) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 10 }}>
          {show('profile') && (
            <div>
              <label style={labelStyle}>Perfil do Relatório</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} value={info.profile} onChange={e => set('profile', e.target.value)}>
                <option value="">— Selecione —</option>
                <option value="oficina">Oficina</option>
                <option value="perito">Perito</option>
                <option value="seguradora">Seguradora</option>
              </select>
            </div>
          )}
          {show('ref') && (
            <div>
              <label style={labelStyle}>Nº da OS / Referência</label>
              <input style={inputStyle} value={info.ref} onChange={e => set('ref', e.target.value)} placeholder="Ex: 2026-00123" />
            </div>
          )}
        </div>
      )}

      {/* ── Proprietário + Telefone ── */}
      {(show('owner') || show('phone')) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 10 }}>
          {show('owner') && (
            <div>
              <label style={labelStyle}>Proprietário / Cliente</label>
              <input style={inputStyle} value={info.owner} onChange={e => set('owner', e.target.value)} placeholder="Ex: João Silva" />
            </div>
          )}
          {show('phone') && (
            <div>
              <label style={labelStyle}>Telefone (com DDD)</label>
              <input style={inputStyle} value={info.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          )}
        </div>
      )}

      {/* ── Dados do veículo ── */}
      {(show('brand') || show('color') || show('vehicleTypeDesc')) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 10 }}>
          {show('brand') && (
            <div>
              <label style={labelStyle}>Marca / Modelo / Ano</label>
              <input style={inputStyle} value={info.brand} onChange={e => set('brand', e.target.value)} placeholder="Ex: Toyota Corolla 2023" />
            </div>
          )}
          {show('color') && (
            <div>
              <label style={labelStyle}>Cor do Veículo</label>
              <input style={inputStyle} value={info.color} onChange={e => set('color', e.target.value)} placeholder="Ex: Prata, Preto" />
            </div>
          )}
          {show('vehicleTypeDesc') && (
            <div>
              <label style={labelStyle}>Tipo / Espécie</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} value={info.vehicleTypeDesc} onChange={e => set('vehicleTypeDesc', e.target.value)}>
                <option value="">— Selecione —</option>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── Cidade + UF ── */}
      {(show('city') || show('state')) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10, marginBottom: 10 }}>
          {show('city') && (
            <div>
              <label style={labelStyle}>Cidade de Emplacamento</label>
              <input style={inputStyle} value={info.city} onChange={e => set('city', e.target.value)} placeholder="Ex: São Paulo" />
            </div>
          )}
          {show('state') && (
            <div>
              <label style={labelStyle}>Estado (UF)</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} value={info.state} onChange={e => set('state', e.target.value)}>
                <option value="">— UF —</option>
                {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── Campos personalizados ── */}
      {customFieldDefs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 10 }}>
          {customFieldDefs.map(d => (
            <div key={d.id}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span>{d.label}</span>
                <button
                  type="button"
                  onClick={() => { if (window.confirm(`Excluir o campo "${d.label}"? Ele será removido de todas as vistorias.`)) removeCustomField(d.id) }}
                  title="Excluir campo"
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', opacity: 0.7 }}
                >
                  <TrashIcon size={12} />
                </button>
              </label>
              <input
                style={inputStyle}
                value={customFieldValue(d.id)}
                onChange={e => setCustomFieldValue(d.id, d.label, e.target.value)}
                placeholder={`Digite ${d.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Observações ── */}
      <div>
        <label style={labelStyle}>📝 Observações Gerais</label>
        <textarea style={{ ...inputStyle, minHeight: 52, resize: 'vertical' }}
          value={info.generalNotes} onChange={e => set('generalNotes', e.target.value)}
          placeholder="Observações adicionais sobre o veículo..." />
      </div>
    </div>
  )
}

function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: `${color}14`,
      border: `1px solid ${color}33`,
      borderRadius: 100, padding: '3px 10px',
      fontSize: '0.72rem', fontWeight: 700, color,
      maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      <span>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  )
}
