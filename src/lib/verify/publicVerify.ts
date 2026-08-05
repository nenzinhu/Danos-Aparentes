/**
 * FASE 8 — Public verification outcomes (QR / hash / public code).
 * Labels match the integrity roadmap. No legal-validity claims.
 */

export type PublicVerifyOutcome =
  | 'integrity_confirmed'
  | 'integrity_not_confirmed'
  | 'not_found'
  | 'cancelled'
  | 'superseded_version'

export type PublicVerifyPresentation = {
  outcome: PublicVerifyOutcome
  /** Founder-plan style label (uppercase). */
  title: string
  description: string
}

const PRESENTATION: Record<PublicVerifyOutcome, Omit<PublicVerifyPresentation, 'outcome'>> = {
  integrity_confirmed: {
    title: 'INTEGRIDADE CONFIRMADA',
    description:
      'O hash corresponde a um laudo registrado. As informações abaixo refletem o registro técnico de emissão.',
  },
  integrity_not_confirmed: {
    title: 'INTEGRIDADE NÃO CONFIRMADA',
    description:
      'O conteúdo informado não corresponde ao registro esperado. O arquivo pode ter sido alterado ou o código está incompleto.',
  },
  not_found: {
    title: 'DOCUMENTO NÃO ENCONTRADO',
    description:
      'Nenhum laudo emitido foi localizado com este código ou hash. Confira o QR / HASH impresso no PDF.',
  },
  cancelled: {
    title: 'DOCUMENTO CANCELADO',
    description:
      'Este registro está associado a um laudo anulado. Não use como evidência da versão vigente.',
  },
  superseded_version: {
    title: 'VERSÃO SUPERADA',
    description:
      'Este hash corresponde a uma versão anterior. Existe uma versão mais recente do mesmo laudo.',
  },
}

export function presentVerifyOutcome(outcome: PublicVerifyOutcome): PublicVerifyPresentation {
  return { outcome, ...PRESENTATION[outcome] }
}

export type ResolveVerifyArgs = {
  found: boolean
  /** From vehicle_inspections.status when inspection_id is linked. */
  inspectionStatus?: string | null
  /** True when report_key lineage exists and this hash is not the latest. */
  isSupersededVersion?: boolean
  /** Explicit integrity mismatch (e.g. PDF recompute in FASE 9). */
  integrityMismatch?: boolean
}

/** Pure resolver for public verify page statuses. */
export function resolveVerifyOutcome(args: ResolveVerifyArgs): PublicVerifyOutcome {
  if (!args.found) return 'not_found'
  if (args.integrityMismatch) return 'integrity_not_confirmed'
  if (args.inspectionStatus === 'cancelled') return 'cancelled'
  if (args.isSupersededVersion) return 'superseded_version'
  return 'integrity_confirmed'
}

/** Normalize public code for lookup (trim, upper). */
export function normalizePublicCode(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase()
}

/** Detect DA-YYYY-XXXXXX(-Rn)? public codes vs hex hashes. */
export function isPublicCodeQuery(raw: string): boolean {
  const n = normalizePublicCode(raw)
  return /^DA-\d{4}-[0-9A-F]{4,12}(-R\d+)?$/i.test(n)
}

/**
 * Mask Brazilian CPF-like digits in free text for public surfaces.
 * Leaves non-CPF numbers alone when possible.
 */
export function maskCpfInText(text: string): string {
  return text.replace(/\b(\d{3})\.(\d{3})\.(\d{3})-(\d{2})\b/g, '***.***.***-$4')
    .replace(/\b(\d{3})(\d{3})(\d{3})(\d{2})\b/g, (full) => {
      if (full.length !== 11) return full
      return `*******${full.slice(-2)}`
    })
}

/** Partial plate mask for public verify (ABC1D23 → ABC***3). */
export function maskPlate(plate: string): string {
  const p = (plate || '').trim().toUpperCase()
  if (p.length < 4) return p || '—'
  return `${p.slice(0, 3)}***${p.slice(-1)}`
}
