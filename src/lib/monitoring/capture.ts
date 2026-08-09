/**
 * Wrapper seguro — no-op quando Sentry DSN não está configurado.
 * Use em rotas críticas: PDF, auth, pagamentos.
 */
export async function captureServerException(
  err: unknown,
  context?: Record<string, string | number | boolean | undefined>,
): Promise<void> {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.withScope((scope) => {
      if (context) {
        for (const [k, v] of Object.entries(context)) {
          if (v !== undefined) scope.setTag(k, String(v))
        }
      }
      Sentry.captureException(err)
    })
  } catch {
    /* monitoring must never break the app */
  }
}
