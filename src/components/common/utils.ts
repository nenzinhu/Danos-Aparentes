import type { Vehicle, DamageRecord, Inspection, DiffResult } from '@/types';

type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ');
}

export function severityColor(severity: DamageRecord['severity']) {
  if (severity === 'high') return 'text-red-700 bg-red-500/10';
  if (severity === 'medium') return 'text-amber-700 bg-amber-500/10';
  return 'text-emerald-700 bg-emerald-500/10';
}

export function severityLabel(severity: DamageRecord['severity']) {
  if (severity === 'high') return 'Grave';
  if (severity === 'medium') return 'Médio';
  return 'Leve';
}

export function plateDisplay(plate: string) {
  return plate.toUpperCase();
}

export function diffSummary(diff: DiffResult) {
  return {
    added: diff.added_damages.length,
    removed: diff.removed_damages.length,
    modified: diff.modified_damages.length,
    unchanged: diff.unchanged_damages.length,
  };
}
