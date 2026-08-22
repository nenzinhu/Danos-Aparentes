import { NextRequest, NextResponse } from 'next/server'
import { sha256Hex } from '@/src/lib/pdf/integrityManifest'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Recebe um digest canônico da ponta da cadeia de auditoria e (best-effort)
 * solicita provas OpenTimestamps. Sem chave/serviço OTS configurado, retorna
 * proofs vazio — a âncora ainda é registrada no cliente.
 */
export async function POST(req: NextRequest) {
  let body: { digest?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const digest = body.digest?.trim()
  if (!digest) {
    return errorJson('digest obrigatório', 400)
  }

  // Validação mínima de formato (hex sha256).
  if (!/^[a-fA-F0-9]{64}$/.test(digest)) {
    return errorJson('digest inválido (esperado sha256 hex)', 400)
  }

  const otsEndpoint = process.env.OTS_API_URL
  const otsKey = process.env.OTS_API_KEY
  const proofs: { calendar: string; proof_base64: string }[] = []

  if (otsEndpoint && otsKey) {
    try {
      const res = await fetch(otsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${otsKey}` },
        body: JSON.stringify({ hash: digest }),
      })
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { proof?: string; calendar?: string } | null
        if (data?.proof) {
          proofs.push({ calendar: data.calendar || 'opentimestamps', proof_base64: data.proof })
        }
      }
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ ok: true, proofs, digest: sha256Hex(digest) })
}
