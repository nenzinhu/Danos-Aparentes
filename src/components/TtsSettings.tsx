'use client';
import { SpeakIcon, VolumeIcon } from '@/src/components/app/AppIcons'
import { TtsConfig } from '../types'
import { GOOGLE_TTS_VOICES } from '../lib/googleTtsVoices'

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

  function onVoiceChange(voiceId: string) {
    const voice = GOOGLE_TTS_VOICES.find((v) => v.id === voiceId)
    onChange({
      ...config,
      engine: 'google-tts',
      voiceId,
      gender: voice?.gender ?? config.gender,
    })
  }

  const females = GOOGLE_TTS_VOICES.filter((v) => v.gender === 'female')
  const males = GOOGLE_TTS_VOICES.filter((v) => v.gender === 'male')

  return (
    <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 16, marginTop: 8 }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', color: 'var(--text-main)' }}>
        <span className="inline-flex items-center gap-2"><SpeakIcon size={16} />Configurações de Voz</span>
        <span style={{ fontSize: '0.65rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 100 }}>
          Google TTS — PT-BR
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, alignItems: 'end' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label htmlFor="tts-voice-select" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Voz (IA Google)
          </label>
          <select
            id="tts-voice-select"
            className="form-input"
            value={config.voiceId ?? GOOGLE_TTS_VOICES[2].id}
            onChange={(e) => onVoiceChange(e.target.value)}
            style={{ width: '100%', fontWeight: 700, fontSize: '0.85rem' }}
          >
            <optgroup label="Femininas — Brasil">
              {females.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </optgroup>
            <optgroup label="Masculinas — Brasil">
              {males.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {([
          { key: 'rate' as const, label: 'Velocidade', min: 0.7, max: 1.2, step: 0.05, fmt: (v: number) => `${v}x` },
          { key: 'volume' as const, label: 'Volume', min: 0, max: 1, step: 0.05, fmt: (v: number) => `${Math.round(v * 100)}%` },
        ] as const).map((s) => (
          <div key={s.key}>
            <label htmlFor={`tts-${s.key}-slider`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              <span>{s.label}</span>
              <span style={{ color: 'var(--primary)' }}>{s.fmt(config[s.key])}</span>
            </label>
            <input
              id={`tts-${s.key}-slider`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={config[s.key]}
              onChange={(e) => set(s.key, parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', height: 5, cursor: 'pointer' }}
            />
          </div>
        ))}

        <button
          onClick={onTest}
          style={{
            background: 'var(--btn-secondary-bg)',
            border: '1px solid var(--btn-secondary-border)',
            borderRadius: 8,
            padding: '8px',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontFamily: 'Outfit,sans-serif',
            fontSize: '0.8rem',
            fontWeight: 700,
            alignSelf: 'end',
          }}
        >
          <span className="inline-flex items-center gap-1.5"><VolumeIcon size={14} />Testar</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {([
          { key: 'active' as const, label: 'Falar ao clicar' },
          { key: 'hoverActive' as const, label: 'Falar ao passar o mouse' },
        ] as const).map((c) => (
          <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={config[c.key]}
              onChange={(e) => set(c.key, e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            {c.label}
          </label>
        ))}
      </div>
    </div>
  )
}
