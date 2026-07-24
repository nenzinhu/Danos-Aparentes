import type { Metadata } from 'next'

// A página /verify é client component e não pode exportar metadata.
// Este layout fornece título, descrição e canonical próprios para SEO.
export const metadata: Metadata = {
  title: 'Verificação de Laudo | Danos Aparentes',
  description:
    'Verifique a autenticidade de um laudo de vistoria do Danos Aparentes pelo código ou QR Code e confirme que o documento não foi adulterado.',
  alternates: { canonical: '/verify' },
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children
}
