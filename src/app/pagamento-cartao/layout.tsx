import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagamento com cartão | Danos Aparentes',
  description: 'Finalize sua assinatura do Danos Aparentes com cartão via Stripe.',
  alternates: { canonical: '/pagamento-cartao' },
  robots: { index: false, follow: false },
}

export default function PagamentoCartaoLayout({ children }: { children: React.ReactNode }) {
  return children
}
