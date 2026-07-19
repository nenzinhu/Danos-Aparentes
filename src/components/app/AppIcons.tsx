/** Ícones SVG lineais do app — substituem emoji na UI de /app. */

import type { ReactNode } from 'react'

export type IconProps = { size?: number; className?: string }

function Base({ size = 16, className = '', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 inline-block align-[-0.125em] ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ClipboardIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </Base>
  )
}

export function CarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 13h18" />
      <path d="M5 13 7.5 8h9L19 13" />
      <path d="M7.5 8 9 6h6l1.5 2" />
      <circle cx="7.5" cy="14.5" r="1.5" />
      <circle cx="16.5" cy="14.5" r="1.5" />
    </Base>
  )
}

export function PenIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Base>
  )
}

export function FileIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </Base>
  )
}

export function CloudIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9 5.5 5.5 0 0 0-10.7 1.5A3.5 3.5 0 0 0 6.5 19Z" />
    </Base>
  )
}

export function LoaderIcon(p: IconProps) {
  return (
    <Base {...p} className={`animate-spin ${p.className || ''}`}>
      <path d="M12 2v4" />
      <path d="m19.07 4.93-2.83 2.83" />
      <path d="M22 12h-4" />
      <path d="m19.07 19.07-2.83-2.83" />
      <path d="M12 22v-4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="M2 12h4" />
      <path d="m4.93 4.93 2.83 2.83" />
    </Base>
  )
}

export function PhoneOffIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07" />
      <path d="M6.27 6.26A19.8 19.8 0 0 0 3.13 14.8 2 2 0 0 0 5.15 17h3a2 2 0 0 0 2-1.72 12.84 12.84 0 0 1 .7-2.81 2 2 0 0 0-.45-2.11L9.15 9.09" />
      <path d="m2 2 20 20" />
    </Base>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  )
}

export function XIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Base>
  )
}

export function AlertIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Base>
  )
}

export function CameraIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </Base>
  )
}

export function TagIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41Z" />
      <circle cx="7" cy="7" r="1.25" />
    </Base>
  )
}

export function TrashIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </Base>
  )
}

export function PackageIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Base>
  )
}

export function NotesIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </Base>
  )
}

export function SeatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 18v-6a4 4 0 0 1 4-4h2" />
      <path d="M14 8h2a4 4 0 0 1 4 4v6" />
      <path d="M4 18h16" />
      <path d="M8 8V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" />
    </Base>
  )
}

export function SignalIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 20h.01" />
      <path d="M8.5 16.4a5 5 0 0 1 7 0" />
      <path d="M5 12.8a10 10 0 0 1 14 0" />
      <path d="M2 9a15 15 0 0 1 20 0" />
    </Base>
  )
}

export function MapIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9 18 2 22V6l7-4 7 4 6-3v16l-6 3Z" />
      <path d="M16 6v16" />
      <path d="M9 2v16" />
    </Base>
  )
}

export function ChartIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 16v-5" />
      <path d="M12 16V8" />
      <path d="M17 16v-9" />
    </Base>
  )
}

export function TrendUpIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </Base>
  )
}

export function FolderIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.5L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
    </Base>
  )
}

export function SparkleIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m6 6 2.5 2.5" />
      <path d="m15.5 15.5 2.5 2.5" />
      <path d="m18 6-2.5 2.5" />
      <path d="m8.5 15.5-2.5 2.5" />
    </Base>
  )
}

export function BoltIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </Base>
  )
}

export function PinIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Base>
  )
}

export function LockIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Base>
  )
}

export function SettingsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Base>
  )
}

export function LightbulbIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
    </Base>
  )
}

export function SearchIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  )
}

export function GiftIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8" />
      <path d="M7.5 8a2.5 2.5 0 1 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 1 1 0 5" />
    </Base>
  )
}

export function DownloadIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </Base>
  )
}

export function ImageIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </Base>
  )
}

export function LaptopIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4" y="4" width="16" height="12" rx="1.5" />
      <path d="M2 20h20" />
    </Base>
  )
}

export function EraserIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.3 5.3a1 1 0 0 1 0 1.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 12 7 7" />
    </Base>
  )
}

export function BuildingIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6 22V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v18" />
      <path d="M15 9h3a1 1 0 0 1 1 1v12" />
      <path d="M9 7h2" />
      <path d="M9 11h2" />
      <path d="M9 15h2" />
    </Base>
  )
}

export function ChatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z" />
    </Base>
  )
}

export function MicIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
      <path d="M8 22h8" />
    </Base>
  )
}

export function PaletteIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.3 3.5-3 3.5h-1.5a2.5 2.5 0 0 0-2.3 3.4A2.5 2.5 0 0 1 12 22Z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function RefreshIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M8 16H3v5" />
    </Base>
  )
}

export function BankIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 21h18" />
      <path d="M5 21V10" />
      <path d="M9 21V10" />
      <path d="M15 21V10" />
      <path d="M19 21V10" />
      <path d="m2 10 10-7 10 7" />
    </Base>
  )
}

export function ShareIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </Base>
  )
}

export function UsersIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3 3 0 0 1 0 5.74" />
    </Base>
  )
}

export function GlobeIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20" />
      <path d="M12 2a15 15 0 0 0 0 20" />
    </Base>
  )
}

export function PlusIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Base>
  )
}

export function VolumeIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </Base>
  )
}

export function FlashlightIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M18 6H6l-1 4h14Z" />
      <path d="M8 10v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10" />
      <path d="M12 14v3" />
    </Base>
  )
}

export function HandIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M18 11V6a2 2 0 0 0-4 0" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 1 0-4 0v8" />
      <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.8-2.4L3 16" />
    </Base>
  )
}

export function SaveIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </Base>
  )
}

export function BookIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </Base>
  )
}

export function UploadIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 21V9" />
      <path d="m7 14 5-5 5 5" />
      <path d="M5 3h14" />
    </Base>
  )
}

export function LinkIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Base>
  )
}

export function ScrollIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M16 3h2a2 2 0 0 1 2 2v2" />
      <path d="M10 12h6" />
      <path d="M10 16h4" />
      <path d="M14 3v5h5" />
    </Base>
  )
}

export function SpeakIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3c-2 3-2 6 0 9-2 3-2 6 0 9" />
      <path d="M7 7c-1.5 2-1.5 4 0 6-1.5 2-1.5 4 0 6" />
      <path d="M17 7c1.5 2 1.5 4 0 6 1.5 2 1.5 4 0 6" />
    </Base>
  )
}

export function GripIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </Base>
  )
}

/** Ícone + texto inline (botões, labels, badges). */
export function IconLabel({
  icon: Icon,
  children,
  size = 14,
  className = '',
  gapClass = 'gap-1.5',
}: {
  icon: (p: IconProps) => ReactNode
  children: ReactNode
  size?: number
  className?: string
  gapClass?: string
}) {
  return (
    <span className={`inline-flex items-center ${gapClass} ${className}`}>
      <Icon size={size} />
      <span>{children}</span>
    </span>
  )
}
