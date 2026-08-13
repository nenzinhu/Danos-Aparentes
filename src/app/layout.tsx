/*
 * ============================================================
 *  DANOS APARENTES — Plataforma Brasileira de Inteligência Histórica Veicular
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
import ChunkErrorReload from '@/src/components/ChunkErrorReload'

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

const SITE_URL = 'https://danosaparentes.com.br'

export const metadata: Metadata = {
  title: 'Danos Aparentes | Inteligência Histórica Veicular',
  description:
    'A primeira Plataforma Brasileira de Inteligência Histórica Veicular. Memória digital, evidências, linha do tempo e dossiês técnicos com IA.',
  metadataBase: new URL(SITE_URL),
  // Canonical da home. Páginas internas definem o seu próprio em
  // `alternates.canonical` — sempre adicione um ao criar rota nova.
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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

  // ── Autoria e Copyright ─────────────────────────────────────
  authors: [{ name: 'Danos Aparentes', url: SITE_URL }],
  creator: 'Danos Aparentes',
  publisher: 'Danos Aparentes',
  keywords: [
    'inteligência histórica veicular',
    'histórico de veículo',
    'memória digital do veículo',
    'evidências digitais',
    'dossiê técnico veicular',
    'linha do tempo veicular',
    'histórico de avarias',
    'plataforma de inspeção veicular',
    'controle de danos',
    'vistoria de veículos',
    'inspeção de veículos',
    'histórico de danos veiculares',
    'vistoria de locadora',
    'vistoria de frota',
    'comparação de avarias',
    'danos aparentes',
    'laudo de vistoria',
  ],

  // ── Open Graph ──────────────────────────────────────────────
  // NÃO definir `url` aqui: em Next.js o openGraph do layout raiz é
  // herdado pelas páginas filhas. Se `url` for a home, rotas como
  // /suporte e /privacidade ficam com canonical próprio + og:url=/ —
  // o GSC classifica como "Google escolheu canônico diferente".
  // Cada página define o próprio `openGraph.url` (ou herda só title/
  // description/images). A home usa `alternates.canonical: '/'`.
  // ── Open Graph ──────────────────────────────────────────────
  // `url: '/'` vale para a home (page.tsx é client e não exporta metadata).
  // Páginas internas DEVEM sobrescrever `openGraph.url` junto com o
  // canonical — senão o GSC vê canônico próprio + og:url=/ e reporta
  // "Google escolheu canônico diferente" (caso /suporte e /privacidade).
  openGraph: {
    title: 'Danos Aparentes | Inteligência Histórica Veicular',
    description:
      'A primeira Plataforma Brasileira de Inteligência Histórica Veicular. Memória digital, evidências, linha do tempo e dossiês com IA.',
    url: '/',
    siteName: 'Danos Aparentes',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Danos Aparentes — Inteligência Histórica Veicular',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },

  // ── Twitter / X ─────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Danos Aparentes | Inteligência Histórica Veicular',
    description:
      'A primeira Plataforma Brasileira de Inteligência Histórica Veicular. Memória digital, evidências, linha do tempo e dossiês com IA.',
    images: ['/og-image.jpg'],
  },

  // ── Ícones ──────────────────────────────────────────────────
  // ?v= força o Safari/iOS a buscar de novo em vez de usar o apple-touch-icon
  // em cache — bump esse valor sempre que o arquivo do ícone mudar.
  // Google Search: ícone quadrado crawlável, preferência >48px (favicon-48.png).
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
        {/* ── DNS-prefetch para scripts de terceiros (não-bloqueantes) ─── */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://cdn.posthog.com" />

        {/* ── LCP: preload do SVG da logo que é o elemento LCP real ──────
            O Lighthouse identificou /brand/logo-full.svg como LCP.
            Preloading como fetch + tipo correto garante descoberta imediata. */}
        <link rel="preload" href="/brand/logo-full.svg" as="image" type="image/svg+xml" fetchPriority="high" />
        {/* Mantém preload da logo.png para fallbacks e outros usos */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
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
        <meta name="author" content="Danos Aparentes" />
        <meta name="copyright" content="© 2026 Danos Aparentes. Todos os direitos reservados." />
        <meta name="rights" content="Protegido pela Lei 9.610/98 — Lei de Direitos Autorais do Brasil." />
        <meta name="generator" content="Danos Aparentes PWA v1.0" />
        <meta name="application-name" content="Danos Aparentes" />
        {/* robots: usar Metadata API (layout/páginas). Não hardcodar
            index,follow aqui — sobrescreve noindex de /pagamento-pix etc. */}

        {/* ── Marca d'água de autoria para indexadores ── */}
        <meta name="dc.creator" content="Danos Aparentes" />
        <meta name="dc.rights" content="Copyright 2026, Danos Aparentes. Lei 9.610/98 - Brasil." />
        <meta name="dc.language" content="pt-BR" />
        <meta name="dc.type" content="Software / Web Application" />

        {/* ── Organization + WebSite (Knowledge Graph) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${SITE_URL}/#organization`,
                  name: 'Danos Aparentes',
                  url: SITE_URL,
                  logo: `${SITE_URL}/logo-full.png`,
                  image: `${SITE_URL}/og-image.jpg`,
                  sameAs: [
                    'https://www.linkedin.com/company/danosaparentes',
                    'https://www.instagram.com/danosaparentes',
                    'https://www.youtube.com/@danosaparentes',
                    'https://x.com/danosaparentes',
                    'https://www.facebook.com/danosaparentes',
                  ],
                  description:
                    'Histórico digital do veículo: registre, compare e comprove o estado com fotos, avarias, evidências e relatórios organizados em cada vistoria.',
                  foundingDate: '2025',
                  founder: {
                    '@type': 'Person',
                    name: 'Jeferson',
                    jobTitle: 'Proprietário',
                    sameAs: [
                      'https://www.linkedin.com/in/jeferson-danosaparentes',
                      'https://www.instagram.com/jeferson.danosaparentes',
                    ],
                  },
                  contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'suporte@danosaparentes.com.br',
                    telephone: '+554****2348',
                    contactType: 'customer support',
                    areaServed: 'BR',
                    availableLanguage: ['Portuguese'],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: 'Danos Aparentes',
                  inLanguage: 'pt-BR',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                },
                {
                  '@type': 'SoftwareApplication',
                  '@id': `${SITE_URL}/#webapp`,
                  name: 'Danos Aparentes',
                  url: SITE_URL,
                  applicationCategory: 'BusinessApplication',
                  applicationSubCategory: 'Inteligência Histórica Veicular',
                  operatingSystem: 'Web',
                  inLanguage: 'pt-BR',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'BRL',
                    url: `${SITE_URL}/planos`,
                  },
                  publisher: { '@id': `${SITE_URL}/#organization` },
                  description:
                    'Plataforma brasileira para registrar, comparar e comprovar o histórico de veículos com fotos, avarias, evidências e laudos técnicos assistidos por IA.',
                },
                {
                  '@type': 'WebPage',
                  '@id': `${SITE_URL}/#webpage`,
                  url: SITE_URL,
                  name: 'Danos Aparentes | Inteligência Histórica Veicular',
                  isPartOf: { '@id': `${SITE_URL}/#website` },
                  about: { '@id': `${SITE_URL}/#organization` },
                  primaryImageOfPage: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/og-image.jpg`,
                    width: 1200,
                    height: 630,
                  },
                  inLanguage: 'pt-BR',
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${outfit.variable} ${outfit.className} ${sairaCondensed.variable} ${plexMono.variable} min-h-screen selection:bg-primary selection:text-white`}>
        {children}
        <ChunkErrorReload />
        <CookieConsentBanner />
        <AnalyticsScripts />
        <SpeedInsights />
      </body>
    </html>
  )
}
