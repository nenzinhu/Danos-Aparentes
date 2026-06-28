import React from 'react'
import { LaudoSheet } from '@/src/components/LaudoSheet'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  /** ISO date (YYYY-MM-DD) */
  date: string
  readingMinutes: number
  author: { name: string; role: string }
  cover: { gradient: string; emoji: string; image?: string }
  /** Sumário navegável — cada id deve existir como <h2 id> no conteúdo. */
  toc: { id: string; label: string }[]
  content: React.ReactNode
}

function Cta() {
  return (
    <aside className="not-prose my-10 rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-sky-500/[0.08] to-blue-900/10 p-6 backdrop-blur-md">
      <p className="text-[0.7rem] font-extrabold uppercase tracking-widest text-[var(--signal-bright)] mb-2">
        Faça na prática
      </p>
      <h3 className="font-display text-xl font-bold text-[var(--text-main)] mb-2">
        Gere um laudo de vistoria em minutos
      </h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
        Marque as avarias num diagrama do veículo, anexe fotos com GPS e exporte um PDF com hash de
        validação e QR Code. Sem papel, sem retrabalho.
      </p>
      <a
        href="/app"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5"
      >
        Abrir o app →
      </a>
    </aside>
  )
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-fazer-laudo-de-vistoria-veicular',
    title: 'Como fazer um laudo de vistoria veicular: o guia completo',
    excerpt:
      'O que é, quando é exigido e o passo a passo para produzir um laudo de avarias claro, fotográfico e à prova de contestação — com modelo real para você seguir.',
    category: 'Vistoria',
    tags: ['laudo de vistoria', 'avarias', 'checklist', 'locadora', 'seguradora'],
    date: '2026-06-28',
    readingMinutes: 7,
    author: { name: 'Equipe Danos Aparentes', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#1FB6FF 100%)', emoji: '📋', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'o-que-e', label: 'O que é um laudo de vistoria' },
      { id: 'quando-exigido', label: 'Quando ele é exigido' },
      { id: 'passo-a-passo', label: 'Passo a passo' },
      { id: 'erros-comuns', label: 'Erros que invalidam o laudo' },
      { id: 'modelo', label: 'Modelo pronto para seguir' },
    ],
    content: (
      <>
        <p>
          Um laudo de vistoria veicular bem feito é a diferença entre <strong>fechar uma entrega sem
          discussão</strong> e ficar preso num bate-boca sobre &ldquo;esse risco já estava aí&rdquo;. Seja na
          devolução de um carro de locadora, na entrada de um sinistro ou na venda de um usado, o laudo
          é a prova documental do estado do veículo num momento exato.
        </p>
        <p>
          Neste guia você vê o que o laudo precisa conter, quando ele é exigido, o passo a passo para
          produzi-lo e os erros que o tornam frágil numa contestação.
        </p>

        <h2 id="o-que-e">O que é um laudo de vistoria</h2>
        <p>
          É o registro estruturado do estado aparente de um veículo: identificação (placa, marca,
          modelo, cor), a lista de avarias por peça e gravidade, fotos das ocorrências e a
          identificação de quem vistoriou. Não confunda com o <em>laudo cautelar</em> (que avalia
          adulteração de chassi/motor para transferência): aqui falamos do <strong>laudo de avarias
          aparentes</strong>, focado em danos visíveis na lataria, vidros e acabamentos.
        </p>

        <h2 id="quando-exigido">Quando ele é exigido</h2>
        <ul>
          <li><strong>Locadoras e frotas:</strong> na entrega e na devolução, para imputar danos novos.</li>
          <li><strong>Seguradoras:</strong> na vistoria prévia e na abertura de sinistro.</li>
          <li><strong>Compra e venda de usados:</strong> para registrar o estado no ato da negociação.</li>
          <li><strong>Transportadoras e pátios:</strong> na entrada e saída de veículos sob guarda.</li>
        </ul>

        <h2 id="passo-a-passo">Passo a passo de uma vistoria à prova de contestação</h2>
        <p>O método é sempre o mesmo, independentemente do tipo de veículo:</p>
        <ul>
          <li><strong>1. Identifique o veículo</strong> — placa, marca/modelo, cor e quilometragem. Erros aqui derrubam o documento inteiro.</li>
          <li><strong>2. Percorra o veículo em ordem fixa</strong> — frente, lateral esquerda, traseira, lateral direita e teto. Uma ordem fixa evita esquecer áreas.</li>
          <li><strong>3. Registre cada avaria por peça e gravidade</strong> — risco/abrasão, deformação ou fratura, e classifique em leve, média ou grave.</li>
          <li><strong>4. Fotografe com contexto</strong> — uma foto aberta (onde está) e uma fechada (o detalhe), com data, hora e localização.</li>
          <li><strong>5. Colha as assinaturas</strong> — vistoriador e proprietário/responsável, fechando o aceite das partes.</li>
        </ul>

        <Cta />

        <h2 id="erros-comuns">Erros que invalidam (ou enfraquecem) o laudo</h2>
        <ul>
          <li><strong>Foto sem data nem local:</strong> uma imagem solta não prova <em>quando</em> o dano existia.</li>
          <li><strong>Descrição vaga:</strong> &ldquo;arranhado&rdquo; não diz nada; &ldquo;risco leve de 8&nbsp;cm na porta dianteira esquerda&rdquo; diz tudo.</li>
          <li><strong>Documento editável:</strong> um PDF que qualquer um altera depois perde força probatória.</li>
          <li><strong>Sem assinatura do responsável:</strong> sem o aceite, vira a sua palavra contra a dele.</li>
        </ul>
        <p>
          É exatamente por isso que um laudo digital com <strong>hash de validação</strong> e{' '}
          <strong>QR Code</strong> tem mais peso: o hash prova que o arquivo não foi adulterado e o QR
          permite conferir o original online a qualquer momento.
        </p>

        <h2 id="modelo">Modelo pronto para seguir</h2>
        <p>
          Em vez de montar um do zero, parta de um modelo que já tem todos os blocos certos:
          identificação, diagrama de danos, detalhamento técnico por peça, galeria fotográfica,
          assinaturas e validação por hash/QR. Veja abaixo como sai o PDF gerado pelo aplicativo:
        </p>

        <LaudoSheet />

        <p>
          Repare no cabeçalho: o laudo sai com a <strong>logo e o nome da sua empresa</strong> —
          concessionária, locadora ou despachante. É um documento <em>white-label</em>, que você
          personaliza uma vez nas configurações e passa a usar em todas as vistorias. Veja também o{' '}
          <a href="/#laudo">modelo completo na página inicial</a> ou gere o seu direto no aplicativo, em
          poucos toques.
        </p>
      </>
    ),
  },
]

BLOG_POSTS.push(
  {
    slug: 'checklist-vistoria-devolucao-locadora',
    title: 'Checklist de vistoria de devolução de veículo para locadoras',
    excerpt:
      'O roteiro completo para receber um carro de volta sem prejuízo: o que conferir, como fotografar e como provar quais danos são novos.',
    category: 'Locadora',
    tags: ['locadora', 'frota', 'devolução', 'checklist', 'vistoria'],
    date: '2026-06-27',
    readingMinutes: 6,
    author: { name: 'Equipe Danos Aparentes', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#155e2f 0%,#0f766e 45%,#22c55e 100%)', emoji: '🚐', image: '/vehicles-img/van.png' },
    toc: [
      { id: 'por-que', label: 'Por que a devolução é crítica' },
      { id: 'antes', label: 'Antes de começar' },
      { id: 'checklist', label: 'O checklist, peça por peça' },
      { id: 'disputas', label: 'Como evitar disputas' },
    ],
    content: (
      <>
        <p>
          Na locação, o dinheiro escapa <strong>na devolução</strong>. É o momento em que um dano novo
          precisa ser identificado, comprovado e cobrado — e onde a maioria dos prejuízos acontece, por
          falta de um registro comparável com o da entrega.
        </p>

        <h2 id="por-que">Por que a devolução é crítica</h2>
        <p>
          Sem uma vistoria de devolução padronizada, todo dano vira discussão: o cliente diz que já
          estava lá, e você não tem como provar o contrário. A solução é ter o mesmo método (e o mesmo
          documento) na entrega e na devolução, para comparar lado a lado.
        </p>

        <h2 id="antes">Antes de começar</h2>
        <ul>
          <li><strong>Lave o veículo</strong> ou avalie sob boa luz — sujeira esconde riscos e amassados.</li>
          <li><strong>Recupere a vistoria de entrega</strong> para comparar peça por peça.</li>
          <li><strong>Confira a quilometragem e o nível de combustível</strong> contra o contrato.</li>
        </ul>

        <h2 id="checklist">O checklist, peça por peça</h2>
        <ul>
          <li><strong>Exterior (em ordem fixa):</strong> frente, lateral esquerda, traseira, lateral direita e teto — para-choques, faróis, retrovisores, vidros e rodas.</li>
          <li><strong>Pneus:</strong> desgaste, bolhas e o estepe.</li>
          <li><strong>Interior:</strong> bancos, forração, painel, multimídia e manchas ou rasgos.</li>
          <li><strong>Itens e documentos:</strong> chave reserva, manual, triângulo, macaco e documento do veículo.</li>
          <li><strong>Fotos:</strong> uma aberta e uma de detalhe por avaria, com data, hora e GPS.</li>
        </ul>

        <Cta />

        <h2 id="disputas">Como evitar disputas</h2>
        <p>
          A regra de ouro: <strong>o dano só é cobrável se você consegue provar que é novo</strong>.
          Isso exige fotos datadas e geolocalizadas e um laudo que não possa ser alterado depois. Com um
          laudo digital de entrega e outro de devolução — ambos com hash e QR de validação — a
          comparação fica objetiva e a cobrança, indiscutível.
        </p>
        <LaudoSheet />

        <p>
          E o documento sai com a <strong>logo e o nome da sua locadora</strong> no cabeçalho, reforçando
          a sua marca a cada entrega e devolução. Veja como é um{' '}
          <a href="/#laudo">Relatório de Vistoria Veicular</a> pronto, ou{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">aprenda o passo a passo do laudo</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'laudo-cautelar-vs-laudo-de-avarias',
    title: 'Laudo cautelar x laudo de avarias: qual você precisa?',
    excerpt:
      'Dois documentos com nomes parecidos e finalidades bem diferentes. Entenda o que cada um cobre para não pedir (nem pagar) o errado.',
    category: 'Laudo',
    tags: ['laudo cautelar', 'laudo de avarias', 'vistoria', 'documentação'],
    date: '2026-06-26',
    readingMinutes: 5,
    author: { name: 'Equipe Danos Aparentes', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#3b1d6e 0%,#5b21b6 45%,#a855f7 100%)', emoji: '⚖️', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'cautelar', label: 'O que é o laudo cautelar' },
      { id: 'avarias', label: 'O que é o laudo de avarias' },
      { id: 'diferencas', label: 'As diferenças na prática' },
      { id: 'qual', label: 'Qual você precisa' },
    ],
    content: (
      <>
        <p>
          &ldquo;Laudo cautelar&rdquo; e &ldquo;laudo de avarias&rdquo; são confundidos o tempo todo —
          mas respondem a perguntas diferentes. Pedir o errado custa tempo e dinheiro.
        </p>

        <h2 id="cautelar">O que é o laudo cautelar</h2>
        <p>
          O laudo cautelar (ou vistoria cautelar) investiga a <strong>procedência e a integridade
          estrutural</strong> do veículo: numeração de chassi e motor, sinais de adulteração, batidas
          estruturais, e cruzamento com bases de sinistro/leilão. É típico exigido em{' '}
          <strong>transferência de propriedade</strong> e na compra de usados.
        </p>

        <h2 id="avarias">O que é o laudo de avarias</h2>
        <p>
          O laudo de avarias aparentes documenta o <strong>estado visível</strong> do veículo num
          momento: riscos, amassados e fraturas por peça, com fotos e assinaturas. Serve para{' '}
          <strong>entrega/devolução, sinistro e responsabilização por danos</strong> — não avalia
          chassi nem procedência.
        </p>

        <h2 id="diferencas">As diferenças na prática</h2>
        <ul>
          <li><strong>Pergunta que responde:</strong> cautelar = &ldquo;esse carro é confiável e legal?&rdquo;; avarias = &ldquo;em que estado ele está agora?&rdquo;.</li>
          <li><strong>Quem costuma exigir:</strong> cautelar = comprador, despachante, financeira; avarias = locadora, seguradora, pátio.</li>
          <li><strong>O que olha:</strong> cautelar = estrutura e procedência; avarias = danos aparentes na lataria, vidros e acabamentos.</li>
        </ul>

        <Cta />

        <h2 id="qual">Qual você precisa</h2>
        <p>
          Vai <strong>transferir ou comprar</strong> um usado e quer segurança sobre o histórico? É o{' '}
          <strong>cautelar</strong>. Precisa <strong>registrar o estado</strong> numa entrega,
          devolução ou sinistro para responsabilizar por danos? É o <strong>laudo de avarias</strong> —
          e é exatamente esse que você gera no Danos Aparentes, com diagrama, fotos com GPS e validação
          por hash/QR. <a href="/blog/como-fazer-laudo-de-vistoria-veicular">Veja como fazer um</a>.
        </p>
      </>
    ),
  },
)

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
