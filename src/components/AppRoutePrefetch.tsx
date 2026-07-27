'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Warm /app route chunk while the user is still on the landing page. */
export default function AppRoutePrefetch() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/app')
    router.prefetch('/app?mode=signup')
  }, [router])

  return null
}
