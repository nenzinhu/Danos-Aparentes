import QRCode from 'qrcode'
import { Damage, VehicleInfo } from '../../types'
import { appendAuditEvent } from '../audit/auditLog'
import { collectOriginalPhotoHashes } from '../photoEvidence'
import { hashRegisterIdempotencyKey } from '../sync/idempotency'
import { resolveTenantId } from '../tenant/resolveTenant'
import { supabase, supabaseEnabled } from '../supabase'
import { normalizePlate } from '../reportComparison'
import { buildIntegrityManifest, type IntegrityManifest } from './integrityManifest'

/**
 * Chave que agrupa reemissões do MESMO laudo (placa + Nº OS normalizados).
 * Sem placa e sem ref não há como saber se dois laudos são a "mesma vistoria"
 * reemitida — nesse caso cada hash fica isolado (report_key vazia), igual ao
 * comportamento anterior a essa versão.
 */
export function buildReportKey(info: Pick<VehicleInfo, 'plate' | 'ref'>): string {
  const plate = normalizePlate(info.plate || '')
  const ref = (info.ref || '').trim().toUpperCase()
  if (!plate && !ref) return ''
  return `${plate}::${ref}`
}

/** QR Code de verificação do laudo (PDF) — bundled via pacote `qrcode`. */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 96,
      margin: 1,
      color: { dark: '#141413', light: '#ffffff' },
    })
  } catch {
    return ''
  }
}

/**
 * Hash de integridade (SHA-256, primeiros 32 hex).
 * Cobre todo o conteúdo do laudo — qualquer alteração depois de emitido
 * muda o hash e derruba a verificação no /verify.
 */
export async function computeHash(info: VehicleInfo, damages: Damage[], ts: number): Promise<string> {
  try {
    const geo = info.geo ? { lat: info.geo.lat, lng: info.geo.lng } : null
    const payload = JSON.stringify({
      ts,
      geo,
      info: {
        owner: info.owner, phone: info.phone, brand: info.brand, plate: info.plate,
        generalNotes: info.generalNotes,
        interiorNotes: info.interiorNotes, interiorPhotos: info.interiorPhotos, interiorPhotoNotes: info.interiorPhotoNotes,
        viewPhotos: info.viewPhotos,
        profile: info.profile, ref: info.ref,
        color: info.color, vehicleTypeDesc: info.vehicleTypeDesc, city: info.city, state: info.state,
        cpf: info.cpf, cnh: info.cnh, cnhCategory: info.cnhCategory,
        inspectorSignature: info.inspectorSignature, clientSignature: info.clientSignature,
        customFields: info.customFields,
      },
      damages: damages.map(d => ({
        vehicle: d.vehicle, view: d.view, partId: d.partId, partName: d.partName,
        type: d.type, typeName: d.typeName, severity: d.severity, notes: d.notes,
        photos: d.photos, photoNotes: d.photoNotes,
      })),
    })
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    return hex.slice(0, 32).toUpperCase()
  } catch { return 'N/D' }
}

export type RegisterHashMeta = {
  /** SavedReport / vehicle_inspections id â€” used to mark issued on cloud. */
  inspectionId?: string
  correctionReason?: string
  /** Previous report_hashes.hash this version replaces. */
  supersedesHash?: string
  publicCode?: string
  laudoVersion?: number
}

/** Registra o hash no Supabase para a página /verify conferir depois */
export async function registerHash(
  hash: string,
  info: VehicleInfo,
  damages: Damage[],
  date: string,
  companyName?: string,
  companyLogo?: string,
  manifest?: IntegrityManifest,
  meta?: RegisterHashMeta,
) {
  if (!supabaseEnabled || !supabase || hash === 'N/D') return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { data: existingHash } = await supabase
      .from('report_hashes')
      .select('hash')
      .eq('hash', hash)
      .maybeSingle()
    if (existingHash?.hash) return

    const tenantId = await resolveTenantId(session.user.id)
    const reportKey = buildReportKey(info)
    let version = 1
    if (reportKey) {
      const { count } = await supabase
        .from('report_hashes')
        .select('hash', { count: 'exact', head: true })
        .eq('report_key', reportKey)
      version = (count ?? 0) + 1
    }
    if (meta?.laudoVersion && meta.laudoVersion > 0) {
      version = meta.laudoVersion
    }

    const row: Record<string, unknown> = {
      hash, user_id: session.user.id, tenant_id: tenantId, plate: info.plate || '',
      ref: info.ref || '', issued_at: date, damages_count: damages.length,
      geo_lat: info.geo?.lat ?? null,
      geo_lng: info.geo?.lng ?? null,
      geo_accuracy: info.geo?.accuracy ?? null,
      geo_address: info.geo?.address ?? null,
      company_name: companyName || '',
      company_logo: companyLogo || '',
      report_key: reportKey,
      version,
      correction_reason: meta?.correctionReason || '',
      supersedes_hash: meta?.supersedesHash || '',
      inspection_id: meta?.inspectionId || '',
      public_code: meta?.publicCode || '',
    }
    if (manifest) {
      row.integrity_scheme = manifest.scheme
      row.integrity_manifest = manifest
      row.final_hash = manifest.final_hash
    }

    await supabase.from('report_hashes').insert(row)

    void appendAuditEvent({
      event_type: 'hash_generation',
      inspection_id: meta?.inspectionId || null,
      tenant_id: tenantId,
      idempotency_key: hashRegisterIdempotencyKey(hash, meta?.inspectionId),
      metadata: {
        hash,
        report_key: reportKey,
        version,
        public_code: meta?.publicCode || '',
        integrity_scheme: manifest?.scheme || '',
        final_hash: manifest?.final_hash || '',
      },
    })

    // Mark the inspection as issued (best-effort). DB trigger then freezes content.
    if (meta?.inspectionId) {
      const { data: inspRow } = await supabase
        .from('vehicle_inspections')
        .select('reviewed_at')
        .eq('id', meta.inspectionId)
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (!inspRow?.reviewed_at) return

      await supabase
        .from('vehicle_inspections')
        .update({
          status: 'issued',
          issued_hash: hash,
          public_code: meta.publicCode || '',
          laudo_version: version,
          issued_at: new Date().toISOString(),
          correction_reason: meta.correctionReason || '',
        })
        .eq('id', meta.inspectionId)
        .eq('user_id', session.user.id)
        .in('status', ['draft', 'complete'])
        .not('reviewed_at', 'is', null)
    }
  } catch { /* best-effort — não bloqueia a geração do PDF */ }
}

/**
 * After PDF bytes exist, recompute integrity-v2 with pdf_hash and update the
 * row keyed by the public v1 hash. Best-effort; no-op without auth/session.
 */
export async function registerIntegrityPdfHash(
  hashV1: string,
  pdfBytes: ArrayBuffer | Uint8Array,
  args: {
    info: VehicleInfo
    damages: Damage[]
    ts: number
    issuedAt: string
    inspectionId?: string
  },
): Promise<void> {
  if (!supabaseEnabled || !supabase || !hashV1 || hashV1 === 'N/D') return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const photoRefs = [
      ...args.damages.flatMap((d) => d.photos || []),
      ...(args.info.interiorPhotos || []),
      ...Object.values(args.info.viewPhotos || {}).filter(Boolean),
    ] as string[]
    let originalPhotoHashes: Record<string, string> = {}
    try {
      originalPhotoHashes = await collectOriginalPhotoHashes(photoRefs)
    } catch {
      /* fall back */
    }

    const manifest = await buildIntegrityManifest({
      info: args.info,
      damages: args.damages,
      ts: args.ts,
      issuedAt: args.issuedAt,
      pdfBytes,
      inspectionId: args.inspectionId,
      originalPhotoHashes,
    })

    await supabase
      .from('report_hashes')
      .update({
        integrity_scheme: manifest.scheme,
        integrity_manifest: manifest,
        final_hash: manifest.final_hash,
      })
      .eq('hash', hashV1)
      .eq('user_id', session.user.id)

    void appendAuditEvent({
      event_type: 'pdf_generation',
      inspection_id: args.inspectionId || null,
      metadata: {
        hash: hashV1,
        final_hash: manifest.final_hash,
        pdf_hash: manifest.pdf_hash,
      },
    })
  } catch { /* best-effort */ }
}
