'use client';
import { useEffect } from 'react'

export default function AppToast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div role="status" aria-live="polite" className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--card-bg)]/95 border border-primary/30 rounded-xl px-6 py-3 z-[99999] text-blue-50 font-bold text-sm shadow-2xl pointer-events-none">
      {msg}
    </div>
  )
}
