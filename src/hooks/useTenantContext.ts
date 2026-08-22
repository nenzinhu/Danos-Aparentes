'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveTenantContext, type TenantContext } from '../lib/tenant/resolveTenant'

export function useTenantContext(userId?: string) {
  const [ctx, setCtx] = useState<TenantContext>({ tenantId: null, role: 'solo' })
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCtx({ tenantId: null, role: 'solo' })
      return
    }
    setLoading(true)
    try {
      const next = await resolveTenantContext(userId)
      setCtx(next)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    void Promise.resolve().then(() => { void refresh() })
  }, [refresh])

  return { ...ctx, loading, refresh }
}
