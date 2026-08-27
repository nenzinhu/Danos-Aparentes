import { z } from 'zod';
import type {
  DamageRecord,
  DamageSeverity,
  DamageCategory,
  EvidencePayload,
  GeoLocation,
  Inspection,
  InspectionStatus,
  Vehicle,
  DiffResult,
  VerifyOutcome,
  PdfVerifyRecord,
} from '@/src/types/index';

export const GeoLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const EvidencePayloadSchema: z.ZodType<EvidencePayload> = z.object({
  photos: z.array(z.string().url()),
  location: GeoLocationSchema.optional(),
  captured_at: z.string().datetime(),
  device_fingerprint: z.string().optional(),
});

export const DamageCategoryEnum = z.enum([
  'arranhão',
  'amassado',
  'trinca',
  'quebra',
  'outro',
]);

export const DamageSeverityEnum = z.enum(['low', 'medium', 'high']);

export const DamageRecordSchema: z.ZodType<DamageRecord> = z.object({
  id: z.string().uuid(),
  severity: DamageSeverityEnum,
  category: DamageCategoryEnum,
  description: z.string().min(1),
  part_id: z.string().optional(),
  part_name: z.string().optional(),
  photo_url: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const InspectionStatusEnum = z.enum([
  'draft',
  'completed',
  'superseded',
  'archived',
]);

export const InspectionSchema: z.ZodType<Inspection> = z.object({
  id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  plate: z.string().min(1),
  type: z.enum(['checkout', 'checkin']),
  status: InspectionStatusEnum,
  damages: z.array(DamageRecordSchema),
  evidence: EvidencePayloadSchema,
  notes: z.string().optional(),
  inspector_name: z.string().optional(),
  inspector_id: z.string().uuid().optional(),
  hash: z.string().min(1),
  previous_hash: z.string().optional(),
  version: z.number().int().positive(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const VehicleSchema: z.ZodType<Vehicle> = z.object({
  id: z.string().uuid(),
  plate: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  color: z.string().optional(),
  first_inspection_at: z.string().datetime().optional(),
  last_inspection_at: z.string().datetime().optional(),
  inspection_count: z.number().int().nonnegative(),
});

export const DiffResultSchema: z.ZodType<DiffResult> = z.object({
  added_damages: z.array(DamageRecordSchema),
  removed_damages: z.array(DamageRecordSchema),
  modified_damages: z.array(DamageRecordSchema),
  unchanged_damages: z.array(DamageRecordSchema),
});

export const VerifyOutcomeSchema: z.ZodType<VerifyOutcome> = z.union([
  z.object({ ok: z.literal(true), status: z.enum(['verified', 'superseded']) }),
  z.object({
    ok: z.literal(false),
    reason: z.enum(['not_found', 'hash_mismatch', 'integrity_failure']),
  }),
]);

export const PdfVerifyRecordSchema: z.ZodType<PdfVerifyRecord> = z.object({
  hash: z.string().min(1),
  final_hash: z.string().nullable(),
  integrity_manifest: z
    .object({ pdf_hash: z.string().optional() })
    .nullable(),
  inspection_status: z.string().nullable(),
  is_superseded_version: z.boolean(),
});

export type {
  DamageSeverity,
  DamageCategory,
  InspectionStatus,
};
