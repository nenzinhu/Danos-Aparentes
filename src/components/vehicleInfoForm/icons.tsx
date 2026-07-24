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
      viewBox="0 0 512 341.39"
      className="shrink-0"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M3.62 302.83c-2 0-3.62-1.62-3.62-3.62 0-1.04.14-2.05.39-3.06 5.8-46 41.82-58.27 67.37-64.9 12.79-3.31 44.6-15.93 31.92-33.3-7.1-9.74-13.53-16.58-19.97-26.87-4.65-6.86-7.1-12.99-7.1-17.89 0-5.23 2.77-11.35 8.32-12.74-.73-10.53-.98-24.38-.48-35.65 1.76-19.35 15.64-33.61 33.57-39.93 7.09-2.7 3.66-13.49 11.5-13.72 18.38-.5 48.51 15.19 60.28 27.92 6.86 7.35 11.26 17.15 12 30.14l-.74 32.46c3.43.98 5.64 3.19 6.62 6.62.98 3.92 0 9.31-3.43 16.91 0 .24-.25.24-.25.49-7.56 12.46-15.44 20.72-24.1 32.26-3.86 5.16-3.11 10.09.1 14.53-4.51 2.63-8.92 5.66-13.15 9.22-16.79 14.09-29.76 35.09-34.32 68.53-.9 3.91-1.25 8.64-.6 12.6H3.62zm415.6-73.61c-.03-3.56-.36-6.1 4.05-6.04l14.28.18c4.61-.03 5.84 1.43 5.79 5.75v19.48h19.36c3.55-.03 6.09-.36 6.03 4.05l-.17 14.29c.02 4.61-1.44 5.83-5.76 5.78h-19.46v19.47c.05 4.32-1.18 5.78-5.79 5.75l-14.28.18c-4.41.06-4.08-2.48-4.05-6.04v-19.36h-19.49c-4.31.05-5.77-1.17-5.75-5.78l-.17-14.29c-.07-4.41 2.48-4.08 6.03-4.05h19.38v-19.37zm12.05-49.31c22.29 0 42.48 9.04 57.08 23.65 14.61 14.61 23.65 34.81 23.65 57.09 0 22.3-9.04 42.48-23.65 57.09-14.6 14.61-34.8 23.65-57.08 23.65-22.3 0-42.48-9.04-57.09-23.65l-.45-.48c-14.35-14.59-23.2-34.59-23.2-56.61 0-22.26 9.04-42.45 23.66-57.06 14.6-14.64 34.79-23.68 57.08-23.68zm45.31 35.42c-11.59-11.59-27.61-18.76-45.31-18.76-17.7 0-33.74 7.17-45.33 18.76-11.6 11.57-18.76 27.6-18.76 45.32 0 17.53 7.01 33.41 18.36 44.94l.41.38c11.59 11.6 27.61 18.77 45.32 18.77 17.69 0 33.72-7.17 45.31-18.77 11.6-11.59 18.77-27.62 18.77-45.32 0-17.69-7.17-33.73-18.77-45.32z" />
    </svg>
  )
}

export function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    sky: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    violet: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
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
