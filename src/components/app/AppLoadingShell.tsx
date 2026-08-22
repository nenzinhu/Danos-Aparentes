'use client'

export default function AppLoadingShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
      <div className="w-full px-4 sm:px-5 py-4 flex items-center justify-between border-b border-[var(--card-border)]/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
          <div className="h-4 w-24 rounded-lg bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
        </div>
        <div className="h-9 w-9 rounded-xl bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
      </div>

      <div className="w-full px-4 sm:px-5 py-3 flex items-center gap-2 border-b border-[var(--card-border)]/40">
        <div className="h-8 w-20 rounded-lg bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
        <div className="h-8 w-24 rounded-lg bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
        <div className="h-8 w-24 rounded-lg bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-5 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--card-border)]/70 bg-[var(--card-bg)]/40 p-4 space-y-3">
              <div className="h-5 w-40 rounded-md bg-[var(--card-border)]/60 animate-pulse" aria-hidden />
              <div className="h-4 w-full rounded-md bg-[var(--card-border)]/50 animate-pulse" aria-hidden />
              <div className="h-4 w-5/6 rounded-md bg-[var(--card-border)]/50 animate-pulse" aria-hidden />
              <div className="h-32 w-full rounded-xl bg-[var(--card-border)]/40 animate-pulse" aria-hidden />
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only">Carregando painel...</p>
    </div>
  )
}
