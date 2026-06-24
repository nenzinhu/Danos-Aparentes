'use client'
import React, { useEffect, useState, useCallback } from 'react'
import Logo from './Logo'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
}

/**
 * Botão "Instalar App" (PWA). Usa o mesmo logo da entrada do app (/logo.png).
 * - Android/Desktop: dispara o prompt nativo de instalação.
 * - iOS Safari: abre instruções (Safari não suporta o prompt automático).
 * - Some quando o app já está instalado/aberto em modo standalone.
 */
export default function PwaInstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const ios = isIos()

  // Registra o service worker (necessário para instalar)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true)
      return
    }
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleClick = useCallback(async () => {
    if (ios) {
      setShowIosHelp(true)
      return
    }
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setDeferred(null)
  }, [deferred, ios])

  // Nada a mostrar: já instalado, ou navegador sem suporte (e não iOS)
  if (installed) return null
  if (!deferred && !ios) return null

  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar o app na tela inicial"
        className="px-4 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 inline-flex items-center gap-2 shadow-md"
      >
        <Logo size={16} />
        Instalar App
      </button>

      {showIosHelp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="max-w-sm w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Logo size={48} className="mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-100 mb-2">Instalar no iPhone</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              1. Toque no botão <strong>Compartilhar</strong> <span aria-hidden>⬆️</span> do Safari.<br />
              2. Escolha <strong>“Adicionar à Tela de Início”</strong>.<br />
              3. Confirme em <strong>Adicionar</strong>.
            </p>
            <button
              onClick={() => setShowIosHelp(false)}
              className="mt-5 w-full py-2.5 rounded-lg font-bold text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
