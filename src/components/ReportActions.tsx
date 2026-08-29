'use client'
import { useState } from 'react'
import { Damage, VehicleInfo, VehicleType } from '../types'
import { generatePdf, buildBadgeSnippet } from '../lib/pdf'
import { copyReport, downloadTxt, sendWhatsApp } from '../lib/report'
import { resolveDamagePhotos, resolvePhotos } from '../lib/photoStore'
import { canReviewReport } from '../lib/auth/rbac'
import { useTenantContext } from '../hooks/useTenantContext'
import {
  IconCopy,
  IconDamageList,
  IconSeal,
  IconTxt,
  IconWhatsApp,
} from './reportActions/icons'
import PdfSectionsPanel from './reportActions/PdfSectionsPanel'
import PlainPdfCard from './PlainPdfCard'
import {
  blockExportWithoutReview,
  captureSvgs,
  checkLaudoQuota,
  loadDisclosureScope,
  loadPdfTheme,
  loadSectionsConfig,
  persistDisclosureScope,
  persistPdfTheme,
  persistSectionsConfig,
  quotaBlockedMessage,
  resolvePdfSettings,
  type PdfTheme,
  type SectionVisibilityState,
} from './reportActions/pdfExport'
import type { DisclosureScope } from '../lib/verify/disclosureScope'
import { useInspectionReviewIssue } from './app/InspectionReviewIssueContext'

export { captureSvgs } from './reportActions/pdfExport'

interface Props {
  vehicleType: VehicleType
  vehicleInfo: VehicleInfo
  damages: Damage[]
  onToast?: (msg: string) => void
  hasAccess?: boolean
  accessToken?: string
  /** Active SavedReport id — marks cloud/local as issued after PDF register. */
  inspectionId?: string | null
  publicCode?: string
  laudoVersion?: number
  correctionReason?: string
  supersedesHash?: string
  inspectionPurpose?: 'entrada' | 'retorno'
  userId?: string
  /** Bloqueia PDF (ex.: avarias novas sem confirmação do vistoriador). */
  blockExportReason?: string | null
  /** Disclosure progressivo: mostra exportação secundária só após as 4 fotos. */
  photosReady?: boolean
  /** Após gerar o PDF com sucesso, volta para o Início (Dashboard/Home). */
  onReturnHome?: () => void
  /** Garante que a inspeção existe no banco (salva a prévia) e retorna o id. */
  onEnsureInspectionId?: () => Promise<string | null>
}

export default function ReportActions({
  vehicleType, vehicleInfo, damages, onToast, hasAccess, accessToken,
  inspectionId, publicCode, laudoVersion, correctionReason, supersedesHash,
  inspectionPurpose, userId,
  blockExportReason = null,
  onReturnHome, onEnsureInspectionId,
  photosReady = false,
}: Props) {
  const { reviewedAt, isReviewed, onIssued } = useInspectionReviewIssue()
  const { role } = useTenantContext(userId)
  const mayReview = userId ? canReviewReport(role, userId, userId) : true
  const [loading, setLoading] = useState<string | null>(null)
  const [reportHash, setReportHash] = useState<string | null>(null)
  const [showBadgePanel, setShowBadgePanel] = useState(false)
  const [showSectionsAccordion, setShowSectionsAccordion] = useState(false)
  const [pdfTheme, setPdfTheme] = useState<PdfTheme>(() => loadPdfTheme())
  const [sectionsConfig, setSectionsConfig] = useState<SectionVisibilityState>(() => loadSectionsConfig())
  const [disclosureScope, setDisclosureScope] = useState<DisclosureScope>(() => loadDisclosureScope())

  const updateSectionsConfig = (newConfig: SectionVisibilityState) => {
    setSectionsConfig(newConfig)
    persistSectionsConfig(newConfig)
  }

  const updateDisclosureScope = (scope: DisclosureScope) => {
    setDisclosureScope(scope)
    persistDisclosureScope(scope)
  }

  const getResolvedPdfSettings = () => resolvePdfSettings(hasAccess, pdfTheme, sectionsConfig, {
    inspectionId: inspectionId || undefined,
    publicCode,
    laudoVersion,
    correctionReason,
    supersedesHash,
    inspectionPurpose,
  })

  const handleThemeChange = (theme: PdfTheme) => {
    setPdfTheme(theme)
    persistPdfTheme(theme)
  }

  /** `false` = ação cancelada (ex.: sem revisão) — não mostrar toast de sucesso. */
  async function handle(key: string, fn: () => Promise<boolean | void>, successMsg?: string) {
    setLoading(key)
    try {
      const ok = await fn()
      if (successMsg && onToast && ok !== false) onToast(successMsg)
    } catch (e) {
      console.error(e)
      if (onToast) onToast('Erro ao gerar arquivo')
    } finally {
      setLoading(null)
    }
  }

  /**
   * Solo/owner: revisão humana obrigatória antes do PDF.
   * Inspetor (sem `review`): pode emitir direto — senão o botão PDF nunca libera.
   */
  const reviewRequiredForExport = mayReview
  const canExportOfficialPdf = !reviewRequiredForExport || Boolean(isReviewed)

  async function preparePdfPayload() {
    if (blockExportReason) {
      onToast?.(blockExportReason)
      return null
    }
    if (reviewRequiredForExport) {
      if (!(await blockExportWithoutReview(reviewedAt, inspectionId, onToast))) {
        return null
      }
    }
    const quota = await checkLaudoQuota(accessToken)
    if (!quota.allowed) {
      onToast?.(quotaBlockedMessage(quota))
      return null
    }
    const svgData = await captureSvgs(vehicleType, damages)
    const resolvedDamages = await resolveDamagePhotos(damages)
    const viewPhotoEntries = Object.entries(vehicleInfo.viewPhotos || {}) as [string, string][]
    const resolvedViewRefs = await resolvePhotos(viewPhotoEntries.map(([, ref]) => ref))
    const resolvedViewPhotos: VehicleInfo['viewPhotos'] = {}
    viewPhotoEntries.forEach(([view], i) => {
      if (resolvedViewRefs[i]) {
        resolvedViewPhotos[view as keyof NonNullable<VehicleInfo['viewPhotos']>] = resolvedViewRefs[i]
      }
    })
    const resolvedVehicleInfo = {
      ...vehicleInfo,
      interiorPhotos: await resolvePhotos(vehicleInfo.interiorPhotos),
      viewPhotos: resolvedViewPhotos,
    }
    return {
      resolvedDamages,
      resolvedVehicleInfo,
      svgData,
      pdfSettings: getResolvedPdfSettings(),
    }
  }

  async function handlePdf(): Promise<boolean> {
    const payload = await preparePdfPayload()
    if (!payload) return false
    const hash = await generatePdf(
      payload.resolvedVehicleInfo,
      payload.resolvedDamages,
      payload.svgData,
      payload.pdfSettings,
      { accessToken },
    )
    if (hash && hash !== 'N/D') {
      setReportHash(hash)
      onIssued?.(hash)
      return true
    }
    return false
  }

  const btnBase = "w-full flex items-center justify-start gap-2 px-3.5 py-2.5 rounded-xl font-outfit text-[0.85rem] font-bold transition-all duration-200"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[var(--primary)]/10 font-bold text-[0.95rem] text-[var(--text-main)]">
        <IconDamageList />
        <span>Exportar Relatório</span>
      </div>

      {blockExportReason && (
        <div className="rounded-xl p-3 border bg-[var(--severity-high)]/10 border-[var(--severity-high)]/25">
          <p className="text-[0.78rem] font-bold text-[var(--severity-high)] mb-1">PDF bloqueado</p>
          <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed">{blockExportReason}</p>
        </div>
      )}

      {!mayReview && (
        <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed px-0.5">
          Perfil inspetor: você pode gerar o PDF do próprio laudo. A auditoria do gestor fica na aba Equipe.
        </p>
      )}

      {/* Card: Aparência do PDF (layout + seções personalizadas) */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/40 p-3 space-y-3">
        <h3 className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Aparência do PDF</h3>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pdf-theme-select" className="text-[0.72rem] font-semibold text-[var(--text-muted)]">Modelo de Layout</label>
          <select
            id="pdf-theme-select"
            value={pdfTheme}
            onChange={(e) => handleThemeChange(e.target.value as PdfTheme)}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-color)] px-3 py-2 rounded-lg font-outfit text-[0.82rem] font-medium outline-none focus:border-[var(--primary)]/40 transition-all cursor-pointer"
          >
            <option value="modern">Moderno (Padrão)</option>
            <option value="editorial">Editorial (Poppins & Lora)</option>
            <option value="tecnico">Técnico / Forense (Mono)</option>
            <option value="corporativo">Corporativo (Azul & Dourado)</option>
            <option value="minimalista">Minimalista (Preto & Branco)</option>
            <option value="vibrante">Vibrante (Roxo & Rosa)</option>
          </select>
        </div>

        <PdfSectionsPanel
          open={showSectionsAccordion}
          onToggle={() => setShowSectionsAccordion(v => !v)}
          sectionsConfig={sectionsConfig}
          onChange={updateSectionsConfig}
          disclosureScope={disclosureScope}
          onDisclosureChange={updateDisclosureScope}
        />
      </section>

      {/* Botão primário — Gerar Laudo PDF (QR + hash, sem certificação) */}
      <PlainPdfCard
        onPlainPdf={() => handle('pdf', handlePdf, 'PDF gerado')}
        canExportPlainPdf={canExportOfficialPdf && photosReady}
      />

      {/* Card: Compartilhar — exportação secundária (só após as 4 fotos) */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/40 p-3 space-y-3">
        <h3 className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">Compartilhar</h3>

        {photosReady ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handle('wp', async () => sendWhatsApp(vehicleInfo, damages))}
              disabled={loading !== null}
              className={`${btnBase} bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/20 disabled:opacity-60`}
            >
              {loading === 'wp' ? <span className="animate-pulse">…</span> : <IconWhatsApp />}
              Enviar resumo via WhatsApp
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handle('copy', async () => { await copyReport(vehicleInfo, damages) }, 'Copiado')}
                disabled={loading !== null}
                title="Copiar Relatório"
                className={`${btnBase} flex-col justify-center gap-1 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] p-2.5 hover:bg-[var(--btn-secondary-hover)] disabled:opacity-60`}
              >
                {loading === 'copy' ? <span className="text-xl animate-pulse">…</span> : <IconCopy />}
                <span className="text-[0.72rem]">Copiar</span>
              </button>

              <button
                onClick={() => handle('txt', async () => downloadTxt(vehicleInfo, damages), 'TXT baixado')}
                disabled={loading !== null}
                title="Bloco de Notas (TXT)"
                className={`${btnBase} flex-col justify-center gap-1 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] p-2.5 hover:bg-[var(--btn-secondary-hover)] disabled:opacity-60`}
              >
                {loading === 'txt' ? <span className="text-xl animate-pulse">…</span> : <IconTxt />}
                <span className="text-[0.72rem]">TXT</span>
              </button>
            </div>

            <button
              onClick={() => setShowBadgePanel(v => !v)}
              disabled={!reportHash}
              title={reportHash ? 'Selo embutível do laudo' : 'Gere o PDF primeiro para liberar o selo'}
              className={`${btnBase} bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/20 disabled:opacity-40`}
            >
              <IconSeal />
              Selo do laudo
            </button>

            {showBadgePanel && reportHash && (
              <div className="flex flex-col gap-2 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] rounded-xl p-2.5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/selo-laudo-verificado.svg" alt="Laudo Verificado" width={56} height={56} />
                  <p className="text-[0.72rem] text-[var(--text-muted)] leading-snug">
                    Cole este código no site ou anúncio do veículo para exibir o selo de autenticidade.
                  </p>
                </div>
                <textarea
                  readOnly
                  value={buildBadgeSnippet(reportHash)}
                  onFocus={(e) => e.currentTarget.select()}
                  rows={3}
                  className="w-full bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] px-3 py-2 rounded-lg font-mono text-[0.7rem] outline-none resize-none"
                />
                <button
                  onClick={() => handle('badge-copy', async () => {
                    await navigator.clipboard.writeText(buildBadgeSnippet(reportHash))
                  }, 'Código copiado')}
                  disabled={loading !== null}
                  className={`${btnBase} justify-center bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] disabled:opacity-60`}
                >
                  {loading === 'badge-copy' ? <span className="animate-pulse">…</span> : <IconCopy />}
                  Copiar código
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[0.72rem] text-[var(--text-muted)] leading-relaxed px-0.5 py-1">
            Capture as 4 fotos dos lados (Frontal, Traseira, Esquerda e Direita) para liberar o compartilhamento e o selo do laudo.
          </p>
        )}
      </section>

      {reportHash && (
        <div className="rounded-xl p-4 mt-2 border border-[var(--success-border)] bg-[var(--success-bg)] flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-[var(--success)] font-extrabold text-[0.95rem]">
            <IconSeal />
            Dossiê emitido com sucesso
          </div>
          <p className="text-[0.74rem] text-[var(--text-muted)] leading-relaxed max-w-[34ch]">
            O laudo foi gerado e registrado na cadeia de auditoria. Compartilhe o
            PDF ou retorne ao início para uma nova vistoria.
          </p>
          {onReturnHome && (
            <button
              type="button"
              onClick={onReturnHome}
              className="w-full bg-[var(--success)] text-[var(--bg-main)] font-extrabold text-[0.85rem] py-2.5 px-4 rounded-xl shadow-lg shadow-[var(--success)]/20 hover:brightness-110 transition-all"
            >
              Retornar ao Início
            </button>
          )}
        </div>
      )}
    </div>
  )
}
