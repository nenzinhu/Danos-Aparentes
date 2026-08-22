import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Append imutável de evento de auditoria de verificação pública.
 * Best-effort: usa service role; falha silenciosa não afeta o usuário.
 */
export async function POST(req: NextRequest) {
  let body: { hash?: string; report_key?: string; inspection_id?: string | null; method?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  if (!body.hash && !body.report_key) {
    return errorJson('hash ou report_key obrigatórios', 400)
  }

  try {
    const { appendAuditEventAdmin } = await import('@/src/lib/server/auditAppend')
    await appendAuditEventAdmin({
      user_id: 'public-verify',
      event_type: 'verify_lookup',
      inspection_id: body.inspection_id ?? null,
      tenant_id: null,
      metadata: {
        hash: body.hash ?? null,
        report_key: body.report_key ?? null,
        method: body.method ?? 'qr',
      },
      actor_type: 'service',
      actor_id: 'public-verify',
    })
  } catch {
    // fail-open: auditoria não deve quebrar a verificação
  }

  return NextResponse.json({ ok: true })
}
