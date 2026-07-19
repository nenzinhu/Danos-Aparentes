/** Ícones SVG lineais para landings e PIX — sem emoji. */

import type { ReactNode } from 'react'

type IconProps = { size?: number; className?: string }

function base(props: IconProps & { children: ReactNode }) {
  const { size = 20, className = '', children } = props
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
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return base({ ...props, children: <path d="M20 6 9 17l-5-5" /> })
}

export function ClipboardCheckIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
  })
}

export function CameraGpsIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
  })
}

export function ChartBarsIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 16v-5" />
        <path d="M12 16V8" />
        <path d="M17 16v-9" />
      </>
    ),
  })
}

export function OfflineIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M12 20h.01" />
        <path d="M8.5 16.4a5 5 0 0 1 7 0" />
        <path d="M5 12.8a10 10 0 0 1 3.2-2.4" />
        <path d="M19 12.8a10 10 0 0 0-3.2-2.4" />
        <path d="m2 2 20 20" />
      </>
    ),
  })
}

export function ShieldHashIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M9.5 12h5" />
        <path d="M12 9.5v5" />
      </>
    ),
  })
}

export function BrandMarkIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h6" />
        <path d="M7 12h10" />
        <path d="M7 16h4" />
      </>
    ),
  })
}

export function UsersIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  })
}

export function WhatsAppSendIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
        <path d="M22 2 11 13" />
      </>
    ),
  })
}

export function WrenchIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
  })
}

export function TruckIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </>
    ),
  })
}

export function QrCodeIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3" />
        <path d="M21 14v3h-3" />
        <path d="M14 21h3" />
      </>
    ),
  })
}

export function SunIcon(props: IconProps) {
  return base({
    ...props,
    children: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
  })
}

export function MoonIcon(props: IconProps) {
  return base({
    ...props,
    children: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  })
}

export function FeatureIconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--primary)]/25 bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
      {children}
    </span>
  )
}

export function PainIconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] text-[var(--text-muted)]">
      {children}
    </span>
  )
}
