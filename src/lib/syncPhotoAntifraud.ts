/**
 * FASE 20 — Sync de metadados de evidência + checagem de reuso na nuvem.
 * Best-effort: nunca derruba o flush da fila.
 */

import { appendAuditEvent } from './audit/auditLog'
import {
  evaluatePhotoAntifraud,
  type PhotoFingerprint,
} from './audit/photoAntifraud'
import { db, type PhotoEvidenceRecord } from './db'
import { isPhotoRef, PHOTO_REF_PREFIX } from './photoStore'
import { supabase } from './supabase'
import type { SavedReport } from '../types'

function collectOptimizedIds(report: SavedReport): string[] {
  const ids = new Set<string>()
  for (const d of report.damages) {
    for (const p of d.photos || []) {
      if (isPhotoRef(p)) ids.add(p.slice(PHOTO_REF_PREFIX.length))
    }
  }
  for (const p of report.vehicleInfo.interiorPhotos || []) {
    if (isPhotoRef(p)) ids.add(p.slice(PHOTO_REF_PREFIX.length))
  }
  for (const p of Object.values(report.vehicleInfo.viewPhotos || {})) {
    if (p && isPhotoRef(p)) ids.add(p.slice(PHOTO_REF_PREFIX.length))
  }
  return [...ids]
}

function toCloudRow(ev: PhotoEvidenceRecord, userId: string) {
  return {
    id: ev.id,
    inspection_id: ev.inspectionId ?? null,
    damage_id: ev.damageId ?? null,
    user_id: userId,
    mime_type: ev.mimeType,
    byte_size: ev.byteSize,
    width: ev.width ?? null,
    height: ev.height ?? null,
    sha256: ev.sha256,
    optimized_sha256: ev.optimizedSha256 ?? null,
    perceptual_hash: ev.perceptualHash ?? null,
    captured_at: new Date(ev.capturedAt).toISOString(),
    gps_lat: ev.gps?.lat ?? null,
    gps_lng: ev.gps?.lng ?? null,
    gps_accuracy: ev.gps?.accuracy ?? null,
    device: ev.device ?? null,
  }
}

function toFingerprint(row: {
  id: string
  sha256: string
  perceptual_hash?: string | null
  inspection_id?: string | null
  captured_at?: string | null
  gps_lat?: number | null
  gps_lng?: number | null
}): PhotoFingerprint {
  return {
    id: row.id,
    sha256: row.sha256,
    perceptualHash: row.perceptual_hash,
    inspectionId: row.inspection_id,
    capturedAt: row.captured_at ? Date.parse(row.captured_at) : null,
    gps:
      row.gps_lat != null && row.gps_lng != null
        ? { lat: row.gps_lat, lng: row.gps_lng }
        : null,
  }
}

/**
 * Upsert photo_evidence na nuvem e registra alertas de reuso/contexto.
 * Não lança — falhas são engolidas.
 */
export async function syncPhotoEvidenceAndAntifraud(
  report: SavedReport,
  userId: string,
): Promise<void> {
  if (!supabase || !userId) return
  try {
    const optimizedIds = collectOptimizedIds(report)
    const localEvidence: PhotoEvidenceRecord[] = []
    for (const optId of optimizedIds) {
      const ev = await db.getPhotoEvidenceByOptimizedId(optId)
      if (ev) {
        // Garante inspection_id no registro local se ainda não tinha.
        if (!ev.inspectionId) {
          const patched = { ...ev, inspectionId: report.id }
          await db.putPhotoEvidence(patched)
          localEvidence.push(patched)
        } else {
          localEvidence.push(ev)
        }
      }
    }
    // Também puxa evidências já marcadas com este inspectionId.
    const byInsp = await db.getPhotoEvidenceByInspection(report.id)
    for (const ev of byInsp) {
      if (!localEvidence.some((e) => e.id === ev.id)) localEvidence.push(ev)
    }

    if (localEvidence.length === 0) return

    const rows = localEvidence.map((ev) => toCloudRow(ev, userId))
    const { error } = await supabase.from('photo_evidence').upsert(rows)
    if (error) return

    // Candidatos do mesmo usuário (últimos 500) para reuso perceptual + exato.
    const { data: remoteCandidates } = await supabase
      .from('photo_evidence')
      .select('id, sha256, perceptual_hash, inspection_id, captured_at, gps_lat, gps_lng')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)

    const candidates = ((remoteCandidates as Parameters<typeof toFingerprint>[0][] | null) ?? [])
      .map(toFingerprint)

    const inspectionGps = report.vehicleInfo.geo
      ? { lat: report.vehicleInfo.geo.lat, lng: report.vehicleInfo.geo.lng }
      : null
    const inspectionAnchorAt = report.savedAt || Date.now()

    for (const ev of localEvidence) {
      const finding = evaluatePhotoAntifraud({
        photo: {
          id: ev.id,
          sha256: ev.sha256,
          perceptualHash: ev.perceptualHash,
          inspectionId: report.id,
          capturedAt: ev.capturedAt,
          gps: ev.gps ? { lat: ev.gps.lat, lng: ev.gps.lng } : null,
        },
        candidates,
        inspectionGps,
        inspectionAnchorAt,
      })

      for (const reuse of finding.reuses) {
        void appendAuditEvent({
          event_type: 'photo_reuse_alert',
          inspection_id: report.id,
          idempotency_key: `photo_reuse:${ev.id}:${reuse.candidateId}:${reuse.kind}`,
          metadata: {
            photo_id: ev.id,
            kind: reuse.kind,
            match_photo_id: reuse.candidateId,
            match_inspection_id: reuse.candidateInspectionId,
            hamming: reuse.distance ?? null,
            sha256: ev.sha256.slice(0, 16),
            source: 'sync',
          },
        })
      }
      for (const ctx of finding.context) {
        void appendAuditEvent({
          event_type: 'photo_context_alert',
          inspection_id: report.id,
          idempotency_key: `photo_ctx:${ev.id}:${ctx.kind}`,
          metadata: {
            photo_id: ev.id,
            kind: ctx.kind,
            detail: ctx.detail,
            source: 'sync',
          },
        })
      }
    }
  } catch {
    // never block sync
  }
}
