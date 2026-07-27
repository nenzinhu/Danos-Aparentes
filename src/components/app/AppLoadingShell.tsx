'use client'

/**
 * Lightweight boot/loading shell for /app — shown during auth restore or
 * while the authenticated workspace chunk downloads. Kept dependency-free
 * so it can also back `loading.tsx` for instant navigation feedback.
 */
export default function AppLoadingShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"
        aria-hidden
      />
      <p className="mt-4 text-sm text-[var(--text-muted)]">Carregando…</p>
    </div>
  )
}
