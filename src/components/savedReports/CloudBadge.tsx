import { IconCheck, IconDocument } from '../ui/AnimatedIcons'
import { CloudState } from './types'

export function SaveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.88 122.88" style={{ flexShrink: 0 }} aria-hidden="true" fill="currentColor">
      <path fillRule="evenodd" d="M61.44,0A61.44,61.44,0,1,1,0,61.44,61.44,61.44,0,0,1,61.44,0Zm10.9,49.72a3.63,3.63,0,1,1,5.09,5.18L63.63,68.53a3.64,3.64,0,0,1-5.1,0L44.93,55.1A3.63,3.63,0,0,1,50,49.91l7.49,7.42.08-26.13a3.64,3.64,0,0,1,7.27.06l-.08,25.93,7.56-7.47ZM32.5,83.09l0-14.22a3.64,3.64,0,0,1,7.27.07l0,10.35q21.66,0,43.3,0l0-10.42a3.64,3.64,0,1,1,7.27.07l0,14.15h0a3.64,3.64,0,0,1-3.6,3.47q-25.32,0-50.59,0a3.63,3.63,0,0,1-3.6-3.47Z" />
    </svg>
  )
}

const CLOUD_BADGE: Record<CloudState, { icon: React.ReactNode; text: string; color: string; bg: string; border: string }> = {
  cloud:   { icon: <IconCheck size={12} className="text-sky-400" />, text: 'Na nuvem', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)' },
  pending: { icon: <span className="animate-spin text-[10px]">⏳</span>, text: 'Pendente', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  local:   { icon: <IconDocument size={12} className="text-slate-400" />, text: 'Local',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
}

export function CloudBadge({ state }: { state: CloudState }) {
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
      <span aria-hidden="true" className="flex items-center">{b.icon}</span> {b.text}
    </span>
  )
}
