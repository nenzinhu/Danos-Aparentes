import type { Metadata } from 'next'

// A página /demo é client component e não pode exportar metadata.
// Este layout fornece título, descrição e canonical próprios para SEO.
export const metadata: Metadata = {
  title: 'Demonstração | Danos Aparentes — Vistoria Digital',
  description:
    'Veja na prática como funciona a vistoria veicular do Danos Aparentes: marque avarias no diagrama do veículo, anexe fotos e gere o laudo em PDF com QR Code.',
  alternates: { canonical: '/demo' },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
