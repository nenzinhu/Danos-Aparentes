'use client';
import React, { useMemo, useState } from 'react'

type CategoryId = 'vistoria' | 'conta' | 'cobranca' | 'tecnico'

interface FaqEntry {
  q: string
  a: React.ReactNode
  category: CategoryId
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'vistoria', label: 'Vistoria & Laudo' },
  { id: 'conta', label: 'Conta & Dados' },
  { id: 'cobranca', label: 'Assinatura' },
  { id: 'tecnico', label: 'Técnico' },
]

const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.label]),
) as Record<CategoryId, string>

const FAQS: FaqEntry[] = [
  {
    category: 'vistoria',
    q: 'Como registro uma avaria na vistoria?',
    a: (
      <>
        <p>
          Na aba <strong>Vistoria</strong>, escolha o tipo de veículo e a vista (lateral, frontal,
          traseira). Clique sobre a peça e selecione o tipo de avaria — ela aparece na lista lateral.
        </p>
        <p>Cada avaria aceita gravidade (baixa/média/alta), notas e fotos antes de gerar o laudo.</p>
      </>
    ),
  },
  {
    category: 'vistoria',
    q: 'Para que serve a captura de localização (GPS)?',
    a: (
      <>
        <p>
          O botão <strong>Capturar localização</strong> registra o ponto GPS exato de onde a vistoria
          foi feita. A coordenada entra no laudo junto do hash e do QR Code, reforçando a autenticidade.
        </p>
        <p>
          Se aparecer “permissão negada”, libere o acesso à localização para o site nas configurações do
          navegador e tente novamente.
        </p>
      </>
    ),
  },
  {
    category: 'vistoria',
    q: 'O laudo tem validade jurídica?',
    a: (
      <>
        <p>
          O laudo serve como registro documental detalhado, com hash de integridade, QR Code de
          verificação, GPS e assinaturas do vistoriador e do proprietário.
        </p>
        <p>
          Seu valor probatório depende do contexto e do aceite das partes — recomendamos confirmar
          exigências específicas com seu jurídico ou seguradora.
        </p>
      </>
    ),
  },
  {
    category: 'vistoria',
    q: 'Como funcionam as assinaturas no laudo?',
    a: (
      <p>
        No formulário da vistoria há dois campos de assinatura digital: <strong>vistoriador</strong> e{' '}
        <strong>proprietário/responsável</strong>. Assine direto na tela (dedo ou caneta) e ambas entram
        no PDF final.
      </p>
    ),
  },
  {
    category: 'vistoria',
    q: 'Posso salvar uma vistoria e continuar depois?',
    a: (
      <p>
        Sim. Use <strong>Vistorias Salvas</strong> para guardar o trabalho em andamento e carregá-lo
        mais tarde no mesmo ou em outro dispositivo, desde que esteja logado na mesma conta.
      </p>
    ),
  },
  {
    category: 'conta',
    q: 'Como redefino minha senha?',
    a: (
      <p>
        Na tela de login, toque em <strong>“Esqueci minha senha”</strong> e informe seu e-mail. Você
        receberá um link para criar uma nova senha. Verifique também a caixa de spam.
      </p>
    ),
  },
  {
    category: 'conta',
    q: 'Onde ficam armazenadas as fotos e os laudos?',
    a: (
      <>
        <p>
          As vistorias são sincronizadas com sua conta na nuvem (quando online) e ficam vinculadas ao
          seu usuário. Assim você acessa o histórico de qualquer dispositivo logado.
        </p>
        <p>Trabalhando offline, os dados ficam no aparelho e sincronizam assim que a conexão volta.</p>
      </>
    ),
  },
  {
    category: 'conta',
    q: 'Posso personalizar o laudo com a marca da minha empresa?',
    a: (
      <p>
        Sim. Em <strong>Configurações da empresa</strong> você adiciona logo e dados que passam a
        constar no cabeçalho do laudo. Recurso disponível para assinantes ativos.
      </p>
    ),
  },
  {
    category: 'conta',
    q: 'O que acontece com meus dados se eu cancelar?',
    a: (
      <p>
        Após o cancelamento o acesso aos recursos pagos é suspenso, mas suas vistorias permanecem na
        conta. Exporte os PDFs que precisar antes de encerrar, por segurança.
      </p>
    ),
  },
  {
    category: 'cobranca',
    q: 'Existe período de teste gratuito?',
    a: (
      <p>
        Sim. Você começa com um período de avaliação para testar a vistoria, o laudo em PDF e a
        sincronização antes de assinar. O tempo restante aparece no topo do app.
      </p>
    ),
  },
  {
    category: 'cobranca',
    q: 'Como gerencio ou cancelo minha assinatura?',
    a: (
      <p>
        No menu da conta, use <strong>Gerenciar assinatura</strong> para abrir o portal de cobrança. Lá
        você atualiza o cartão, vê faturas e cancela quando quiser, sem multa.
      </p>
    ),
  },
  {
    category: 'cobranca',
    q: 'Quais formas de pagamento são aceitas?',
    a: (
      <p>
        O pagamento é processado de forma segura via cartão de crédito pelo nosso provedor (Stripe). Os
        dados do cartão não ficam armazenados em nossos servidores.
      </p>
    ),
  },
  {
    category: 'cobranca',
    q: 'Posso pedir reembolso?',
    a: (
      <p>
        Se algo não saiu como esperado, fale com o suporte. Avaliamos pedidos de reembolso conforme as
        condições contratadas e a legislação aplicável (CDC).
      </p>
    ),
  },
  {
    category: 'tecnico',
    q: 'Funciona offline, no campo?',
    a: (
      <p>
        Sim — é um PWA (Progressive Web App). Você pode registrar avarias e fotos sem sinal; ao
        reconectar, tudo sincroniza automaticamente com sua conta.
      </p>
    ),
  },
  {
    category: 'tecnico',
    q: 'Como instalo o app no celular?',
    a: (
      <>
        <p>
          Abra o site no navegador do celular e use a opção{' '}
          <strong>“Adicionar à tela inicial”</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1 my-2">
          <li>
            <strong>Android (Chrome):</strong> menu ⋮ → “Adicionar à tela inicial”.
          </li>
          <li>
            <strong>iPhone (Safari):</strong> botão compartilhar → “Adicionar à Tela de Início”.
          </li>
        </ul>
        <p>Ele passa a abrir como um aplicativo, em tela cheia.</p>
      </>
    ),
  },
  {
    category: 'tecnico',
    q: 'Quais navegadores são compatíveis?',
    a: (
      <p>
        Use versões recentes de Chrome, Edge, Safari ou Firefox. Para câmera e GPS, mantenha o navegador
        atualizado e conceda as permissões solicitadas.
      </p>
    ),
  },
  {
    category: 'tecnico',
    q: 'A leitura por voz (TTS) não está funcionando. O que faço?',
    a: (
      <p>
        Verifique se o volume está ativo e se há uma voz em português selecionada nas configurações de
        voz do app. Em alguns aparelhos, a primeira reprodução exige um toque na tela para liberar o
        áudio.
      </p>
    ),
  },
]

// Texto pesquisável a partir do nó React da resposta.
function answerText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(answerText).join(' ')
  if (React.isValidElement(node)) return answerText((node.props as { children?: React.ReactNode }).children)
  return ''
}

const FAQ_INDEX = FAQS.map(f => ({ ...f, search: `${f.q} ${answerText(f.a)}`.toLowerCase() }))

function ChevronIcon() {
  return (
    <svg
      className="flex-none w-5 h-5 text-[var(--primary)] transition-transform duration-300 ease-out group-aria-expanded:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function FaqAccordion() {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<CategoryId | 'all'>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return FAQ_INDEX.map((f, i) => ({ ...f, i })).filter(f => {
      const matchCat = activeCat === 'all' || f.category === activeCat
      const matchTerm = !term || f.search.includes(term)
      return matchCat && matchTerm
    })
  }, [query, activeCat])

  return (
    <div>
      {/* Busca */}
      <div className="relative mb-5">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-muted)] pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por palavra-chave (ex.: GPS, laudo, reembolso)…"
          aria-label="Buscar nas perguntas frequentes"
          autoComplete="off"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] text-[0.95rem] outline-none transition-[border-color,box-shadow] focus:border-sky-500/55 focus:shadow-[0_0_0_3px_rgba(31,182,255,0.15)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2 mb-7" role="group" aria-label="Filtrar por categoria">
        <CategoryPill active={activeCat === 'all'} onClick={() => setActiveCat('all')}>
          Todas
        </CategoryPill>
        {CATEGORIES.map(c => (
          <CategoryPill key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            {c.label}
          </CategoryPill>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2.5">
        {visible.map(f => {
          const isOpen = openIndex === f.i
          return (
            <div
              key={f.i}
              className={`glass-card overflow-hidden transition-colors ${
                isOpen ? 'border-sky-500/35' : ''
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : f.i)}
                className="group w-full flex items-center justify-between gap-4 text-left px-5 py-[1.15rem] font-semibold text-[var(--text-main)] text-base leading-snug"
              >
                <span>
                  <span className="block text-[0.62rem] font-extrabold tracking-[0.1em] uppercase text-[var(--signal)] mb-1.5">
                    {CATEGORY_LABEL[f.category]}
                  </span>
                  {f.q}
                </span>
                <ChevronIcon />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-[var(--text-muted)] text-[0.93rem] [&_strong]:text-[var(--text-main)] [&_strong]:font-semibold [&_p]:mb-2.5 [&_p:last-child]:mb-0">
                    {f.a}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {visible.length === 0 && (
          <p className="text-center text-[var(--text-muted)] text-[0.95rem] py-10">
            Nenhuma pergunta encontrada. Tente outra palavra-chave ou categoria.
          </p>
        )}
      </div>
    </div>
  )
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[0.8rem] font-bold border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
        active
          ? 'bg-sky-500/15 border-sky-500/60 text-[var(--primary-hover)] shadow-[0_0_14px_rgba(31,182,255,0.18)]'
          : 'bg-sky-500/[0.06] border-[var(--input-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-sky-500/40'
      }`}
    >
      {children}
    </button>
  )
}
