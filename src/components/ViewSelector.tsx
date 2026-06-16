import { ViewType } from '../types'

const VIEWS: { id: ViewType; label: string }[] = [
  { id: 'lateral-left',  label: 'Lat. Esquerda' },
  { id: 'lateral-right', label: 'Lat. Direita' },
  { id: 'frontal',       label: 'Frontal' },
  { id: 'traseira',      label: 'Traseira' },
]

interface Props {
  current: ViewType
  onChange: (v: ViewType) => void
}

export default function ViewSelector({ current, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
      {VIEWS.map(v => (
        <button key={v.id} onClick={() => onChange(v.id)} style={{
          background: current === v.id ? 'rgba(0,170,255,0.15)' : 'transparent',
          border: `1px solid ${current === v.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
          color: current === v.id ? 'var(--primary)' : 'var(--text-muted)',
          fontFamily: 'Outfit,sans-serif', fontSize: '0.78rem', fontWeight: 700,
          transition: 'all 0.2s',
        }}>
          {v.label}
        </button>
      ))}
    </div>
  )
}
