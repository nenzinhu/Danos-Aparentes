'use client'

import { use } from 'react'
import VehiclesPageClient from '@/src/components/vehicles/VehiclesPageClient'

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <VehiclesPageClient mode={{ kind: 'detail', vehicleId: decodeURIComponent(id) }} />
}
