/** Mapeia chaves semânticas do tutorial para ícones SVG do app. */

import type { ReactNode } from 'react'
import {
  BuildingIcon,
  ClipboardIcon,
  CarIcon,
  NotesIcon,
  SearchIcon,
  BoltIcon,
  PenIcon,
  RefreshIcon,
  HandIcon,
  TagIcon,
  AlertIcon,
  CameraIcon,
  PaletteIcon,
  FileIcon,
  LockIcon,
  ChatIcon,
  SaveIcon,
  SignalIcon,
  CloudIcon,
  type IconProps,
} from './AppIcons'

const MAP: Record<string, (p: IconProps) => ReactNode> = {
  building: BuildingIcon,
  clipboard: ClipboardIcon,
  car: CarIcon,
  notes: NotesIcon,
  search: SearchIcon,
  bolt: BoltIcon,
  pen: PenIcon,
  refresh: RefreshIcon,
  hand: HandIcon,
  tag: TagIcon,
  alert: AlertIcon,
  camera: CameraIcon,
  palette: PaletteIcon,
  file: FileIcon,
  lock: LockIcon,
  chat: ChatIcon,
  save: SaveIcon,
  signal: SignalIcon,
  cloud: CloudIcon,
}

export function ManualHighlightIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = MAP[name] || FileIcon
  return <Icon size={size} className="text-sky-400" />
}
