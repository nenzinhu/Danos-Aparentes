import type { Metadata } from 'next'

const TITLE = 'Verificação de Dossiê Técnico | Danos Aparentes'
const DESCRIPTION =
  'Verifique a autenticidade de um dossiê técnico do Danos Aparentes pelo código ou QR Code e confirme que o documento não foi adulterado.'

// A página /verify é client component e não pode exportar metadata.
// Este layout fornece título, descrição, canonical e OG próprios para SEO.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/verify' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/verify',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children
}
