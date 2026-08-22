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
  { path: '', priority: 1.0, changeFrequency: 'weekly', lastModified: '2026-08-04' },
  { path: '/planos', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-08-04' },
  { path: '/locadoras', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-25' },
  { path: '/historico', priority: 0.95, changeFrequency: 'weekly', lastModified: '2026-08-02' },
  { path: '/historico-de-frotas', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-08-03' },
  { path: '/oficinas', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/seguradoras', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/frotas', priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-07-12' },
  { path: '/sobre', priority: 0.7, changeFrequency: 'monthly', lastModified: '2026-08-04' },
  { path: '/imprensa', priority: 0.55, changeFrequency: 'monthly', lastModified: '2026-08-03' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-08-04' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly', lastModified: '2026-07-23' },
  { path: '/demo', priority: 0.7, changeFrequency: 'monthly', lastModified: '2026-07-12' },
  { path: '/suporte', priority: 0.6, changeFrequency: 'monthly', lastModified: '2026-07-01' },
  { path: '/depoimentos', priority: 0.75, changeFrequency: 'monthly', lastModified: '2026-08-06' },
  { path: '/termos', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-15' },
  { path: '/privacidade', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-15' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const homeImages = [
    `${SITE_URL}/og-image.jpg`,
    `${SITE_URL}/Laudo/laudo-vistoria-diagrama-avarias.webp`,
    `${SITE_URL}/Laudo/laudo-evidencias-hash-qr.webp`,
    `${SITE_URL}/exemplo-laudo-pdf-marca.webp`,
    `${SITE_URL}/identidade-empresa-config-pdf.webp`,
  ]

  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(`${r.lastModified}T12:00:00`),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    ...(r.path === '' ? { images: homeImages } : {}),
  }))
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.updatedDate || p.date}T12:00:00`),
    changeFrequency: 'monthly',
    priority: 0.7,
    ...(p.cover.image
      ? { images: [`${SITE_URL}${p.cover.image}`] }
      : {}),
  }))
  const categoryEntries: MetadataRoute.Sitemap = getCategories().map(c => ({
    url: `${SITE_URL}/blog/categoria/${c.slug}`,
    lastModified: new Date('2026-07-23T12:00:00'),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))
  return [...staticEntries, ...blogEntries, ...categoryEntries]
}
