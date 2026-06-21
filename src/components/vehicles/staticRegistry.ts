import { VehicleType, ViewType, VehicleProps } from '../../types'
import { ComponentType } from 'react'

import CarLateralLeft from './CarLateralLeft'
import CarLateralRight from './CarLateralRight'
import CarFrontal from './CarFrontal'
import CarTraseira from './CarTraseira'

import Car2dLateralLeft from './Car2dLateralLeft'
import Car2dLateralRight from './Car2dLateralRight'

import MotoLateralLeft from './MotoLateralLeft'
import MotoLateralRight from './MotoLateralRight'
import MotoFrontal from './MotoFrontal'
import MotoTraseira from './MotoTraseira'

import TruckLateralLeft from './TruckLateralLeft'
import TruckLateralRight from './TruckLateralRight'
import TruckFrontal from './TruckFrontal'
import TruckTraseira from './TruckTraseira'

import BusLateralLeft from './BusLateralLeft'
import BusLateralRight from './BusLateralRight'
import BusFrontal from './BusFrontal'
import BusTraseira from './BusTraseira'

import VanLateralLeft from './VanLateralLeft'
import VanLateralRight from './VanLateralRight'
import VanFrontal from './VanFrontal'
import VanTraseira from './VanTraseira'

import MicroBusLateralLeft from './MicroBusLateralLeft'
import MicroBusLateralRight from './MicroBusLateralRight'
import MicroBusFrontal from './MicroBusFrontal'
import MicroBusTraseira from './MicroBusTraseira'

import CustomLateralLeft from './CustomLateralLeft'
import CustomLateralRight from './CustomLateralRight'
import CustomFrontal from './CustomFrontal'
import CustomTraseira from './CustomTraseira'

export const staticVehicleRegistry: Record<VehicleType, Record<ViewType, ComponentType<VehicleProps>>> = {
  car: {
    'lateral-left': CarLateralLeft,
    'lateral-right': CarLateralRight,
    'frontal': CarFrontal,
    'traseira': CarTraseira,
  },
  car2d: {
    'lateral-left': Car2dLateralLeft,
    'lateral-right': Car2dLateralRight,
    'frontal': CarFrontal,
    'traseira': CarTraseira,
  },
  moto: {
    'lateral-left': MotoLateralLeft,
    'lateral-right': MotoLateralRight,
    'frontal': MotoFrontal,
    'traseira': MotoTraseira,
  },
  truck: {
    'lateral-left': TruckLateralLeft,
    'lateral-right': TruckLateralRight,
    'frontal': TruckFrontal,
    'traseira': TruckTraseira,
  },
  bus: {
    'lateral-left': BusLateralLeft,
    'lateral-right': BusLateralRight,
    'frontal': BusFrontal,
    'traseira': BusTraseira,
  },
  van: {
    'lateral-left': VanLateralLeft,
    'lateral-right': VanLateralRight,
    'frontal': VanFrontal,
    'traseira': VanTraseira,
  },
  microbus: {
    'lateral-left': MicroBusLateralLeft,
    'lateral-right': MicroBusLateralRight,
    'frontal': MicroBusFrontal,
    'traseira': MicroBusTraseira,
  },
  custom: {
    'lateral-left': CustomLateralLeft,
    'lateral-right': CustomLateralRight,
    'frontal': CustomFrontal,
    'traseira': CustomTraseira,
  },
}
