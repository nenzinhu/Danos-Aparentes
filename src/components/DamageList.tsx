import { useState } from 'react'
import { Damage, Severity } from '../types'
import { compressImage, fileToDataUrl } from '../lib/imageUtils'

interface Props {
  damages: Damage[]
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<Damage>) => void
}

const SEV_LABEL: Record<Severity, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }
const SEV_COLOR: Record<Severity, string> = { low: '#f59e0b', medium: '#f97316', high: '#ef4444' }
const VIEW_LABEL: Record<string, string> = {
  'lateral-left': 'Lat. Esq.', 'lateral-right': 'Lat. Dir.', frontal: 'Frontal', traseira: 'Traseira'
}

export default function DamageList({ damages, onRemove, onUpdate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [photoViewer, setPhotoViewer] = useState<string | null>(null)

  async function handlePhoto(id: string, file: File) {
    const raw = await fileToDataUrl(file)
    const compressed = await compressImage(raw)
    const dmg = damages.find(d => d.id === id)
    if (!dmg) return
    onUpdate(id, {
      photos: [...dmg.photos, compressed],
      photoNotes: [...(dmg.photoNotes ?? []), ''],
    })
  }

  function updatePhotoNote(dmgId: string, photoIdx: number, note: string) {
    const dmg = damages.find(d => d.id === dmgId)
    if (!dmg) return
    const notes = [...(dmg.photoNotes ?? dmg.photos.map(() => ''))]
    notes[photoIdx] = note
    onUpdate(dmgId, { photoNotes: notes })
  }

  function removePhoto(dmgId: string, photoIdx: number) {
    const dmg = damages.find(d => d.id === dmgId)
    if (!dmg) return
    onUpdate(dmgId, {
      photos: dmg.photos.filter((_, i) => i !== photoIdx),
      photoNotes: (dmg.photoNotes ?? []).filter((_, i) => i !== photoIdx),
    })
  }

  if (damages.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: '0.9rem' }}>
        Nenhuma avaria registrada.<br />
        <span style={{ fontSize: '0.8rem' }}>Clique em uma peça no SVG para começar.</span>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {damages.map(d => {
          const photoNotes = d.photoNotes ?? d.photos.map(() => '')
          return (
            <div key={d.id} style={{
              background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, overflow: 'hidden',
              borderLeft: `3px solid ${SEV_COLOR[d.severity]}`
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_COLOR[d.severity], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.partName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {d.typeName} • <span style={{ color: SEV_COLOR[d.severity], fontWeight: 700 }}>{SEV_LABEL[d.severity]}</span> • {VIEW_LABEL[d.view] || d.view}
                  </div>
                </div>
                {d.photos.length > 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', background: 'rgba(0,170,255,0.1)', padding: '2px 6px', borderRadius: 6 }}>📷 {d.photos.length}</span>
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{expandedId === d.id ? '▲' : '▼'}</span>
                <button onClick={e => { e.stopPropagation(); onRemove(d.id) }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '2px 6px', flexShrink: 0 }}>✕</button>
              </div>

              {/* Expanded */}
              {expandedId === d.id && (
                <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Severity selector */}
                  <div style={{ marginTop: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Grau de Dano</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['low', 'medium', 'high'] as Severity[]).map(sev => (
                        <button key={sev} onClick={() => onUpdate(d.id, { severity: sev })} style={{
                          flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer',
                          fontFamily: 'Outfit,sans-serif', fontSize: '0.78rem', fontWeight: 800,
                          border: `1px solid ${d.severity === sev ? SEV_COLOR[sev] : 'rgba(255,255,255,0.08)'}`,
                          background: d.severity === sev ? `${SEV_COLOR[sev]}22` : 'rgba(255,255,255,0.02)',
                          color: d.severity === sev ? SEV_COLOR[sev] : 'var(--text-muted)',
                        }}>
                          {SEV_LABEL[sev]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <textarea value={d.notes} onChange={e => onUpdate(d.id, { notes: e.target.value })}
                    placeholder="Observação sobre este dano..."
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '8px 10px', color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif',
                      fontSize: '0.82rem', resize: 'vertical', minHeight: 52, outline: 'none', boxSizing: 'border-box'
                    }} />

                  {/* Photos */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Fotos ({d.photos.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {d.photos.map((p, i) => (
                        <div key={i} style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          {/* Thumbnail */}
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={p} alt="" onClick={() => setPhotoViewer(p)}
                              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', display: 'block' }} />
                            <button onClick={() => removePhoto(d.id, i)}
                              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', width: 20, height: 20, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontWeight: 900 }}>✕</button>
                          </div>
                          {/* Caption/Tag */}
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              🏷️ Tag / Descrição da Foto
                            </div>
                            <textarea
                              value={photoNotes[i] ?? ''}
                              onChange={e => updatePhotoNote(d.id, i, e.target.value)}
                              placeholder={`Ex.: Amassado na porta traseira esquerda, próximo à maçaneta`}
                              rows={2}
                              style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(0,170,255,0.18)', borderRadius: 6,
                                padding: '6px 8px', color: 'var(--text-main)',
                                fontFamily: 'Outfit,sans-serif', fontSize: '0.78rem',
                                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add photo button */}
                      <label style={{
                        height: 44, borderRadius: 8,
                        border: '1px dashed rgba(0,170,255,0.3)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        color: '#00aaff', fontSize: '0.8rem', gap: 6,
                        background: 'rgba(0,170,255,0.04)', fontWeight: 700, fontFamily: 'Outfit,sans-serif'
                      }}>
                        📷 Anexar Foto
                        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                          onChange={e => { if (e.target.files?.[0]) handlePhoto(d.id, e.target.files[0]) }} />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Photo viewer modal */}
      {photoViewer && (
        <div onClick={() => setPhotoViewer(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
        }}>
          <img src={photoViewer} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setPhotoViewer(null)} style={{
            position: 'fixed', top: 16, right: 16, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: 44, height: 44, color: '#fff', cursor: 'pointer', fontSize: '1.2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>
      )}
    </>
  )
}
