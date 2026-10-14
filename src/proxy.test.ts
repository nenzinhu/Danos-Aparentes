import { describe, expect, it } from 'vitest'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { config, proxy } from './proxy'

describe('maintenance proxy', () => {
  it('returns 503 for API requests while maintenance is active', async () => {
    const response = await proxy(new NextRequest('https://danosaparentes.com.br/api/reliability'))

    expect(response.status).toBe(503)
    expect(response.headers.get('retry-after')).toBe('3600')
  })

  it('returns 503 for the API root while maintenance is active', async () => {
    const response = await proxy(new NextRequest('https://danosaparentes.com.br/api'))

    expect(response.status).toBe(503)
  })

  it('rewrites internal pages to the maintenance home', async () => {
    const response = await proxy(new NextRequest('https://danosaparentes.com.br/app'))

    expect(response.headers.get('x-middleware-rewrite')).toBe('https://danosaparentes.com.br/')
  })

  it('allows the maintenance home to render', async () => {
    const response = await proxy(new NextRequest('https://danosaparentes.com.br/'))

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('allows only the static assets required by the maintenance shell', async () => {
    const favicon = await proxy(new NextRequest('https://danosaparentes.com.br/favicon.ico'))
    const logo = await proxy(new NextRequest('https://danosaparentes.com.br/brand/logo-full-dark.svg'))

    expect(favicon.headers.get('x-middleware-next')).toBe('1')
    expect(logo.headers.get('x-middleware-next')).toBe('1')
  })

  it('keeps dotted API paths inside the maintenance matcher', () => {
    expect(unstable_doesMiddlewareMatch({
      config,
      nextConfig: {},
      url: '/api/vehicles/report.svg',
    })).toBe(true)
    expect(unstable_doesMiddlewareMatch({
      config,
      nextConfig: {},
      url: '/historico/report.svg',
    })).toBe(true)
  })
})
