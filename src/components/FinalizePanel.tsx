'use client'
import { useState, useCallback } from 'react'
import type { GeoLocation, VehicleInfo } from '../types'
import SignaturePad from './SignaturePad'
import Button from './ui/Button'
import { sealOnScreenSignature, type SignatureRole } from '../lib/signatures'
import { appendAuditEvent } from '../lib/audit/auditLog'

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  showSignatures?: boolean
  showGeo?: boolean
  /** Optional inspection id for audit trail. */
  inspectionId?: string | null
  sessionId?: string
}

/**
 * GPS + assinaturas — ficam depois da revisão de avarias,
 * imediatamente antes de gerar o PDF.
 */
export default function FinalizePanel({
  info,
  onChange,
  showSignatures = true,
  showGeo = true,
  inspectionId,
  sessionId,
}: Props) {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [geoError, setGeoError] = useState('')
  const [inspectorName, setInspectorName] = useState(info.inspectorSignatureMeta?.signerName || '')
  const [clientName, setClientName] = useState(info.clientSignatureMeta?.signerName || '')
  const [inspectorDoc, setInspectorDoc] = useState(info.inspectorSignatureMeta?.signerDocument || '')
  const [clientDoc, setClientDoc] = useState(info.clientSignatureMeta?.signerDocument || '')
  const [sigError, setSigError] = useState('')

  const set = useCallback((field: keyof VehicleInfo, value: string) => {
    onChange({ ...info, [field]: value })
  }, [info, onChange])

  const captureGeo = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('error')
      setGeoError('Este dispositivo não suporta geolocalização.')
      return
    }
    setGeoStatus('loading')
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo: GeoLocation = {
          lat: +pos.coords.latitude.toFixed(6),
          lng: +pos.coords.longitude.toFixed(6),
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : undefined,
          capturedAt: Date.now(),
        }
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${geo.lat}&lon=${geo.lng}&accept-language=pt-BR`,
            { headers: { Accept: 'application/json' } },
          )
          if (res.ok) {
            const data = await res.json()
            if (data?.display_name) geo.address = String(data.display_name)
          }
        } catch { /* offline: mantém só as coordenadas */ }
        onChange({ ...info, geo })
        setGeoStatus('done')
      },
      (err) => {
        setGeoStatus('error')
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada. Libere o GPS para este site.'
            : err.code === err.TIMEOUT
              ? 'Tempo esgotado ao obter a localização. Tente novamente.'
              : 'Não foi possível obter a localização.',
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [info, onChange])

  const clearGeo = useCallback(() => {
    const { geo: _removed, ...rest } = info
    onChange(rest as VehicleInfo)
    setGeoStatus('idle')
    setGeoError('')
  }, [info, onChange])

  const handleSignatureChange = useCallback(async (role: SignatureRole, dataUrl: string) => {
    setSigError('')
    if (!dataUrl) {
      if (role === 'inspector') {
        onChange({ ...info, inspectorSignature: '', inspectorSignatureMeta: undefined })
      } else {
        onChange({ ...info, clientSignature: '', clientSignatureMeta: undefined })
      }
      return
    }

    const name = role === 'inspector' ? inspectorName : clientName
    const doc = role === 'inspector' ? inspectorDoc : clientDoc
    try {
      const meta = await sealOnScreenSignature({
        role,
        imageDataUrl: dataUrl,
        signerName: name || (role === 'inspector' ? 'Vistoriador' : 'Responsável'),
        signerDocument: doc || undefined,
        sessionId,
      })
      if (role === 'inspector') {
        onChange({ ...info, inspectorSignature: dataUrl, inspectorSignatureMeta: meta })
      } else {
        onChange({ ...info, clientSignature: dataUrl, clientSignatureMeta: meta })
      }
      void appendAuditEvent({
        event_type: 'signature',
        inspection_id: inspectionId || null,
        metadata: {
          role,
          provider_id: meta.providerId,
          content_hash: meta.contentHash,
          signer_name: meta.signerName,
        },
      })
    } catch (e) {
      setSigError(e instanceof Error ? e.message : 'Não foi possível registrar a assinatura')
      if (role === 'inspector') set('inspectorSignature', dataUrl)
      else set('clientSignature', dataUrl)
    }
  }, [info, onChange, inspectorName, clientName, inspectorDoc, clientDoc, sessionId, inspectionId, set])

  return (
    <div className="space-y-4">
      {showGeo && (
        <div className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-700/10 to-blue-900/5 p-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 text-[0.7rem] font-black text-sky-400 tracking-wider uppercase">
              📍 Localização da Vistoria (GPS)
            </div>
            {info.geo && (
              <button
                type="button"
                onClick={clearGeo}
                className="text-[0.7rem] font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Remover
              </button>
            )}
          </div>

          {!info.geo ? (
            <>
              <p className="text-[0.78rem] text-slate-400 leading-relaxed mb-3">
                Capture o GPS do local onde a vistoria foi feita. A coordenada entra no laudo PDF junto do hash e do QR Code.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={captureGeo}
                loading={geoStatus === 'loading'}
                className="w-full"
              >
                {geoStatus === 'loading' ? 'Obtendo localização…' : '📡 Capturar localização atual'}
              </Button>
              {geoStatus === 'error' && (
                <p className="text-[0.75rem] text-red-400 font-semibold mt-2">{geoError}</p>
              )}
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold">
                  ✓ Localização registrada
                </span>
                {typeof info.geo.accuracy === 'number' && (
                  <span className="inline-flex items-center gap-1 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold">
                    ± {info.geo.accuracy} m
                  </span>
                )}
              </div>
              <p className="font-mono text-[0.8rem] text-[var(--text-main)] font-bold">
                {info.geo.lat.toFixed(6)}, {info.geo.lng.toFixed(6)}
              </p>
              {info.geo.address && (
                <p className="text-[0.75rem] text-slate-400 mt-1 leading-relaxed">{info.geo.address}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2.5">
                <a
                  href={`https://www.google.com/maps?q=${info.geo.lat},${info.geo.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.75rem] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  🗺️ Ver no mapa
                </a>
                <button
                  type="button"
                  onClick={captureGeo}
                  className="text-[0.75rem] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ↻ Atualizar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showSignatures && (
        <div className="pt-2 border-t border-white/5 space-y-3">
          <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed">
            Assinatura na tela registra nome, horário e hash da imagem para rastreabilidade técnica.
            Não equivale automaticamente a assinatura qualificada com certificado digital.
          </p>
          {sigError && (
            <p className="text-[0.75rem] text-amber-400 font-semibold" role="alert">{sigError}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px] space-y-2">
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Nome do vistoriador"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-sky-500/40"
              />
              <input
                type="text"
                value={inspectorDoc}
                onChange={(e) => setInspectorDoc(e.target.value)}
                placeholder="Documento (opcional)"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-sky-500/40"
              />
              <SignaturePad
                label="Assinatura do Vistoriador"
                value={info.inspectorSignature}
                onChange={(val) => { void handleSignatureChange('inspector', val) }}
              />
              {info.inspectorSignatureMeta?.contentHash && (
                <p className="font-mono text-[0.65rem] text-[var(--text-muted)] truncate">
                  hash {info.inspectorSignatureMeta.contentHash.slice(0, 16)}…
                </p>
              )}
            </div>
            <div className="flex-1 min-w-[220px] space-y-2">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do responsável"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-sky-500/40"
              />
              <input
                type="text"
                value={clientDoc}
                onChange={(e) => setClientDoc(e.target.value)}
                placeholder="Documento (opcional)"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg text-[0.8rem] outline-none focus:border-sky-500/40"
              />
              <SignaturePad
                label="Assinatura do Proprietário / Responsável"
                value={info.clientSignature}
                onChange={(val) => { void handleSignatureChange('client', val) }}
              />
              {info.clientSignatureMeta?.contentHash && (
                <p className="font-mono text-[0.65rem] text-[var(--text-muted)] truncate">
                  hash {info.clientSignatureMeta.contentHash.slice(0, 16)}…
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
