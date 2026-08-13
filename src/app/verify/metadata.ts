import type { Metadata } from 'next'
import { SITE_URL } from '@/src/lib/seo'

// Página pública de verificação de dossiê — canonical explícito
// (recomendação de auditoria: canonical em todas as páginas públicas).
export const metadata: Metadata = {
  title: 'Verificar autenticidade do dossiê | Danos Aparentes',
  description:
    'Verifique a autenticidade de um dossiê de vistoria Danos Aparentes: hash SHA-256, assinatura e QR Code validados publicamente.',
  alternates: { canonical: '/verify' },
  openGraph: {
    title: 'Verificar autenticidade do dossiê | Danos Aparentes',
    description:
      'Verificação pública de dossiês de vistoria com hash, assinatura e QR Code.',
    url: '/verify',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}
