import dynamic from 'next/dynamic'
import { VehicleType, ViewType, VehicleProps } from '../../types'
import { ComponentType } from 'react'

// Usando dynamic imports para reduzir o bundle inicial.
// Isso carrega os componentes apenas quando necessário.

export type VehicleRegistry = Record<VehicleType, Record<ViewType, ComponentType<VehicleProps>>>

export const vehicleRegistry: VehicleRegistry = {
  car: {
    'lateral-left': dynamic(() => import('./CarLateralLeft')),
    'lateral-right': dynamic(() => import('./CarLateralRight')),
    'frontal': dynamic(() => import('./CarFrontal')),
    'traseira': dynamic(() => import('./CarTraseira')),
  },
  car2d: {
    'lateral-left': dynamic(() => import('./Car2dLateralLeft')),
    'lateral-right': dynamic(() => import('./Car2dLateralRight')),
    'frontal': dynamic(() => import('./CarFrontal')),
    'traseira': dynamic(() => import('./CarTraseira')),
  },
  moto: {
    'lateral-left': dynamic(() => import('./MotoLateralLeft')),
    'lateral-right': dynamic(() => import('./MotoLateralRight')),
    'frontal': dynamic(() => import('./MotoFrontal')),
    'traseira': dynamic(() => import('./MotoTraseira')),
  },
  motoneta: {
    'lateral-left': dynamic(() => import('./MotoLateralLeft')),
    'lateral-right': dynamic(() => import('./MotoLateralRight')),
    'frontal': dynamic(() => import('./MotoFrontal')),
    'traseira': dynamic(() => import('./MotoTraseira')),
  },
  truck: {
    'lateral-left': dynamic(() => import('./TruckLateralLeft')),
    'lateral-right': dynamic(() => import('./TruckLateralRight')),
    'frontal': dynamic(() => import('./TruckFrontal')),
    'traseira': dynamic(() => import('./TruckTraseira')),
  },
  bus: {
    'lateral-left': dynamic(() => import('./BusLateralLeft')),
    'lateral-right': dynamic(() => import('./BusLateralRight')),
    'frontal': dynamic(() => import('./BusFrontal')),
    'traseira': dynamic(() => import('./BusTraseira')),
  },
  van: {
    'lateral-left': dynamic(() => import('./VanLateralLeft')),
    'lateral-right': dynamic(() => import('./VanLateralRight')),
    'frontal': dynamic(() => import('./VanFrontal')),
    'traseira': dynamic(() => import('./VanTraseira')),
  },
  microbus: {
    'lateral-left': dynamic(() => import('./MicroBusLateralLeft')),
    'lateral-right': dynamic(() => import('./MicroBusLateralRight')),
    'frontal': dynamic(() => import('./MicroBusFrontal')),
    'traseira': dynamic(() => import('./MicroBusTraseira')),
  },
  custom: {
    'lateral-left': dynamic(() => import('./CustomLateralLeft')),
    'lateral-right': dynamic(() => import('./CustomLateralRight')),
    'frontal': dynamic(() => import('./CustomFrontal')),
    'traseira': dynamic(() => import('./CustomTraseira')),
  },
}

