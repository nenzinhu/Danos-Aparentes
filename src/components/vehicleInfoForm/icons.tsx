export function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function InspectionDataIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 4h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M9 4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2" />
      <path d="M9 3h6v3H9z" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  )
}

export function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    sky: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    violet: 'bg-[var(--primary)]/15 border-[var(--primary)]/30 text-[var(--signal)]',
    orange: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    green: 'bg-green-500/15 border-green-500/30 text-green-400',
  }

  return (
    <div
      className={`
      inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5
      text-[0.72rem] font-bold max-w-[240px] truncate ${colorClasses[color] || colorClasses.sky}
    `}
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}
