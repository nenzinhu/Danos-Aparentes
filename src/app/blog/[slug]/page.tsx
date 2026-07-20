import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS, getPost, getRelatedPosts, categorySlug, formatDate, Cta } from '@/src/content/blog'
import { BlogCover } from '@/src/components/BlogCover'
import { BlogPostCard } from '@/src/components/BlogPostCard'
import ShareBar from '@/src/components/ShareBar'
import {
  ORG_ID,
  SITE_URL,
  blogAuthorJsonLd,
} from '@/src/lib/seo/entity'

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const url = `/blog/${post.slug}`
  return {
    title: `${post.title} | Blog Danos Aparentes`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      images: ['/og-image.jpg'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: ['/og-image.jpg'] },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const relatedPosts = getRelatedPosts(post)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    ...(post.cover.image ? { image: `${SITE_URL}${post.cover.image}` } : {}),
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: blogAuthorJsonLd,
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    keywords: post.tags.join(', '),
    inLanguage: 'pt-BR',
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 2, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  }
  const howToJsonLd = post.howTo && {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.howTo.name,
    description: post.excerpt,
    inLanguage: 'pt-BR',
    step: post.howTo.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
  const faqJsonLd = post.faq && post.faq.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {howToJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      )}
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="w-full max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] mb-6" aria-label="Trilha">
          <Link href="/blog" className="hover:text-[var(--text-main)] transition-colors">← Blog</Link>
        </nav>

        {/* Capa */}
        <BlogCover cover={post.cover} className="h-40 sm:h-56 rounded-2xl mb-7" emojiClass="text-7xl">
          <Link
            href={`/blog/categoria/${categorySlug(post.category)}`}
            className="cover-badge absolute top-4 left-4 text-[0.62rem] font-extrabold uppercase tracking-widest bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            {post.category}
          </Link>
        </BlogCover>

        {/* Cabeçalho do artigo */}
        <header className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold leading-[1.05] tracking-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-[0.7rem] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
            <span>{post.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(post.date)}</span>
            {post.updatedDate && post.updatedDate !== post.date && (
              <>
                <span aria-hidden="true">·</span>
                <span>Atualizado em {formatDate(post.updatedDate)}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min de leitura</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10 items-start">
          {/* Conteúdo */}
          <article
            className="
              max-w-none order-2 lg:order-1
              [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-[var(--text-main)] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-24
              [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-[var(--text-main)] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:scroll-mt-24
              [&_p]:text-[0.95rem] [&_p]:leading-[1.75] [&_p]:text-[var(--text-muted)] [&_p]:mb-4
              [&_.blog-cta_h3]:!text-white [&_.blog-cta_p.blog-cta-body]:!text-slate-300 [&_.blog-cta_p.blog-cta-eyebrow]:!text-amber-400
              [&_ul]:my-4 [&_ul]:space-y-2 [&_ul]:pl-1
              [&_ol]:my-4 [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:list-decimal
              [&_li]:relative [&_li]:pl-6 [&_li]:text-[0.95rem] [&_li]:leading-[1.7] [&_li]:text-[var(--text-muted)]
              [&_ol>li]:pl-1 [&_ol>li]:before:content-none
              [&_li]:before:content-['▹'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-[var(--signal-bright)] [&_li]:before:font-bold
              [&_strong]:text-[var(--text-main)] [&_strong]:font-semibold
              [&_em]:text-[var(--text-main)] [&_em]:not-italic [&_em]:font-medium
              [&_a]:text-[var(--primary)] [&_a]:font-semibold [&_a]:underline [&_a]:decoration-[var(--primary)]/30 hover:[&_a]:decoration-[var(--primary)] [&_a]:underline-offset-2 [&_a]:transition-colors
              [&_.blog-cta_a]:!text-white [&_.blog-cta_a]:no-underline
            "
          >
            {post.content}

            {post.faq && post.faq.length > 0 && (
              <section aria-labelledby="faq">
                <h2 id="faq">Perguntas frequentes</h2>
                {post.faq.map(item => (
                  <div key={item.question}>
                    <h3 id={item.question
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')
                      .slice(0, 60)}
                    >
                      {item.question}
                    </h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </section>
            )}
          </article>

          {/* Sumário (sticky no desktop) */}
          <aside className="hidden lg:block order-1 lg:order-2 sticky top-24">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mb-3">Neste artigo</p>
            <nav className="flex flex-col gap-2 border-l border-[var(--card-border)] pl-4">
              {post.toc.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors leading-snug"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
        </div>

        {/* CTA de fechamento — reforço final antes de "Leia também" */}
        <Cta />

        {/* Relacionados */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[var(--card-border)]">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Leia também
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map(related => (
                <BlogPostCard key={related.slug} post={related} />
              ))}
            </div>
          </div>
        )}

        {/* Partilha + contato */}
        <div className="mt-12 pt-6 border-t border-[var(--card-border)]">
          <ShareBar title={post.title} />
        </div>

        {/* Tags + rodapé */}
        <div className="mt-10 pt-6 border-t border-[var(--card-border)]">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="text-[0.68rem] font-bold text-[var(--text-muted)] bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] rounded-full px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
            ← Ver todos os artigos
          </Link>
        </div>
      </div>
    </main>
  )
}
