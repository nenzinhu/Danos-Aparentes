import type { PublicVerifyOutcome } from './publicVerify'

/** FASE 18 — best-effort public verify audit (server appends to chain). */
export async function logPublicVerifyAudit(args: {
  hash: string
  outcome: PublicVerifyOutcome
  inspection_id?: string | null
  method?: string
}): Promise<void> {
  try {
    await fetch('/api/verify-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: args.hash,
        outcome: args.outcome,
        inspection_id: args.inspection_id ?? undefined,
        method: args.method ?? 'lookup',
      }),
    })
  } catch {
    // never block verify UX
  }
}
