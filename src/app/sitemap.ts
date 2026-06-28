import type { MetadataRoute } from 'next'

const SITE_URL = 'https://danosaparentes.com.br'

// Rotas públicas indexáveis (exclui /app e /api). Mantém este array ao
// adicionar páginas novas (ex.: /blog) para o sitemap acompanhar.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/demo', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/suporte', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/verify', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/termos', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacidade', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
