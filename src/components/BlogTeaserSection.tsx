import Link from 'next/link'
import { BLOG_POSTS } from '@/src/content/blog'
import { BlogPostCard } from './BlogPostCard'

// Seção "Do blog" na landing: puxa visitantes para os artigos e cria
// links internos (bom para SEO). Mostra os 3 posts mais recentes.
export default function BlogTeaserSection() {
  const posts = BLOG_POSTS.slice(0, 3)
  if (posts.length === 0) return null

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <span className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-3">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Do blog
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Vistoria sem achismo
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-3 max-w-xl">
            Conhecimento para quem transforma vistorias em evidências e histórico veicular
            confiável.
          </p>
        </div>
        <Link
          href="/blog"
          className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Ver o blog →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map(post => (
          <BlogPostCard key={post.slug} post={post} coverHeightClass="h-32" />
        ))}
      </div>
    </section>
  )
}
