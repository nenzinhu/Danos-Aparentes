import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_COMPANY_NAME, LEGAL_CNPJ, LEGAL_CONTACT_EMAIL } from '@/src/components/LegalContent'

const SITE_URL = 'https://danosaparentes.com.br'
const WHATSAPP_NUMBER = '+5548992032348'
const WHATSAPP_DISPLAY = '(48) 99203-2348'
const WHATSAPP_LINK = 'https://wa.me/5548992032348'

export const metadata: Metadata = {
  title: 'Sobre | Histórico Digital e Vistoria com IA — Danos Aparentes',
  description:
    'O que a Danos Aparentes faz: histórico digital do veículo, vistoria de entrada e retorno, PDF Antes × Depois, IA sugestiva (humano confirma), fotos dos 4 lados e laudo com QR/hash.',
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre | Histórico Digital e Vistoria com IA — Danos Aparentes',
    description:
      'Histórico digital do veículo, entrada/retorno, PDF Antes × Depois e Inteligência Artificial sugestiva — o vistoriador confirma o que marcou no SVG.',
    url: '/sobre',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre | Histórico Digital e Vistoria com IA — Danos Aparentes',
    description:
      'Histórico digital do veículo, entrada/retorno, PDF Antes × Depois e IA sugestiva com confirmação humana.',
    images: ['/og-image.jpg'],
  },
}

const WHAT_WE_DO = [
  {
    title: 'Histórico digital do veículo',
    body: 'Cada vistoria vira uma página na linha do tempo: entrada, uso, retorno e reparo — comparável no tempo, por placa.',
  },
  {
    title: 'Entrada e retorno (check-out / check-in)',
    body: 'Vistoria de entrada como baseline. No retorno, o sistema importa os dados e destaca avarias novas em relação ao laudo anterior.',
  },
  {
    title: 'PDF Antes × Depois',
    body: 'Laudos profissionais de entrada (sem avarias ou com o estado registrado) e de retorno (com o que mudou) — prontos para enviar e arquivar.',
  },
  {
    title: 'Registro visual no SVG',
    body: 'O vistoriador marca exatamente a peça no diagrama do veículo. O dano fica no local certo, não em texto solto.',
  },
  {
    title: 'Inteligência Artificial sugestiva',
    body: 'Assistida por IA e detecção automática de descrição: a IA só sugere tipo, grau e texto. Quem marcou no SVG confirma — Aceitar, Editar ou Ignorar. Nada grava sozinho.',
  },
  {
    title: 'Fotos dos 4 lados + evidência da avaria',
    body: 'Contexto do veículo nas quatro vistas e foto vinculada à peça marcada, com geolocalização e carimbo de data/hora.',
  },
  {
    title: 'Laudo verificável',
    body: 'PDF com hash SHA-256, QR Code e verificação pública em danosaparentes.com.br/verify. Assinaturas na tela do vistoriador e do responsável.',
  },
  {
    title: 'Offline no pátio',
    body: 'Funciona sem sinal e sincroniza depois — pensado para locadoras, frotas e oficinas no campo.',
  },
]

export default function SobrePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'Sobre a Danos Aparentes',
            url: `${SITE_URL}/sobre`,
            description:
              'Histórico digital do veículo com vistoria de entrada e retorno, PDF Antes × Depois e Inteligência Artificial sugestiva com confirmação do vistoriador.',
            mainEntity: {
              '@type': 'Organization',
              name: LEGAL_COMPANY_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo-full.png`,
              taxID: LEGAL_CNPJ,
              email: LEGAL_CONTACT_EMAIL,
              telephone: WHATSAPP_NUMBER,
              founder: {
                '@type': 'Person',
                name: 'Jeferson',
                jobTitle: 'Proprietário',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: LEGAL_CONTACT_EMAIL,
                telephone: WHATSAPP_NUMBER,
                contactType: 'customer support',
                areaServed: 'BR',
                availableLanguage: ['Portuguese'],
              },
            },
          }),
        }}
      />

      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <h1 className="text-2xl font-extrabold mb-1">Sobre a Danos Aparentes</h1>
        <p className="text-sm text-[var(--signal-bright)] font-semibold uppercase tracking-wider mb-2">
          Histórico Digital do Veículo · Assistido por IA
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          O que fazemos, as features atuais e quem está por trás.
        </p>

        <div className="glass-card p-6 space-y-8 text-sm leading-relaxed text-[var(--text-muted)]">
          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">O que é</h2>
            <p>
              A Danos Aparentes é a plataforma de <strong className="text-[var(--text-main)]">histórico digital do veículo</strong>:
              registre o estado na entrada, compare no retorno e comprove o que mudou com fotos, diagrama SVG, PDF e
              verificação digital. Feita para locadoras, concessionárias, seguradoras, oficinas, transportadoras,
              empresas com frota e vistoriadores independentes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">O problema que originou o produto</h2>
            <p>
              Vistorias em papel, fotos soltas sem hora nem local, e cada profissional registrando avarias do seu
              jeito. Na hora de cobrar um dano na devolução, faltava prova padronizada de que a avaria não estava lá
              antes — e a cobrança virava discussão (ou processo).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-3">O que é feito hoje — features</h2>
            <ul className="space-y-4 list-none m-0 p-0">
              {WHAT_WE_DO.map((item) => (
                <li key={item.title} className="border-t border-[var(--card-border)]/40 pt-4 first:border-0 first:pt-0">
                  <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[var(--signal-bright)]/25 bg-[color-mix(in_srgb,var(--signal)_8%,transparent)] px-4 py-4">
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">IA: agilidade sem abrir mão do humano</h2>
            <p>
              Destacamos <strong className="text-[var(--text-main)]">Inteligência Artificial</strong>,{' '}
              <strong className="text-[var(--text-main)]">Assistida por IA</strong> e{' '}
              <strong className="text-[var(--text-main)]">Detecção Automática</strong> porque aceleram a documentação —
              mas a regra é clara: o vistoriador marca o dano no SVG; a IA só sugere a descrição; o vistoriador
              confirma. Nada entra no laudo sozinho.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">Para quem é</h2>
            <p className="mb-2">
              Locadoras, concessionárias, seguradoras, oficinas, transportadoras, empresas com frotas e vistoriadores
              independentes.
            </p>
            <p>
              Saiba mais:{' '}
              <Link href="/locadoras" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                Locadoras
              </Link>
              ,{' '}
              <Link href="/oficinas" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                Oficinas
              </Link>
              ,{' '}
              <Link href="/seguradoras" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                Seguradoras
              </Link>{' '}
              e{' '}
              <Link href="/frotas" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                Frotas
              </Link>
              . Ou veja a{' '}
              <Link href="/#ia-assistente" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                IA na landing
              </Link>{' '}
              e o{' '}
              <Link href="/#comparacao" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                PDF Antes × Depois
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">Quem somos</h2>
            <p>
              A plataforma é operada por <strong className="text-[var(--text-main)]">Jeferson</strong>, proprietário
              da {LEGAL_COMPANY_NAME} (CNPJ {LEGAL_CNPJ}), responsável pelo desenvolvimento e evolução do produto. O
              contato para dúvidas, suporte ou parcerias é{' '}
              <a
                href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              >
                {LEGAL_CONTACT_EMAIL}
              </a>{' '}
              ou WhatsApp{' '}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              >
                {WHATSAPP_DISPLAY}
              </a>
              .
            </p>
          </section>

          <p className="text-xs pt-4 border-t border-[var(--card-border)]/20">
            Dúvidas?{' '}
            <Link href="/faq" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              FAQ
            </Link>
            {' · '}
            <Link href="/suporte" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              Suporte
            </Link>
            {' · '}
            <Link href="/demo" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              Demo
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
