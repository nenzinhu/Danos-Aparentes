import type { Metadata } from 'next'
import Link from 'next/link'
import { BLOG_POSTS, formatDate } from '@/src/content/blog'
import { BlogCover } from '@/src/components/BlogCover'
import { BlogPostCard } from '@/src/components/BlogPostCard'

const TITLE = 'Blog | Danos Aparentes'
const DESCRIPTION =
  'Guias práticos de vistoria veicular, laudos de avarias, checklists e boas práticas para locadoras, seguradoras, despachantes e concessionárias.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/blog', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

export default function BlogIndexPage() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="mb-10">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Blog
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Vistoria sem achismo
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-3 max-w-xl">
            Guias diretos sobre laudos, avarias e processos de vistoria — para quem registra danos no
            pátio e precisa de prova que não se contesta.
          </p>
        </header>

        {/* Artigo em destaque */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block glass-card overflow-hidden mb-8 transition-all hover:border-sky-500/40 focus-visible:ring-2 ring-[var(--primary)] outline-none"
          >
            <BlogCover cover={featured.cover} className="h-44 sm:h-52">
              <span className="cover-badge absolute top-4 left-4 text-[0.62rem] font-extrabold uppercase tracking-widest bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                {featured.category}
              </span>
              <span className="absolute top-4 right-4 text-[0.6rem] font-bold uppercase tracking-wider bg-[var(--signal-bright)] text-black px-2.5 py-1 rounded-full">
                Destaque
              </span>
            </BlogCover>
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold leading-tight text-[var(--text-main)] group-hover:text-[var(--primary-hover)] transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">{featured.excerpt}</p>
              <div className="flex items-center gap-3 mt-4 text-[0.7rem] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
                <span>{formatDate(featured.date)}</span>
                <span aria-hidden="true">·</span>
                <span>{featured.readingMinutes} min de leitura</span>
              </div>
            </div>
          </Link>
        )}

        {/* Demais artigos */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map(post => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Mais guias a caminho. Quer um tema específico?{' '}
              <Link href="/suporte" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                Sugira pelo suporte
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
