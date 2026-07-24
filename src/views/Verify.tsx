'use client';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

interface HashRecord {
  hash: string
  plate: string
  ref: string
  issued_at: string
  damages_count: number
  created_at: string
  geo_lat?: number | null
  geo_lng?: number | null
  geo_accuracy?: number | null
  geo_address?: string | null
  company_name?: string | null
}

type Status = 'loading' | 'valid' | 'not_found' | 'no_hash' | 'offline' | 'error'

function normalizeHash(raw: string): string {
  return raw.trim().replace(/[\s-]/g, '').toUpperCase()
}

/** Extrai hash (+ geo opcional) de URL /verify?hash=… ou de um hash puro. */
function parseQrPayload(raw: string): { hash: string; lat?: string; lng?: string } | null {
  const text = raw.trim()
  if (!text) return null

  try {
    const url = new URL(text)
    const hash = normalizeHash(url.searchParams.get('hash') || '')
    if (hash) {
      const lat = (url.searchParams.get('lat') || '').trim() || undefined
      const lng = (url.searchParams.get('lng') || '').trim() || undefined
      return { hash, lat, lng }
    }
  } catch {
    /* não é URL — tenta hash puro ou querystring solta */
  }

  const queryMatch = text.match(/[?&]hash=([^&\s#]+)/i)
  if (queryMatch) {
    const hash = normalizeHash(decodeURIComponent(queryMatch[1]))
    if (hash) return { hash }
  }

  const hash = normalizeHash(text)
  if (/^[A-F0-9]{16,64}$/.test(hash)) return { hash }

  return null
}

export default function Verify() {
  const [status, setStatus] = useState<Status>('loading')
  const [record, setRecord] = useState<HashRecord | null>(null)
  const [hash, setHash] = useState('')
  const [inputHash, setInputHash] = useState('')
  const [geo, setGeo] = useState<{ lat: string; lng: string } | null>(null)
  const [qrScanning, setQrScanning] = useState(false)
  const [qrError, setQrError] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleGenerateCurrentPdf() {
    setIsGeneratingPdf(true)
    try {
      const { db } = await import('@/src/lib/db')
      const savedReports = await db.getAllSaved()
      const currentDamages = await db.getAllDamages()
      const metadata = await db.getMeta<any>('vehicle_info')

      if (savedReports.length > 0) {
        const latest = savedReports[savedReports.length - 1]
        const { generatePdf } = await import('@/src/lib/pdf')
        const companyName = localStorage.getItem('company_name') || record?.company_name || ''
        const companyLogo = localStorage.getItem('company_logo') || ''
        await generatePdf(latest.vehicleInfo, latest.damages, undefined, { companyName, companyLogo })
        return
      }

      if (metadata && (metadata.plate || metadata.chassis || currentDamages.length > 0)) {
        const { generatePdf } = await import('@/src/lib/pdf')
        const info: import('@/src/types').VehicleInfo = {
          owner: metadata?.owner || metadata?.clientName || 'Cliente Exemplo',
          phone: metadata?.phone || '(11) 99999-9999',
          brand: metadata?.brand || 'Toyota',
          plate: metadata?.plate || 'ABC1D23',
          generalNotes: metadata?.generalNotes || '',
          interiorNotes: metadata?.interiorNotes || '',
          interiorPhotos: metadata?.interiorPhotos || [],
          interiorPhotoNotes: metadata?.interiorPhotoNotes || [],
          profile: metadata?.profile || 'perito',
          ref: metadata?.ref || 'OS-1001',
          color: metadata?.color || 'Prata',
          vehicleTypeDesc: metadata?.vehicleTypeDesc || metadata?.model || 'Corolla 2.0 Flex',
          city: metadata?.city || 'São Paulo',
          state: metadata?.state || 'SP',
          cpf: metadata?.cpf || '123.456.789-00',
        }
        const companyName = localStorage.getItem('company_name') || record?.company_name || ''
        const companyLogo = localStorage.getItem('company_logo') || ''
        await generatePdf(info, currentDamages, undefined, { companyName, companyLogo })
        return
      }

      if (record) {
        const { generatePdf } = await import('@/src/lib/pdf')
        const info: import('@/src/types').VehicleInfo = {
          owner: 'Cliente Final',
          phone: '(11) 99999-9999',
          brand: 'Frota',
          plate: record.plate || 'ABC1D23',
          generalNotes: 'Vistoria verificada e autenticada via SHA-256',
          interiorNotes: '',
          interiorPhotos: [],
          interiorPhotoNotes: [],
          profile: 'perito',
          ref: record.ref || 'OS-2025',
          color: 'Prata',
          vehicleTypeDesc: 'Veículo Periciado',
          city: 'São Paulo',
          state: 'SP',
          cpf: '123.456.789-00',
        }
        const dummyDamages = Array.from({ length: Math.max(1, record.damages_count || 1) }, (_, i) => ({
          id: `damage-${i + 1}`,
          vehicle: 'car-sedan' as any,
          view: 'lateral-left' as const,
          partId: i === 0 ? 'porta_de' : 'parachoques_d',
          partName: i === 0 ? 'Porta Dianteira Esquerda' : 'Para-choque Dianteiro',
          type: 'risco_leve' as any,
          typeName: 'Risco Leve',
          severity: 'low' as const,
          notes: 'Avaria registrada com fotografia pericial no momento da inspeção',
          photos: [],
          photoNotes: [],
        })) as unknown as import('@/src/types').Damage[]
        const companyName = localStorage.getItem('company_name') || record.company_name || ''
        const companyLogo = localStorage.getItem('company_logo') || ''
        await generatePdf(info, dummyDamages, undefined, { companyName, companyLogo })
        return
      }

      window.open('/exemplos/modelo-relatorio-vistoria-veicular.pdf', '_blank')
    } catch {
      window.open('/exemplos/modelo-relatorio-vistoria-veicular.pdf', '_blank')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const applyAndVerify = useCallback(async (rawHash: string, nextGeo?: { lat: string; lng: string } | null) => {
    const h = normalizeHash(rawHash)
    setInputHash(h)
    if (nextGeo?.lat && nextGeo?.lng) setGeo(nextGeo)

    if (!h) {
      setStatus('no_hash')
      setHash('')
      setRecord(null)
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set('hash', h)
    if (nextGeo?.lat && nextGeo?.lng) {
      url.searchParams.set('lat', nextGeo.lat)
      url.searchParams.set('lng', nextGeo.lng)
    }
    window.history.replaceState({}, '', url.toString())

    setHash(h)
    setRecord(null)

    if (!supabaseEnabled || !supabase) {
      setStatus('offline')
      return
    }

    setStatus('loading')

    try {
      const { data, error } = await supabase.from('report_hashes').select('*').eq('hash', h).maybeSingle()
      if (error) {
        setStatus('error')
        return
      }
      if (!data) {
        setStatus('not_found')
        return
      }
      setRecord(data as HashRecord)
      setStatus('valid')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const h = (params.get('hash') || '').trim()
    setTimeout(() => { setInputHash(normalizeHash(h)); }, 0)

    const lat = (params.get('lat') || '').trim()
    const lng = (params.get('lng') || '').trim()
    if (lat && lng) setTimeout(() => { setGeo({ lat, lng }); }, 0)

    setTimeout(() => { void applyAndVerify(h, lat && lng ? { lat, lng } : null); }, 0)
  }, [applyAndVerify])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void applyAndVerify(inputHash)
  }

  async function handleQrUpload(file: File | undefined) {
    if (!file) return
    setQrError('')
    setQrScanning(true)

    const objectUrl = URL.createObjectURL(file)
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      const result = await reader.decodeFromImageUrl(objectUrl)
      const parsed = parseQrPayload(result.getText())

      if (!parsed?.hash) {
        setQrError('QR Code lido, mas não contém um HASH válido do Danos Aparentes.')
        return
      }

      await applyAndVerify(
        parsed.hash,
        parsed.lat && parsed.lng ? { lat: parsed.lat, lng: parsed.lng } : null,
      )
    } catch {
      setQrError('Não foi possível ler o QR Code. Envie uma foto nítida do código no laudo.')
    } finally {
      URL.revokeObjectURL(objectUrl)
      setQrScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const ICONS: Record<Status, { icon: string; bg: string; text: string; border: string; title: string; desc: string }> = {
    loading:   { 
      icon: '⏳', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
      title: 'VERIFICANDO REGISTRO', desc: 'Aguarde enquanto consultamos a autenticidade deste documento em nossa base de dados digital.' 
    },
    valid:     { 
      icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
      title: 'DOCUMENTO AUTÊNTICO', desc: 'A integridade deste relatório foi confirmada. As informações abaixo correspondem ao registro original.' 
    },
    not_found: { 
      icon: '❌', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
      title: 'NÃO LOCALIZADO', desc: 'Este código não corresponde a nenhum documento emitido pelo sistema. O PDF pode ser inválido ou adulterado.' 
    },
    no_hash:   { 
      icon: '⚠️', bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200',
      title: 'INFORME O HASH OU O QR', desc: 'Digite o HASH do laudo ou envie uma foto do QR Code impresso no documento para verificar a autenticidade.' 
    },
    offline:   { 
      icon: '⚠️', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
      title: 'SISTEMA INDISPONÍVEL', desc: 'A verificação online não está ativa neste ambiente. Valide o HASH manualmente com a via impressa.' 
    },
    error:     { 
      icon: '⚠️', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
      title: 'ERRO DE CONEXÃO', desc: 'Ocorreu uma falha na comunicação com o servidor de autenticidade. Tente novamente em instantes.' 
    },
  }

  const view = ICONS[status]
  const isBusy = status === 'loading' || qrScanning
  const showForm = status === 'no_hash' || status === 'not_found' || status === 'error' || status === 'valid'
  const canSubmit = !isBusy && !!normalizeHash(inputHash)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-outfit text-slate-900">
      <div className="w-full max-w-2xl bg-white shadow-xl border border-slate-200 rounded-sm overflow-hidden relative">
        {/* Document Header */}
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-4 border-blue-500">
          <div>
            <h1 className="text-xl font-black tracking-tighter italic">DANOS APARENTES</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Sistema de Vistoria e Perícia Automotiva</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase text-slate-400">Certificado de Autenticidade</div>
            <div className="text-sm font-mono tracking-tighter">REF: {record?.ref || '---'}</div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Status Section */}
          <div className={`${view.bg} ${view.border} border rounded-lg p-6 flex gap-6 items-start transition-all duration-500`}>
            <div className="text-5xl shrink-0">{view.icon}</div>
            <div>
              <h2 className={`text-lg font-black uppercase tracking-tight ${view.text} mb-1`}>{view.title}</h2>
              {status === 'valid' && record?.company_name && (
                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Emitido por {record.company_name}</p>
              )}
              <p className="text-sm leading-relaxed opacity-80">{view.desc}</p>
            </div>
          </div>

          {/* Manual hash + QR upload */}
          {showForm && (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="hash-input" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Verificar pelo HASH do laudo
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="hash-input"
                    type="text"
                    value={inputHash}
                    onChange={(e) => setInputHash(e.target.value.toUpperCase())}
                    placeholder="Cole ou digite o HASH (ex: EEA9011EA43BCD2177DBB4F6CA639B87)"
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded px-4 py-3 font-mono text-sm text-slate-800 tracking-wide placeholder:text-slate-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="shrink-0 px-5 py-3 rounded bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Verificar
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O HASH aparece no rodapé do PDF, junto ao QR Code. Aceita letras e números; espaços são ignorados.
                </p>
              </form>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ou</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="space-y-3">
                <label htmlFor="qr-upload" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Enviar foto do QR Code
                </label>
                <input
                  ref={fileInputRef}
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => void handleQrUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {qrScanning ? 'Lendo QR Code…' : '📷 Escolher ou tirar foto do QR'}
                </button>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tire uma foto ou envie a imagem do QR Code impresso no laudo. O sistema extrai o HASH automaticamente.
                </p>
                {qrError && (
                  <p className="text-[11px] font-bold text-rose-600 leading-relaxed" role="alert">
                    {qrError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Data Section */}
          {status === 'valid' && record && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Detalhes do Registro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <Row label="Placa do Veículo" value={record.plate || 'NÃO INFORMADA'} />
                <Row label="Referência / OS" value={record.ref || 'NÃO INFORMADA'} />
                <Row label="Danos Registrados" value={String(record.damages_count)} />
                <Row label="Data de Emissão" value={record.issued_at || 'NÃO INFORMADA'} />
                {record.company_name && <Row label="Empresa Emissora" value={record.company_name} />}
              </div>
            </div>
          )}

          {/* Localização da vistoria — prioriza o registro autenticado do banco;
              cai para os parâmetros do QR Code apenas como exibição. */}
          {(() => {
            const fromDb = !!record && record.geo_lat != null && record.geo_lng != null
            const lat = fromDb ? String(record!.geo_lat) : geo?.lat
            const lng = fromDb ? String(record!.geo_lng) : geo?.lng
            if (!lat || !lng) return null
            const accuracy = fromDb ? record!.geo_accuracy : null
            const address = fromDb ? record!.geo_address : null
            return (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
                  <span>Local da Vistoria</span>
                  {fromDb
                    ? <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">✓ AUTENTICADO</span>
                    : <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">NÃO CONFIRMADO</span>}
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-800">{lat}, {lng}</span>
                    {typeof accuracy === 'number' && <span className="text-xs text-slate-400 ml-2">± {accuracy} m</span>}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    🗺️ Abrir no Google Maps
                  </a>
                </div>
                {address && <p className="text-xs text-slate-500 leading-relaxed">{address}</p>}
              </div>
            )
          })()}

          {/* Footer Info */}
          <div className="pt-8 border-t border-dashed border-slate-200">
            <div className="flex flex-col md:flex-row justify-between gap-6 items-end relative">
              <div className="space-y-3 w-full max-w-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificador Digital (HASH)</div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                  {hash || 'NENHUM HASH FORNECIDO PARA VALIDAÇÃO'}
                </div>
              </div>
              
              <div className="hidden md:block opacity-10 select-none pointer-events-none absolute bottom-0 right-0 rotate-[-12deg]">
                <div className="border-4 border-slate-900 rounded-full w-32 h-32 flex items-center justify-center font-black text-center p-2 text-slate-900">
                  LAUDO<br/>VERIFICADO
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100 flex flex-col items-center gap-2">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.1em]">
            Este documento é uma representação digital de validade pública garantida por tecnologia de hashing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-[11px]">
            <span className="text-slate-400 font-bold">Modelos PDF:</span>
            <button
              onClick={() => void handleGenerateCurrentPdf()}
              disabled={isGeneratingPdf}
              className="font-bold text-blue-600 hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 bg-transparent border-0 p-0"
              title="Gerar/Baixar PDF do Laudo Atual"
            >
              📄 {isGeneratingPdf ? 'Gerando PDF do Laudo…' : 'Laudo de Vistoria (PDF - Gerar Laudo Atual)'}
            </button>
            <span className="text-slate-300">·</span>
            <a href="/exemplos/modelo-verificacao-autenticidade.pdf" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 hover:underline">
              🛡️ Certificado de Autenticidade SHA-256 (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-800 uppercase leading-tight">{value}</span>
    </div>
  )
}
