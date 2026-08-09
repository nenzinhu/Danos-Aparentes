'use client'

export default function AppLoadingShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" aria-hidden />
      <p className="mt-4 text-sm text-[var(--text-muted)]">Carregando…</p>
    </div>
  )
}
