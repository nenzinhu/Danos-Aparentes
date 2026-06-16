import { useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

interface HashRecord {
  hash: string
  plate: string
  ref: string
  issued_at: string
  damages_count: number
  created_at: string
}

type Status = 'loading' | 'valid' | 'not_found' | 'no_hash' | 'offline' | 'error'

const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 20,
  padding: '32px 28px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
  boxShadow: 'var(--glass-shadow)', maxWidth: 440, width: '100%', textAlign: 'center',
}

export default function Verify() {
  const [status, setStatus] = useState<Status>('loading')
  const [record, setRecord] = useState<HashRecord | null>(null)
  const [hash, setHash] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const h = (params.get('hash') || '').trim()
    setHash(h)

    if (!h) { setStatus('no_hash'); return }
    if (!supabaseEnabled || !supabase) { setStatus('offline'); return }

    supabase.from('report_hashes').select('*').eq('hash', h).maybeSingle()
      .then(({ data, error }) => {
        if (error) { setStatus('error'); return }
        if (!data) { setStatus('not_found'); return }
        setRecord(data as HashRecord)
        setStatus('valid')
      })
      .catch(() => setStatus('error'))
  }, [])

  const ICONS: Record<Status, { icon: string; color: string; title: string; desc: string }> = {
    loading:   { icon: '⏳', color: '#eab308', title: 'Verificando...', desc: 'Consultando o registro digital deste documento.' },
    valid:     { icon: '✅', color: '#22c55e', title: 'Documento Autêntico', desc: 'Este hash corresponde a um relatório emitido pelo sistema AvariasAPARENTES PWA.' },
    not_found: { icon: '❌', color: '#ef4444', title: 'Hash Não Encontrado', desc: 'Este código não corresponde a nenhum documento emitido — o PDF pode ter sido alterado ou não foi gerado por este sistema.' },
    no_hash:   { icon: '⚠️', color: '#f97316', title: 'Código Inválido', desc: 'Nenhum código de verificação foi informado na URL.' },
    offline:   { icon: '⚠️', color: '#f97316', title: 'Verificação Indisponível', desc: 'A verificação online não está configurada neste ambiente. Compare manualmente o HASH impresso no PDF.' },
    error:     { icon: '⚠️', color: '#f97316', title: 'Erro ao Verificar', desc: 'Não foi possível consultar o servidor agora. Tente novamente em alguns instantes.' },
  }

  const view = ICONS[status]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, background: 'var(--bg-gradient)', fontFamily: 'Outfit,sans-serif', color: 'var(--text-main)',
    }}>
      <div style={cardStyle}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
          AvariasAPARENTES PWA • Verificação de Documento
        </div>

        <div style={{ fontSize: '3.2rem', lineHeight: 1, marginBottom: 14 }}>{view.icon}</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: view.color, marginBottom: 8 }}>{view.title}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{view.desc}</div>

        {status === 'valid' && record && (
          <div style={{ textAlign: 'left', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
            <Row label="Placa" value={record.plate || 'N/I'} />
            <Row label="Nº OS / Referência" value={record.ref || 'N/I'} />
            <Row label="Avarias Registradas" value={String(record.damages_count)} />
            <Row label="Emitido em" value={record.issued_at || 'N/I'} />
          </div>
        )}

        {hash && (
          <div style={{ marginTop: 16, fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: '"Courier New",monospace', wordBreak: 'break-all' }}>
            HASH: {hash}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0', fontSize: '0.82rem' }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
      <span style={{ color: 'var(--text-main)', fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
