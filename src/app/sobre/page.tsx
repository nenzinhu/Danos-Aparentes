import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_COMPANY_NAME, LEGAL_CNPJ, LEGAL_CONTACT_EMAIL } from '@/src/components/LegalContent'

const SITE_URL = 'https://danosaparentes.com.br'
const WHATSAPP_NUMBER = '+5548992032348'
const WHATSAPP_DISPLAY = '(48) 99203-2348'
const WHATSAPP_LINK = 'https://wa.me/5548992032348'

export const metadata: Metadata = {
  title: 'Sobre | Quem Somos — Danos Aparentes',
  description:
    'Conheça a Danos Aparentes: quem criou a plataforma de vistoria digital de avarias veiculares, por que ela existe e como funciona o laudo com hash SHA-256 e QR Code.',
  alternates: { canonical: '/sobre' },
}

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
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Quem está por trás da plataforma, e por que ela existe.
        </p>

        <div className="glass-card p-6 space-y-6 text-sm leading-relaxed text-[var(--text-muted)]">
          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">O problema que originou o produto</h2>
            <p>
              A Danos Aparentes nasceu de um problema operacional simples e recorrente: vistorias de veículos
              feitas em papel, fotos soltas sem hora nem local, e cada vistoriador registrando avarias do seu
              próprio jeito. Na hora de cobrar um dano na devolução — de uma locadora, de uma oficina, de uma
              frota — não havia como provar de forma padronizada que a avaria não estava lá antes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">Quem somos</h2>
            <p>
              A plataforma é operada por <strong className="text-[var(--text-main)]">Jeferson</strong>, proprietário
              da {LEGAL_COMPANY_NAME} (CNPJ {LEGAL_CNPJ}), responsável pelo desenvolvimento e evolução do produto.
              O contato direto para dúvidas, suporte técnico ou parcerias é por e-mail em{' '}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                {LEGAL_CONTACT_EMAIL}
              </a>{' '}
              ou pelo WhatsApp comercial{' '}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                {WHATSAPP_DISPLAY}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">O que a Danos Aparentes garante</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vistoria digital com diagrama do veículo, marcação de avaria por peça e fotos com GPS e timestamp.</li>
              <li>Laudo em PDF com hash de verificação SHA-256 e QR Code, gerado em segundos.</li>
              <li>Assinatura digital do vistoriador e do cliente na própria tela.</li>
              <li>Funcionamento 100% offline em pátios sem sinal, com sincronização posterior.</li>
              <li>Verificação pública de autenticidade de qualquer laudo emitido, em{' '}
                <Link href="/verify" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                  danosaparentes.com.br/verify
                </Link>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2">Para quem é</h2>
            <p>
              Locadoras, oficinas mecânicas, seguradoras, despachantes e gestores de frota que precisam de um
              padrão único de vistoria entre diferentes vistoriadores — veja{' '}
              <Link href="/locadoras" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">Locadoras</Link>,{' '}
              <Link href="/oficinas" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">Oficinas</Link>,{' '}
              <Link href="/seguradoras" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">Seguradoras</Link>{' '}
              e <Link href="/frotas" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">Frotas</Link>.
            </p>
          </section>

          <p className="text-xs pt-4 border-t border-[var(--card-border)]/20">
            Dúvidas gerais? Consulte as{' '}
            <Link href="/faq" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              perguntas frequentes
            </Link>{' '}
            ou fale com o{' '}
            <Link href="/suporte" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              suporte
            </Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
