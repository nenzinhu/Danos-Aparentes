/**
 * Fase 1 GTM ops — valida env local OU health remoto (sem imprimir secrets).
 *
 * Local:  node scripts/check-gtm-ops.mjs
 * Remoto: node scripts/check-gtm-ops.mjs --url https://danosaparentes.com.br --secret $env:CRON_SECRET
 *
 * Exit 0 = criticalOk; exit 1 = falha crítica; exit 2 = usage/rede.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(path) {
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    env[k] = v
  }
  return env
}

function parseArgs(argv) {
  const out = { url: null, secret: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url') out.url = argv[++i]
    else if (argv[i] === '--secret') out.secret = argv[++i]
    else if (argv[i] === '--help' || argv[i] === '-h') out.help = true
  }
  return out
}

/** Espelho mínimo de src/lib/server/gtmOpsHealth.ts — manter alinhado. */
function evaluateGtmOps(env) {
  const checks = []
  const present = (key) => typeof env[key] === 'string' && env[key].trim().length > 0
  const value = (key) => (env[key] || '').trim()
  const req = (id, key, level, why) => {
    const ok = present(key)
    checks.push({
      id,
      level,
      ok,
      detail: ok ? `${key} definido` : `${key} ausente — ${why}`,
    })
  }

  req('base_url', 'NEXT_PUBLIC_BASE_URL', 'critical', 'URLs de checkout/PIX/portal quebram')
  req('supabase_url', 'NEXT_PUBLIC_SUPABASE_URL', 'critical', 'auth e API não sobem')
  req('supabase_anon', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'critical', 'client auth')
  req('supabase_service', 'SUPABASE_SERVICE_ROLE_KEY', 'critical', 'webhooks, trial, PDF server')
  req('stripe_secret', 'STRIPE_SECRET_KEY', 'critical', 'checkout cartão')
  req('stripe_webhook', 'STRIPE_WEBHOOK_SECRET', 'critical', 'pagamento cartão não ativa assinatura')
  {
    const proOk = present('STRIPE_PRICE_ID_PRO') || present('STRIPE_PRICE_ID')
    checks.push({
      id: 'stripe_price_pro',
      level: 'critical',
      ok: proOk,
      detail: proOk
        ? present('STRIPE_PRICE_ID_PRO')
          ? 'STRIPE_PRICE_ID_PRO definido'
          : 'STRIPE_PRICE_ID (legado Pro) definido'
        : 'STRIPE_PRICE_ID_PRO ou STRIPE_PRICE_ID ausente — plano Pro',
    })
  }
  req('stripe_price_starter', 'STRIPE_PRICE_ID_STARTER', 'critical', 'plano Starter')

  const provider = (value('PIX_PROVIDER') || 'asaas').toLowerCase()
  if (provider === 'mercadopago') {
    req('pix_mp_token', 'PIX_MERCADO_PAGO_ACCESS_TOKEN', 'critical', 'PIX MP')
    req('pix_mp_webhook', 'PIX_WEBHOOK_SECRET', 'critical', 'webhook MP não valida')
  } else {
    req('asaas_key', 'ASAAS_API_KEY', 'critical', 'PIX Asaas (default BR)')
    req('asaas_webhook', 'ASAAS_WEBHOOK_TOKEN', 'critical', 'pago PIX sem ativar acesso')
  }

  req('cron_secret', 'CRON_SECRET', 'critical', 'cron trial-ending e health ops')
  req('signature_secret', 'SIGNATURE_LINK_SECRET', 'critical', 'assinatura remota')

  const baseUrl = value('NEXT_PUBLIC_BASE_URL')
  let prodLike = false
  try {
    const host = new URL(baseUrl.includes('://') ? baseUrl : `https://${baseUrl}`).hostname.toLowerCase()
    prodLike =
      host === 'danosaparentes.com.br' ||
      host === 'www.danosaparentes.com.br' ||
      host === 'danosaparentes.vercel.app'
  } catch {
    /* ignore */
  }

  const sk = value('STRIPE_SECRET_KEY')
  const mode = sk.startsWith('sk_live_') ? 'live' : sk.startsWith('sk_test_') ? 'test' : 'unknown'
  if (prodLike && mode === 'test') {
    checks.push({
      id: 'stripe_mode_vs_base',
      level: 'critical',
      ok: false,
      detail: 'BASE_URL de produção com STRIPE_SECRET_KEY de teste (sk_test_)',
    })
  } else if (prodLike && mode === 'live') {
    checks.push({
      id: 'stripe_mode_vs_base',
      level: 'critical',
      ok: true,
      detail: 'Stripe live alinhado com BASE_URL de produção',
    })
  }

  if (provider !== 'mercadopago') {
    const asaasUrl = value('ASAAS_API_URL') || 'https://api-sandbox.asaas.com'
    const sandbox = asaasUrl.toLowerCase().includes('sandbox')
    if (prodLike && sandbox) {
      checks.push({
        id: 'asaas_sandbox_vs_prod',
        level: 'critical',
        ok: false,
        detail:
          'BASE_URL de produção com Asaas sandbox. Defina ASAAS_API_URL=https://api.asaas.com',
      })
    } else if (prodLike && !sandbox) {
      checks.push({
        id: 'asaas_sandbox_vs_prod',
        level: 'critical',
        ok: true,
        detail: 'Asaas API de produção',
      })
    }
  }

  req('stripe_price_corp', 'STRIPE_PRICE_ID_CORPORATE', 'recommended', 'tier corporativo')
  req('smtp_host', 'SMTP_HOST', 'recommended', 'welcome + trial ending')
  req('smtp_user', 'SMTP_USER', 'recommended', 'lifecycle e-mail')
  req('smtp_pass', 'SMTP_PASS', 'recommended', 'lifecycle e-mail')
  {
    const rateOk =
      (present('UPSTASH_REDIS_REST_URL') && present('UPSTASH_REDIS_REST_TOKEN')) ||
      (present('KV_REST_API_URL') && present('KV_REST_API_TOKEN'))
    checks.push({
      id: 'rate_limit_redis',
      level: 'recommended',
      ok: rateOk,
      detail: rateOk
        ? 'Rate limit distribuído (Upstash ou Vercel KV)'
        : 'UPSTASH_* ou KV_REST_* ausentes — fallback memória por instância',
    })
  }
  {
    const sentryOk = present('SENTRY_DSN') || present('NEXT_PUBLIC_SENTRY_DSN')
    checks.push({
      id: 'sentry_dsn',
      level: 'recommended',
      ok: sentryOk,
      detail: sentryOk
        ? 'Sentry DSN definido'
        : 'SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN ausente — erros pagamento/PDF',
    })
  }
  if (provider !== 'mercadopago' && prodLike) {
    req('asaas_cpf', 'ASAAS_DEFAULT_CPF', 'recommended', 'cliente Asaas sem CPF do user')
  }
  req(
    'posthog',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'recommended',
    'funil cta→signup→first_inspection',
  )
  req('ga4', 'NEXT_PUBLIC_GA_MEASUREMENT_ID', 'optional', 'ads')

  const criticalFail = checks.filter((c) => c.level === 'critical' && !c.ok).length
  const recommendedFail = checks.filter((c) => c.level === 'recommended' && !c.ok).length
  return {
    ok: criticalFail === 0,
    criticalOk: criticalFail === 0,
    summary: { criticalFail, recommendedFail, total: checks.length },
    checks,
  }
}

function printReport(report, source) {
  console.log(`\nGTM ops check (${source})`)
  console.log(
    `criticalOk=${report.criticalOk}  criticalFail=${report.summary.criticalFail}  recommendedFail=${report.summary.recommendedFail}`,
  )
  const icon = (ok) => (ok ? 'OK ' : 'FAIL')
  for (const c of report.checks.filter((c) => c.level === 'critical')) {
    console.log(`  [${icon(c.ok)}] ${c.id}: ${c.detail}`)
  }
  const soft = report.checks.filter((c) => !c.ok && c.level !== 'critical')
  if (soft.length) {
    console.log('\nRecomendados / opcionais falhando:')
    for (const c of soft) {
      console.log(`  [WARN] [${c.level}] ${c.id}: ${c.detail}`)
    }
  }
  console.log('')
}

const args = parseArgs(process.argv.slice(2))
if (args.help) {
  console.log(`Uso:
  node scripts/check-gtm-ops.mjs
  node scripts/check-gtm-ops.mjs --url https://danosaparentes.com.br --secret <CRON_SECRET>
`)
  process.exit(0)
}

if (args.url) {
  const secret = args.secret || process.env.CRON_SECRET
  if (!secret) {
    console.error('Remoto exige --secret ou CRON_SECRET no ambiente.')
    process.exit(2)
  }
  const base = args.url.replace(/\/$/, '')
  const res = await fetch(`${base}/api/ops/gtm-health`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const body = await res.json().catch(() => ({}))
  if (res.status === 401) {
    console.error('Unauthorized — CRON_SECRET incorreto ou ausente no servidor.')
    process.exit(2)
  }
  if (!body.checks) {
    console.error('Resposta inesperada:', res.status, body)
    process.exit(2)
  }
  printReport(body, `remote ${base} HTTP ${res.status}`)
  process.exit(body.criticalOk ? 0 : 1)
}

const env = {
  ...loadEnv(resolve(root, '.env')),
  ...loadEnv(resolve(root, '.env.local')),
  ...process.env,
}
const report = evaluateGtmOps(env)
printReport(report, 'local .env / .env.local')
console.log('Dica: após deploy, rode com --url https://danosaparentes.com.br --secret <CRON_SECRET>')
process.exit(report.criticalOk ? 0 : 1)
