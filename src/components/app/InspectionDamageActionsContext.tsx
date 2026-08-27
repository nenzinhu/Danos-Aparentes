'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Damage, DamageType, Severity } from '@/src/types'

/** Actions de avaria — evita prop-drilling no InspectTab / filhos. */
export type InspectionDamageActionsValue = {
  onAddDamage: (
    partId: string,
    partName: string,
    type: DamageType,
    typeName: string,
    photoFile?: File,
  ) => void
  onAddDamageDetailed?: (
    partId: string,
    partName: string,
    type: DamageType,
    typeName: string,
    severity: Severity,
    notes: string,
    photoFile?: File,
    evidence?: Pick<Damage, 'evidenceStatus' | 'evidenceDecidedBy' | 'evidenceDecidedAt' | 'aiDecisionId'>,
  ) => void
  onAddDamageRecord?: (damage: Damage) => void
  onRemoveDamageFromPart: (partId: string) => void
  onRemoveDamage: (id: string) => void
  onUpdateDamage: (id: string, patch: Partial<Damage>) => void
}

const InspectionDamageActionsContext = createContext<InspectionDamageActionsValue | null>(null)

export function InspectionDamageActionsProvider({
  value,
  children,
}: {
  value: InspectionDamageActionsValue
  children: ReactNode
}) {
  return (
    <InspectionDamageActionsContext.Provider value={value}>
      {children}
    </InspectionDamageActionsContext.Provider>
  )
}

export function useInspectionDamageActions(): InspectionDamageActionsValue {
  const ctx = useContext(InspectionDamageActionsContext)
  if (!ctx) {
    throw new Error('useInspectionDamageActions deve ser usado dentro de InspectionDamageActionsProvider')
  }
  return ctx
}
