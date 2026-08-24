/**
 * FASE 21 — Divulgação seletiva na verificação pública.
 *
 * O QR/hash prova autenticidade; o nível define o que a superfície pública
 * revela. Sem alegação de validade jurídica.
 *
 * Níveis:
 * - authenticity (A): só autenticidade + placa mascarada + data
 * - summary (B): A + contagem/severidade de danos (sem GPS)
 * - full (C): B + referência/OS + local da vistoria
 *
 * Laudos antigos sem coluna → tratados como `summary` (compatível com o
 * comportamento histórico da /verify). Novas emissões default = authenticity.
 */

export const DISCLOSURE_SCOPES = ['authenticity', 'summary', 'full'] as const
export type DisclosureScope = (typeof DISCLOSURE_SCOPES)[number]

export type SeveritySummary = {
  low: number
  medium: number
  high: number
}

export type PublicFieldFlags = {
  showPlate: boolean
  showRef: boolean
  showDamagesCount: boolean
  showSeverityBreakdown: boolean
  showIssuedAt: boolean
  showPublicCode: boolean
  showCompany: boolean
  showVersion: boolean
  showGeo: boolean
  showReliability: boolean
  showHash: boolean
}

export const DISCLOSURE_LABELS: Record<
  DisclosureScope,
  { short: string; title: string; description: string }
> = {
  authenticity: {
    short: 'A — Autenticidade',
    title: 'NÍVEL A · AUTENTICIDADE',
    description:
      'Confirma integridade do laudo, data de emissão e placa mascarada. Sem contagem de danos nem localização.',
  },
  summary: {
    short: 'B — Resumo',
    title: 'NÍVEL B · RESUMO',
    description:
      'Inclui contagem de danos por severidade e dados do emissor. Sem GPS nem fotos.',
  },
  full: {
    short: 'C — Completo',
    title: 'NÍVEL C · COMPLETO',
    description:
      'Inclui referência/OS e local da vistoria (quando registrado), além do resumo.',
  },
}

/** Default para novas emissões (mais restritivo / LGPD-friendly). */
export const DEFAULT_NEW_DISCLOSURE_SCOPE: DisclosureScope = 'authenticity'

/** Default para registros legados sem a coluna. */
export const LEGACY_DISCLOSURE_SCOPE: DisclosureScope = 'summary'

export function isDisclosureScope(value: unknown): value is DisclosureScope {
  return value === 'authenticity' || value === 'summary' || value === 'full'
}

/** Aceita 'a'|'b'|'c' e nomes longos; legado/vazio → summary. */
export function normalizeDisclosureScope(
  raw: unknown,
  opts?: { forNewIssue?: boolean },
): DisclosureScope {
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase()
    if (v === 'authenticity' || v === 'a') return 'authenticity'
    if (v === 'summary' || v === 'b') return 'summary'
    if (v === 'full' || v === 'c') return 'full'
  }
  return opts?.forNewIssue ? DEFAULT_NEW_DISCLOSURE_SCOPE : LEGACY_DISCLOSURE_SCOPE
}

export function fieldsForDisclosureScope(scope: DisclosureScope): PublicFieldFlags {
  switch (scope) {
    case 'authenticity':
      return {
        showPlate: true,
        showRef: false,
        showDamagesCount: false,
        showSeverityBreakdown: false,
        showIssuedAt: true,
        showPublicCode: true,
        showCompany: true,
        showVersion: true,
        showGeo: false,
        showReliability: true,
        showHash: true,
      }
    case 'summary':
      return {
        showPlate: true,
        showRef: true,
        showDamagesCount: true,
        showSeverityBreakdown: true,
        showIssuedAt: true,
        showPublicCode: true,
        showCompany: true,
        showVersion: true,
        showGeo: false,
        showReliability: true,
        showHash: true,
      }
    case 'full':
      return {
        showPlate: true,
        showRef: true,
        showDamagesCount: true,
        showSeverityBreakdown: true,
        showIssuedAt: true,
        showPublicCode: true,
        showCompany: true,
        showVersion: true,
        showGeo: true,
        showReliability: true,
        showHash: true,
      }
  }
}

export function buildSeveritySummary(
  damages: Array<{ severity?: string | null }>,
): SeveritySummary {
  const out: SeveritySummary = { low: 0, medium: 0, high: 0 }
  for (const d of damages) {
    if (d.severity === 'low') out.low++
    else if (d.severity === 'medium') out.medium++
    else if (d.severity === 'high') out.high++
  }
  return out
}

export function parseSeveritySummary(raw: unknown): SeveritySummary | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const low = typeof o['low'] === 'number' ? o['low'] : 0
  const medium = typeof o['medium'] === 'number' ? o['medium'] : 0
  const high = typeof o['high'] === 'number' ? o['high'] : 0
  if (low + medium + high === 0 && !('low' in o)) return null
  return { low, medium, high }
}
