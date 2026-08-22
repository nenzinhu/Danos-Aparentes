import Link from 'next/link'
import type { BlogPost } from '@/src/content/blog'
import { formatDate, mapCategory, postCategorySlug } from '@/src/content/blog'
import { BlogCover } from './BlogCover'

// Card de post reutilizado no índice do blog, na seção "Do blog" da
// landing, em "Leia também" e nas páginas de categoria.
export function BlogPostCard({
  post,
  coverHeightClass = 'h-28',
}: {
  post: BlogPost
  coverHeightClass?: string
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block glass-card overflow-hidden transition-all hover:border-sky-500/40 focus-visible:ring-2 ring-[var(--primary)] outline-none"
    >
      <BlogCover cover={post.cover} className={coverHeightClass} emojiClass="text-4xl" />
      <div className="p-5">
        <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-[var(--signal-bright)]">
          {mapCategory(post.category)}
        </span>
        <h3 className="font-display text-lg font-bold leading-tight mt-1 text-[var(--text-main)] group-hover:text-[var(--primary-hover)] transition-colors">
          {post.title}
        </h3>
        <div className="mt-3 text-[0.68rem] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
          {post.readingMinutes} min · {formatDate(post.date)}
        </div>
      </div>
    </Link>
  )
}
