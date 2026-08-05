/**
 * FASE 19 — deep-link da comparação (`?prev=&curr=`).
 */

export type CompareDeepLink = {
  prevId: string | null
  currId: string | null
}

/** Lê IDs de vistoria a partir de URLSearchParams / Record. */
export function parseCompareDeepLink(
  params: URLSearchParams | Record<string, string | string[] | undefined | null>,
): CompareDeepLink {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      const v = params.get(key)?.trim()
      return v || null
    }
    const raw = params[key]
    const v = Array.isArray(raw) ? raw[0] : raw
    const s = typeof v === 'string' ? v.trim() : ''
    return s || null
  }
  return {
    prevId: get('prev'),
    currId: get('curr'),
  }
}

/** Monta path relativo com query opcional. */
export function buildCompareHref(
  vehicleId: string,
  opts?: { prevId?: string | null; currId?: string | null },
): string {
  const base = `/app/vehicles/${encodeURIComponent(vehicleId)}/compare`
  const q = new URLSearchParams()
  if (opts?.prevId) q.set('prev', opts.prevId)
  if (opts?.currId) q.set('curr', opts.currId)
  const qs = q.toString()
  return qs ? `${base}?${qs}` : base
}
