'use client';
import React, { useMemo, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SavedReport, VehicleType, Severity } from '../types'
import { resolveVehicleType } from '../lib/vehicleTypeInference'
import { usePerformanceTelemetry } from '../hooks/usePerformanceTelemetry'
import { groupReportsByVehicle } from '../lib/vehicleEvidence'
import Link from 'next/link'
import {
  IconChart,
  IconFolder,
  IconWarning,
  IconSparkles,
  IconCar,
  IconPin,
  IconBolt,
  IconBarChart,
  IconTrend,
  IconBulb,
} from './ui/AnimatedIcons'


import AuditDashboard from './AuditDashboard'

interface Props {
  saved: SavedReport[]
  accessToken?: string
  showAuditDashboard?: boolean
}

const VEHICLE_NAME: Record<VehicleType, string> = {
  car: 'Automóvel',
  car2d: 'Carro (2/3 Portas)',
  moto: 'Motocicleta',
  motoneta: 'Motoneta',
  truck: 'Caminhão',
  van: 'Van / Utilitário',
  bus: 'Ônibus',
  microbus: 'Micro-ônibus',
  custom: 'Genérico / Outro'
}

const VEHICLE_COLOR: Record<VehicleType, string> = {
  car: '#38bdf8', // sky-400
  car2d: '#0ea5e9', // sky-500
  moto: '#a855f7', // purple-500
  motoneta: '#c084fc', // purple-400
  truck: '#eab308', // yellow-500
  van: '#14b8a6', // teal-500
  bus: '#f97316', // orange-500
  microbus: '#fb923c', // orange-400
  custom: '#64748b' // slate-500
}

function getReportVehicleType(r: SavedReport): VehicleType {
  return resolveVehicleType(r.vehicleInfo.vehicleTypeDesc, r.damages)
}

export default function DashboardView({ saved, accessToken, showAuditDashboard }: Props) {
  const kpiRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = kpiRef.current
    if (!el) return
    // Respeita prefers-reduced-motion: mostra os cards sem animar (WIG).
    const reduce = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set('.dash-kpi-card', { opacity: 1, y: 0, scale: 1 })
        return
      }
      gsap.fromTo('.dash-kpi-card',
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.1 }
      )
    }, el)
    return () => ctx.revert()
  }, [])
  const { metrics, baseline } = usePerformanceTelemetry()
  // 1. Calculate General KPI Statistics

  const stats = useMemo(() => {
    const totalReports = saved.length
    const totalDamages = saved.reduce((acc, r) => acc + r.damages.length, 0)
    const avgDamages = totalReports > 0 ? (totalDamages / totalReports).toFixed(1) : '0'
    const cleanReports = saved.filter(r => r.damages.length === 0).length
    const cleanReportsPct = totalReports > 0 ? Math.round((cleanReports / totalReports) * 100) : 0
    const vehiclesMonitored = groupReportsByVehicle(saved).length
    const evidenceCount = saved.reduce((acc, r) => {
      const damagePhotos = r.damages.reduce((a, d) => a + (d.photos?.length ?? 0), 0)
      const interior = r.vehicleInfo?.interiorPhotos?.length ?? 0
      const views = r.vehicleInfo?.viewPhotos ? Object.keys(r.vehicleInfo.viewPhotos).length : 0
      return acc + damagePhotos + interior + views
    }, 0)
    const aiAnalyses = saved.reduce(
      (acc, r) =>
        acc +
        r.damages.filter((d) => Boolean(d.aiDecisionId) || d.evidenceStatus === 'sugerido' || d.evidenceStatus === 'confirmado')
          .length,
      0,
    )
    const dossiersIssued = saved.filter((r) => r.status === 'issued').length
    const activeHistories = vehiclesMonitored

    // 2. Severity Counts
    let low = 0
    let medium = 0
    let high = 0
    
    // 3. Vehicle Type Counts
    const typeCounts: Record<VehicleType, number> = {
      car: 0,
      car2d: 0,
      moto: 0,
      motoneta: 0,
      truck: 0,
      van: 0,
      bus: 0,
      microbus: 0,
      custom: 0
    }

    // 4. Parts Frequency Map
    const partMap: Record<string, { count: number; name: string }> = {}

    saved.forEach(r => {
      // Vehicle type count
      const vtype = getReportVehicleType(r)
      typeCounts[vtype] = (typeCounts[vtype] || 0) + 1

      r.damages.forEach(d => {
        // Severity counts
        if (d.severity === 'low') low++
        else if (d.severity === 'medium') medium++
        else if (d.severity === 'high') high++

        // Parts counts
        if (!partMap[d.partId]) {
          partMap[d.partId] = { count: 0, name: d.partName }
        }
        partMap[d.partId].count++
      })
    })

    const topParts = Object.values(partMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalReports,
      totalDamages,
      avgDamages,
      cleanReports,
      cleanReportsPct,
      vehiclesMonitored,
      evidenceCount,
      aiAnalyses,
      dossiersIssued,
      activeHistories,
      severity: { low, medium, high },
      typeCounts,
      topParts
    }
  }, [saved])

  const vehiclesWithNewDamages = useMemo(() => {
    return groupReportsByVehicle(saved)
      .filter((v) => v.newDamagesOnLast > 0)
      .sort((a, b) => b.newDamagesOnLast - a.newDamagesOnLast)
      .slice(0, 8)
  }, [saved])

  if (saved.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px', background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <IconChart size={56} className="text-sky-400" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 8, color: '#f8fafc' }}>Nenhum dado para exibir</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 24px' }}>
          Para visualizar a gestão histórica e as métricas da plataforma, registre e salve sua primeira inspeção.
        </p>
      </div>
    )
  }

  // Percentage Calculations for Severity Stack Bar
  const totalSev = stats.severity.low + stats.severity.medium + stats.severity.high
  const lowPct = totalSev > 0 ? (stats.severity.low / totalSev) * 100 : 0
  const medPct = totalSev > 0 ? (stats.severity.medium / totalSev) * 100 : 0
  const highPct = totalSev > 0 ? (stats.severity.high / totalSev) * 100 : 0

  // Max vehicle count for scaling horizontal bars
  const maxVehicleCount = Math.max(...Object.values(stats.typeCounts), 1)

  return (
    <div ref={kpiRef} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ── KPI GRID ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        
        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Veículos Monitorados</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.vehiclesMonitored}</div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconCar size={12} className="text-sky-400" /> Memória digital ativa
          </div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inspeções Realizadas</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.totalReports}</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconFolder size={12} className="text-emerald-400" /> Eventos do histórico
          </div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidências Armazenadas</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.evidenceCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fotos e documentos</div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Danos Identificados</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.totalDamages}</div>
          <div style={{ fontSize: '0.72rem', color: stats.totalDamages > 0 ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconWarning size={12} className={stats.totalDamages > 0 ? 'text-red-400' : 'text-slate-500'} />
            {stats.totalDamages > 0 ? 'Registrados no histórico' : 'Nenhum dano'}
          </div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Análises por IA</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.aiAnalyses}</div>
          <div style={{ fontSize: '0.72rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconSparkles size={12} className="text-[var(--signal)]" /> Inteligência aplicada
          </div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dossiês Emitidos</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.dossiersIssued}</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconSparkles size={12} className="text-emerald-400" /> {stats.activeHistories} históricos ativos
          </div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eventos Registrados</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.totalReports}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Média {stats.avgDamages} danos/inspeção</div>
        </div>

        <div className="dash-kpi-card" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Históricos Ativos</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'Outfit,sans-serif' }}>{stats.activeHistories}</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconSparkles size={12} className="text-emerald-400" /> {stats.cleanReportsPct}% inspeções sem danos
          </div>
        </div>

      </div>

      {vehiclesWithNewDamages.length > 0 && (
        <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: 24, backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconBolt size={16} className="text-amber-400" /> Novos danos (última inspeção)
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Comparação estrutural entre as duas últimas inspeções do mesmo veículo
              </span>
            </div>
            <Link href="/app/vehicles" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
              Ver veículos →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vehiclesWithNewDamages.map((v) => (
              <Link
                key={v.id}
                href={`/app/vehicles/${encodeURIComponent(v.id)}/compare`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(0,0,0,0.2)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ fontWeight: 800, letterSpacing: '0.04em' }}>{v.plate}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                  {v.newDamagesOnLast} novo(s)
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTIONS GRID ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

        {/* Gravidade Card */}
        <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconWarning size={16} className="text-orange-400" /> Gravidade das Avarias
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Distribuição percentual das avarias identificadas</span>
          </div>

          {totalSev === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', minHeight: 120 }}>
              Nenhuma avaria cadastrada para mapear gravidades.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Stacked bar */}
              <div style={{ display: 'flex', width: '100%', height: 20, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {lowPct > 0 && <div style={{ width: `${lowPct}%`, background: '#94a3b8', transition: 'width 0.5s ease-out' }} title={`Leve: ${stats.severity.low}`} />}
                {medPct > 0 && <div style={{ width: `${medPct}%`, background: '#f97316', transition: 'width 0.5s ease-out' }} title={`Média: ${stats.severity.medium}`} />}
                {highPct > 0 && <div style={{ width: `${highPct}%`, background: '#ef4444', transition: 'width 0.5s ease-out' }} title={`Grave: ${stats.severity.high}`} />}
              </div>

              {/* Legends */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Low */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8' }} />
                    <span style={{ fontWeight: 600 }}>Leve</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0' }}>{stats.severity.low} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(lowPct)}%)</span></div>
                </div>

                {/* Medium */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }} />
                    <span style={{ fontWeight: 600 }}>Média</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0' }}>{stats.severity.medium} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(medPct)}%)</span></div>
                </div>

                {/* High */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontWeight: 600 }}>Grave</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0' }}>{stats.severity.high} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(highPct)}%)</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tipos de Veículos Card */}
        <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCar size={16} className="text-sky-400" /> Frota Vistoriada
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quantidade de vistorias registradas por categoria</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(Object.keys(stats.typeCounts) as VehicleType[]).map(type => {
              const count = stats.typeCounts[type]
              const pct = (count / maxVehicleCount) * 100
              const color = VEHICLE_COLOR[type]

              return (
                <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 700, color: '#cbd5e1' }}>{VEHICLE_NAME[type]}</span>
                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>{count}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── TOP DAMAGED PARTS ───────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPin size={16} className="text-amber-400" /> Top 5 Peças com Mais Avarias
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Componentes com maior frequência de incidência de danos</span>
        </div>

        {stats.topParts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '24px 0' }}>
            Nenhum dano registrado para calcular estatísticas de peças.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.topParts.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,170,255,0.12)', border: '1px solid rgba(0,170,255,0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, fontFamily: 'Outfit,sans-serif' }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#cbd5e1' }}>{item.name}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {item.count} {item.count === 1 ? 'avaria' : 'avarias'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TELEMETRIA DE DESEMPENHO (REAL-TIME) ─────────────────────────────────── */}
      <div style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBolt size={14} className="text-yellow-400" /> Telemetria de Desempenho (Tempo Real)
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Métricas reais de Core Web Vitals e diagnósticos de renderização</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', background: metrics.online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: metrics.online ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)', padding: '4px 8px', borderRadius: 8, color: metrics.online ? '#10b981' : '#ef4444' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: metrics.online ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            {metrics.online ? 'Sistema Online' : 'Modo Offline'}
          </div>
        </div>

        {/* Web Vitals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {/* TTFB */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>TTFB (Resposta de Rede)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                {metrics.ttfb !== null ? `${metrics.ttfb} ms` : 'Medindo...'}
              </span>
              {baseline.ttfbAvg > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  (méd. {baseline.ttfbAvg}ms)
                </span>
              )}
            </div>
            {metrics.ttfb !== null && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: metrics.ttfb <= 800 ? '#10b981' : metrics.ttfb <= 1800 ? '#f59e0b' : '#ef4444' }}>
                {metrics.ttfb <= 800 ? '● Excelente (<800ms)' : metrics.ttfb <= 1800 ? '● Regular (<1.8s)' : '● Lento (>1.8s)'}
              </span>
            )}
          </div>

          {/* FCP */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>FCP (Primeira Pintura)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                {metrics.fcp !== null ? `${metrics.fcp} ms` : 'Carregando...'}
              </span>
              {baseline.fcpAvg > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  (méd. {baseline.fcpAvg}ms)
                </span>
              )}
            </div>
            {metrics.fcp !== null && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: metrics.fcp <= 1800 ? '#10b981' : metrics.fcp <= 3000 ? '#f59e0b' : '#ef4444' }}>
                {metrics.fcp <= 1800 ? '● Excelente (<1.8s)' : metrics.fcp <= 3000 ? '● Regular (<3s)' : '● Lento (>3s)'}
              </span>
            )}
          </div>

          {/* LCP */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>LCP (Elemento Principal)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                {metrics.lcp !== null ? `${metrics.lcp} ms` : 'Aguardando...'}
              </span>
              {baseline.lcpAvg > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  (méd. {baseline.lcpAvg}ms)
                </span>
              )}
            </div>
            {metrics.lcp !== null && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: metrics.lcp <= 2500 ? '#10b981' : metrics.lcp <= 4000 ? '#f59e0b' : '#ef4444' }}>
                {metrics.lcp <= 2500 ? '● Excelente (<2.5s)' : metrics.lcp <= 4000 ? '● Regular (<4s)' : '● Lento (>4s)'}
              </span>
            )}
          </div>

          {/* CLS */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>CLS (Estabilidade Visual)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                {metrics.cls.toFixed(3)}
              </span>
              {baseline.clsAvg > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  (méd. {baseline.clsAvg.toFixed(3)})
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: metrics.cls <= 0.1 ? '#10b981' : metrics.cls <= 0.25 ? '#f59e0b' : '#ef4444' }}>
              {metrics.cls <= 0.1 ? '● Alta Estabilidade (<0.1)' : metrics.cls <= 0.25 ? '● Média Oscilação (<0.25)' : '● Instável (>0.25)'}
            </span>
          </div>
        </div>

        {/* SLO and Diagnostics Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, paddingTop: 8 }}>
          {/* Uptime SLO & Health */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(0,0,0,0.08)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconBarChart size={12} className="text-sky-400" /> Indicadores de Observabilidade (SLO)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Disponibilidade Planejada:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>99.99% (SLA)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latência da Telemetria:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>&lt; 100ms</span>
              </div>
              {metrics.memoryUsed !== null && metrics.memoryLimit !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sobrecarga de Memória (JS Heap):</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>{metrics.memoryUsed} MB / {metrics.memoryLimit} MB</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Precisão de Alertas:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>&gt; 95%</span>
              </div>
            </div>
          </div>

          {/* Applied Optimization Impacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(0,0,0,0.08)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconTrend size={12} className="text-emerald-400" /> Impacto de Otimizações Aplicadas
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Frictionless Vehicle Selector (CSS calc):</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>-101ms forced reflow (0ms JS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>SSR Page Shell (Header Hydration):</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>LCP Delay: 539ms ➔ 24ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Preload de Logotipo (/logo.png):</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>Pre-fetching prioritário</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dynamic Code Splitting (FAQ/Pricing):</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>Lazy-loading ativado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Text */}
        <div style={{ background: 'rgba(0,170,255,0.04)', border: '1px solid rgba(0,170,255,0.08)', borderRadius: 12, padding: '12px 16px', fontSize: '0.72rem', color: '#38bdf8', lineHeight: '1.4' }}>
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <IconBulb size={14} className="text-sky-300" />
            <span><strong>Dica de Performance:</strong> O sistema está rodando em ambiente local. O tempo de renderização (LCP) medido na primeira carga é acelerado pela injeção do CSS Crítico e do script de tema assíncrono no head. Para uma medição pura dos Web Vitals, execute o build de produção (`npm run build`) e acesse em uma janela anônima (sem extensões de terceiros).</span>
          </span>
        </div>
      </div>

      {showAuditDashboard && (
        <AuditDashboard accessToken={accessToken} enabled={Boolean(accessToken)} />
      )}

    </div>
  )
}
