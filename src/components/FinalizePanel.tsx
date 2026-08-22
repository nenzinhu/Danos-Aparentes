'use client'
import { useState, useCallback, useEffect } from 'react'
import type { GeoLocation, VehicleInfo } from '../types'
import Button from './ui/Button'

interface Props {
  info: VehicleInfo
  onChange: (info: VehicleInfo) => void
  showGeo?: boolean
  /** Optional inspection id for audit trail. */
  inspectionId?: string | null
  /** Bearer token for server-side actions (PDF/certification). */
  accessToken?: string | null
}

/**
 * GPS da vistoria — capturado automaticamente ao abrir o card (sem botão manual,
 * sem aba de "localizar"). A coordenada entra no laudo PDF junto do hash e do QR Code.
 * A certificação digital vive em ReportActions (card único).
 */
export default function FinalizePanel({
  info,
  onChange,
  showGeo = true,
}: Props) {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [geoError, setGeoError] = useState('')

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
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${geo.lat}&lon=${geo.lng}&zoom=18&addressdetails=1&accept-language=pt-BR`,
            { headers: { Accept: 'application/json' } },
          )
          if (res.ok) {
            const data = await res.json()
            // Monta o endereço a partir dos campos estruturados (mais preciso que
            // o display_name, que prioriza POIs distantes).
            const a = data?.address || {}
            const parts = [
              [a.road, a.house_number].filter(Boolean).join(', '),
              a.suburb || a.neighbourhood || a.quarter || a.district,
              a.city || a.town || a.municipality || a.county,
              a.state,
              a.postcode,
            ].filter(Boolean)
            geo.address = parts.length ? parts.join(' · ') : (data?.display_name || '')
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

  // Captura automática ao montar (uma vez), salvo se já houver coordenada.
  useEffect(() => {
    if (!showGeo) return
    if (info.geo) { setGeoStatus('done'); return }
    captureGeo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!showGeo) return null

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[0.72rem] font-black text-[var(--primary)] tracking-wider uppercase">
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
        <div className="flex items-center gap-2 text-[0.78rem] text-[var(--text-muted)]">
          <span className="animate-pulse">⏳</span>
          {geoStatus === 'error' ? (
            <span className="text-red-400 font-semibold">{geoError}</span>
          ) : (
            <span>Localizando automaticamente…</span>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 bg-[var(--success)]/15 border border-[var(--success)]/30 text-[var(--success)] rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold">
              ✓ Localização registrada
            </span>
            {typeof info.geo.accuracy === 'number' && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold border ${
                info.geo.accuracy > 1000
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-[var(--primary)]/15 border-[var(--primary)]/30 text-[var(--primary)]'
              }`}>
                ± {info.geo.accuracy} m{info.geo.accuracy > 1000 ? ' (baixa)' : ''}
              </span>
            )}
          </div>
          <p className="font-mono text-[0.8rem] text-[var(--text-main)] font-bold">
            {info.geo.lat.toFixed(6)}, {info.geo.lng.toFixed(6)}
          </p>
          {info.geo.address && (
            <p className="text-[0.75rem] text-[var(--text-muted)] mt-1 leading-relaxed">{info.geo.address}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2.5">
            <a
              href={`https://www.google.com/maps?q=${info.geo.lat},${info.geo.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.75rem] font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            >
              🗺️ Ver no mapa
            </a>
            <button
              type="button"
              onClick={captureGeo}
              className="text-[0.75rem] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              ↻ Atualizar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
