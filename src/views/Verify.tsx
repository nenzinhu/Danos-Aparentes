'use client'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import {
  isPublicCodeQuery,
  maskPlate,
  normalizePublicCode,
  presentVerifyOutcome,
  resolveVerifyOutcome,
  type PublicVerifyOutcome,
} from '../lib/verify/publicVerify'
import { comparePdfUpload, hashPdfBytes } from '../lib/verify/pdfUploadVerify'

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
  company_logo?: string | null
  report_key?: string | null
  version?: number | null
  public_code?: string | null
  inspection_id?: string | null
}

interface VersionInfo {
  version: number
  total: number
  latestHash: string
  isLatest: boolean
}

type Status = 'loading' | 'valid' | 'not_found' | 'no_hash' | 'offline' | 'error' | PublicVerifyOutcome

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
    const code = normalizePublicCode(url.searchParams.get('code') || '')
    if (code) return { hash: code }
  } catch {
    /* não é URL */
  }

  const queryMatch = text.match(/[?&]hash=([^&\s#]+)/i)
  if (queryMatch) {
    const hash = normalizeHash(decodeURIComponent(queryMatch[1]))
    if (hash) return { hash }
  }

  const codeMatch = text.match(/[?&]code=([^&\s#]+)/i)
  if (codeMatch) {
    const code = normalizePublicCode(decodeURIComponent(codeMatch[1]))
    if (code) return { hash: code }
  }

  if (isPublicCodeQuery(text)) return { hash: normalizePublicCode(text) }

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
  const [pdfScanning, setPdfScanning] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [outcome, setOutcome] = useState<PublicVerifyOutcome | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const applyAndVerify = useCallback(async (rawHash: string, nextGeo?: { lat: string; lng: string } | null) => {
    const raw = rawHash.trim()
    const byCode = isPublicCodeQuery(raw)
    const h = byCode ? normalizePublicCode(raw) : normalizeHash(raw)
    setInputHash(h)
    if (nextGeo?.lat && nextGeo?.lng) setGeo(nextGeo)

    if (!h) {
      setStatus('no_hash')
      setHash('')
      setRecord(null)
      setOutcome(null)
      return
    }

    const url = new URL(window.location.href)
    if (byCode) {
      url.searchParams.delete('hash')
      url.searchParams.set('code', h)
    } else {
      url.searchParams.delete('code')
      url.searchParams.set('hash', h)
    }
    if (nextGeo?.lat && nextGeo?.lng) {
      url.searchParams.set('lat', nextGeo.lat)
      url.searchParams.set('lng', nextGeo.lng)
    }
    window.history.replaceState({}, '', url.toString())

    setHash(h)
    setRecord(null)
    setVersionInfo(null)
    setOutcome(null)

    if (!supabaseEnabled || !supabase) {
      setStatus('offline')
      return
    }

    setStatus('loading')

    try {
      let data: HashRecord | null = null
      if (byCode) {
        const res = await supabase
          .from('report_hashes')
          .select('*')
          .eq('public_code', h)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (res.error) {
          setStatus('error')
          return
        }
        data = (res.data as HashRecord) || null
      } else {
        const res = await supabase.from('report_hashes').select('*').eq('hash', h).maybeSingle()
        if (res.error) {
          setStatus('error')
          return
        }
        data = (res.data as HashRecord) || null
      }

      if (!data) {
        const o = resolveVerifyOutcome({ found: false })
        setOutcome(o)
        setStatus(o)
        return
      }

      const rec = data
      setRecord(rec)
      setHash(rec.hash)

      let isSupersededVersion = false
      if (rec.report_key) {
        const { data: siblings } = await supabase
          .from('report_hashes')
          .select('hash, version')
          .eq('report_key', rec.report_key)
          .order('version', { ascending: true })
        if (siblings && siblings.length > 0) {
          const latest = siblings[siblings.length - 1] as { hash: string; version: number }
          const info = {
            version: rec.version || 1,
            total: siblings.length,
            latestHash: latest.hash,
            isLatest: latest.hash === rec.hash,
          }
          setVersionInfo(info)
          isSupersededVersion = !info.isLatest && info.total > 1
        }
      }

      let inspectionStatus: string | null = null
      if (rec.inspection_id) {
        const { data: insp } = await supabase
          .from('vehicle_inspections')
          .select('status')
          .eq('id', rec.inspection_id)
          .maybeSingle()
        inspectionStatus = (insp?.status as string) || null
      }

      const o = resolveVerifyOutcome({
        found: true,
        inspectionStatus,
        isSupersededVersion,
      })
      setOutcome(o)
      setStatus(o === 'integrity_confirmed' ? 'valid' : o)
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const h = (params.get('hash') || params.get('code') || '').trim()
    setTimeout(() => { setInputHash(h.toUpperCase()); }, 0)

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
        setQrError('QR Code lido, mas não contém um HASH ou código público válido do Danos Aparentes.')
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

  async function handlePdfUpload(file: File | undefined) {
    if (!file) return
    setPdfError('')
    setPdfScanning(true)
    setRecord(null)
    setVersionInfo(null)
    setOutcome(null)

    try {
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        setPdfError('Envie um arquivo PDF do laudo.')
        return
      }
      if (!supabaseEnabled || !supabase) {
        setStatus('offline')
        return
      }

      const buf = await file.arrayBuffer()
      const pdfHash = await hashPdfBytes(buf)

      const byPdf = await supabase
        .from('report_hashes')
        .select('*')
        .filter('integrity_manifest->>pdf_hash', 'eq', pdfHash)
        .limit(1)
        .maybeSingle()

      let matchedBy: 'pdf_hash' | 'typed_hash' | 'none' = 'none'
      let data = (byPdf.data as HashRecord | null) || null
      if (data) matchedBy = 'pdf_hash'

      if (!data && inputHash.trim()) {
        const typed = inputHash.trim()
        const byCode = isPublicCodeQuery(typed)
        const key = byCode ? normalizePublicCode(typed) : normalizeHash(typed)
        const res = byCode
          ? await supabase.from('report_hashes').select('*').eq('public_code', key).order('version', { ascending: false }).limit(1).maybeSingle()
          : await supabase.from('report_hashes').select('*').eq('hash', key).maybeSingle()
        data = (res.data as HashRecord | null) || null
        if (data) matchedBy = 'typed_hash'
      }

      let inspectionStatus: string | null = null
      let isSupersededVersion = false
      if (data?.inspection_id) {
        const { data: insp } = await supabase
          .from('vehicle_inspections')
          .select('status')
          .eq('id', data.inspection_id)
          .maybeSingle()
        inspectionStatus = (insp?.status as string) || null
      }
      if (data?.report_key) {
        const { data: siblings } = await supabase
          .from('report_hashes')
          .select('hash, version')
          .eq('report_key', data.report_key)
          .order('version', { ascending: true })
        if (siblings && siblings.length > 1) {
          const latest = siblings[siblings.length - 1] as { hash: string; version: number }
          isSupersededVersion = latest.hash !== data.hash
          setVersionInfo({
            version: data.version || 1,
            total: siblings.length,
            latestHash: latest.hash,
            isLatest: latest.hash === data.hash,
          })
        }
      }

      const o = comparePdfUpload({
        uploadedPdfHash: pdfHash,
        record: data
          ? {
              hash: data.hash,
              final_hash: (data as HashRecord & { final_hash?: string }).final_hash,
              integrity_manifest: (data as HashRecord & { integrity_manifest?: { pdf_hash?: string } }).integrity_manifest,
              inspection_status: inspectionStatus,
              is_superseded_version: isSupersededVersion,
            }
          : null,
        matchedBy,
      })

      setOutcome(o)
      setStatus(o === 'integrity_confirmed' ? 'valid' : o)
      if (data) {
        setRecord(data)
        setHash(data.hash)
      } else {
        setHash(pdfHash.slice(0, 32).toUpperCase())
      }
    } catch {
      setPdfError('Não foi possível verificar o PDF. Tente novamente.')
      setStatus('error')
    } finally {
      setPdfScanning(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  const presentation = outcome ? presentVerifyOutcome(outcome) : null

  const ICONS: Record<string, { icon: string; bg: string; text: string; border: string; title: string; desc: string }> = {
    loading: {
      icon: '⏳', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
      title: 'VERIFICANDO REGISTRO', desc: 'Aguarde enquanto consultamos o registro técnico deste documento.',
    },
    valid: {
      icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
      title: presentation?.title || 'INTEGRIDADE CONFIRMADA',
      desc: presentation?.description || 'A integridade deste relatório foi confirmada no registro de emissão.',
    },
    integrity_confirmed: {
      icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200',
      title: 'INTEGRIDADE CONFIRMADA',
      desc: presentVerifyOutcome('integrity_confirmed').description,
    },
    integrity_not_confirmed: {
      icon: '❌', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
      title: 'INTEGRIDADE NÃO CONFIRMADA',
      desc: presentVerifyOutcome('integrity_not_confirmed').description,
    },
    not_found: {
      icon: '❌', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
      title: 'DOCUMENTO NÃO ENCONTRADO',
      desc: presentVerifyOutcome('not_found').description,
    },
    cancelled: {
      icon: '🚫', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300',
      title: 'DOCUMENTO CANCELADO',
      desc: presentVerifyOutcome('cancelled').description,
    },
    superseded_version: {
      icon: '⚠️', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300',
      title: 'VERSÃO SUPERADA',
      desc: presentVerifyOutcome('superseded_version').description,
    },
    no_hash: {
      icon: '⚠️', bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200',
      title: 'INFORME O HASH, CÓDIGO OU O QR',
      desc: 'Digite o HASH / código público (DA-…) do laudo ou envie uma foto do QR Code impresso no documento.',
    },
    offline: {
      icon: '⚠️', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200',
      title: 'SISTEMA INDISPONÍVEL', desc: 'A verificação online não está ativa neste ambiente. Valide o HASH manualmente com a via impressa.',
    },
    error: {
      icon: '⚠️', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200',
      title: 'ERRO DE CONEXÃO', desc: 'Ocorreu uma falha na comunicação com o servidor de autenticidade. Tente novamente em instantes.',
    },
  }

  const view = ICONS[status] || ICONS.error
  const isBusy = status === 'loading' || qrScanning || pdfScanning
  const showForm =
    status === 'no_hash' ||
    status === 'not_found' ||
    status === 'error' ||
    status === 'valid' ||
    status === 'superseded_version' ||
    status === 'cancelled' ||
    status === 'integrity_not_confirmed'
  const canSubmit = !isBusy && !!inputHash.trim()
  const showDetails = status === 'valid' || status === 'superseded_version' || status === 'cancelled'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-outfit text-slate-900">
      <div className="w-full max-w-2xl bg-white shadow-xl border border-slate-200 rounded-sm overflow-hidden relative">
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-4 border-blue-500">
          <div>
            <h1 className="text-xl font-black tracking-tighter italic">DANOS APARENTES</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Sistema de Vistoria e Perícia Automotiva</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase text-slate-400">Verificação de Integridade</div>
            <div className="text-sm font-mono tracking-tighter">REF: {record?.ref || '---'}</div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className={`${view.bg} ${view.border} border rounded-lg p-6 flex gap-6 items-start transition-all duration-500`}>
            <div className="text-5xl shrink-0">{view.icon}</div>
            <div>
              <h2 className={`text-lg font-black uppercase tracking-tight ${view.text} mb-1`}>{view.title}</h2>
              {showDetails && (record?.company_name || record?.company_logo) && (
                <div className="flex items-center gap-2 mb-1">
                  {record.company_logo && (
                    <img src={record.company_logo} alt={record.company_name || 'Logo da empresa'} className="h-6 max-w-[120px] object-contain" />
                  )}
                  {record.company_name && (
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Emitido por {record.company_name}</p>
                  )}
                </div>
              )}
              <p className="text-sm leading-relaxed opacity-80">{view.desc}</p>
            </div>
          </div>

          {showForm && (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="hash-input" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Verificar pelo HASH ou código público
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="hash-input"
                    type="text"
                    value={inputHash}
                    onChange={(e) => setInputHash(e.target.value.toUpperCase())}
                    placeholder="HASH ou DA-2026-XXXXXX"
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
                  Aceita HASH do rodapé do PDF, código público DA-… ou foto do QR Code.
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
                {qrError && (
                  <p className="text-[11px] font-bold text-rose-600 leading-relaxed" role="alert">
                    {qrError}
                  </p>
                )}
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ou</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="space-y-3">
                <label htmlFor="pdf-upload" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Enviar o PDF do laudo
                </label>
                <input
                  ref={pdfInputRef}
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => void handlePdfUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => pdfInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pdfScanning ? 'Calculando SHA-256 do PDF…' : '📄 Escolher arquivo PDF'}
                </button>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O sistema calcula o hash do arquivo e compara com o registro. Qualquer alteração no PDF invalida a integridade.
                </p>
                {pdfError && (
                  <p className="text-[11px] font-bold text-rose-600 leading-relaxed" role="alert">
                    {pdfError}
                  </p>
                )}
              </div>
            </div>
          )}

          {showDetails && versionInfo && versionInfo.total > 1 && (
            versionInfo.isLatest ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-800">
                  ✓ Versão {versionInfo.version} de {versionInfo.total} — esta é a versão mais recente deste laudo.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex flex-col gap-2">
                <p className="text-xs font-bold text-amber-800">
                  ⚠️ Versão {versionInfo.version} de {versionInfo.total} — este laudo foi substituído por uma versão mais recente.
                </p>
                <button
                  type="button"
                  onClick={() => void applyAndVerify(versionInfo.latestHash)}
                  className="self-start text-xs font-black uppercase tracking-wider text-amber-900 underline hover:no-underline"
                >
                  Ver a versão mais recente →
                </button>
              </div>
            )
          )}

          {showDetails && record && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Detalhes do Registro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <Row label="Placa do Veículo" value={maskPlate(record.plate || '')} />
                <Row label="Referência / OS" value={record.ref || 'NÃO INFORMADA'} />
                <Row label="Danos Registrados" value={String(record.damages_count)} />
                <Row label="Data de Emissão" value={record.issued_at || 'NÃO INFORMADA'} />
                {record.public_code && <Row label="Código Público" value={record.public_code} />}
                {record.company_name && <Row label="Empresa Emissora" value={record.company_name} />}
                {versionInfo && <Row label="Versão do Laudo" value={`${versionInfo.version} de ${versionInfo.total}`} />}
              </div>
            </div>
          )}

          {(() => {
            const fromDb = !!record && record.geo_lat != null && record.geo_lng != null
            const lat = fromDb ? String(record!.geo_lat) : geo?.lat
            const lng = fromDb ? String(record!.geo_lng) : geo?.lng
            if (!lat || !lng || !showDetails) return null
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

          <div className="pt-8 border-t border-dashed border-slate-200">
            <div className="space-y-3 w-full max-w-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificador Digital (HASH)</div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                {hash || 'NENHUM HASH FORNECIDO PARA VALIDAÇÃO'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.1em]">
            Este registro confirma a integridade técnica do conteúdo via hashing.
            Não constitui validade jurídica garantida.
          </p>
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
