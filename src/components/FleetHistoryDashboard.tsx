'use client'
import React, { useMemo } from 'react'
import { SavedReport } from '../types'
import { groupReportsByVehicle } from '../lib/vehicleEvidence/groupReports'
import {
  IconChart,
  IconFolder,
  IconWarning,
  IconSparkles,
  IconCar,
  IconBolt,
} from './ui/AnimatedIcons'

interface Props {
  saved: SavedReport[]
}

type Status = 'green' | 'yellow' | 'red'

function statusColor(s: Status): string {
  if (s === 'green') return '#10b981'
  if (s === 'yellow') return '#f59e0b'
  return '#ef4444'
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0
}

/**
 * Dashboard de Gestão de Históricos (visão de gestor de frota / operador B2B).
 * Calcula os 5 KPIs North Star a partir dos laudos locais (offline-first).
 * - Hist. completo: % veículos com ≥2 inspeções (entrada+saída comparáveis)
 * - Danos novos: Σ newDamagesOnLast / veículos comparados (leading risk)
 * - Cobertura evidências: % inspeções com alguma foto (dano ou vista)
 * - Dossiês emitidos: count status='issued'
 * - Integridade: % inspeções com issued_hash (selo de integridade)
 */
export default function FleetHistoryDashboard({ saved }: Props) {
  const kpis = useMemo(() => {
    const groups = groupReportsByVehicle(saved)
    const totalVehicles = groups.length

    const completeHistory = groups.filter((g) => g.reports.length >= 2).length
    const compared = groups.filter((g) => g.reports.length >= 2)
    const newDamages = compared.reduce((a, g) => a + g.newDamagesOnLast, 0)

    let withPhoto = 0
    let withHash = 0
    let issued = 0
    for (const r of saved) {
      const damagePhotos = r.damages.reduce(
        (a, d) => a + (d.photos?.length ?? 0),
        0,
      )
      const views = r.vehicleInfo?.viewPhotos
        ? Object.values(r.vehicleInfo.viewPhotos).filter((v) => Array.isArray(v) && v.length > 0).length
        : 0
      if (damagePhotos + views > 0) withPhoto++
      if (r.issuedHash && r.issuedHash.length > 0) withHash++
      if (r.status === 'issued') issued++
    }

    const histCompletePct = pct(completeHistory, totalVehicles)
    const evidencePct = pct(withPhoto, saved.length)
    const integrityPct = pct(withHash, saved.length)
    const damageRate = compared.length > 0 ? newDamages / compared.length : 0

    return {
      totalVehicles,
      completeHistory,
      histCompletePct,
      newDamages,
      compared: compared.length,
      damageRate,
      evidencePct,
      issued,
      integrityPct,
    }
  }, [saved])

  if (saved.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 16px',
          background: 'rgba(15,23,42,0.45)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <IconChart size={48} className="text-sky-400" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 6, color: '#f8fafc' }}>
          Sem históricos para gerenciar
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 360, margin: '0 auto' }}>
          Registre inspeções de entrada e saída para acompanhar a saúde do histórico da frota.
        </p>
      </div>
    )
  }

  const cards: {
    label: string
    value: string
    sub: string
    icon: React.ReactNode
    status: Status
  }[] = [
    {
      label: 'Hist. Completo (entrada+saída)',
      value: `${kpis.histCompletePct}%`,
      sub: `${kpis.completeHistory}/${kpis.totalVehicles} veículos com ≥2 inspeções`,
      icon: <IconCar size={12} className="text-sky-400" />,
      status: kpis.histCompletePct >= 90 ? 'green' : kpis.histCompletePct >= 70 ? 'yellow' : 'red',
    },
    {
      label: 'Taxa de Danos Novos',
      value: kpis.compared > 0 ? kpis.damageRate.toFixed(2) : '0',
      sub: `${kpis.newDamages} novos em ${kpis.compared} comparados`,
      icon: <IconWarning size={12} className="text-red-400" />,
      status: kpis.damageRate <= 0.5 ? 'green' : kpis.damageRate <= 1 ? 'yellow' : 'red',
    },
    {
      label: 'Cobertura de Evidências',
      value: `${kpis.evidencePct}%`,
      sub: 'inspeções com foto (dano ou vista)',
      icon: <IconFolder size={12} className="text-emerald-400" />,
      status: kpis.evidencePct >= 95 ? 'green' : kpis.evidencePct >= 80 ? 'yellow' : 'red',
    },
    {
      label: 'Dossiês Emitidos',
      value: `${kpis.issued}`,
      sub: 'laudos com validade jurídica',
      icon: <IconSparkles size={12} className="text-emerald-400" />,
      status: 'green',
    },
    {
      label: 'Integridade do Histórico',
      value: `${kpis.integrityPct}%`,
      sub: 'inspeções com selo (hash) íntegro',
      icon: <IconBolt size={12} className="text-amber-400" />,
      status: kpis.integrityPct >= 100 ? 'green' : 'yellow',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Gestão de Históricos — Indicadores da Frota
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: 'rgba(15,23,42,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#f8fafc',
                fontFamily: 'Outfit,sans-serif',
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: statusColor(c.status),
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {c.icon}
              {c.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
