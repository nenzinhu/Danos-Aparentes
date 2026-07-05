# Blog SEO Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three SEO on-page improvements to the existing 24-post blog — a real named author in structured data, related-posts links, and category archive pages — using only data that already exists in `BLOG_POSTS`.

**Architecture:** All new logic lives in `src/content/blog.tsx` (the single data/helper module the blog already uses). A new shared `BlogPostCard` component replaces duplicated card markup in two existing files and is reused by the two new UI surfaces (related posts, category page). One new dynamic route (`/blog/categoria/[categoria]`) is added, statically generated from the categories already present in the post data.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS. No test runner is configured in this repo (no Jest/Vitest/Playwright — checked `package.json`, confirmed no `test` script and no test files under `src/`).

## Global Constraints

- No test framework exists in this project. Do NOT add one for this plan (out of scope — see spec's "Fora de escopo"). Verify each task with `npx tsc --noEmit` (type check) and manual verification via `npm run dev` in the browser. The final task additionally runs `npm run build` to confirm the new static routes generate correctly.
- Site URL is `https://danosaparentes.com.br` (already hardcoded as `SITE_URL` in `src/app/sitemap.ts` and `src/app/blog/[slug]/page.tsx` — reuse the same literal, don't introduce a new constant).
- Post dates in `BLOG_POSTS` are ISO `YYYY-MM-DD` strings — lexicographic string comparison is valid for sorting by date, no `Date` parsing needed.
- Follow the import style already used in each file being edited: files under `src/app/**` import via the `@/src/...` alias; `src/components/BlogTeaserSection.tsx` imports `BlogCover` via the relative `./BlogCover` — match whichever convention the file you're touching already uses.
- Do not make a category badge a `<Link>` when it sits inside a card that is already wrapped in a `<Link>` to the post (nested anchors are invalid HTML and break click behavior). Only `src/app/blog/[slug]/page.tsx`'s cover badge (not inside any Link) becomes a category link.

---

### Task 1: Extract shared `BlogPostCard` component

**Files:**
- Create: `src/components/BlogPostCard.tsx`
- Modify: `src/app/blog/page.tsx:74-91`
- Modify: `src/components/BlogTeaserSection.tsx` (whole file, 60 lines)

**Interfaces:**
- Produces: `BlogPostCard({ post, coverHeightClass }: { post: BlogPost; coverHeightClass?: string })` — a `<Link>`-wrapped card (cover + category text + title + reading time/date). Default `coverHeightClass` is `'h-28'`. Used directly by Tasks 4 and 5 (they don't exist yet, but they will import this).
- Consumes: `BlogPost` type and `formatDate` from `@/src/content/blog`; `BlogCover` from `./BlogCover`.

- [ ] **Step 1: Create `src/components/BlogPostCard.tsx`**

```tsx
import Link from 'next/link'
import type { BlogPost } from '@/src/content/blog'
import { formatDate } from '@/src/content/blog'
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
  )
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `BlogPostCard.tsx`.

- [ ] **Step 3: Replace the "rest of posts" grid in `src/app/blog/page.tsx`**

Find this block (currently lines 74-91):

```tsx
        {/* Demais artigos */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block glass-card overflow-hidden transition-all hover:border-sky-500/40 focus-visible:ring-2 ring-[var(--primary)] outline-none"
              >
                <BlogCover cover={post.cover} className="h-28" emojiClass="text-4xl" />
                <div className="p-5">
                  <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-[var(--signal-bright)]">{post.category}</span>
                  <h3 className="font-display text-lg font-bold leading-tight mt-1 group-hover:text-[var(--primary-hover)] transition-colors">{post.title}</h3>
                  <div className="mt-3 text-[0.68rem] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
                    {post.readingMinutes} min · {formatDate(post.date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
```

Replace it with:

```tsx
        {/* Demais artigos */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map(post => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
```

Then add the import (alongside the existing `BlogCover` import near the top of the file):

```tsx
import { BlogPostCard } from '@/src/components/BlogPostCard'
```

`BlogCover` and `formatDate` are still imported and used by the featured-post block above this — do not remove those imports.

- [ ] **Step 4: Replace the grid in `src/components/BlogTeaserSection.tsx`**

Replace the entire file content with:

```tsx
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
          <BlogPostCard key={post.slug} post={post} coverHeightClass="h-32" />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/blog` and `http://localhost:3000/` (scroll to "Do blog" section).
Expected: both look identical to before the refactor — same card layout, cover heights, category label, title, reading time/date. Clicking a card still navigates to the post.

- [ ] **Step 7: Commit**

```bash
git add src/components/BlogPostCard.tsx src/app/blog/page.tsx src/components/BlogTeaserSection.tsx
git commit -m "refactor(blog): extract shared BlogPostCard component"
```

---

### Task 2: Author → "Jeferson" + `Person` schema

**Files:**
- Modify: `src/content/blog.tsx` (24 occurrences of the author literal)
- Modify: `src/app/blog/[slug]/page.tsx:49`

**Interfaces:**
- Consumes: none new.
- Produces: `post.author.name === 'Jeferson'` for all 24 posts — Task 3's related-posts UI and Task 1's `BlogPostCard` already render `post.author` nowhere directly (only `[slug]/page.tsx` renders the byline), so no other task depends on this value's shape, only that it stays a `{ name: string; role: string }` object.

- [ ] **Step 1: Replace the author literal in `src/content/blog.tsx`**

Every one of the 24 posts currently has this exact line:

```
    author: { name: 'Equipe Danos Aparentes', role: 'Vistoria digital' },
```

Run:

```bash
sed -i "s/author: { name: 'Equipe Danos Aparentes', role: 'Vistoria digital' },/author: { name: 'Jeferson', role: 'Vistoria digital' },/g" src/content/blog.tsx
```

- [ ] **Step 2: Verify the replacement count**

Run: `grep -c "name: 'Jeferson'" src/content/blog.tsx`
Expected: `24`

Run: `grep -c "Equipe Danos Aparentes" src/content/blog.tsx`
Expected: `0`

- [ ] **Step 3: Update the JSON-LD author in `src/app/blog/[slug]/page.tsx`**

Find (line 49):

```tsx
    author: { '@type': 'Organization', name: post.author.name },
```

Replace with:

```tsx
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: 'Proprietário',
      worksFor: { '@type': 'Organization', name: 'Danos Aparentes' },
    },
```

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual check**

Run: `npm run dev`, open any post (e.g. `http://localhost:3000/blog/vistoria-de-frota-padronizar-equipe`).
Expected: byline under the title reads "Jeferson" instead of "Equipe Danos Aparentes". View page source and confirm the `application/ld+json` script tag's `author` object has `"@type":"Person"` and `"jobTitle":"Proprietário"`.

- [ ] **Step 6: Commit**

```bash
git add src/content/blog.tsx src/app/blog/[slug]/page.tsx
git commit -m "feat(blog): assina posts como Jeferson e usa schema Person (E-E-A-T)"
```

---

### Task 3: Related posts (`getRelatedPosts` + "Leia também" section)

**Files:**
- Modify: `src/content/blog.tsx` (add function after `getPost`, currently around line 1780-1782)
- Modify: `src/app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `BlogPostCard` from Task 1 (`@/src/components/BlogPostCard`).
- Produces: `getRelatedPosts(post: BlogPost, limit?: number): BlogPost[]` in `@/src/content/blog` — exported alongside `getPost`/`formatDate`. Returns at most `limit` posts (default 3), same-category posts first (newest first), then same-tag posts (newest first), never includes `post` itself.

- [ ] **Step 1: Add `getRelatedPosts` to `src/content/blog.tsx`**

Find the existing `getPost` function:

```ts
export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}
```

Add immediately after it:

```ts
export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const others = BLOG_POSTS.filter(p => p.slug !== post.slug)
  const byDateDesc = (a: BlogPost, b: BlogPost) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)

  const sameCategory = others.filter(p => p.category === post.category).sort(byDateDesc)
  const sameTag = others
    .filter(p => p.category !== post.category && p.tags.some(tag => post.tags.includes(tag)))
    .sort(byDateDesc)

  return [...sameCategory, ...sameTag].slice(0, limit)
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Compute related posts in `src/app/blog/[slug]/page.tsx`**

Find:

```tsx
import { BLOG_POSTS, getPost, formatDate } from '@/src/content/blog'
import { BlogCover } from '@/src/components/BlogCover'
import ShareBar from '@/src/components/ShareBar'
```

Replace with:

```tsx
import { BLOG_POSTS, getPost, getRelatedPosts, formatDate } from '@/src/content/blog'
import { BlogCover } from '@/src/components/BlogCover'
import { BlogPostCard } from '@/src/components/BlogPostCard'
import ShareBar from '@/src/components/ShareBar'
```

Find:

```tsx
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const articleJsonLd = {
```

Replace with:

```tsx
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const relatedPosts = getRelatedPosts(post)

  const articleJsonLd = {
```

- [ ] **Step 4: Render the "Leia também" section**

Find the closing of the content/toc grid and the start of the share block:

```tsx
        </div>

        {/* Partilha + contato */}
        <div className="mt-12 pt-6 border-t border-[var(--card-border)]">
          <ShareBar title={post.title} />
        </div>
```

Replace with:

```tsx
        </div>

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
```

- [ ] **Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual check**

Run: `npm run dev`, open `http://localhost:3000/blog/vistoria-de-frota-padronizar-equipe` (category `Frota`).
Expected: a "Leia também" section appears above "Partilha", showing up to 3 other posts — check that `como-reduzir-prejuizo-com-avarias-na-frota` (also category `Frota`) appears, and that the current post never appears in its own related list.

- [ ] **Step 7: Commit**

```bash
git add src/content/blog.tsx src/app/blog/[slug]/page.tsx
git commit -m "feat(blog): adiciona artigos relacionados em cada post"
```

---

### Task 4: Category helpers (`categorySlug`, `getCategories`, `getPostsByCategorySlug`)

**Files:**
- Modify: `src/content/blog.tsx` (add functions after `getRelatedPosts`, added in Task 3)

**Interfaces:**
- Produces:
  - `categorySlug(category: string): string` — lowercase, accent-stripped, hyphenated slug (e.g. `"Boas práticas"` → `"boas-praticas"`).
  - `getCategories(): { name: string; slug: string }[]` — one entry per distinct `category` value in `BLOG_POSTS`, in first-seen order.
  - `getPostsByCategorySlug(slug: string): BlogPost[]` — all posts whose `categorySlug(post.category)` matches `slug`.
- Consumed by: Task 5 (category route), Task 6 (category badge link), Task 7 (sitemap).

- [ ] **Step 1: Add the three functions to `src/content/blog.tsx`**

Add after `getRelatedPosts` (added in Task 3):

```ts
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getCategories(): { name: string; slug: string }[] {
  const seen = new Map<string, string>()
  for (const post of BLOG_POSTS) {
    if (!seen.has(post.category)) seen.set(post.category, categorySlug(post.category))
  }
  return Array.from(seen, ([name, slug]) => ({ name, slug }))
}

export function getPostsByCategorySlug(slug: string): BlogPost[] {
  return BLOG_POSTS.filter(p => categorySlug(p.category) === slug)
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify slugs manually**

Run:

```bash
node -e "
const src = require('fs').readFileSync('src/content/blog.tsx', 'utf8')
const categories = [...new Set([...src.matchAll(/category: '([^']+)'/g)].map(m => m[1]))]
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-\$)/g, '')
for (const c of categories) console.log(c, '->', slugify(c))
"
```

Expected: one line per distinct category (11 categories), each with a lowercase hyphenated slug and no accented characters (e.g. `Boas práticas -> boas-praticas`, `Validade -> validade`). This confirms the slugify logic before it's wired into routing in Task 5.

- [ ] **Step 4: Commit**

```bash
git add src/content/blog.tsx
git commit -m "feat(blog): adiciona helpers de categoria (slug, listagem, filtro)"
```

---

### Task 5: Category archive route (`/blog/categoria/[categoria]`)

**Files:**
- Create: `src/app/blog/categoria/[categoria]/page.tsx`

**Interfaces:**
- Consumes: `getCategories`, `getPostsByCategorySlug` from `@/src/content/blog` (Task 4); `BlogPostCard` from `@/src/components/BlogPostCard` (Task 1).
- Produces: static routes at `/blog/categoria/{slug}` for every category, consumed by Task 6 (link target) and Task 7 (sitemap entries).

- [ ] **Step 1: Create `src/app/blog/categoria/[categoria]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategories, getPostsByCategorySlug } from '@/src/content/blog'
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
  const categoryName = posts[0].category
  const title = `Artigos sobre ${categoryName} | Blog Danos Aparentes`
  const description = `Guias de vistoria e laudo de avarias sobre ${categoryName.toLowerCase()}.`
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
  const categoryName = posts[0].category

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
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open `http://localhost:3000/blog/categoria/frota`.
Expected: page title "Frota", grid of every post whose category is `Frota` (at least `vistoria-de-frota-padronizar-equipe` and `como-reduzir-prejuizo-com-avarias-na-frota`). Open `http://localhost:3000/blog/categoria/nao-existe` and confirm it renders the standard 404 page.

- [ ] **Step 4: Commit**

```bash
git add src/app/blog/categoria
git commit -m "feat(blog): páginas de categoria em /blog/categoria/[categoria]"
```

---

### Task 6: Category badge link on the post page

**Files:**
- Modify: `src/app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `categorySlug` from `@/src/content/blog` (Task 4); route produced by Task 5.

- [ ] **Step 1: Import `categorySlug`**

Find:

```tsx
import { BLOG_POSTS, getPost, getRelatedPosts, formatDate } from '@/src/content/blog'
```

Replace with:

```tsx
import { BLOG_POSTS, getPost, getRelatedPosts, categorySlug, formatDate } from '@/src/content/blog'
```

- [ ] **Step 2: Turn the cover's category badge into a link**

Find:

```tsx
        <BlogCover cover={post.cover} className="h-40 sm:h-56 rounded-2xl mb-7" emojiClass="text-7xl">
          <span className="absolute top-4 left-4 text-[0.62rem] font-extrabold uppercase tracking-widest bg-black/30 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </BlogCover>
```

Replace with:

```tsx
        <BlogCover cover={post.cover} className="h-40 sm:h-56 rounded-2xl mb-7" emojiClass="text-7xl">
          <Link
            href={`/blog/categoria/${categorySlug(post.category)}`}
            className="absolute top-4 left-4 text-[0.62rem] font-extrabold uppercase tracking-widest bg-black/30 text-white px-2.5 py-1 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            {post.category}
          </Link>
        </BlogCover>
```

`Link` is already imported at the top of this file (used elsewhere in the page) — no new import needed.

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open any post, click the category badge on the cover.
Expected: navigates to `/blog/categoria/{slug}` (e.g. clicking "Frota" goes to `/blog/categoria/frota`) and lands on the page built in Task 5.

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/[slug]/page.tsx
git commit -m "feat(blog): badge de categoria no post linka para a página da categoria"
```

---

### Task 7: Category entries in the sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getCategories` from `@/src/content/blog` (Task 4).

- [ ] **Step 1: Add category entries to `src/app/sitemap.ts`**

Find:

```ts
import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/src/content/blog'
```

Replace with:

```ts
import type { MetadataRoute } from 'next'
import { BLOG_POSTS, getCategories } from '@/src/content/blog'
```

Find:

```ts
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T12:00:00`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  return [...staticEntries, ...blogEntries]
```

Replace with:

```ts
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T12:00:00`),
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
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Full build (final verification for the whole plan)**

Run: `npm run build`
Expected: build succeeds; output lists the new `/blog/categoria/[categoria]` route with one static page per category (11 categories) among the generated routes.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open `http://localhost:3000/sitemap.xml`.
Expected: contains `<url>` entries for `/blog/categoria/frota`, `/blog/categoria/locadora`, etc. — one per distinct category.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): inclui páginas de categoria do blog no sitemap"
```
