// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'

vi.mock('@/src/lib/db', () => ({
  db: { getAllSaved: async () => [] },
}))
vi.mock('@/src/lib/feedback', () => ({
  playDamageAddedFeedback: () => {},
}))
vi.mock('@/src/lib/photoUploadProgress', () => ({
  startPhotoUploadProgress: () => {},
  updatePhotoUploadProgress: () => {},
  finishPhotoUploadProgress: () => {},
}))
vi.mock('@/src/lib/photoEvidence', () => ({
  storePhotoEvidence: async () => ({ optimizedRef: 'data:x' }),
}))

import { useInspectionWorkflow } from './useInspectionWorkflow'
import { EMPTY_INFO } from '@/src/components/app/constants'
import type { Damage, DamageId, SavedReport } from '@/src/types'

function makeReport(overrides: Partial<SavedReport> = {}): SavedReport {
  return {
    id: 'r1',
    savedAt: Date.now(),
    syncedAt: null,
    vehicleType: 'car',
    vehicleInfo: { ...EMPTY_INFO, plate: 'ABC1D23', owner: 'João' },
    damages: [],
    status: 'complete',
    ...overrides,
  } as SavedReport
}

function setup(overrides: Partial<Parameters<typeof useInspectionWorkflow>[0]> = {}) {
  const spies = {
    addDamage: vi.fn(async (_d: Damage) => {}),
    removeDamage: vi.fn(async () => {}),
    updateDamage: vi.fn(async () => {}),
    clearDamages: vi.fn(async () => {}),
    saveReport: vi.fn(async (_v, _d, _t) => makeReport()),
    showToast: vi.fn(),
  }
  const hook = renderHook(() =>
    useInspectionWorkflow({
      damages: [],
      ...spies,
      ...overrides,
    } as Parameters<typeof useInspectionWorkflow>[0]),
  )
  return { hook, spies }
}

describe('useInspectionWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muda a vista atual e acumula vistas visitadas', () => {
    const { hook } = setup()
    act(() => hook.result.current.handleViewTypeChange('frontal'))
    expect(hook.result.current.viewType).toBe('frontal')
    expect(hook.result.current.visitedViews).toEqual(['lateral-left', 'frontal'])
    // repetir a mesma vista não duplica
    act(() => hook.result.current.handleViewTypeChange('frontal'))
    expect(hook.result.current.visitedViews).toHaveLength(2)
  })

  it('trocar o tipo de veículo reseta a vista para lateral-left', () => {
    const { hook } = setup()
    act(() => hook.result.current.handleViewTypeChange('frontal'))
    act(() => hook.result.current.handleVehicleTypeChange('moto'))
    expect(hook.result.current.vehicleType).toBe('moto')
    expect(hook.result.current.viewType).toBe('lateral-left')
    expect(hook.result.current.visitedViews).toEqual(['lateral-left'])
  })

  it('handleAddDamage cria avaria com veículo/vista atuais e severidade baixa', () => {
    const { hook, spies } = setup()
    act(() => {
      hook.result.current.handleAddDamage('car-ll-door', 'Porta', 'scratch', 'Risco')
    })
    expect(spies.addDamage).toHaveBeenCalledTimes(1)
    const d = spies.addDamage.mock.calls[0]?.[0] as unknown as Damage
    expect(d.vehicle).toBe('car')
    expect(d.view).toBe('lateral-left')
    expect(d.partId).toBe('car-ll-door')
    expect(d.severity).toBe('low')
    expect(d.id).toBeTruthy()
  })

  it('handleSaveDraft sem cliente nem placa mostra erro e não salva', async () => {
    const { hook, spies } = setup()
    await act(async () => {
      await hook.result.current.handleSaveDraft()
    })
    expect(spies.saveReport).not.toHaveBeenCalled()
    expect(spies.showToast).toHaveBeenCalledWith(expect.stringContaining('cliente ou a placa'))
  })

  it('startEntrada limpa o estado e notifica', () => {
    const { hook, spies } = setup()
    act(() => hook.result.current.startEntrada())
    expect(spies.clearDamages).toHaveBeenCalled()
    expect(hook.result.current.activeReportId).toBeNull()
    expect(hook.result.current.inspectionPurpose).toBe('entrada')
    expect(spies.showToast).toHaveBeenCalledWith(expect.stringContaining('Nova Inspeção'))
  })

  it('handleLoad bloqueia laudo emitido (imutável) e não carrega', () => {
    const { hook, spies } = setup()
    const issued = makeReport({ status: 'issued' })
    act(() => hook.result.current.handleLoad(issued))
    expect(spies.clearDamages).not.toHaveBeenCalled()
    expect(spies.showToast).toHaveBeenCalledWith(expect.stringContaining('🔒'))
  })

  it('handleLoad carrega rascunho e define a inspeção ativa', () => {
    const { hook, spies } = setup()
    const draft = makeReport({
      status: 'draft',
      damages: [{
        id: 'd1' as DamageId, vehicle: 'car', view: 'frontal',
        partId: 'car-fr-bumper', partName: 'Para-choque',
        type: 'dent', typeName: 'Amassado', severity: 'medium',
        notes: '', photos: [], photoNotes: [],
      }],
    })
    act(() => hook.result.current.handleLoad(draft))
    expect(spies.clearDamages).toHaveBeenCalled()
    expect(spies.addDamage).toHaveBeenCalled()
    expect(hook.result.current.activeReportId).toBe('r1')
    expect(hook.result.current.vehicleInfo.plate).toBe('ABC1D23')
  })

  it('handleSave salva com status complete e assume o id ativo', async () => {
    const { hook, spies } = setup()
    await act(async () => {
      await hook.result.current.handleSave()
    })
    expect(spies.saveReport).toHaveBeenCalledWith(
      expect.anything(), expect.anything(), 'car',
      expect.objectContaining({ status: 'complete' }),
    )
    expect(hook.result.current.activeReportId).toBe('r1')
    expect(spies.showToast).toHaveBeenCalled()
  })
})
