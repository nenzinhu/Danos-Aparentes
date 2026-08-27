import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategories, getCategoryDescription, getPostsByCategorySlug, mapCategory } from '@/src/content/blog'
import { BlogPostCard } from '@/src/components/BlogPostCard'

const SITE_URL = 'https://danosaparentes.com.br'

export function generateStaticParams() {
  return getCategories().map(c => ({ categoria: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>
}): Promise<Metadata> {
  const { categoria } = await params
  const posts = getPostsByCategorySlug(categoria)
  if (posts.length === 0) return {}
  const firstPost = posts[0]
  if (!firstPost) return {}
  const categoryName = mapCategory(firstPost.category)
  const title = `Artigos sobre ${categoryName} | Blog Danos Aparentes`
  const description = getCategoryDescription(categoryName)
  const url = `/blog/categoria/${categoria}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: ['/og-image.jpg'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  }
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const posts = getPostsByCategorySlug(categoria)
  if (posts.length === 0) notFound()
  const firstPost = posts[0]
  if (!firstPost) notFound()
  const categoryName = mapCategory(firstPost.category)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 2, name: categoryName, item: `${SITE_URL}/blog/categoria/${categoria}` },
    ],
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="w-full max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Blog
        </Link>

        <header className="mb-10">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Categoria
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            {categoryName}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--text-muted)] leading-relaxed">
            {getCategoryDescription(categoryName)}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map(post => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </main>
  )
}
