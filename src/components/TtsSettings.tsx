import { TtsConfig } from '../types'

interface Props {
  config: TtsConfig
  onChange: (c: TtsConfig) => void
  onTest: () => void
  voices: SpeechSynthesisVoice[]
}

export default function TtsSettings({ config, onChange, onTest }: Props) {
  function set<K extends keyof TtsConfig>(key: K, value: TtsConfig[K]) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 8 }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        🗣️ Configurações de Voz
        <span style={{ fontSize: '0.72rem', background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)', color: 'var(--neon-cyan)', padding: '2px 8px', borderRadius: 100 }}>Gratuita</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Motor</label>
          <select className="form-input" value={config.engine} onChange={e => set('engine', e.target.value as TtsConfig['engine'])}>
            <option value="native">🎙️ Navegador</option>
            <option value="google-tts">☁️ Google TTS</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Gênero</label>
          <select className="form-input" value={config.gender} onChange={e => set('gender', e.target.value as TtsConfig['gender'])}>
            <option value="male">👨 Masculina</option>
            <option value="female">👩 Feminina</option>
          </select>
        </div>

        {([
          { key: 'rate'   as const, label: 'Velocidade', min: 0.5, max: 2,   step: 0.1,  fmt: (v: number) => `${v}x` },
          { key: 'pitch'  as const, label: 'Tom',        min: 0.5, max: 1.5,  step: 0.05, fmt: (v: number) => `${v}` },
          { key: 'volume' as const, label: 'Volume',     min: 0,   max: 1,    step: 0.05, fmt: (v: number) => `${Math.round(v*100)}%` },
        ] as const).map(s => (
          <div key={s.key}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              <span>{s.label}</span>
              <span style={{ color: 'var(--primary)' }}>{s.fmt(config[s.key])}</span>
            </label>
            <input type="range" min={s.min} max={s.max} step={s.step} value={config[s.key]}
              onChange={e => set(s.key, parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', height: 5, cursor: 'pointer' }} />
          </div>
        ))}

        <button onClick={onTest} style={{
          background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)',
          borderRadius: 8, padding: '8px', color: 'var(--text-main)', cursor: 'pointer',
          fontFamily: 'Outfit,sans-serif', fontSize: '0.8rem', fontWeight: 700, alignSelf: 'end'
        }}>🔊 Testar</button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {([
          { key: 'active'      as const, label: 'Falar ao clicar' },
          { key: 'hoverActive' as const, label: 'Falar ao passar o mouse' },
        ] as const).map(c => (
          <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={config[c.key]} onChange={e => set(c.key, e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
            {c.label}
          </label>
        ))}
      </div>
    </div>
  )
}
