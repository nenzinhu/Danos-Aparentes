'use client';
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMarketingConsent, setMarketingConsent } from '@/src/lib/analytics/consent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getMarketingConsent() === 'unknown')
  }, [])

  if (!visible) return null

  function accept() {
    setMarketingConsent('accepted')
    setVisible(false)
  }

  function reject() {
    setMarketingConsent('rejected')
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 inset-x-0 z-[99990] p-4 bg-slate-950/95 border-t border-slate-700 backdrop-blur-md"
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="text-xs text-slate-300 leading-relaxed">
          Usamos cookies de marketing (Meta e TikTok) para medir cadastros vindos de anúncios.{' '}
          <Link href="/privacidade" className="text-sky-400 underline">Política de Privacidade</Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={reject}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={accept}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
