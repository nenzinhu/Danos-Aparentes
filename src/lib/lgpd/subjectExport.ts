/**
 * FASE 11 — Build a machine-readable subject data package for an inspection.
 * Supports access/portability workflows; does not delete or claim legal compliance.
 */

import type { Damage, SavedReport, VehicleInfo } from '../../types'
import { PERSONAL_DATA_INVENTORY } from './dataInventory'
import { maskSubjectPreview } from './maskPersonal'

export type SubjectDataExport = {
  schema: 'danos-aparentes-subject-export-v1'
  exportedAt: string
  inspectionId: string
  publicCode?: string
  inventoryKeys: string[]
  /** Full fields for the authenticated controller/operator export. */
  subject: {
    owner: string
    cpf: string
    cnh: string
    phone: string
    plate: string
    city: string
    state: string
    geo: VehicleInfo['geo'] | null
    hasInspectorSignature: boolean
    hasClientSignature: boolean
  }
  /** Minimized copy suitable for screen sharing / support. */
  minimized: ReturnType<typeof maskSubjectPreview>
  damagesSummary: Array<{ id: string; partName: string; typeName: string; photoCount: number }>
  notes: string
}

export function buildSubjectDataExport(report: SavedReport): SubjectDataExport {
  const info = report.vehicleInfo
  const damages: Damage[] = report.damages || []
  return {
    schema: 'danos-aparentes-subject-export-v1',
    exportedAt: new Date().toISOString(),
    inspectionId: report.id,
    publicCode: report.publicCode,
    inventoryKeys: PERSONAL_DATA_INVENTORY.map((f) => f.key),
    subject: {
      owner: info.owner || '',
      cpf: info.cpf || '',
      cnh: info.cnh || '',
      phone: info.phone || '',
      plate: info.plate || '',
      city: info.city || '',
      state: info.state || '',
      geo: info.geo || null,
      hasInspectorSignature: Boolean(info.inspectorSignature),
      hasClientSignature: Boolean(info.clientSignature),
    },
    minimized: maskSubjectPreview({
      owner: info.owner,
      cpf: info.cpf,
      phone: info.phone,
      plate: info.plate,
    }),
    damagesSummary: damages.map((d) => ({
      id: d.id,
      partName: d.partName,
      typeName: d.typeName,
      photoCount: (d.photos || []).length,
    })),
    notes:
      'Pacote técnico de acesso/portabilidade. Não inclui blobs de foto/assinatura (só flags e contagens). Eliminação e bases legais ficam fora deste módulo.',
  }
}

export function subjectExportToJson(report: SavedReport): string {
  return `${JSON.stringify(buildSubjectDataExport(report), null, 2)}\n`
}
