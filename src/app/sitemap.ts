import type { MetadataRoute } from 'next'
import { BLOG_POSTS, getCategories } from '@/src/content/blog'

const SITE_URL = 'https://danosaparentes.com.br'

// Rotas públicas indexáveis (exclui /app e /api). Mantém este array ao
// adicionar páginas novas para o sitemap acompanhar.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/planos', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/locadoras', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/oficinas', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/seguradoras', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/frotas', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sobre', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/demo', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/suporte', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/verify', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/termos', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacidade', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.updatedDate || p.date}T12:00:00`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  const categoryEntries: MetadataRoute.Sitemap = getCategories().map(c => ({
    url: `${SITE_URL}/blog/categoria/${c.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))
  return [...staticEntries, ...blogEntries, ...categoryEntries]
}
