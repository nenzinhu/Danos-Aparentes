'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth, hasSupabaseAuthCookieHint } from '@/src/hooks/useAuth'
import { useSavedReports } from '@/src/hooks/useSavedReports'
import { useTenantContext } from '@/src/hooks/useTenantContext'
import { supabaseEnabled } from '@/src/lib/supabase'
import {
  findVehicleSummary,
  groupReportsByVehicle,
  mergeRemoteVehiclesIntoSummaries,
  type RemoteVehicleRow,
  type VehicleHistorySummaryWithCloud,
} from '@/src/lib/vehicleEvidence'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'
import Login from '@/src/views/Login'
import VehiclesListView from '@/src/components/vehicles/VehiclesListView'
import VehicleDetailView from '@/src/components/vehicles/VehicleDetailView'
import VehicleCompareView from '@/src/components/vehicles/VehicleCompareView'

const Header = dynamic(() => import('@/src/components/Header'), { ssr: false })

type Mode =
  | { kind: 'list' }
  | { kind: 'detail'; vehicleId: string }
  | { kind: 'compare'; vehicleId: string }

export default function VehiclesPageClient({ mode }: { mode: Mode }) {
  const { session, loading, signIn, signUp, signOut, resetPassword } = useAuth()
  const [likelyAuthed] = useState(() => hasSupabaseAuthCookieHint())
  const { saved, refreshRemote } = useSavedReports(session?.user.id)
  const { tenantId } = useTenantContext(session?.user.id)

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('darkMode')
      if (savedTheme !== null) return savedTheme !== 'false'
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
    }
    return true
  })

  useEffect(() => {
    if (darkMode) document.documentElement.classList.remove('light')
    else document.documentElement.classList.add('light')
  }, [darkMode])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((d) => {
      const next = !d
      localStorage.setItem('darkMode', String(next))
      return next
    })
  }, [])

  const [remoteVehicles, setRemoteVehicles] = useState<RemoteVehicleRow[]>([])

  useEffect(() => {
    const token = session?.access_token
    if (!token) {
      // Adia um tick para não chamar setState sincronamente dentro do effect.
      const t = setTimeout(() => setRemoteVehicles([]), 0)
      return () => clearTimeout(t)
    }
    let cancelled = false
    void fetch('/api/vehicles', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { vehicles: [] }))
      .then((data: { vehicles?: RemoteVehicleRow[] }) => {
        if (!cancelled) setRemoteVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
      })
      .catch(() => {
        if (!cancelled) setRemoteVehicles([])
      })
    return () => {
      cancelled = true
    }
  }, [session?.access_token])

  const localVehicles = useMemo(
    () =>
      groupReportsByVehicle(saved, {
        tenantId,
        userId: session?.user.id ?? 'local',
      }),
    [saved, tenantId, session?.user.id],
  )

  const vehicles: VehicleHistorySummaryWithCloud[] = useMemo(
    () => mergeRemoteVehiclesIntoSummaries(localVehicles, remoteVehicles),
    [localVehicles, remoteVehicles],
  )

  if (supabaseEnabled && loading && likelyAuthed) {
    return <AppLoadingShell />
  }

  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }

  const userId = session?.user.id ?? 'local'
  const vehicle: VehicleHistorySummaryWithCloud | null =
    mode.kind !== 'list'
      ? vehicles.find((v) => v.id === mode.vehicleId) ??
        findVehicleSummary(saved, mode.vehicleId, { tenantId, userId })
      : null

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center pb-12">
      <Header
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
        onOpenSaved={() => { window.location.href = '/app' }}
        onSignOut={supabaseEnabled ? signOut : undefined}
      />

      <div className="w-full max-w-3xl px-4 mt-4 flex items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-2 text-xs font-bold">
          <Link href="/app" className="text-[var(--text-muted)] hover:text-sky-400 transition-colors">
            Nova Inspeção
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
          <Link
            href="/app/vehicles"
            className={mode.kind === 'list' ? 'text-sky-400' : 'text-[var(--text-muted)] hover:text-sky-400'}
          >
            Veículos
          </Link>
          {mode.kind !== 'list' && vehicle && (
            <>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-main)]">{vehicle.plate}</span>
            </>
          )}
          {mode.kind === 'compare' && (
            <>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-main)]">Comparar</span>
            </>
          )}
        </nav>
      </div>

      <main className="w-full max-w-3xl px-4 mt-6">
        {mode.kind === 'list' && (
          <>
            <header className="mb-6">
              <h1 className="font-display text-3xl font-bold">Veículos</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Histórico de estados por veículo — base da Inteligência Histórica Veicular.
              </p>
            </header>
            <VehiclesListView vehicles={vehicles} />
          </>
        )}

        {mode.kind === 'detail' && (
          vehicle ? (
            <VehicleDetailView
              vehicle={vehicle}
              accessToken={session?.access_token}
              userId={userId}
              onHydrated={refreshRemote}
            />
          ) : (
            <MissingVehicle />
          )
        )}

        {mode.kind === 'compare' && (
          vehicle ? (
            <VehicleCompareView
              vehicleId={vehicle.id}
              plate={vehicle.plate}
              reports={vehicle.reports}
              userId={userId}
              tenantId={tenantId}
              accessToken={session?.access_token}
              onHydrated={refreshRemote}
            />
          ) : (
            <MissingVehicle />
          )
        )}
      </main>
    </div>
  )
}

function MissingVehicle() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-8 text-center">
      <p className="text-sm text-[var(--text-muted)]">Veículo não encontrado no histórico local.</p>
      <Link href="/app/vehicles" className="inline-block mt-4 text-sm font-bold text-sky-400 hover:underline">
        ← Voltar à lista
      </Link>
    </div>
  )
}
