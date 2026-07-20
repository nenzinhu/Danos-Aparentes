/*
 * ============================================================
 *  DANOS APARENTES — Sistema de Vistoria Veicular
 *  © 2026 Todos os direitos reservados.
 *
 *  Obra protegida pela Lei 9.610/98 (Lei de Direitos Autorais).
 *  Registro de Programa de Computador — INPI (pendente).
 *
 *  É expressamente proibido:
 *  - Reproduzir, copiar ou distribuir este código-fonte;
 *  - Realizar engenharia reversa, decompilação ou desmontagem;
 *  - Comercializar, sublicenciar ou transferir sem autorização.
 *
 *  Violações sujeitam o infrator às sanções previstas na
 *  Lei 9.279/96, Lei 9.610/98 e Código Penal Brasileiro.
 * ============================================================
 */
import { Outfit, Saira_Condensed, IBM_Plex_Mono } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import CookieConsentBanner from '@/src/components/CookieConsentBanner'
import AnalyticsScripts from '@/src/components/AnalyticsScripts'
import {
  FOUNDER_NAME,
  SITE_URL,
  organizationJsonLd,
  personJsonLd,
  websiteJsonLd,
} from '@/src/lib/seo/entity'

const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-outfit' })
const sairaCondensed = Saira_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono-data',
})

export const metadata: Metadata = {
  title: 'Danos Aparentes — Vistoria Digital de Avarias Veiculares',
  description: 'Vistoria veicular digital: marque avarias no diagrama do veículo, anexe fotos com GPS e gere o laudo em PDF com hash e QR Code. Teste grátis.',
  metadataBase: new URL(SITE_URL),
  // Canonical da home. Páginas internas definem o seu próprio em
  // `alternates.canonical` — sempre adicione um ao criar rota nova.
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  verification: {
    yandex: '63c44acce9c82466',
    other: { 'msvalidate.01': '1244E8D097B04D299E7DDB8CD4BFDEEB' },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Danos Aparentes',
  },
  robots: { index: true, follow: true },

  // ── Autoria e Copyright ─────────────────────────────────────
  authors: [{ name: FOUNDER_NAME, url: `${SITE_URL}/sobre` }],
  creator: FOUNDER_NAME,
  publisher: 'Danos Aparentes',
  keywords: [
    'vistoria veicular', 'danos aparentes', 'laudo de vistoria', 'inspeção de veículo',
    'avarias veiculares', 'PDF vistoria', 'PWA vistoria', 'software vistoria',
  ],

  // ── Open Graph ──────────────────────────────────────────────
  openGraph: {
    title: 'Danos Aparentes — Vistoria Digital de Avarias Veiculares',
    description: 'Vistoria veicular digital: marque avarias no diagrama do veículo, anexe fotos com GPS e gere o laudo em PDF com hash e QR Code. Teste grátis.',
    url: SITE_URL,
    siteName: 'Danos Aparentes',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Danos Aparentes — Vistoria Digital',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },

  // ── Twitter / X ─────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Danos Aparentes — Vistoria Digital de Avarias Veiculares',
    description: 'Documente avarias veiculares com precisão pericial.',
    images: ['/og-image.jpg'],
  },

  // ── Ícones ──────────────────────────────────────────────────
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
    { color: '#020617' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root { color-scheme: dark; }
          html.light { color-scheme: light; }
          body {
            background: #020617;
            color: #e8f4ff;
          }
          html.light body {
            background: #faf9f5;
            color: #141413;
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var saved = localStorage.getItem('darkMode');
              var isDark = saved !== null ? saved !== 'false' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (!isDark) {
                document.documentElement.classList.add('light');
              } else {
                document.documentElement.classList.remove('light');
              }
            } catch (e) {}
          })();
        `}} />
        {/* ── Meta tags de Autoria e Direito Autoral ── */}
        <meta name="author" content={FOUNDER_NAME} />
        <meta name="copyright" content="© 2026 Danos Aparentes. Todos os direitos reservados." />
        <meta name="rights" content="Protegido pela Lei 9.610/98 — Lei de Direitos Autorais do Brasil." />
        <meta name="generator" content="Danos Aparentes PWA v1.0" />
        <meta name="application-name" content="Danos Aparentes" />

        {/* ── Marca d'água de autoria para indexadores ── */}
        <meta name="dc.creator" content={FOUNDER_NAME} />
        <meta name="dc.rights" content="Copyright 2026, Danos Aparentes. Lei 9.610/98 - Brasil." />
        <meta name="dc.language" content="pt-BR" />
        <meta name="dc.type" content="Software / Web Application" />

        {/* ── Knowledge Graph / GEO — Organization + Person + WebSite ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${outfit.className} ${sairaCondensed.variable} ${plexMono.variable} min-h-screen selection:bg-primary selection:text-white`}>
        {children}
        <CookieConsentBanner />
        <AnalyticsScripts />
        <SpeedInsights />
      </body>
    </html>
  )
}
