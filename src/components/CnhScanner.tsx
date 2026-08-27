'use client';
import { useEffect, useRef, useState } from 'react'
import { extractCnhFieldsFromBarcode } from '../lib/cnhBarcode'
import { uploadCnhPhoto } from '../lib/documentPhoto'

interface Props {
  onResult: (fields: { nome: string | null; cpf: string | null; cnhNumber: string | null }) => void
  onClose: () => void
}

const SCAN_TIMEOUT_MS = 15000

export default function CnhScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'scanning' | 'timeout' | 'error'>('scanning')

  useEffect(() => {
    let cancelled = false
    let controls: { stop: () => void } | null = null
    const timeoutId = setTimeout(() => { if (!cancelled) setStatus('timeout') }, SCAN_TIMEOUT_MS)

    async function start() {
      try {
        const { BrowserPDF417Reader } = await import('@zxing/browser')
        const reader = new BrowserPDF417Reader()
        if (cancelled || !videoRef.current) return

        controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, _err, ctrl) => {
            if (cancelled || !result) return
            const fields = extractCnhFieldsFromBarcode(result.getText())
            // Registro da CNH continua sendo o sinal de "leitura bem-sucedida":
            // é o campo mais estável do barcode e já era usado assim antes
            // desta mudança. Nome e CPF, quando também vierem válidos no
            // mesmo frame, são repassados junto.
            if (!fields.cnhNumber) return

            clearTimeout(timeoutId)
            ctrl.stop()
            cancelled = true

            // Snapshot do frame atual para guardar como evidência (best-effort).
            const video = videoRef.current
            if (video) {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              canvas.getContext('2d')?.drawImage(video, 0, 0)
              canvas.toBlob(blob => { if (blob) uploadCnhPhoto(blob) }, 'image/jpeg', 0.85)
            }

            onResult(fields)
          },
        )
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    start()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      controls?.stop()
    }
  }, [onResult])

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[var(--surface)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--primary)]/10 flex items-center justify-between">
          <span className="font-bold text-[var(--text-main)]">Escanear CNH</span>
          <button onClick={onClose} className="text-[var(--text-muted)] text-xl leading-none">×</button>
        </div>

        {status === 'scanning' && (
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-[3/2] object-cover bg-black" muted playsInline />
            <p className="p-3 text-center text-xs text-[var(--text-muted)]">
              Aponte para o código de barras no verso da CNH…
            </p>
          </div>
        )}

        {status === 'timeout' && (
          <div className="p-6 text-center space-y-3">
            <p className="text-sm text-[var(--text-main)]">Não consegui ler o código de barras.</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] font-bold text-sm"
            >
              Digitar manualmente
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="p-6 text-center space-y-3">
            <p className="text-sm text-[var(--text-main)]">Não foi possível acessar a câmera.</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] font-bold text-sm"
            >
              Digitar manualmente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
