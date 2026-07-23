'use client';
import { useState } from 'react'
import { useTeam, TeamReport } from '@/src/hooks/useTeam'
import { generatePdf } from '@/src/lib/pdf'
import { captureSvgs } from '@/src/components/ReportActions'
import { Damage, VehicleType } from '@/src/types'

import { resolveVehicleType } from '@/src/lib/vehicleTypeInference'

interface Props {
  accessToken?: string
  onToast: (msg: string) => void
}

export default function TeamTab({ accessToken, onToast }: Props) {
  const { members, reports, loading, error, inviteMember } = useTeam(accessToken)
  const [email, setEmail] = useState('')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [expandedReportIds, setExpandedReportIds] = useState<Set<string>>(new Set())

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      const url = await inviteMember(email.trim())
      setInviteUrl(url)
      setEmail('')
    } catch (err) {
      onToast(err instanceof Error ? `❌ ${err.message}` : '❌ Falha ao gerar convite')
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      onToast('🔗 Link copiado!')
    } catch {
      onToast('❌ Não foi possível copiar o link')
    }
  }

  const handleDownloadPdf = async (tr: TeamReport) => {
    setDownloadingId(tr.report.id)
    try {
      const vType = resolveVehicleType(tr.report.vehicleInfo.vehicleTypeDesc, tr.report.damages)
      const svgData = await captureSvgs(vType, tr.report.damages)
      await generatePdf(tr.report.vehicleInfo, tr.report.damages, svgData, {})
    } catch (err) {
      console.error('Failed to generate team report PDF:', err)
      onToast('❌ Falha ao gerar PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-5">
        <h2 className="text-lg font-bold text-[var(--text-main)] mb-1">👥 Equipe</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Convide inspetores para a sua empresa. Ao aceitarem, os laudos deles aparecem aqui.
        </p>

        <form onSubmit={handleInvite} className="flex flex-wrap gap-2 mb-3">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email-do-inspetor@exemplo.com"
            className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-sky-500/10 border border-sky-500/25 text-sky-400 disabled:opacity-50"
          >
            {sending ? 'Gerando…' : 'Convidar'}
          </button>
        </form>

        {inviteUrl && (
          <div className="flex flex-wrap items-center gap-2 bg-black/20 border border-white/10 rounded-lg p-3 mb-3 text-xs">
            <span className="text-[var(--text-muted)] break-all flex-1 min-w-[180px]">{inviteUrl}</span>
            <button onClick={() => handleCopy(inviteUrl)} className="px-3 py-1.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-400 font-bold">
              Copiar link
            </button>
          </div>
        )}

        {members.length > 0 && (
          <div className="flex flex-col gap-2">
            {members.map(m => (
              <div key={`${m.invited_email}-${m.invited_at}`} className="flex items-center justify-between bg-black/10 border border-white/5 rounded-lg px-3 py-2 text-xs">
                <span className="text-[var(--text-main)]">{m.invited_email}</span>
                <span className={m.status === 'accepted' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {m.status === 'accepted' ? '✓ Ativo' : '⏳ Pendente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-base font-bold text-[var(--text-main)] mb-3">Laudos da equipe</h3>
        {loading && <div className="text-xs text-[var(--text-muted)]">Carregando…</div>}
        {error && <div className="text-xs text-red-400">{error}</div>}
        {!loading && !error && reports.length === 0 && (
          <div className="text-xs text-[var(--text-muted)]">Nenhum laudo de equipe ainda.</div>
        )}
        <div className="flex flex-col gap-2">
          {reports.map(tr => {
            const isExpanded = expandedReportIds.has(tr.report.id)
            const toggleExpand = (e: React.MouseEvent) => {
              if ((e.target as HTMLElement).closest('button')) return
              setExpandedReportIds(prev => {
                const next = new Set(prev)
                if (next.has(tr.report.id)) {
                  next.delete(tr.report.id)
                } else {
                  next.add(tr.report.id)
                }
                return next
              })
            }

            return (
              <div
                key={tr.report.id}
                onClick={toggleExpand}
                className="flex flex-col bg-black/10 border border-white/5 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[0.65rem] text-slate-500 w-4 inline-block text-center select-none">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--text-main)] truncate">
                      {tr.report.vehicleInfo.brand || 'Veículo'} — {tr.report.vehicleInfo.plate || 'S/P'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      Inspetor: {tr.inspectorEmail || '—'} • {tr.report.damages.length} avaria(s)
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf(tr)}
                    disabled={downloadingId !== null}
                    className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex-shrink-0 disabled:opacity-50"
                  >
                    {downloadingId === tr.report.id ? '⏳' : '📄 PDF'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                    <div className="text-[0.62rem] font-bold text-[var(--text-muted)] tracking-wider">
                      📋 AVARIAS DETALHADAS
                    </div>
                    {tr.report.damages.length === 0 ? (
                      <div className="text-xs text-emerald-400 font-bold pl-2">
                        ✨ Nenhuma avaria registrada neste laudo.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 pl-2">
                        {tr.report.damages.map((d, index) => (
                          <div key={d.id || index} className="flex items-start gap-2 text-xs">
                            <span className="text-white/20 select-none">├─</span>
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ background: d.severity === 'high' ? '#ef4444' : d.severity === 'medium' ? '#f97316' : '#94a3b8' }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-slate-300">
                                {d.view === 'lateral-left' ? 'Lat. Esq.' : d.view === 'lateral-right' ? 'Lat. Dir.' : d.view === 'frontal' ? 'Frontal' : d.view === 'traseira' ? 'Traseira' : d.view} • {d.partName} ({d.typeName})
                              </span>
                              <span
                                className="ml-1.5 font-bold"
                                style={{ color: d.severity === 'high' ? '#ef4444' : d.severity === 'medium' ? '#f97316' : '#94a3b8' }}
                              >
                                [{d.severity === 'high' ? 'Grave' : d.severity === 'medium' ? 'Média' : 'Leve'}]
                              </span>
                              {d.notes && (
                                <p className="margin-0 text-[10px] text-[var(--text-muted)] italic truncate">
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
          })}
        </div>
      </div>
    </div>
  )
}
