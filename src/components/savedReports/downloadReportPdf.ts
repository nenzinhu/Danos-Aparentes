import type { SavedReport } from '../../types'
import { resolveVehicleType } from '../../lib/vehicleTypeInference'
import { generatePdf } from '../../lib/pdf'
import { captureSvgs } from '../ReportActions'
import { resolveDamagePhotos, resolvePhotos } from '../../lib/photoStore'
import { isIssuedLocked } from '../../lib/pdf/reportIssuance'

export async function downloadReportPdf(
  r: SavedReport,
  opts: { hasAccess?: boolean; accessToken?: string },
): Promise<void> {
  const vType = resolveVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
  const svgData = await captureSvgs(vType, r.damages)
  const companyName = opts.hasAccess ? (localStorage.getItem('company_name') || '') : ''
  const companyLogo = opts.hasAccess ? (localStorage.getItem('company_logo') || '') : ''
  const pdfTheme = (localStorage.getItem('vistoria_pdf_theme') as 'modern' | 'editorial') || 'modern'
  const resolvedDamages = await resolveDamagePhotos(r.damages)
  const viewEntries = Object.entries(r.vehicleInfo.viewPhotos || {}) as [string, string][]
  const resolvedViewRefs = await resolvePhotos(viewEntries.map(([, ref]) => ref))
  const resolvedViewPhotos: typeof r.vehicleInfo.viewPhotos = {}
  viewEntries.forEach(([view], i) => {
    if (resolvedViewRefs[i]) {
      ;(resolvedViewPhotos as Record<string, string>)[view] = resolvedViewRefs[i]
    }
  })
  const resolvedInfo = {
    ...r.vehicleInfo,
    interiorPhotos: await resolvePhotos(r.vehicleInfo.interiorPhotos || []),
    viewPhotos: resolvedViewPhotos,
  }
  await generatePdf(resolvedInfo, resolvedDamages, svgData, {
    companyName,
    companyLogo,
    pdfTheme,
    // Re-download of issued snapshot must not bump report_hashes.version
    skipHashRegister: isIssuedLocked(r.status) || Boolean(r.issuedHash),
    inspectionId: r.id,
    publicCode: r.publicCode,
    laudoVersion: r.laudoVersion,
    inspectionPurpose: r.inspectionPurpose,
  }, { accessToken: opts.accessToken })
}
