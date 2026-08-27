import { withSentryConfig } from '@sentry/nextjs'

/**
 * Cabeçalhos de segurança aplicados a todas as rotas.
 * A Vercel já envia HSTS (max-age=63072000); aqui reforçamos com includeSubDomains.
 *
 * CSP: Report-Only (não bloqueia). NÃO ativar enforce nesta janela.
 * Alvo sugerido para enforce: ~10–17 set 2026 (1–2 semanas após RO em produção).
 * Rollout:
 *  1. Manter RO por 1–2 semanas em produção
 *  2. Auditar violações no DevTools / logs (console CSP)
 *  3. Ajustar allowlist se necessário
 *  4. Trocar Content-Security-Policy-Report-Only → Content-Security-Policy
 * Critério de go: zero violações inesperadas em fluxos críticos (login, vistoria, PDF, pagamento).
 */
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // Scripts de terceiros inventariados (GTM/GA Ads, Meta, TikTok, PostHog, Sentry, Vercel, Stripe).
  // 'unsafe-inline'/'unsafe-eval' ainda necessários para Next + pixels — remover ao migrar para nonces.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.google.com https://connect.facebook.net https://analytics.tiktok.com https://cdn.posthog.com https://*.i.posthog.com https://browser.sentry-cdn.com https://*.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://td.doubleclick.net",
  // connect: APIs próprias + Supabase + billing + analytics + IA providers + Upstash.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.asaas.com https://api.mercadopago.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.facebook.com https://graph.facebook.com https://analytics.tiktok.com https://*.i.posthog.com https://us.i.posthog.com https://*.sentry.io https://vitals.vercel-insights.com https://api.groq.com https://generativelanguage.googleapis.com https://*.upstash.io",
  "manifest-src 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(self), microphone=(), payment=(), interest-cohort=()' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // Compressão gzip/brotli explícita (Vercel já comprime, mas garante em dev/preview)
  compress: true,
  // Tree-shake imports de pacotes pesados — reduz unused JS no bundle cliente
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'gsap',
      '@gsap/react',
      'posthog-js',
      'qrcode.react',
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    // Consolidar URLs sobrepostas de B2B/gestão de frota em uma canônica.
    // Evita concorrência de SEO e mega-menu fragmentado no header.
    return [
      { source: '/frotas', destination: '/historico-de-frotas', permanent: true },
      { source: '/historico/frotas', destination: '/historico-de-frotas', permanent: true },
      // Consolidação de categorias do blog (missão SEO): ~20 categorias antigas
      // -> 6 temas semânticos. 301 para preservar o SEO das URLs indexadas.
      { source: '/blog/categoria/acessibilidade', destination: '/blog/categoria/vistoria', permanent: true },
      { source: '/blog/categoria/boas-praticas', destination: '/blog/categoria/vistoria', permanent: true },
      { source: '/blog/categoria/comparativo', destination: '/blog/categoria/comparacao', permanent: true },
      { source: '/blog/categoria/concessionaria', destination: '/blog/categoria/historico-veicular', permanent: true },
      { source: '/blog/categoria/deposito', destination: '/blog/categoria/historico-veicular', permanent: true },
      { source: '/blog/categoria/despachante', destination: '/blog/categoria/gestao', permanent: true },
      { source: '/blog/categoria/estacionamento', destination: '/blog/categoria/historico-veicular', permanent: true },
      { source: '/blog/categoria/frota', destination: '/blog/categoria/historico-veicular', permanent: true },
      { source: '/blog/categoria/guincho', destination: '/blog/categoria/historico-veicular', permanent: true },
      { source: '/blog/categoria/laudo', destination: '/blog/categoria/avarias-e-danos', permanent: true },
      { source: '/blog/categoria/locadora', destination: '/blog/categoria/historico-veicular', permanent: true },
      { source: '/blog/categoria/oficina', destination: '/blog/categoria/avarias-e-danos', permanent: true },
      { source: '/blog/categoria/operacao', destination: '/blog/categoria/vistoria', permanent: true },
      { source: '/blog/categoria/produtividade', destination: '/blog/categoria/vistoria', permanent: true },
      { source: '/blog/categoria/profissionalismo', destination: '/blog/categoria/vistoria', permanent: true },
      { source: '/blog/categoria/seguro', destination: '/blog/categoria/gestao', permanent: true },
      { source: '/blog/categoria/tecnologia', destination: '/blog/categoria/inteligencia', permanent: true },
      { source: '/blog/categoria/valet', destination: '/blog/categoria/vistoria', permanent: true },
      { source: '/blog/categoria/validade', destination: '/blog/categoria/avarias-e-danos', permanent: true },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Qualidades customizadas usadas por next/image (DiffCompareSection usa 85,
    // AiAssistantSection usa 92). Sem isso o Next emite warning de quality não configurada.
    qualities: [75, 85, 92],
    // Permite que next/image sirva imagens redimensionadas nos tamanhos usados
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 556],
  },
  outputFileTracingIncludes: {
    '/api/generate-pdf': [
      './node_modules/@sparticuz/chromium/**',
    ],
  },
  outputFileTracingExcludes: {
    '*': [
      './esc-skills-main/**',
      './videoforge/**',
      './remotion-danos-aparentes/**',
      './videos/**',
      './damage-model/**',
      './docs/**',
      './PDF/**',
      './outputs/**',
      './wireframes/**',
      './analysis/**',
      './deliverables/**',
      './.agents/**',
      './.claude/**',
      './.cursor/**',
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
})
