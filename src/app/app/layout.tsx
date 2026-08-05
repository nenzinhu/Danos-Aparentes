import type { Metadata } from 'next'

/** App autenticado — utilitário, não deve competir com a home no índice. */
export const metadata: Metadata = {
  title: 'App | Danos Aparentes',
  description: 'Painel de vistoria veicular digital.',
  robots: { index: false, follow: false },
  // Evita herdar canonical "/" do layout raiz (sinal errado para o Google).
  alternates: { canonical: '/app' },
}

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
