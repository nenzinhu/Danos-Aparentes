'use client'

import { Suspense, use } from 'react'
import VehiclesPageClient from '@/src/components/vehicles/VehiclesPageClient'

function CompareInner({ vehicleId }: { vehicleId: string }) {
  return <VehiclesPageClient mode={{ kind: 'compare', vehicleId }} />
}

export default function VehicleComparePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Carregando comparação…</div>}>
      <CompareInner vehicleId={decodeURIComponent(id)} />
    </Suspense>
  )
}
