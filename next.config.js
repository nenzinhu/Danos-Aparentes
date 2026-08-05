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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
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
