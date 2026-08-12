/**
 * BreadcrumbList estruturado (Schema.org) — reutilizável.
 * Melhora a exibição de trilha no Google e reforça a arquitetura de URLs.
 * Não inventa dados: recebe a trilha exata da página.
 */
const SITE_URL = 'https://danosaparentes.com.br'

export default function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
