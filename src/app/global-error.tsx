'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24, background: '#020617', color: '#e2e8f0' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Algo deu errado</h1>
        <p style={{ opacity: 0.75, marginBottom: 16 }}>
          O erro foi registrado. Tente novamente ou volte ao início.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#e2e8f0',
            cursor: 'pointer',
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  )
}
