import type { Metadata } from 'next'

// Assinatura remota por token — página utilitária/privada, sem valor de busca.
export const metadata: Metadata = {
  title: 'Assinar Laudo | Danos Aparentes',
  description: 'Assinatura digital remota do laudo de vistoria.',
  robots: { index: false, follow: false },
}

export default function AssinarLayout({ children }: { children: React.ReactNode }) {
  return children
}
