import Link from 'next/link'
import { BLOG_POSTS, formatDate } from '@/src/content/blog'
import { BlogCover } from './BlogCover'

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
            Guias de vistoria e laudo
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-3 max-w-xl">
            Conteúdo direto para quem registra avarias no pátio: laudos, checklists e boas práticas que
            evitam contestação.
          </p>
        </div>
        <Link
          href="/blog"
          className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block glass-card overflow-hidden transition-all hover:border-sky-500/40 focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <BlogCover cover={post.cover} className="h-32" emojiClass="text-4xl" />
            <div className="p-5">
              <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-[var(--signal-bright)]">
                {post.category}
              </span>
              <h3 className="font-display text-lg font-bold leading-tight mt-1 text-[var(--text-main)] group-hover:text-[var(--primary-hover)] transition-colors">
                {post.title}
              </h3>
              <div className="mt-3 text-[0.68rem] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
                {post.readingMinutes} min · {formatDate(post.date)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
