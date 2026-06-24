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
import { Outfit } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import CookieConsentBanner from '@/src/components/CookieConsentBanner'
import AnalyticsScripts from '@/src/components/AnalyticsScripts'

const outfit = Outfit({ subsets: ['latin'], display: 'swap' })

const SITE_URL = 'https://danosaparentes.com.br'

export const metadata: Metadata = {
  title: 'Danos Aparentes — Vistoria Digital de Avarias Veiculares',
  description: 'Documente avarias veiculares com precisão pericial: mapa 3D do veículo, fotos por avaria, laudo em PDF com QR Code de verificação.',
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
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
    'vistoria veicular', 'danos aparentes', 'laudo de vistoria', 'inspeção de veículo',
    'avarias veiculares', 'PDF vistoria', 'PWA vistoria', 'software vistoria',
  ],

  // ── Open Graph ──────────────────────────────────────────────
  openGraph: {
    title: 'Danos Aparentes — Vistoria Digital de Avarias Veiculares',
    description: 'Documente avarias veiculares com precisão pericial: mapa 3D do veículo, fotos por avaria, laudo em PDF com QR Code de verificação.',
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
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preload" href="/logo.png" as="image" type="image/png" fetchPriority="high" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background: #020617;
            color: #e8f4ff;
          }
          .text-slate-400 {
            color: rgb(148, 163, 184);
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var isDark = localStorage.getItem('darkMode') !== 'false';
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
        <meta name="robots" content="index, follow" />

        {/* ── Marca d'água de autoria para indexadores ── */}
        <meta name="dc.creator" content="Danos Aparentes" />
        <meta name="dc.rights" content="Copyright 2026, Danos Aparentes. Lei 9.610/98 - Brasil." />
        <meta name="dc.language" content="pt-BR" />
        <meta name="dc.type" content="Software / Web Application" />
      </head>
      <body className={`${outfit.className} min-h-screen selection:bg-primary selection:text-white`}>
        {children}
        <CookieConsentBanner />
        <AnalyticsScripts />
        <SpeedInsights />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18259031185"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18259031185');
          `}
        </Script>
      </body>
    </html>
  )
}
