'use client';

import { useMemo } from 'react';
import type { Inspection, DiffResult, VerifyOutcome, PdfVerifyRecord } from '@/types';
import { VerifyOutcomeSchema, PdfVerifyRecordSchema } from '@/lib/validation/schemas';

export function useInspectionDiff(
  before: Inspection | null,
  after: Inspection | null
): DiffResult | null {
  return useMemo(() => {
    if (!before || !after) return null;

    const beforeMap = new Map(before.damages.map(d => [d.id, d]));
    const afterMap = new Map(after.damages.map(d => [d.id, d]));

    const added_damages: DiffResult['added_damages'] = [];
    const removed_damages: DiffResult['removed_damages'] = [];
    const modified_damages: DiffResult['modified_damages'] = [];
    const unchanged_damages: DiffResult['unchanged_damages'] = [];

    for (const [id, d] of afterMap) {
      if (!beforeMap.has(id)) added_damages.push(d);
      else {
        const b = beforeMap.get(id)!;
        if (
          b.severity !== d.severity ||
          b.category !== d.category ||
          b.description !== d.description
        ) {
          modified_damages.push(d);
        } else {
          unchanged_damages.push(d);
        }
      }
    }

    for (const [id, d] of beforeMap) {
      if (!afterMap.has(id)) removed_damages.push(d);
    }

    return { added_damages, removed_damages, modified_damages, unchanged_damages };
  }, [before, after]);
}

export function useVerifyOutcome(raw: unknown): VerifyOutcome | null {
  return useMemo(() => {
    try {
      return VerifyOutcomeSchema.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);
}

export function usePdfVerifyRecord(raw: unknown): PdfVerifyRecord | null {
  return useMemo(() => {
    try {
      return PdfVerifyRecordSchema.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);
}
