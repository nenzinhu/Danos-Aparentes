import { withSentryConfig } from '@sentry/nextjs'

/**
 * Cabeçalhos de segurança aplicados a todas as rotas.
 * A Vercel já envia HSTS (max-age=63072000); aqui reforçamos com includeSubDomains.
 * CSP fica de fora de propósito — exige inventário dos scripts de terceiros
 * (Meta Pixel, TikTok, Supabase, Vercel Analytics, Sentry, PostHog) para não quebrar o site.
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(self), microphone=(), payment=(), interest-cohort=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
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
