'use client'
import React, { memo } from 'react'
import { createPortal } from 'react-dom'
import DamageFloat from '../DamageFloat'
import { useVehicleViewer } from './context'
import { isNewDamage } from '../../lib/reportComparison'

export const FloatingDamage = memo(function FloatingDamage() {
  const {
    selectedPart,
    setSelectedPart,
    onAddDamage,
    onAddDamageDetailed,
    onRemoveDamageFromPart,
    damages,
    vehicleType,
    accessToken,
    previousReport,
    onToast,
  } = useVehicleViewer()

  if (!selectedPart) return null

  const existingDmg = damages.find(d => d.partId === selectedPart.id && d.vehicle === vehicleType)

  return createPortal(
    <DamageFloat
      partId={selectedPart.id}
      partName={selectedPart.name}
      position={selectedPart.pos}
      currentType={existingDmg?.type}
      accessToken={accessToken}
      previousReport={previousReport}
      onChoose={(type, typeName, severity, notes, photoFile) => {
        const isNew = previousReport
          ? isNewDamage({ partId: selectedPart.id, type }, previousReport)
          : false
        if (onAddDamageDetailed) {
          onAddDamageDetailed(selectedPart.id, selectedPart.name, type, typeName, severity, notes, photoFile)
        } else {
          onAddDamage(selectedPart.id, selectedPart.name, type, typeName, photoFile)
        }
        if (isNew) {
          onToast?.(
            '⚠️ Avaria a mais vs anterior — IA analisou a foto; você confirmou como vistoriador',
          )
        }
        setSelectedPart(null)
      }}
      onClear={() => {
        onRemoveDamageFromPart(selectedPart.id)
        setSelectedPart(null)
      }}
      onClose={() => setSelectedPart(null)}
    />,
    document.body
  )
})
