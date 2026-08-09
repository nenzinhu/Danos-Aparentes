/**
 * GET /api/ops/gtm-health
 * Presença/consistência de env GTM — sem vazar secrets.
 * Auth: Authorization: Bearer $CRON_SECRET
 */
import { NextRequest, NextResponse } from 'next/server'
import { evaluateGtmOps } from '@/src/lib/server/gtmOpsHealth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization') || ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const report = evaluateGtmOps(process.env)
  return NextResponse.json(
    {
      service: 'danos-aparentes',
      check: 'gtm-ops',
      ...report,
    },
    { status: report.criticalOk ? 200 : 503 },
  )
}
