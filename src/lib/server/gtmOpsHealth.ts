/**
 * Checklist GTM ops — presença/consistência de env (sem vazar valores).
 * Fase 1 do diagnóstico: blindar pagamento + trial + webhooks antes de escala.
 */

export type GtmCheckLevel = 'critical' | 'recommended' | 'optional'

export type GtmCheck = {
  id: string
  level: GtmCheckLevel
  ok: boolean
  detail: string
}

export type GtmOpsReport = {
  ok: boolean
  criticalOk: boolean
  summary: { criticalFail: number; recommendedFail: number; total: number }
  checks: GtmCheck[]
}

type EnvBag = Record<string, string | undefined>

function present(env: EnvBag, key: string): boolean {
  const v = env[key]
  return typeof v === 'string' && v.trim().length > 0
}

function value(env: EnvBag, key: string): string {
  return (env[key] || '').trim()
}

function isProdBaseUrl(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl.includes('://') ? baseUrl : `https://${baseUrl}`).hostname.toLowerCase()
    return (
      host === 'danosaparentes.com.br' ||
      host === 'www.danosaparentes.com.br' ||
      host === 'danosaparentes.vercel.app'
    )
  } catch {
    return false
  }
}

function stripeMode(secretKey: string): 'live' | 'test' | 'unknown' {
  if (secretKey.startsWith('sk_live_')) return 'live'
  if (secretKey.startsWith('sk_test_')) return 'test'
  return 'unknown'
}

function asaasIsSandbox(apiUrl: string): boolean {
  const u = (apiUrl || 'https://api-sandbox.asaas.com').toLowerCase()
  return u.includes('sandbox')
}

/** Avalia env sem expor secrets — só booleanos + mensagens. */
export function evaluateGtmOps(env: EnvBag = process.env): GtmOpsReport {
  const checks: GtmCheck[] = []

  const push = (c: GtmCheck) => {
    checks.push(c)
  }

  const req = (id: string, key: string, level: GtmCheckLevel, why: string) => {
    const ok = present(env, key)
    push({
      id,
      level,
      ok,
      detail: ok ? `${key} definido` : `${key} ausente — ${why}`,
    })
  }

  // —— Critical: app + supabase ——
  req('base_url', 'NEXT_PUBLIC_BASE_URL', 'critical', 'URLs de checkout/PIX/portal quebram')
  req('supabase_url', 'NEXT_PUBLIC_SUPABASE_URL', 'critical', 'auth e API não sobem')
  req('supabase_anon', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'critical', 'client auth')
  req('supabase_service', 'SUPABASE_SERVICE_ROLE_KEY', 'critical', 'webhooks, trial, PDF server')

  // —— Critical: Stripe ——
  req('stripe_secret', 'STRIPE_SECRET_KEY', 'critical', 'checkout cartão')
  req('stripe_webhook', 'STRIPE_WEBHOOK_SECRET', 'critical', 'pagamento cartão não ativa assinatura')
  {
    const proOk = present(env, 'STRIPE_PRICE_ID_PRO') || present(env, 'STRIPE_PRICE_ID')
    push({
      id: 'stripe_price_pro',
      level: 'critical',
      ok: proOk,
      detail: proOk
        ? present(env, 'STRIPE_PRICE_ID_PRO')
          ? 'STRIPE_PRICE_ID_PRO definido'
          : 'STRIPE_PRICE_ID (legado Pro) definido'
        : 'STRIPE_PRICE_ID_PRO ou STRIPE_PRICE_ID ausente — plano Pro',
    })
  }
  req('stripe_price_starter', 'STRIPE_PRICE_ID_STARTER', 'critical', 'plano Starter')

  // —— Critical: PIX (provider) ——
  const provider = (value(env, 'PIX_PROVIDER') || 'asaas').toLowerCase()
  if (provider === 'mercadopago') {
    req('pix_mp_token', 'PIX_MERCADO_PAGO_ACCESS_TOKEN', 'critical', 'PIX MP')
    req('pix_mp_webhook', 'PIX_WEBHOOK_SECRET', 'critical', 'webhook MP não valida')
  } else {
    req('asaas_key', 'ASAAS_API_KEY', 'critical', 'PIX Asaas (default BR)')
    req('asaas_webhook', 'ASAAS_WEBHOOK_TOKEN', 'critical', 'pago PIX sem ativar acesso')
  }

  // —— Critical: lifecycle / links ——
  req('cron_secret', 'CRON_SECRET', 'critical', 'cron trial-ending e health ops')
  req('signature_secret', 'SIGNATURE_LINK_SECRET', 'critical', 'assinatura remota')

  // —— Consistency ——
  const baseUrl = value(env, 'NEXT_PUBLIC_BASE_URL')
  const prodLike = baseUrl ? isProdBaseUrl(baseUrl) : false
  const sk = value(env, 'STRIPE_SECRET_KEY')
  const mode = sk ? stripeMode(sk) : 'unknown'

  if (prodLike && mode === 'test') {
    push({
      id: 'stripe_mode_vs_base',
      level: 'critical',
      ok: false,
      detail: 'BASE_URL de produção com STRIPE_SECRET_KEY de teste (sk_test_)',
    })
  } else if (prodLike && mode === 'live') {
    push({
      id: 'stripe_mode_vs_base',
      level: 'critical',
      ok: true,
      detail: 'Stripe live alinhado com BASE_URL de produção',
    })
  } else if (mode !== 'unknown') {
    push({
      id: 'stripe_mode_vs_base',
      level: 'recommended',
      ok: true,
      detail: `Stripe em modo ${mode} (BASE_URL ${prodLike ? 'prod' : 'não-prod'})`,
    })
  }

  if (provider !== 'mercadopago') {
    const asaasUrl = value(env, 'ASAAS_API_URL') || 'https://api-sandbox.asaas.com'
    const sandbox = asaasIsSandbox(asaasUrl)
    if (prodLike && sandbox) {
      push({
        id: 'asaas_sandbox_vs_prod',
        level: 'critical',
        ok: false,
        detail:
          'BASE_URL de produção com Asaas sandbox (ASAAS_API_URL default ou *sandbox*). Use https://api.asaas.com',
      })
    } else if (prodLike && !sandbox) {
      push({
        id: 'asaas_sandbox_vs_prod',
        level: 'critical',
        ok: true,
        detail: 'Asaas API de produção',
      })
    } else {
      push({
        id: 'asaas_sandbox_vs_prod',
        level: 'recommended',
        ok: true,
        detail: sandbox ? 'Asaas sandbox (ok em dev)' : 'Asaas produção com BASE_URL não-prod',
      })
    }
  }

  // —— Recommended ——
  req('stripe_price_corp', 'STRIPE_PRICE_ID_CORPORATE', 'recommended', 'tier corporativo no webhook')
  req('smtp_host', 'SMTP_HOST', 'recommended', 'welcome + trial ending')
  req('smtp_user', 'SMTP_USER', 'recommended', 'lifecycle e-mail')
  req('smtp_pass', 'SMTP_PASS', 'recommended', 'lifecycle e-mail')
  {
    const rateOk =
      (present(env, 'UPSTASH_REDIS_REST_URL') && present(env, 'UPSTASH_REDIS_REST_TOKEN')) ||
      (present(env, 'KV_REST_API_URL') && present(env, 'KV_REST_API_TOKEN'))
    push({
      id: 'rate_limit_redis',
      level: 'recommended',
      ok: rateOk,
      detail: rateOk
        ? 'Rate limit distribuído (Upstash ou Vercel KV)'
        : 'UPSTASH_* ou KV_REST_* ausentes — fallback memória por instância',
    })
  }
  {
    const sentryOk = present(env, 'SENTRY_DSN') || present(env, 'NEXT_PUBLIC_SENTRY_DSN')
    push({
      id: 'sentry_dsn',
      level: 'recommended',
      ok: sentryOk,
      detail: sentryOk
        ? 'Sentry DSN definido'
        : 'SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN ausente — erros pagamento/PDF em prod',
    })
  }
  if (provider !== 'mercadopago' && prodLike) {
    req('asaas_cpf', 'ASAAS_DEFAULT_CPF', 'recommended', 'cliente Asaas sem CPF do user')
  }

  // —— Funil / growth ——
  req(
    'posthog',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'recommended',
    'funil cta_click → signup_start → first_inspection (produto; memory sem cookie ads)',
  )
  req('ga4', 'NEXT_PUBLIC_GA_MEASUREMENT_ID', 'optional', 'ads attribution (exige consentimento)')

  const criticalFail = checks.filter((c) => c.level === 'critical' && !c.ok).length
  const recommendedFail = checks.filter((c) => c.level === 'recommended' && !c.ok).length
  const criticalOk = criticalFail === 0

  return {
    ok: criticalOk,
    criticalOk,
    summary: { criticalFail, recommendedFail, total: checks.length },
    checks,
  }
}
