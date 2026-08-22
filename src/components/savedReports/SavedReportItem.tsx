import type React from 'react'
import type { SavedReport } from '../../types'
import { resolveVehicleType } from '../../lib/vehicleTypeInference'
import { VehicleIconSvg } from '../VehicleSelector'
import { isIssuedLocked } from '../../lib/pdf/reportIssuance'
import { CloudBadge } from './CloudBadge'
import type { CloudState } from './types'

const viewLabels: Record<string, string> = {
  'lateral-left': 'Lat. Esq.',
  'lateral-right': 'Lat. Dir.',
  'frontal': 'Frontal',
  'traseira': 'Traseira',
}
const severityLabels: Record<string, string> = {
  low: 'Leve',
  medium: 'Média',
  high: 'Grave',
}
const severityColors: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f97316',
  high: '#ef4444',
}

export interface SavedReportItemProps {
  r: SavedReport
  flatIdx: number
  isActive: boolean
  isExpanded: boolean
  downloadingId: string | null
  generatingQrId: string | null
  copiedSignatureId: string | null
  correctingId: string | null
  cloudState: CloudState
  onToggleExpand: (e: React.MouseEvent) => void
  onDownloadPdf: (r: SavedReport) => void
  onGenerateQr: (r: SavedReport) => void
  onCopySignatureLink: (r: SavedReport) => void
  onLoad: (r: SavedReport) => void
  onClose: () => void
  onCreateCorrection?: (r: SavedReport) => void
  onExportSubjectData: (r: SavedReport) => void
  onDelete: (id: string) => void
}

export function SavedReportItem({
  r,
  flatIdx,
  isActive,
  isExpanded,
  downloadingId,
  generatingQrId,
  copiedSignatureId,
  correctingId,
  cloudState,
  onToggleExpand,
  onDownloadPdf,
  onGenerateQr,
  onCopySignatureLink,
  onLoad,
  onClose,
  onCreateCorrection,
  onExportSubjectData,
  onDelete,
}: SavedReportItemProps) {
  const vType = resolveVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
  const detail = [
    r.vehicleInfo.owner || 'Proprietário não informado',
    r.vehicleInfo.city || null,
    r.vehicleInfo.phone || null,
  ].filter(Boolean).join(' • ')

  return (
    <div
      key={r.id}
      data-report-index={flatIdx}
      onClick={onToggleExpand}
      style={{
        background: isActive ? 'rgba(0,170,255,0.06)' : 'rgba(0,0,0,0.2)',
        border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '10px 12px',
        marginBottom: 8,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.65rem', color: isExpanded ? 'var(--primary)' : 'rgba(255,255,255,0.25)', width: 10, display: 'inline-block', textAlign: 'center', userSelect: 'none' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
          <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <VehicleIconSvg type={vType} size={20} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
              {r.vehicleInfo.brand || 'Veículo'} — {r.vehicleInfo.plate || 'S/P'}
            </span>
            {r.status === 'draft' && (
              <span
                title="Prévia cadastral — abra no celular para continuar a vistoria"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                  color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                  borderRadius: 999, padding: '2px 8px', lineHeight: 1.4,
                }}
              >
                💻 Prévia
              </span>
            )}
            {r.status === 'issued' && (
              <span
                title="Laudo emitido — imutável; correções geram nova versão"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                  color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                  borderRadius: 999, padding: '2px 8px', lineHeight: 1.4,
                }}
              >
                🔒 Emitido{r.publicCode ? ` · ${r.publicCode}` : ''}
              </span>
            )}
            {r.status === 'superseded' && (
              <span
                title="Substituído por uma versão mais recente"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                  color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: 999, padding: '2px 8px', lineHeight: 1.4,
                }}
              >
                ↩️ Substituído{r.publicCode ? ` · ${r.publicCode}` : ''}
              </span>
            )}
            <CloudBadge state={cloudState} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {detail}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.8 }}>
            {r.damages.length} avaria(s) • {new Date(r.savedAt).toLocaleString('pt-BR')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onDownloadPdf(r)}
            disabled={downloadingId !== null}
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 8,
              padding: '5px 10px',
              color: '#10b981',
              cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              opacity: downloadingId !== null && downloadingId !== r.id ? 0.5 : 1
            }}
          >
            {downloadingId === r.id ? '⏳' : '📄 PDF'}
          </button>
          <button
            onClick={() => onGenerateQr(r)}
            disabled={generatingQrId !== null || !r.vehicleInfo.plate}
            title="Gerar QR para colar no veículo"
            style={{
              background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 8,
              padding: '5px 10px',
              color: '#a855f7',
              cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
              opacity: generatingQrId !== null && generatingQrId !== r.id ? 0.5 : 1,
            }}
          >
            {generatingQrId === r.id ? '⏳' : '🏷️ QR'}
          </button>
          {r.vehicleInfo.plate && (
            <a
              href={`/app/vehicles/${encodeURIComponent(
                r.vehicleId || `local:${String(r.vehicleInfo.plate).toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
              )}/compare?curr=${encodeURIComponent(r.id)}`}
              onClick={onClose}
              title="Comparar vistorias deste veículo"
              style={{
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.28)',
                borderRadius: 8,
                padding: '5px 10px',
                color: '#fbbf24',
                cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              ⇄ Comparar
            </a>
          )}
          <button
            onClick={() => onCopySignatureLink(r)}
            disabled={cloudState !== 'cloud'}
            title={cloudState === 'cloud' ? 'Copiar link de assinatura remota' : 'Aguarde a vistoria sincronizar com a nuvem'}
            style={{
              background: 'rgba(236,72,153,0.1)',
              border: '1px solid rgba(236,72,153,0.2)',
              borderRadius: 8,
              padding: '5px 10px',
              color: '#ec4899',
              cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
              opacity: cloudState !== 'cloud' ? 0.5 : 1,
            }}
          >
            {copiedSignatureId === r.id ? '✓ Copiado' : '🖊️ Assinatura'}
          </button>
          <button
            onClick={() => onLoad(r)}
            disabled={isIssuedLocked(r.status)}
            title={isIssuedLocked(r.status) ? 'Laudo emitido é imutável — use Criar correção' : 'Carregar para editar'}
            style={{
              background: 'rgba(0,170,255,0.1)',
              border: '1px solid rgba(0,170,255,0.2)',
              borderRadius: 8,
              padding: '5px 10px',
              color: 'var(--primary)',
              cursor: isIssuedLocked(r.status) ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit,sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
              opacity: isIssuedLocked(r.status) ? 0.45 : 1,
            }}
          >
            Carregar
          </button>
          {r.status === 'issued' && onCreateCorrection && (
            <button
              onClick={() => onCreateCorrection(r)}
              disabled={correctingId !== null}
              title="Cria uma nova versão editável; o original permanece"
              style={{
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: 8,
                padding: '5px 10px',
                color: '#fbbf24',
                cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif',
                fontWeight: 700,
                fontSize: '0.72rem',
                opacity: correctingId !== null && correctingId !== r.id ? 0.5 : 1,
              }}
            >
              {correctingId === r.id ? '⏳' : '📝 Correção'}
            </button>
          )}
          <button
            onClick={() => onExportSubjectData(r)}
            title="Exportar pacote técnico de dados pessoais (acesso/portabilidade)"
            style={{
              background: 'rgba(148,163,184,0.12)',
              border: '1px solid rgba(148,163,184,0.3)',
              borderRadius: 8,
              padding: '5px 8px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          >
            LGPD
          </button>
          <button
            onClick={() => onDelete(r.id)}
            disabled={isIssuedLocked(r.status)}
            title={isIssuedLocked(r.status) ? 'Laudo emitido não pode ser excluído' : 'Excluir'}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              padding: '5px 8px',
              color: '#ef4444',
              cursor: isIssuedLocked(r.status) ? 'not-allowed' : 'pointer',
              fontSize: '0.72rem',
              opacity: isIssuedLocked(r.status) ? 0.45 : 1,
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            📋 DETALHES DAS AVARIAS
          </div>
          {r.damages.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, paddingLeft: 6 }}>
              ✨ Nenhuma avaria registrada neste laudo.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.damages.map((d, idx) => (
                <div key={d.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.72rem', paddingLeft: 6 }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', userSelect: 'none' }}>├─</span>
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: severityColors[d.severity] || '#fff',
                    marginTop: 6,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: '#cbd5e1' }}>
                      {viewLabels[d.view] || d.view} • {d.partName} ({d.typeName})
                    </span>
                    <span style={{ marginLeft: 6, fontWeight: 800, color: severityColors[d.severity] }}>
                      [{severityLabels[d.severity]}]
                    </span>
                    {d.photos && d.photos.length > 0 && (
                      <span style={{ marginLeft: 6, color: 'var(--primary)', fontWeight: 800, fontSize: '0.68rem' }} title={`${d.photos.length} foto(s)`}>
                        📷 {d.photos.length}
                      </span>
                    )}
                    {d.notes && (
                      <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        &quot;{d.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
