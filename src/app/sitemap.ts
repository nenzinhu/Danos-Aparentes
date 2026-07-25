import type { MetadataRoute } from 'next'
import { BLOG_POSTS, getCategories } from '@/src/content/blog'

const SITE_URL = 'https://danosaparentes.com.br'

// lastModified fixo por rota — evita lastmod "sempre hoje" em páginas estáticas
// que raramente mudam (dilui o sinal de frescor real no sitemap).
const ROUTES: {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  lastModified: string
}[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly', lastModified: '2026-07-24' },
  { path: '/planos', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/locadoras', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-25' },
  { path: '/oficinas', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/seguradoras', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/frotas', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/sobre', priority: 0.7, changeFrequency: 'monthly', lastModified: '2026-07-24' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-07-12' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-07-23' },
  { path: '/demo', priority: 0.7, changeFrequency: 'monthly', lastModified: '2026-07-12' },
  { path: '/suporte', priority: 0.6, changeFrequency: 'monthly', lastModified: '2026-07-01' },
  { path: '/verify', priority: 0.5, changeFrequency: 'monthly', lastModified: '2026-07-01' },
  { path: '/termos', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-15' },
  { path: '/privacidade', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-15' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(`${r.lastModified}T12:00:00`),
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
    lastModified: new Date('2026-07-23T12:00:00'),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))
  return [...staticEntries, ...blogEntries, ...categoryEntries]
}
