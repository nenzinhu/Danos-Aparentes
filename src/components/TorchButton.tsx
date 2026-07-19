'use client';
import { useCallback, useEffect, useRef, useState } from 'react'
import { LoaderIcon } from '@/src/components/app/AppIcons'

/**
 * Botão flutuante de lanterna: acende o LED de flash da câmera traseira
 * (capability `torch`) para iluminar o veículo em ambientes escuros durante
 * a vistoria. Mantém um MediaStreamTrack vivo enquanto ligado e o encerra ao
 * desligar, sair da página ou desmontar.
 */

// O `torch` ainda não faz parte do lib.dom padrão — tipamos de forma frouxa.
type TorchTrack = MediaStreamTrack & {
  getCapabilities?: () => { torch?: boolean }
}

interface Props {
  onToast?: (msg: string) => void
}

export default function TorchButton({ onToast }: Props) {
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const trackRef = useRef<TorchTrack | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopTorch = useCallback(async () => {
    const track = trackRef.current
    if (track) {
      try { await track.applyConstraints({ advanced: [{ torch: false }] } as any) } catch { /* já desligando */ }
      try { track.stop() } catch { /* noop */ }
    }
    streamRef.current?.getTracks().forEach(t => { try { t.stop() } catch { /* noop */ } })
    trackRef.current = null
    streamRef.current = null
    setOn(false)
  }, [])

  const startTorch = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setUnsupported(true)
      onToast?.('Lanterna indisponível neste dispositivo.')
      return
    }
    setBusy(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      const track = stream.getVideoTracks()[0] as TorchTrack
      const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean }
      if (!caps.torch) {
        // Sem suporte a flash contínuo (ex.: desktop, iOS Safari).
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setUnsupported(true)
        onToast?.('Este aparelho não permite acender o flash pelo navegador.')
        return
      }
      await track.applyConstraints({ advanced: [{ torch: true }] } as any)
      trackRef.current = track
      setOn(true)
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError')
      onToast?.(denied
        ? 'Permissão de câmera negada. Libere o acesso para usar a lanterna.'
        : 'Não foi possível acender a lanterna.')
    } finally {
      setBusy(false)
    }
  }, [onToast])

  const toggle = useCallback(() => {
    if (busy) return
    if (on) stopTorch()
    else startTorch()
  }, [busy, on, startTorch, stopTorch])

  // Desliga ao esconder a aba (economiza bateria) e ao desmontar.
  useEffect(() => {
    const onHide = () => { if (document.hidden) stopTorch() }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      stopTorch()
    }
  }, [stopTorch])

  if (unsupported) return null

  return (
    <div className="fixed bottom-24 right-4 z-[400] animate-in fade-in zoom-in-75 duration-300 motion-reduce:animate-none">
      <div className="relative grid place-items-center">
        {/* Anel de status: só pulsa quando a lanterna está acesa. */}
        {on && (
          <span aria-hidden="true" className="torch-halo absolute inset-0 rounded-full bg-amber-400 pointer-events-none" />
        )}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={on}
          aria-label={on ? 'Apagar lanterna' : 'Acender lanterna'}
          title={on ? 'Apagar lanterna' : 'Acender lanterna'}
          className={`relative grid place-items-center w-14 h-14 rounded-full border shadow-2xl transition-[transform,background-color,box-shadow,color] duration-200 ease-out active:scale-90 focus-visible:ring-2 ring-offset-2 ring-offset-slate-950 outline-none motion-reduce:transition-none ${
            on
              ? 'bg-amber-400 border-amber-300 text-slate-900 ring-amber-400 shadow-[0_0_28px_rgba(245,180,40,0.65)] scale-105'
              : 'bg-slate-900/90 border-white/15 text-amber-300 ring-amber-400 hover:bg-slate-800 hover:scale-105 backdrop-blur-md'
          } ${busy ? 'opacity-70 cursor-wait' : ''}`}
        >
          {busy ? (
            <LoaderIcon size={22} />
          ) : (
            <svg
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              className={`transition-transform duration-200 ease-out ${on ? 'scale-110' : 'scale-100'}`}
            >
              <path d="M9 2h6l-.5 4.5a2 2 0 0 1-.5 1.2L13 9v11a1 1 0 0 1-1 1h0a1 1 0 0 1-1-1V9L9.99 7.7a2 2 0 0 1-.49-1.2L9 2Z" />
              <path d="M9 2h6" /><path d="M12 13v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
