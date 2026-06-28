'use client';
import { useEffect, useState } from 'react'
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
}

type Status = 'loading' | 'valid' | 'not_found' | 'no_hash' | 'offline' | 'error'

export default function Verify() {
  const [status, setStatus] = useState<Status>('loading')
  const [record, setRecord] = useState<HashRecord | null>(null)
  const [hash, setHash] = useState('')
  const [geo, setGeo] = useState<{ lat: string; lng: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const h = (params.get('hash') || '').trim()
    setHash(h)

    const lat = (params.get('lat') || '').trim()
    const lng = (params.get('lng') || '').trim()
    if (lat && lng) setGeo({ lat, lng })

    if (!h) { setStatus('no_hash'); return }
    if (!supabaseEnabled || !supabase) { setStatus('offline'); return }

    async function verifyHash() {
      try {
        const { data, error } = await supabase!.from('report_hashes').select('*').eq('hash', h).maybeSingle()
        if (error) { setStatus('error'); return }
        if (!data) { setStatus('not_found'); return }
        setRecord(data as HashRecord)
        setStatus('valid')
      } catch (err) {
        setStatus('error')
      }
    }
    verifyHash()
  }, [])

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
      title: 'CÓDIGO AUSENTE', desc: 'Nenhum identificador de verificação foi fornecido. Por favor, utilize o link ou QR Code presente no documento.' 
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
              <p className="text-sm leading-relaxed opacity-80">{view.desc}</p>
            </div>
          </div>

          {/* Data Section */}
          {status === 'valid' && record && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Detalhes do Registro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <Row label="Placa do Veículo" value={record.plate || 'NÃO INFORMADA'} />
                <Row label="Referência / OS" value={record.ref || 'NÃO INFORMADA'} />
                <Row label="Danos Registrados" value={String(record.damages_count)} />
                <Row label="Data de Emissão" value={record.issued_at || 'NÃO INFORMADA'} />
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

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.1em]">
            Este documento é uma representação digital de validade pública garantida por tecnologia de hashing.
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
