import { useEffect, useRef } from 'react'
import { DamageType } from '../types'

interface Props {
  partName: string
  position: { x: number; y: number }
  onChoose: (type: DamageType, typeName: string) => void
  onClear: () => void
  onClose: () => void
}

export default function DamageFloat({ partName, position, onChoose, onClear, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose])

  const types: { type: DamageType; label: string; emoji: string }[] = [
    { type: 'scratch', label: 'Arranhado', emoji: '✏️' },
    { type: 'dent',    label: 'Amassado',  emoji: '🔨' },
    { type: 'broken',  label: 'Quebrado',  emoji: '💥' },
  ]

  const left = Math.min(position.x, window.innerWidth - 260)
  const top = Math.min(position.y, window.innerHeight - 230)

  return (
    <div ref={ref} style={{
      position: 'fixed', left, top, zIndex: 10000, minWidth: 240,
      background: '#0d1b2e', border: '1.5px solid rgba(0,170,255,0.35)',
      borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,120,255,0.15)', padding: 14,
    }}>
      {/* Título */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#e8f4ff', fontFamily: 'Outfit,sans-serif' }}>
          📍 {partName}
        </span>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
          color: '#aac8e8', cursor: 'pointer', padding: '3px 8px', fontSize: '0.8rem', lineHeight: 1,
          fontFamily: 'Outfit,sans-serif',
        }}>✕</button>
      </div>

      {/* Label acima */}
      <div style={{ fontSize: '0.72rem', color: 'rgba(160,200,240,0.6)', fontFamily: 'Outfit,sans-serif', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Tipo de avaria
      </div>

      {/* Opções */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {types.map(t => (
          <button key={t.type} onClick={() => onChoose(t.type, t.label)} style={{
            background: 'rgba(0,100,200,0.18)',
            border: '1.5px solid rgba(0,150,255,0.35)',
            borderRadius: 12, padding: '12px 6px', cursor: 'pointer',
            color: '#e8f4ff',
            fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', fontWeight: 800,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            transition: 'background 0.15s, border-color 0.15s',
          }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{t.emoji}</span>
            <span style={{ color: '#e8f4ff', fontSize: '0.8rem', fontWeight: 800 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Sem avaria */}
      <button onClick={onClear} style={{
        marginTop: 10, width: '100%',
        background: 'rgba(239,68,68,0.12)',
        border: '1.5px solid rgba(239,68,68,0.4)',
        borderRadius: 10, padding: '9px',
        color: '#f87171', cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
        fontSize: '0.82rem', fontWeight: 800,
      }}>
        🧽 Sem avaria / Limpar
      </button>
    </div>
  )
}
