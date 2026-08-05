import type { Metadata } from 'next'

const TITLE = 'Demonstração | Danos Aparentes — Vistoria Digital'
const DESCRIPTION =
  'Veja na prática como funciona a vistoria veicular do Danos Aparentes: marque avarias no diagrama do veículo, anexe fotos e gere o laudo em PDF com QR Code.'

// A página /demo é client component e não pode exportar metadata.
// Este layout fornece título, descrição, canonical e OG próprios para SEO.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/demo' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/demo',
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

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
