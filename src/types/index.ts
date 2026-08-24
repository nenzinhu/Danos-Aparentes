/**
 * Core domain types for Danos Aparentes.
 * Single source of truth for vehicle, inspection, damage, and evidence.
 */

export type DamageSeverity = 'low' | 'medium' | 'high';

export type DamageCategory =
  | 'arranhão'
  | 'amassado'
  | 'trinca'
  | 'quebra'
  | 'outro';

export interface DamageRecord {
  id: string;
  severity: DamageSeverity;
  category: DamageCategory;
  description: string;
  part_id?: string;
  part_name?: string;
  photo_url?: string;
  confidence?: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface EvidencePayload {
  photos: string[];
  location?: GeoLocation;
  captured_at: string; // ISO
  device_fingerprint?: string;
}

export type InspectionStatus = 'draft' | 'completed' | 'superseded' | 'archived';

export interface InspectionBase {
  vehicle_id: string;
  plate: string;
  type: 'checkout' | 'checkin';
  status: InspectionStatus;
  damages: DamageRecord[];
  evidence: EvidencePayload;
  notes?: string;
  inspector_name?: string;
  inspector_id?: string;
}

export interface Inspection extends InspectionBase {
  id: string;
  hash: string;
  previous_hash?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  first_inspection_at?: string;
  last_inspection_at?: string;
  inspection_count: number;
}

export interface DiffResult {
  added_damages: DamageRecord[];
  removed_damages: DamageRecord[];
  modified_damages: DamageRecord[];
  unchanged_damages: DamageRecord[];
}

export type VerifyOutcome =
  | { ok: true; status: 'verified' }
  | { ok: true; status: 'superseded' }
  | { ok: false; reason: 'not_found' | 'hash_mismatch' | 'integrity_failure' };

export interface PdfVerifyRecord {
  hash: string;
  final_hash: string | null;
  integrity_manifest: { pdf_hash?: string } | null;
  inspection_status: string | null;
  is_superseded_version: boolean;
}
