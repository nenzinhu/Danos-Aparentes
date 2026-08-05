import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_COMPANY_NAME, LEGAL_CNPJ, LEGAL_CONTACT_EMAIL } from '@/src/components/LegalContent'

const SITE_URL = 'https://danosaparentes.com.br'
const WHATSAPP_NUMBER = '+5548992032348'
const WHATSAPP_DISPLAY = '(48) 99203-2348'
const WHATSAPP_LINK = 'https://wa.me/5548992032348'
const PRESS_EMAIL = LEGAL_CONTACT_EMAIL

const TITLE = 'Media Kit | Imprensa — Danos Aparentes'
const DESCRIPTION =
  'Media kit da Danos Aparentes: overview da marca, logos, screenshots, cores, tipografia e contato para imprensa.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/imprensa' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/imprensa',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

type Asset = {
  name: string
  href: string
  format: string
  note: string
  preview?: string
  darkBg?: boolean
}

const LOGO_ASSETS: Asset[] = [
  {
    name: 'Logo completo (SVG)',
    href: '/brand/logo-full.svg',
    format: 'SVG',
    note: 'Horizontal · fundo escuro',
    preview: '/brand/logo-full.svg',
    darkBg: true,
  },
  {
    name: 'Logo completo (PNG)',
    href: '/logo-full.png',
    format: 'PNG',
    note: 'Alta resolução · transparente',
    preview: '/logo-full.png',
    darkBg: true,
  },
  {
    name: 'Ícone / lupa (SVG)',
    href: '/brand/logo-icon.svg',
    format: 'SVG',
    note: 'Uso compacto, favicon, social',
    preview: '/brand/logo-icon.svg',
  },
  {
    name: 'Ícone (PNG 512)',
    href: '/icon-512.png',
    format: 'PNG',
    note: 'App icon / PWA',
    preview: '/icon-512.png',
  },
  {
    name: 'Favicon SVG',
    href: '/favicon.svg',
    format: 'SVG',
    note: 'Browser / abas',
    preview: '/favicon.svg',
  },
  {
    name: 'Selo laudo verificado',
    href: '/selo-laudo-verificado.svg',
    format: 'SVG',
    note: 'Confiança / verificação do PDF',
    preview: '/selo-laudo-verificado.svg',
  },
]

const SCREENSHOT_ASSETS: Asset[] = [
  {
    name: 'Home — hero',
    href: '/screenshots/home-hero.png',
    format: 'PNG · 2x',
    note: 'Landing desktop',
    preview: '/screenshots/home-hero.png',
  },
  {
    name: 'Planos',
    href: '/screenshots/planos.png',
    format: 'PNG · 2x',
    note: 'Página de preços',
    preview: '/screenshots/planos.png',
  },
  {
    name: 'Locadoras',
    href: '/screenshots/locadoras.png',
    format: 'PNG · 2x',
    note: 'Landing por segmento',
    preview: '/screenshots/locadoras.png',
  },
]

const BRAND_COLORS = [
  { name: 'Primary (dark)', hex: '#1FB6FF', token: '--primary' },
  { name: 'Primary (light)', hex: '#9e4428', token: 'tema claro' },
  { name: 'Signal / âmbar', hex: '#f5a623', token: '--signal' },
  { name: 'Fundo escuro', hex: '#020617', token: '--bg-main' },
  { name: 'Fundo claro', hex: '#faf9f5', token: 'tema claro' },
]

const KEY_FACTS = [
  { label: 'Produto', value: 'Vistoria veicular digital com laudo PDF verificável' },
  { label: 'Prova', value: 'Hash SHA-256 + QR Code público em /verify' },
  { label: 'Uso offline', value: 'Pátio sem sinal; sync quando volta a internet' },
  { label: 'Segmentos', value: 'Locadoras, oficinas, seguradoras e frotas' },
  { label: 'Trial', value: '7 dias grátis · sem cartão' },
  { label: 'Sede operacional', value: 'Florianópolis / SC · Brasil' },
]

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <a
      href={asset.href}
      download
      className="group flex flex-col rounded-xl border border-[var(--card-border)]/60 bg-[var(--btn-secondary-bg)] hover:border-[var(--sheet-line)] transition-colors overflow-hidden focus-visible:ring-2 ring-[var(--primary)] outline-none"
    >
      <div
        className={`flex items-center justify-center min-h-[96px] p-4 ${
          asset.darkBg ? 'bg-[#0b1220]' : 'bg-[var(--bg-main)]'
        }`}
      >
        {asset.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.preview}
            alt=""
            className="max-h-16 max-w-full object-contain"
          />
        ) : null}
      </div>
      <div className="px-3 py-3 border-t border-[var(--card-border)]/40">
        <p className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
          {asset.name}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          {asset.format} · {asset.note}
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--signal-bright)]">
          Baixar ↓
        </p>
      </div>
    </a>
  )
}

export default function ImprensaPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Media Kit — Danos Aparentes',
            url: `${SITE_URL}/imprensa`,
            description: DESCRIPTION,
            isPartOf: { '@type': 'WebSite', name: 'Danos Aparentes', url: SITE_URL },
            about: {
              '@type': 'Organization',
              name: LEGAL_COMPANY_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo-full.png`,
              taxID: LEGAL_CNPJ,
              email: PRESS_EMAIL,
              telephone: WHATSAPP_NUMBER,
              contactPoint: {
                '@type': 'ContactPoint',
                email: PRESS_EMAIL,
                telephone: WHATSAPP_NUMBER,
                contactType: 'public relations',
                areaServed: 'BR',
                availableLanguage: ['Portuguese'],
              },
            },
          }),
        }}
      />

      <div className="w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <p className="font-mono-data text-[11px] tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-2">
          Press · Media Kit
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Media Kit Danos Aparentes</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl leading-relaxed">
          Assets e informações oficiais para jornalistas, parceiros e diretórios. Baixe logos e
          screenshots sem pedir autorização prévia para cobertura editorial.
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-[var(--text-muted)]">
          {/* Overview */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-base font-bold text-[var(--text-main)]">Visão geral da empresa</h2>
            <p>
              A <strong className="text-[var(--text-main)]">{LEGAL_COMPANY_NAME}</strong> (CNPJ{' '}
              {LEGAL_CNPJ}) é uma plataforma de vistoria veicular digital. O produto transforma cada
              avaria em evidência organizada: diagrama do veículo, fotos, assinatura na tela e laudo
              PDF com hash SHA-256 e QR Code de verificação pública.
            </p>
            <p>
              Nasceu para acabar com vistorias em papel e fotos soltas — o padrão que falha quando
              locadora, oficina ou frota precisa provar se o dano já existia na entrada ou surgiu na
              saída.
            </p>
            <p>
              Mais contexto em{' '}
              <Link href="/sobre" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]">
                /sobre
              </Link>
              .
            </p>
          </section>

          {/* Key facts */}
          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-3">Fatos-chave</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--card-border)] border border-[var(--card-border)] rounded-xl overflow-hidden">
              {KEY_FACTS.map(f => (
                <div key={f.label} className="bg-[var(--bg-main)] px-4 py-3">
                  <dt className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)]">
                    {f.label}
                  </dt>
                  <dd className="text-sm text-[var(--text-main)] mt-1 leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Logos */}
          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-1">Logos e ícones</h2>
            <p className="text-xs mb-4">
              Preferir SVG quando possível. Mantenha proporção e área de respiro; não distorça nem
              recolora o logotipo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOGO_ASSETS.map(a => (
                <AssetCard key={a.href} asset={a} />
              ))}
            </div>
          </section>

          {/* Screenshots */}
          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-1">Screenshots do produto</h2>
            <p className="text-xs mb-4">
              Capturas HiDPI da landing e de páginas de conversão. Crédito: Danos Aparentes.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {SCREENSHOT_ASSETS.map(a => (
                <a
                  key={a.href}
                  href={a.href}
                  download
                  className="group rounded-xl border border-[var(--card-border)]/60 overflow-hidden hover:border-[var(--sheet-line)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.preview} alt={a.name} className="w-full h-auto block bg-[var(--bg-main)]" />
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[var(--btn-secondary-bg)] border-t border-[var(--card-border)]/40">
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)]">{a.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {a.format} · {a.note}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--signal-bright)] shrink-0">
                      Baixar ↓
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Brand guidelines inline */}
          <section className="glass-card p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] mb-1">Guia rápido de marca</h2>
              <p className="text-xs">
                Tipografia e cores oficiais usadas no produto e no site.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">
                Tipografia
              </h3>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <strong className="text-[var(--text-main)] font-display">Display / títulos:</strong>{' '}
                  Outfit (peso 700–900), uppercase em headlines de marca
                </li>
                <li>
                  <strong className="text-[var(--text-main)]">Corpo:</strong> Outfit / system UI
                </li>
                <li>
                  <strong className="text-[var(--text-main)] font-mono-data">Dados / labels:</strong>{' '}
                  mono tracking largo (rótulos de laudo, OS, placa)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">
                Cores
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BRAND_COLORS.map(c => (
                  <li
                    key={c.name + c.hex}
                    className="flex items-center gap-3 rounded-lg border border-[var(--card-border)]/50 px-3 py-2"
                  >
                    <span
                      className="w-8 h-8 rounded-md border border-[var(--card-border)] shrink-0"
                      style={{ background: c.hex }}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-bold text-[var(--text-main)]">{c.name}</span>
                      <span className="block font-mono-data text-[11px] tracking-wide">
                        {c.hex} · {c.token}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Usage */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-base font-bold text-[var(--text-main)]">Uso permitido</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Cobertura jornalística, blog posts, comparativos e uso educacional.</li>
              <li>Downloads gratuitos dos assets desta página — sem autorização prévia para esses fins.</li>
              <li>Manter proporções, cores e espaço em branco ao redor do logo.</li>
            </ul>
            <h3 className="text-sm font-bold text-[var(--text-main)] pt-2">Não permitido</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Alterar, distorcer ou recolorir o logotipo.</li>
              <li>Usar a marca de forma que sugira endosso, parceria ou afiliação inexistente.</li>
              <li>Uso comercial de merchandising ou white-label sem autorização escrita.</li>
            </ul>
            <p className="text-xs pt-1">
              Para usos especiais ou comerciais, fale conosco pelo contato de imprensa abaixo.
            </p>
          </section>

          {/* Contact */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-base font-bold text-[var(--text-main)]">Contato para imprensa</h2>
            <p>
              Pedidos de entrevista, fact-check, assets adicionais ou autorização comercial:
            </p>
            <ul className="space-y-2 text-[var(--text-main)]">
              <li>
                <span className="text-[var(--text-muted)]">E-mail:</span>{' '}
                <a
                  href={`mailto:${PRESS_EMAIL}?subject=Imprensa%20—%20Danos%20Aparentes`}
                  className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                >
                  {PRESS_EMAIL}
                </a>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">WhatsApp:</span>{' '}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Site:</span>{' '}
                <a href={SITE_URL} className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]">
                  danosaparentes.com.br
                </a>
              </li>
            </ul>
          </section>

          <p className="text-xs border-t border-[var(--card-border)]/20 pt-4">
            Também veja{' '}
            <Link href="/sobre" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Sobre
            </Link>
            ,{' '}
            <Link href="/faq" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]">
              FAQ
            </Link>{' '}
            e{' '}
            <Link href="/suporte" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Suporte
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
