// Utilitário central de SEO — URL canonica do site e helpers de metadados.
// Centraliza SITE_URL para evitar duplicação e garantir canonical consistente
// em todas as rotas públicas (recomendação de auditoria SEO/GEO/AEO).

export const SITE_URL = 'https://danosaparentes.com.br'

export const SITE_NAME = 'Danos Aparentes'

/** Constrói URL canônica absoluta a partir de um path relativo. */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean}`
}

/**
 * Helper para gerar `alternates.canonical` + `openGraph.url` consistentes.
 * Uso em qualquer `export const metadata` de página:
 *   ...withCanonical('/sobre')
 */
export function withCanonical(path: string) {
  return {
    alternates: { canonical: path },
    openGraph: { url: path },
  }
}
