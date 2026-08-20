'use client';
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getMarketingConsent, setMarketingConsent } from '@/src/lib/analytics/consent'
import Button from './ui/Button'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<Element | null>(null)

  useEffect(() => {
    setVisible(getMarketingConsent() === 'unknown')
  }, [])

  useEffect(() => {
    if (!visible) return
    lastFocusedRef.current = document.activeElement

    const node = bannerRef.current
    if (!node) return

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const focusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      )

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        reject()
        return
      }
      if (e.key !== 'Tab') return

      const items = focusable()
      if (!items.length) return

      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !node.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last || !node.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    const onKey = (e: KeyboardEvent) => trapFocus(e)
    document.addEventListener('keydown', onKey)

    const firstFocusable = focusable()[0]
    if (firstFocusable) {
      queueMicrotask(() => firstFocusable.focus())
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      const last = lastFocusedRef.current
      if (last && typeof (last as HTMLElement).focus === 'function') {
        ;(last as HTMLElement).focus?.()
      }
    }
  }, [visible])

  function accept() {
    setMarketingConsent('accepted')
    setVisible(false)
  }

  function reject() {
    setMarketingConsent('rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 bg-slate-950/95 border-t border-slate-700 backdrop-blur-md"
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="text-xs text-slate-300 leading-relaxed">
          Usamos cookies de marketing (Meta e TikTok) para medir cadastros vindos de anúncios.{' '}
          <Link href="/privacidade" className="text-sky-400 underline">
            Política de Privacidade
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={reject}
            className="!text-slate-200 !border-slate-600 !bg-slate-800 hover:!bg-slate-700"
          >
            Recusar
          </Button>
          <Button variant="primary" size="sm" onClick={accept}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  )
}
