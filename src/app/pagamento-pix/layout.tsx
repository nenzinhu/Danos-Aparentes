import type { Metadata } from 'next'

// Checkout PIX — utilitário de conversão, não página de busca.
// noindex evita thin/duplicate content herdado do layout raiz.
export const metadata: Metadata = {
  title: 'Pagamento PIX | Danos Aparentes',
  description: 'Finalize sua assinatura do Danos Aparentes via PIX.',
  alternates: { canonical: '/pagamento-pix' },
  robots: { index: false, follow: false },
}

export default function PagamentoPixLayout({ children }: { children: React.ReactNode }) {
  return children
}
