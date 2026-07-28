import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { compareInspections, type ComparisonItem, type Inspection } from '../domain'
import { LAB_TENANT } from './demoData'
import { resetLabStore, useLabStore } from './labStore'
import './styles.css'

function LabBanner() {
  return (
    <div className="lab-banner">
      <strong>LAB ISOLADO</strong>
      <span>Não altera o app de produção. Validar aqui; promover depois se der certo.</span>
    </div>
  )
}

function VehiclesPage() {
  const store = useLabStore()
  const [, bump] = useState(0)
  const vehicles = store.listVehicles(LAB_TENANT)

  return (
    <div className="app-shell">
      <LabBanner />
      <p className="meta" style={{ marginBottom: '0.5rem' }}>Danos Aparentes · Lab</p>
      <h1 className="brand">Evidência veicular</h1>
      <p className="lede">
        Histórico de estados, comparação entre vistorias e prova do que mudou — sem tocar laudos emitidos.
      </p>
      <div className="nav-row">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            resetLabStore()
            bump((n) => n + 1)
          }}
        >
          Resetar demo
        </button>
      </div>
      <div className="vehicle-list">
        {vehicles.map((v, i) => {
          const inspections = store.listInspectionsForVehicle(v.id, LAB_TENANT)
          const last = inspections[inspections.length - 1]
          const activeDamages = last?.damages.length ?? 0
          return (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="vehicle-row"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div>
                <div className="plate">{v.plate}</div>
                <div className="meta">
                  {[v.brand, v.model, v.color].filter(Boolean).join(' · ') || 'Veículo'}
                </div>
              </div>
              <div className="meta" style={{ textAlign: 'right' }}>
                {inspections.length} vistoria(s)
                <br />
                {activeDamages} dano(s) na última
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function VehicleDetailPage() {
  const { id } = useParams()
  const store = useLabStore()
  const vehicle = id ? store.vehicles.get(id) : undefined
  const inspections = id ? store.listInspectionsForVehicle(id, LAB_TENANT) : []

  if (!vehicle) {
    return (
      <div className="app-shell">
        <LabBanner />
        <p>Veículo não encontrado.</p>
        <Link className="btn" to="/">← Voltar</Link>
      </div>
    )
  }

  const last = inspections[inspections.length - 1]
  const first = inspections[0]
  const prev = inspections.length >= 2 ? inspections[inspections.length - 2] : null
  const newOnLast =
    last && prev ? compareInspections(prev, last).summary.newDamages : 0

  return (
    <div className="app-shell">
      <LabBanner />
      <Link className="btn btn-ghost" to="/">← Veículos</Link>
      <p className="meta" style={{ marginTop: '1.25rem' }}>Veículo</p>
      <h1 className="brand">{vehicle.plate}</h1>
      <p className="lede">
        {[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' · ')}
        {last?.geo?.address ? ` · ${last.geo.address}` : ''}
      </p>

      <div className="stat-grid">
        <div className="stat">
          <strong>{inspections.length}</strong>
          <span>Vistorias</span>
        </div>
        <div className="stat">
          <strong>{last?.damages.length ?? 0}</strong>
          <span>Danos ativos (última)</span>
        </div>
        <div className="stat">
          <strong>{newOnLast}</strong>
          <span>Novos na última</span>
        </div>
        <div className="stat">
          <strong>{first ? new Date(first.inspectedAt).toLocaleDateString('pt-BR') : '—'}</strong>
          <span>Primeira vistoria</span>
        </div>
      </div>

      <div className="nav-row">
        <Link className="btn btn-primary" to={`/vehicles/${vehicle.id}/compare`}>
          Comparar vistorias
        </Link>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.75rem' }}>
        Histórico
      </h2>
      <div className="timeline">
        {inspections.map((insp) => (
          <div key={insp.id} className="tl-item">
            <time>{new Date(insp.inspectedAt).toLocaleString('pt-BR')}</time>
            <strong>Vistoria {insp.publicCode || insp.id}</strong>
            <div className="meta">
              {insp.damages.length === 0
                ? 'Sem danos'
                : `${insp.damages.length} dano(s) · status ${insp.status}`}
            </div>
          </div>
        ))}
        {store.audit
          .filter((e) => e.vehicleId === vehicle.id && e.eventType === 'comparison_reviewed')
          .slice(-3)
          .map((e) => (
            <div key={e.eventId} className="tl-item">
              <time>{new Date(e.timestamp).toLocaleString('pt-BR')}</time>
              <strong>Comparação revisada</strong>
              <div className="meta">{String(e.metadata?.decision ?? '')}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

function categoryPill(cat: ComparisonItem['category']) {
  switch (cat) {
    case 'new':
      return <span className="pill pill-new">Novo dano</span>
    case 'unchanged':
      return <span className="pill pill-unchanged">Existente</span>
    case 'severityChanged':
      return <span className="pill pill-changed">Alterado</span>
    case 'removedOrRepaired':
      return <span className="pill pill-removed">Não identificado</span>
    case 'uncertain':
      return <span className="pill pill-uncertain">Incerto</span>
  }
}

function ComparePage() {
  const { id } = useParams()
  const store = useLabStore()
  const navigate = useNavigate()
  const vehicle = id ? store.vehicles.get(id) : undefined
  const inspections = useMemo(
    () => (id ? store.listInspectionsForVehicle(id, LAB_TENANT) : []),
    [id, store],
  )

  const [prevId, setPrevId] = useState(inspections[inspections.length - 2]?.id ?? '')
  const [currId, setCurrId] = useState(inspections[inspections.length - 1]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [comparisonId, setComparisonId] = useState<string | null>(null)
  const [, bump] = useState(0)

  if (!vehicle) {
    return (
      <div className="app-shell">
        <p>Veículo não encontrado.</p>
        <Link className="btn" to="/">← Voltar</Link>
      </div>
    )
  }

  const comparison = comparisonId ? store.comparisons.get(comparisonId) : undefined

  function runCompare() {
    setError(null)
    if (!prevId || !currId) {
      setError('Selecione duas vistorias.')
      return
    }
    const result = store.compare(prevId, currId, 'demo-user')
    if (!result.ok) {
      setError(result.reason)
      setComparisonId(null)
      return
    }
    setComparisonId(result.comparison.id)
    bump((n) => n + 1)
  }

  function decide(item: ComparisonItem, decision: 'accept' | 'edit' | 'ignore') {
    if (!comparison) return
    store.review(comparison.id, {
      itemIdentityKey: item.identityKey,
      decision,
      userId: 'demo-user',
      justification: decision === 'accept' ? 'Confirmado' : decision === 'ignore' ? 'Ignorado' : 'Editado',
    })
    bump((n) => n + 1)
  }

  function label(insp?: Inspection) {
    if (!insp) return '—'
    return `${new Date(insp.inspectedAt).toLocaleDateString('pt-BR')} · ${insp.publicCode || insp.id}`
  }

  return (
    <div className="app-shell">
      <LabBanner />
      <button type="button" className="btn btn-ghost" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
        ← {vehicle.plate}
      </button>
      <h1 className="brand" style={{ marginTop: '1rem', fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}>
        Comparação
      </h1>
      <p className="lede">Veículo {vehicle.plate}. Resultado derivado — laudos emitidos permanecem imutáveis.</p>

      <div className="select-row">
        <label className="field">
          Anterior
          <select value={prevId} onChange={(e) => setPrevId(e.target.value)}>
            <option value="">Selecione</option>
            {inspections.map((i) => (
              <option key={i.id} value={i.id}>{label(i)}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Atual
          <select value={currId} onChange={(e) => setCurrId(e.target.value)}>
            <option value="">Selecione</option>
            {inspections.map((i) => (
              <option key={i.id} value={i.id}>{label(i)}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={runCompare}>
          Comparar
        </button>
      </div>

      {error && <p style={{ color: 'var(--warn)' }}>{error}</p>}

      {comparison && (
        <>
          <div className="compare-layout">
            <div className="panel">
              <h3>Anterior</h3>
              <div>{label(store.inspections.get(comparison.previousInspectionId))}</div>
            </div>
            <div className="panel">
              <h3>Atual</h3>
              <div>{label(store.inspections.get(comparison.currentInspectionId))}</div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Resumo</h2>
          <div className="summary-row">
            <span>{comparison.summary.unchanged} existentes</span>
            <span>{comparison.summary.newDamages} novos</span>
            <span>{comparison.summary.severityChanged} alterados</span>
            <span>{comparison.summary.removedOrRepaired} não identificados</span>
            <span>{comparison.summary.uncertain} incertos</span>
          </div>

          {comparison.items.map((item) => {
            const decided = comparison.decisions.find((d) => d.itemIdentityKey === item.identityKey)
            return (
              <div key={item.identityKey + item.category} className="damage-block">
                {categoryPill(item.category)}
                <h4>{item.current?.partName || item.previous?.partName || 'Peça'}</h4>
                <p className="meta">{item.message}</p>
                {(item.current || item.previous) && (
                  <p className="meta">
                    Tipo: {item.current?.typeName || item.previous?.typeName}
                    {item.previousSeverity && item.currentSeverity && item.previousSeverity !== item.currentSeverity
                      ? ` · Severidade: ${item.previousSeverity} → ${item.currentSeverity}`
                      : item.currentSeverity
                        ? ` · Severidade: ${item.currentSeverity}`
                        : ''}
                  </p>
                )}
                <div className="evidence-pair">
                  <div className="evidence-box">
                    <strong style={{ color: 'var(--ink)' }}>Antes</strong>
                    <div>{item.previous ? `${item.previous.photoRefs?.[0] ?? 'sem foto'} · ${item.previous.typeName}` : '—'}</div>
                  </div>
                  <div className="evidence-box">
                    <strong style={{ color: 'var(--ink)' }}>Depois</strong>
                    <div>{item.current ? `${item.current.photoRefs?.[0] ?? 'sem foto'} · ${item.current.typeName}` : '—'}</div>
                  </div>
                </div>
                {decided ? (
                  <p className="meta">Decisão: {decided.decision} · {new Date(decided.timestamp).toLocaleString('pt-BR')}</p>
                ) : (
                  <div className="actions">
                    <button type="button" className="btn btn-primary" onClick={() => decide(item, 'accept')}>Confirmar</button>
                    <button type="button" className="btn" onClick={() => decide(item, 'edit')}>Editar</button>
                    <button type="button" className="btn btn-ghost" onClick={() => decide(item, 'ignore')}>Ignorar</button>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VehiclesPage />} />
        <Route path="/vehicles" element={<Navigate to="/" replace />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/vehicles/:id/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
