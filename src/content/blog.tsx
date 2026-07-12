import React from 'react'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import VehicleViewsDemo from '@/src/components/blog/VehicleViewsDemo'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import LandingCtaLink from '@/src/components/LandingCtaLink'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  /** ISO date (YYYY-MM-DD) */
  date: string
  /** ISO date (YYYY-MM-DD) da última revisão de conteúdo. Se ausente, usa `date`. */
  updatedDate?: string
  readingMinutes: number
  author: { name: string; role: string }
  cover: { gradient: string; emoji: string; image?: string }
  /** Sumário navegável — cada id deve existir como <h2 id> no conteúdo. */
  toc: { id: string; label: string }[]
  content: React.ReactNode
  /**
   * Passos numerados visíveis no artigo (schema HowTo). Só preencher quando o
   * post tem uma lista "1. 2. 3." real no conteúdo — o texto aqui deve
   * espelhar exatamente o que aparece na página, sem parafrasear.
   */
  howTo?: { name: string; steps: { name: string; text: string }[] }
}

export function Cta() {
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
      <LandingCtaLink className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5">
        Testar 7 dias grátis →
      </LandingCtaLink>
    </aside>
  )
}

// Bloco reutilizável: recursos do laudo (perfil/campos, logo, QR/hash) +
// imagem real do PDF. Usado nos artigos por tipo de veículo.
function RecursosLaudo() {
  return (
    <>
      <h2 id="perfil">Perfil e campos: o laudo se adapta a você</h2>
      <p>
        No <strong>perfil da vistoria</strong> você define o nome do vistoriador e da empresa e decide
        exatamente o que entra no documento. Dá para <strong>adicionar campos próprios</strong> (apólice,
        contrato, nº do box, KM, centro de custo), <strong>remover</strong> os que não usa e até{' '}
        <strong>reordenar</strong> as seções — perfil, cliente, documentos, veículo, local e assinaturas
        — para o laudo ficar com a cara da sua operação.
      </p>

      <h2 id="logo">Sua logo e o nome da empresa no PDF</h2>
      <p>
        O laudo sai com a <strong>logo e o nome da sua empresa</strong> no cabeçalho — concessionária,
        locadora ou despachante. É um documento <em>white-label</em>: você configura uma vez e passa a
        usar em todas as vistorias. Veja como fica:
      </p>

      <LaudoSheet />

      <h2 id="validacao">Assinatura, QR Code e hash de validação</h2>
      <p>
        Ao concluir, o vistoriador e o proprietário/responsável <strong>assinam na própria tela</strong>
        {' '}(dedo ou caneta). O PDF é então selado com um <strong>hash SHA-256</strong> — que prova que o
        arquivo não foi adulterado — e um <strong>QR Code</strong> que permite conferir o laudo original
        online a qualquer momento. É o que dá força ao documento numa contestação.
      </p>

      <Cta />
    </>
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
    updatedDate: '2026-07-12',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#1FB6FF 100%)', emoji: '📋', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'o-que-e', label: 'O que é um laudo de vistoria' },
      { id: 'quando-exigido', label: 'Quando ele é exigido' },
      { id: 'passo-a-passo', label: 'Passo a passo' },
      { id: 'erros-comuns', label: 'Erros que invalidam o laudo' },
      { id: 'modelo', label: 'Modelo pronto para seguir' },
    ],
    howTo: {
      name: 'Passo a passo de uma vistoria à prova de contestação',
      steps: [
        { name: 'Identifique o veículo', text: 'Placa, marca/modelo, cor e quilometragem. Erros aqui derrubam o documento inteiro.' },
        { name: 'Percorra o veículo em ordem fixa', text: 'Frente, lateral esquerda, traseira, lateral direita e teto. Uma ordem fixa evita esquecer áreas.' },
        { name: 'Registre cada avaria por peça e gravidade', text: 'Risco/abrasão, deformação ou fratura, e classifique em leve, média ou grave.' },
        { name: 'Fotografe com contexto', text: 'Uma foto aberta (onde está) e uma fechada (o detalhe), com data, hora e localização.' },
        { name: 'Colha as assinaturas', text: 'Vistoriador e proprietário/responsável, fechando o aceite das partes.' },
      ],
    },
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

        <BlogVideo
          src="/videos/vistoria-digital-tour.mp4"
          poster="/videos/vistoria-digital-tour-poster.jpg"
          title="Como funciona a vistoria digital do Danos Aparentes"
          description="O fluxo completo em 60 segundos: consulta automática da placa, marcação de avarias por toque no diagrama, assinatura na tela e laudo em PDF com hash SHA-256 e QR Code de verificação."
          duration="PT58S"
          uploadDate="2026-07-12"
          caption="O fluxo digital em 60 segundos: placa, toque no diagrama, assinatura e laudo verificável."
        />

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
    author: { name: 'Jeferson', role: 'Vistoria digital' },
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
        <p>
          Gerenciando vários vistoriadores e várias filiais? Veja{' '}
          <a href="/locadoras">como padronizar a vistoria em toda a sua frota</a>.
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
    author: { name: 'Jeferson', role: 'Vistoria digital' },
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

BLOG_POSTS.push(
  {
    slug: 'vistoria-de-moto',
    title: 'Vistoria de moto: o que muda na inspeção de avarias',
    excerpt:
      'Motos têm pontos de avaria próprios. Veja o que conferir, como registrar e como gerar um laudo com sua logo, campos personalizados e validação por QR Code.',
    category: 'Vistoria',
    tags: ['vistoria de moto', 'motocicleta', 'laudo', 'avarias'],
    date: '2026-06-25',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 45%,#f87171 100%)', emoji: '🏍️', image: '/vehicles-img/moto.png' },
    toc: [
      { id: 'pontos', label: 'Pontos críticos da moto' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          A moto é mais exposta que o carro — qualquer queda deixa marca. Por isso a vistoria precisa de
          um olhar específico para os pontos que mais sofrem, registrados peça a peça com foto.
        </p>

        <h2 id="pontos">Pontos críticos da moto</h2>
        <ul>
          <li><strong>Carenagens e tanque:</strong> riscos, amassados e trincas — onde a queda mais marca.</li>
          <li><strong>Guidão, manetes e retrovisores:</strong> empenamento e quebras.</li>
          <li><strong>Escapamento:</strong> amassados, oxidação e pontos de impacto.</li>
          <li><strong>Rodas e pneus:</strong> empenos, desgaste e o estado da relação/corrente.</li>
          <li><strong>Banco, farol e lanternas:</strong> rasgos, trincas e funcionamento.</li>
        </ul>
        <p>O método é o mesmo do carro: registre cada avaria por peça, classifique a gravidade e anexe foto com data e GPS.</p>

        <RecursosLaudo />

        <p>
          Quer o passo a passo geral? Leia o{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">guia completo do laudo de vistoria</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-de-caminhao',
    title: 'Vistoria de caminhão: roteiro completo de avarias',
    excerpt:
      'Cabine, baú, chassi e múltiplos eixos: o que inspecionar num caminhão e como emitir um laudo personalizado, com sua marca e validação por hash e QR Code.',
    category: 'Vistoria',
    tags: ['vistoria de caminhão', 'frota', 'laudo', 'avarias'],
    date: '2026-06-24',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0e7490 45%,#22d3ee 100%)', emoji: '🚚', image: '/vehicles-img/truck.png' },
    toc: [
      { id: 'pontos', label: 'O que inspecionar' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          No caminhão, a vistoria é maior e tem áreas que o carro não tem. Uma ordem fixa e um registro
          peça a peça evitam que algo passe — e protegem você na entrega e na devolução.
        </p>

        <h2 id="pontos">O que inspecionar num caminhão</h2>
        <ul>
          <li><strong>Cabine:</strong> para-choques, faróis, para-brisa, retrovisores e portas.</li>
          <li><strong>Baú / carroceria:</strong> chapas, lonas, longarinas e portas traseiras.</li>
          <li><strong>Chassi e quinta roda:</strong> trincas, oxidação e pontos de impacto.</li>
          <li><strong>Rodas e pneus (todos os eixos):</strong> desgaste, avarias e estepes.</li>
          <li><strong>Tanque e tampas:</strong> amassados e vazamentos aparentes.</li>
        </ul>
        <p>Com vários eixos e grandes superfícies, vale fotografar cada lado por completo, além do detalhe de cada avaria.</p>

        <RecursosLaudo />

        <p>
          Trabalha com frota? Veja também o{' '}
          <a href="/blog/checklist-vistoria-devolucao-locadora">checklist de devolução para locadoras</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-de-onibus',
    title: 'Vistoria de ônibus: como inspecionar e laudar avarias',
    excerpt:
      'Carroceria longa, muitas janelas e interior: o roteiro para vistoriar um ônibus e gerar um laudo com sua logo, campos sob medida e selo de QR Code e hash.',
    category: 'Vistoria',
    tags: ['vistoria de ônibus', 'frota', 'laudo', 'avarias'],
    date: '2026-06-23',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#155e2f 0%,#047857 45%,#34d399 100%)', emoji: '🚌', image: '/vehicles-img/bus.png' },
    toc: [
      { id: 'pontos', label: 'O que inspecionar' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          O ônibus tem uma carroceria longa e muitas superfícies — laterais, janelas, portas e interior.
          Vistoriar em ordem e registrar por seção é o que garante um laudo completo e sem brechas.
        </p>

        <h2 id="pontos">O que inspecionar num ônibus</h2>
        <ul>
          <li><strong>Carroceria lateral:</strong> riscos, amassados e a pintura ao longo de toda a extensão.</li>
          <li><strong>Janelas e para-brisas:</strong> trincas e vedação.</li>
          <li><strong>Portas e bagageiros:</strong> funcionamento, alinhamento e avarias.</li>
          <li><strong>Frente e traseira:</strong> para-choques, faróis e lanternas.</li>
          <li><strong>Interior:</strong> bancos, forração, piso e saídas de emergência.</li>
        </ul>
        <p>Pela extensão, fotografe a lateral inteira e depois o detalhe de cada ocorrência, sempre com data e GPS.</p>

        <RecursosLaudo />

        <p>
          Veja também o{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">guia completo do laudo de vistoria</a>.
        </p>
      </>
    ),
  },
)

BLOG_POSTS.push(
  {
    slug: 'como-fotografar-avarias',
    title: 'Como fotografar avarias à prova de contestação',
    excerpt:
      'A foto certa é o que segura a cobrança. Veja enquadramento, luz, escala e os metadados (data, hora, GPS) que tornam o registro indiscutível.',
    category: 'Boas práticas',
    tags: ['fotografia', 'avarias', 'vistoria', 'prova'],
    date: '2026-06-22',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#1e1b4b 0%,#4338ca 45%,#818cf8 100%)', emoji: '📷', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'porque', label: 'Por que a foto decide' },
      { id: 'enquadramento', label: 'Enquadramento' },
      { id: 'luz', label: 'Luz e ângulo' },
      { id: 'metadados', label: 'Data, hora e GPS' },
      { id: 'erros', label: 'Erros comuns' },
    ],
    content: (
      <>
        <p>
          Numa contestação, vence quem tem a prova melhor. E a prova é a foto. Uma imagem mal tirada
          enfraquece um laudo correto; uma bem tirada encerra a discussão.
        </p>

        <h2 id="porque">Por que a foto decide</h2>
        <p>
          O laudo aponta a avaria; a foto comprova que ela existe, onde está e quando foi registrada. Sem
          isso, é a sua palavra contra a do cliente.
        </p>

        <h2 id="enquadramento">Enquadramento: sempre duas fotos</h2>
        <ul>
          <li><strong>Foto aberta:</strong> mostra a peça inteira e a localização da avaria no veículo.</li>
          <li><strong>Foto de detalhe:</strong> aproxima o dano para revelar profundidade e extensão.</li>
          <li><strong>Referência de escala:</strong> aproxime de forma que dê para perceber o tamanho real.</li>
        </ul>

        <h2 id="luz">Luz e ângulo</h2>
        <ul>
          <li>Prefira <strong>luz natural difusa</strong>; evite sol estourando a imagem.</li>
          <li>Fotografe a <strong>45°</strong> para riscos e amassados aparecerem — de frente, eles somem.</li>
          <li>Limpe a área: poeira e reflexo escondem o dano.</li>
        </ul>

        <h2 id="metadados">Data, hora e GPS: o que torna indiscutível</h2>
        <p>
          Uma foto sem contexto pode ser de qualquer dia. Com <strong>data, hora e localização (GPS)</strong>
          {' '}embutidos, ela prova <em>quando</em> e <em>onde</em> a avaria foi registrada — exatamente o que
          o app faz automaticamente em cada foto do laudo, junto ao hash de validação.
        </p>

        <Cta />

        <h2 id="erros">Erros comuns que invalidam a prova</h2>
        <ul>
          <li>Só a foto de detalhe, sem a aberta (não dá para saber onde é).</li>
          <li>Foto tremida ou escura.</li>
          <li>Registrar dias depois — a data não bate com a entrega/devolução.</li>
        </ul>
        <p>
          Veja como tudo se junta no{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">guia completo do laudo de vistoria</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-de-frota-padronizar-equipe',
    title: 'Vistoria de frota: como padronizar a equipe',
    excerpt:
      'Quando cada um vistoria de um jeito, a cobrança falha. Veja como definir um padrão único — ordem, campos e laudo — e treinar a equipe para registros consistentes.',
    category: 'Frota',
    tags: ['frota', 'padronização', 'equipe', 'vistoria'],
    date: '2026-06-21',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 45%,#fb923c 100%)', emoji: '🚐', image: '/vehicles-img/microbus.png' },
    toc: [
      { id: 'porque', label: 'Por que padronizar' },
      { id: 'padrao', label: 'Defina um padrão único' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          Em frota, o problema raramente é falta de vistoria — é cada vistoriador fazer do seu jeito. Aí os
          laudos não se comparam, e a cobrança de um dano novo desanda na primeira contestação.
        </p>

        <h2 id="porque">Por que padronizar</h2>
        <p>
          Um padrão único garante que entrega e devolução são <strong>comparáveis peça a peça</strong>,
          independentemente de quem vistoriou. É isso que transforma o laudo em prova confiável.
        </p>

        <h2 id="padrao">Defina um padrão único</h2>
        <ul>
          <li><strong>Ordem fixa:</strong> sempre a mesma sequência (frente, lateral esquerda, traseira, lateral direita, teto, interior).</li>
          <li><strong>Mesmos campos:</strong> todos preenchem as mesmas informações — sem improviso.</li>
          <li><strong>Mesmo padrão de foto:</strong> aberta + detalhe, com data, hora e GPS.</li>
          <li><strong>Mesmo documento:</strong> o laudo sai igual para toda a equipe.</li>
        </ul>

        <RecursosLaudo />

        <p>
          Trabalha com locação? Veja também o{' '}
          <a href="/blog/checklist-vistoria-devolucao-locadora">checklist de devolução para locadoras</a>{' '}
          e como o{' '}
          <a href="/locadoras">sistema de vistoria para locadora e frota</a> resolve isso na prática.
        </p>
      </>
    ),
  },
  {
    slug: 'laudo-de-avarias-para-sinistro',
    title: 'Laudo de avarias para sinistro: como documentar para o seguro',
    excerpt:
      'Um sinistro mal documentado vira dor de cabeça com a seguradora. Veja o que registrar, como fotografar e como emitir um laudo com validação por hash e QR Code.',
    category: 'Seguro',
    tags: ['sinistro', 'seguro', 'laudo de avarias', 'documentação'],
    date: '2026-06-20',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f3d3e 0%,#0d9488 45%,#5eead4 100%)', emoji: '🛡️', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'espera', label: 'O que a seguradora espera' },
      { id: 'documentar', label: 'Como documentar' },
      { id: 'perfil', label: 'Perfil e campos' },
      { id: 'logo', label: 'Logo no PDF' },
      { id: 'validacao', label: 'QR Code e hash' },
    ],
    content: (
      <>
        <p>
          No sinistro, a diferença entre um processo rápido e uma novela é a documentação. Um laudo de
          avarias claro e validável acelera a análise e evita questionamentos.
        </p>

        <h2 id="espera">O que a seguradora espera</h2>
        <ul>
          <li><strong>Estado do veículo</strong> registrado por peça, com gravidade.</li>
          <li><strong>Fotos</strong> abertas e de detalhe, com data, hora e local.</li>
          <li><strong>Documento íntegro</strong>, que não possa ser alterado depois.</li>
        </ul>

        <h2 id="documentar">Como documentar bem</h2>
        <ul>
          <li>Registre <strong>todas</strong> as avarias aparentes, mesmo as pequenas.</li>
          <li>Não edite as fotos — a seguradora valoriza o registro original.</li>
          <li>Feche o laudo com assinaturas e selo de validação no mesmo dia da ocorrência.</li>
        </ul>

        <RecursosLaudo />

        <p>
          Não confunda com a vistoria de procedência: veja a diferença entre{' '}
          <a href="/blog/laudo-cautelar-vs-laudo-de-avarias">laudo cautelar e laudo de avarias</a>.
        </p>
      </>
    ),
  },
)

const RAIN_POSTS: BlogPost[] = [
  {
    slug: 'vistoria-na-chuva-sem-retrabalho',
    title: 'Vistoria na chuva: como evitar papel molhado, erro e retrabalho',
    excerpt:
      'Chuva, papel e celular pessoal formam uma combinação ruim para a vistoria. Veja como o Danos Aparentes ajuda a evitar perda de informação, fotos soltas e redigitação quando o pátio vira um caos.',
    category: 'Operação',
    tags: ['vistoria na chuva', 'retrabalho', 'prancheta', 'laudo digital', 'frota'],
    date: '2026-07-04',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f172a 0%,#334155 45%,#64748b 100%)', emoji: '🌧️', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'caos', label: 'Por que a chuva bagunça a vistoria' },
      { id: 'problema', label: 'O que se perde no fluxo manual' },
      { id: 'organizar', label: 'Como vistoriar sem retrabalho' },
      { id: 'resultado', label: 'O resultado para a operação' },
    ],
    content: (
      <>
        <p>
          Em dia seco, o papel já atrasa. Debaixo de chuva, ele vira problema operacional. Ficha molhada,
          anotação ilegível, foto tirada às pressas e correria para terminar logo transformam a vistoria em
          uma coleta de dados frágil, sujeita a erro e retrabalho.
        </p>
        <p>
          Quando o pátio está corrido e o clima aperta, a operação precisa de um fluxo que organize a
          vistoria no momento em que ela acontece, e não horas depois no escritório. Com o{' '}
          <strong>Danos Aparentes</strong>, esse registro já nasce mais claro, visual e pronto para virar
          laudo.
        </p>

        <div className="my-8 overflow-hidden rounded-2xl border border-[var(--card-border)] bg-black/10">
          <img
            src="/blog/vistoria-na-chuva-pos-chuva-smartphone.png"
            alt="Comparação entre vistoria confusa em papel pós-chuva e vistoria clara com smartphone"
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-cover"
          />
          <p className="px-4 py-3 text-xs leading-relaxed text-[var(--text-muted)]">
            Depois da chuva, a diferença entre improviso e processo continua evidente: de um lado, papel
            confuso e retrabalho; do outro, vistoria clara, organizada e pronta no smartphone.
          </p>
        </div>

        <h2 id="caos">Por que a chuva bagunça a vistoria</h2>
        <ul>
          <li><strong>O papel perde legibilidade</strong>, especialmente quando o preenchimento é feito às pressas.</li>
          <li><strong>O celular vira galeria solta</strong>, com fotos sem contexto e sem vínculo com a ficha.</li>
          <li><strong>O vistoriador acelera demais</strong>, porque quer sair do tempo ruim o quanto antes.</li>
          <li><strong>O escritório herda a desordem</strong>, tendo que reconstruir depois o que faltou no pátio.</li>
        </ul>

        <h2 id="problema">O que se perde no fluxo manual</h2>
        <p>
          O maior prejuízo da vistoria na chuva não é só a lentidão. É a perda de qualidade da prova. Uma
          anotação confusa, uma foto sem contexto ou uma informação esquecida enfraquecem o laudo na hora de
          comparar entrega e devolução.
        </p>
        <ul>
          <li><strong>Descrição incompleta</strong> da avaria.</li>
          <li><strong>Foto sem associação clara</strong> à peça vistoriada.</li>
          <li><strong>Campo faltando</strong>, que exige redigitação ou contato posterior com a equipe.</li>
          <li><strong>Mais tempo de escritório</strong>, justamente quando a operação precisa girar rápido.</li>
        </ul>

        <Cta />

        <h2 id="organizar">Como vistoriar sem retrabalho mesmo com chuva</h2>
        <ul>
          <li><strong>Registrar a avaria diretamente no celular</strong>, em vez de anotar primeiro no papel.</li>
          <li><strong>Vincular a foto ao dano na hora</strong>, sem depender de memória depois.</li>
          <li><strong>Fechar a vistoria no próprio pátio</strong>, com assinatura e laudo pronto.</li>
          <li><strong>Eliminar a reconstrução no escritório</strong>, que é onde o retrabalho cresce.</li>
        </ul>
        <p>
          Se a operação precisa continuar mesmo com tempo ruim, o processo tem que ser resiliente à chuva. É
          isso que reduz erro e protege a qualidade do laudo.
        </p>

        <h2 id="resultado">O resultado para a operação</h2>
        <p>
          Com um fluxo digital, a chuva deixa de ser gatilho para confusão. A equipe ganha consistência, o
          laudo sai mais rápido e a prova fica mais forte. Para complementar, veja também{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a>,{' '}
          <a href="/blog/vistoria-sem-papel">como sair da prancheta para o laudo digital</a> e{' '}
          <a href="/blog/antes-e-depois-da-vistoria-digital">o antes e depois da vistoria digital</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'antes-e-depois-da-vistoria-digital',
    title: 'Antes e depois da vistoria digital: o que muda na prática',
    excerpt:
      'Do papel molhado ao laudo pronto no celular: veja a diferença prática entre uma vistoria manual e o fluxo digital do Danos Aparentes, com marcação visual, fotos organizadas e PDF imediato.',
    category: 'Comparativo',
    tags: ['antes e depois', 'vistoria digital', 'prancheta', 'laudo veicular', 'produtividade'],
    date: '2026-07-04',
    updatedDate: '2026-07-12',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f172a 0%,#0f766e 45%,#22c55e 100%)', emoji: '📱', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'antes', label: 'Como funciona o antes' },
      { id: 'depois', label: 'Como funciona o depois' },
      { id: 'comparacao', label: 'O que muda na operação' },
      { id: 'cliente', label: 'O impacto para o cliente' },
    ],
    content: (
      <>
        <p>
          A comparação entre vistoria manual e vistoria digital não é estética. É operacional. No modelo
          antigo, a equipe anota, fotografa, redigita e revisa. No modelo digital, ela registra uma vez só
          e o laudo já nasce pronto para envio. No <strong>Danos Aparentes</strong>, essa virada fica visível
          já na rotina do pátio.
        </p>

        <BlogVideo
          src="/videos/vistoria-digital-promo.mp4"
          poster="/videos/vistoria-digital-promo-poster.jpg"
          title="Antes e depois da vistoria digital em 60 segundos"
          description="De 20 minutos de burocracia com papel e prancheta para 3 toques na tela: laudo 100% digital, assinado na tela, com GPS, hora exata, hash SHA-256 e QR Code — funcionando até offline."
          duration="PT58S"
          uploadDate="2026-07-12"
          caption="O antes e depois da vistoria em 60 segundos — de papel e prancheta para 3 toques na tela."
        />

        <h2 id="antes">Como funciona o antes</h2>
        <ul>
          <li><strong>Prancheta ou folha carbonada</strong> para anotar os danos.</li>
          <li><strong>Fotos no celular pessoal</strong>, sem ligação direta com a ficha.</li>
          <li><strong>Redigitação no escritório</strong>, consumindo mais tempo por veículo.</li>
          <li><strong>Maior risco de erro</strong> na transcrição e na organização das imagens.</li>
        </ul>

        <h2 id="depois">Como funciona o depois</h2>
        <ul>
          <li><strong>Marcação direta no diagrama do veículo</strong>, com localização visual da avaria.</li>
          <li><strong>Foto anexada no mesmo fluxo</strong>, já associada ao dano certo.</li>
          <li><strong>Assinatura na hora</strong>, sem etapa pendente posterior.</li>
          <li><strong>PDF pronto no final</strong>, com aparência profissional e histórico organizado.</li>
        </ul>

        <h2 id="comparacao">O que muda na operação</h2>
        <p>
          O maior ganho não é só parecer moderno. É reduzir retrabalho, acelerar a rotina e melhorar a
          comparabilidade entre as vistorias. A equipe deixa de gastar energia reconstruindo informação e
          passa a se concentrar no que importa: registrar bem o estado do veículo.
        </p>
        <ul>
          <li><strong>Menos tempo por vistoria</strong>.</li>
          <li><strong>Menos erro de transcrição</strong>.</li>
          <li><strong>Mais previsibilidade</strong> no padrão dos laudos.</li>
          <li><strong>Mais facilidade</strong> para provar o que mudou entre entrega e devolução.</li>
        </ul>

        <Cta />

        <h2 id="cliente">O impacto para o cliente</h2>
        <p>
          O cliente entende melhor um laudo visual, organizado e enviado rápido. Isso reduz ruído na
          devolução e melhora a percepção de profissionalismo da sua operação. Se quiser aprofundar esse
          contraste, leia também{' '}
          <a href="/blog/vistoria-na-chuva-sem-retrabalho">como vistoriar na chuva sem retrabalho</a>,{' '}
          <a href="/blog/erros-de-transcricao-na-vistoria">como evitar erros de transcrição</a> e{' '}
          <a href="/blog/como-fazer-mais-vistorias-por-dia">como fazer mais vistorias por dia</a>.
        </p>
      </>
    ),
  },
]

BLOG_POSTS.unshift(
  {
    slug: 'como-eliminar-redigitacao-na-vistoria-veicular',
    title: 'Como eliminar a redigitação na vistoria veicular',
    excerpt:
      'Se a vistoria começa no papel e termina no escritório, sua operação perde tempo duas vezes. Veja como o Danos Aparentes ajuda a eliminar a redigitação e transformar o laudo em um fluxo único, do pátio ao PDF.',
    category: 'Operação',
    tags: ['redigitação', 'vistoria veicular', 'laudo digital', 'produtividade', 'frota'],
    date: '2026-07-04',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#1e293b 0%,#2563eb 45%,#93c5fd 100%)', emoji: '⌨️', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'tempo', label: 'Onde o tempo é perdido' },
      { id: 'fluxo', label: 'Como eliminar a redigitação' },
      { id: 'campo', label: 'O que precisa ser registrado no campo' },
      { id: 'ganho', label: 'O ganho operacional na prática' },
    ],
    content: (
      <>
        <p>
          Redigitar laudo é pagar duas vezes pelo mesmo trabalho. Primeiro, o vistoriador anota no papel,
          tira foto no celular e segue para o próximo veículo. Depois, alguém precisa sentar no computador,
          reorganizar fotos, reler a ficha e preencher tudo de novo.
        </p>
        <p>
          Esse vai e volta consome tempo, cria atraso e abre espaço para erro. A solução não é digitar mais
          rápido. É fazer a vistoria nascer digital. Com o <strong>Danos Aparentes</strong>, a informação entra
          uma vez só e já segue para o laudo final.
        </p>

        <h2 id="tempo">Onde o tempo é perdido</h2>
        <ul>
          <li><strong>No preenchimento duplicado:</strong> o mesmo dado é escrito no pátio e reescrito no escritório.</li>
          <li><strong>Na organização das fotos:</strong> imagens ficam soltas na galeria e depois precisam ser associadas ao dano certo.</li>
          <li><strong>Na conferência manual:</strong> placa, quilometragem e observações precisam ser revisadas antes do PDF.</li>
          <li><strong>No retrabalho da equipe:</strong> qualquer campo faltando exige voltar ao vistoriador.</li>
        </ul>

        <h2 id="fluxo">Como eliminar a redigitação</h2>
        <p>
          O caminho mais eficiente é simples: registrar tudo no momento da vistoria, já dentro do fluxo que
          gera o laudo final. Isso significa que a equipe deve marcar a avaria, anexar a foto, preencher os
          dados do veículo e colher a assinatura na mesma sessão.
        </p>
        <ul>
          <li><strong>Um único registro:</strong> o dado entra uma vez e já segue para o PDF.</li>
          <li><strong>Foto vinculada à avaria:</strong> a imagem não fica perdida nem separada do dano.</li>
          <li><strong>Documento fechado:</strong> o laudo já sai pronto para envio, sem etapa extra de escritório.</li>
        </ul>

        <Cta />

        <h2 id="campo">O que precisa ser registrado no campo</h2>
        <ul>
          <li><strong>Identificação do veículo</strong> com placa, modelo, cor e quilometragem.</li>
          <li><strong>Avaria por peça</strong>, com tipo e gravidade.</li>
          <li><strong>Fotos abertas e de detalhe</strong>, já ligadas ao item certo do laudo.</li>
          <li><strong>Assinaturas</strong> do vistoriador e do responsável.</li>
        </ul>
        <p>
          Quando tudo isso é feito no pátio, a fase de escritório deixa de ser produção e vira apenas
          conferência pontual.
        </p>

        <h2 id="ganho">O ganho operacional na prática</h2>
        <p>
          Eliminar a redigitação reduz o tempo por veículo, diminui falhas de transcrição e libera a equipe
          para vistoriar mais. Também melhora a percepção do cliente, porque o documento sai mais rápido e
          com aparência profissional. Se quiser complementar esse tema, veja também o artigo sobre{' '}
          <a href="/blog/vistoria-sem-papel">vistoria sem papel</a> e o guia de{' '}
          <a href="/blog/como-fazer-mais-vistorias-por-dia">como fazer mais vistorias por dia</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'erros-de-transcricao-na-vistoria',
    title: 'Erros de transcrição na vistoria: como evitar no laudo',
    excerpt:
      'Placa errada, foto trocada, observação incompleta. Veja por que a transcrição manual enfraquece o laudo e como o Danos Aparentes ajuda a reduzir falhas antes que virem contestação ou retrabalho.',
    category: 'Boas práticas',
    tags: ['erros de transcrição', 'laudo de vistoria', 'retrabalho', 'vistoria digital', 'laudo'],
    date: '2026-07-04',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 45%,#fca5a5 100%)', emoji: '⚠️', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'porque', label: 'Por que os erros acontecem' },
      { id: 'tipos', label: 'Erros mais comuns no laudo' },
      { id: 'prevenir', label: 'Como prevenir na operação' },
      { id: 'impacto', label: 'O impacto na cobrança e no cliente' },
    ],
    content: (
      <>
        <p>
          Nem todo problema no laudo vem de uma vistoria ruim. Muitas vezes, a inspeção no pátio foi correta,
          mas a transcrição para o computador introduziu falhas que enfraquecem a prova.
        </p>
        <p>
          Um número trocado, uma foto associada à peça errada ou uma observação resumida demais já bastam
          para criar dúvida na devolução, no sinistro ou na auditoria interna. Com o{' '}
          <strong>Danos Aparentes</strong>, o dado nasce com mais contexto e menos espaço para erro.
        </p>

        <h2 id="porque">Por que os erros acontecem</h2>
        <ul>
          <li><strong>O processo é quebrado em etapas:</strong> uma pessoa registra e outra reconstrói o laudo depois.</li>
          <li><strong>As fotos ficam fora do contexto:</strong> a equipe precisa lembrar a que dano cada imagem pertence.</li>
          <li><strong>O tempo pressiona:</strong> quem redigita quer terminar rápido e acaba resumindo demais.</li>
          <li><strong>Não existe validação na origem:</strong> o dado só é percebido como errado quando o PDF já saiu.</li>
        </ul>

        <h2 id="tipos">Erros mais comuns no laudo</h2>
        <ul>
          <li><strong>Placa ou quilometragem incorretas</strong>, comprometendo a identificação do veículo.</li>
          <li><strong>Foto vinculada à peça errada</strong>, o que enfraquece a comprovação do dano.</li>
          <li><strong>Descrição vaga</strong>, como &ldquo;arranhado lateral&rdquo;, sem localização exata.</li>
          <li><strong>Campo faltando</strong>, exigindo contato extra com a equipe do pátio.</li>
        </ul>

        <h2 id="prevenir">Como prevenir na operação</h2>
        <p>
          O melhor jeito de reduzir erro de transcrição é fazer com que a transcrição deixe de existir. O
          dado precisa nascer no sistema já com contexto: avaria, foto, horário, local e assinatura. Além
          disso, vale padronizar a nomenclatura dos danos e a sequência da vistoria.
        </p>
        <ul>
          <li><strong>Preencha uma vez só</strong>, no momento da vistoria.</li>
          <li><strong>Padronize descrições</strong> para risco, amassado, trinca e quebra.</li>
          <li><strong>Associe foto e avaria no mesmo fluxo</strong>, sem depender de memória.</li>
          <li><strong>Revise antes de concluir</strong>, não horas depois no escritório.</li>
        </ul>

        <Cta />

        <h2 id="impacto">O impacto na cobrança e no cliente</h2>
        <p>
          Erro de transcrição custa tempo, credibilidade e dinheiro. Um laudo inconsistente é mais fácil de
          contestar e mais difícil de defender. Para aprofundar a origem desse retrabalho, veja também{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a> e{' '}
          <a href="/blog/avarias-preexistentes-como-provar">como provar avarias preexistentes</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-sem-papel',
    title: 'Vistoria sem papel: como sair da prancheta para o laudo digital',
    excerpt:
      'Prancheta, folha carbonada e planilha já não dão conta da vistoria moderna. Veja como migrar com o Danos Aparentes para um processo sem papel, com fotos, assinatura e PDF no mesmo fluxo.',
    category: 'Operação',
    tags: ['vistoria sem papel', 'prancheta', 'laudo digital', 'checklist digital', 'frota'],
    date: '2026-07-03',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#3f3f46 0%,#0f766e 45%,#5eead4 100%)', emoji: '📋', image: '/vehicles-img/van.png' },
    toc: [
      { id: 'papel', label: 'Por que o papel atrasa' },
      { id: 'digital', label: 'O que muda no fluxo digital' },
      { id: 'migracao', label: 'Como fazer a migração' },
      { id: 'resultado', label: 'O resultado para a operação' },
    ],
    content: (
      <>
        <p>
          O papel parece simples porque é conhecido. Mas, na vistoria, ele quase sempre é o começo de uma
          cadeia de retrabalho: ficha física, foto separada, planilha depois, revisão manual e atraso para
          enviar o documento ao cliente.
        </p>
        <p>
          Sair da prancheta não é apenas trocar suporte. É trocar um processo fragmentado por um fluxo único.
          No <strong>Danos Aparentes</strong>, isso acontece com marcação visual, fotos e PDF no mesmo caminho.
        </p>

        <h2 id="papel">Por que o papel atrasa</h2>
        <ul>
          <li><strong>Não integra foto e dano</strong>, então alguém precisa montar a relação depois.</li>
          <li><strong>Não valida o preenchimento</strong>, deixando campos em branco passarem despercebidos.</li>
          <li><strong>Exige guarda física</strong>, difícil de consultar em comparação futura.</li>
          <li><strong>Depende de redigitação</strong>, o que aumenta tempo e erro.</li>
        </ul>

        <h2 id="digital">O que muda no fluxo digital</h2>
        <p>
          Na vistoria sem papel, a equipe registra a avaria diretamente no diagrama do veículo, anexa fotos,
          coleta assinatura e fecha o laudo na mesma sessão. O resultado é um PDF pronto para envio, sem
          passar por uma segunda produção no escritório.
        </p>
        <ul>
          <li><strong>Registro por peça</strong>, com localização clara do dano.</li>
          <li><strong>Fotos com contexto</strong>, associadas ao item correto.</li>
          <li><strong>Assinatura na hora</strong>, fechando o aceite do responsável.</li>
          <li><strong>Histórico consultável</strong>, útil para entrega, devolução e sinistro.</li>
        </ul>

        <Cta />

        <h2 id="migracao">Como fazer a migração</h2>
        <ul>
          <li><strong>Defina uma sequência padrão</strong> de vistoria antes de digitalizar.</li>
          <li><strong>Treine a equipe no celular</strong>, não só no escritório.</li>
          <li><strong>Escolha um modelo de laudo único</strong> para toda a operação.</li>
          <li><strong>Comece por entrega e devolução</strong>, onde o ganho costuma ser mais visível.</li>
        </ul>

        <h2 id="resultado">O resultado para a operação</h2>
        <p>
          A vistoria sem papel reduz tempo, organiza melhor a prova e melhora a experiência do cliente. Se
          você quiser aprofundar o lado operacional, leia também{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a> e{' '}
          <a href="/blog/como-fazer-mais-vistorias-por-dia">como fazer mais vistorias por dia</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'como-padronizar-equipe-de-vistoria-e-acabar-com-o-retrabalho',
    title: 'Como padronizar a equipe de vistoria e acabar com o retrabalho',
    excerpt:
      'Quando cada vistoriador registra de um jeito, a operação perde consistência e velocidade. Veja como o Danos Aparentes ajuda a padronizar a equipe para reduzir retrabalho e produzir laudos comparáveis.',
    category: 'Frota',
    tags: ['padronizar equipe de vistoria', 'retrabalho', 'frota', 'processo operacional', 'laudo'],
    date: '2026-07-03',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 45%,#fdba74 100%)', emoji: '👥', image: '/vehicles-img/microbus.png' },
    toc: [
      { id: 'cada-um', label: 'O custo do cada um faz de um jeito' },
      { id: 'padrao', label: 'O que precisa estar padronizado' },
      { id: 'treinamento', label: 'Como treinar sem travar a operação' },
      { id: 'comparavel', label: 'Por que isso melhora a comparação' },
    ],
    content: (
      <>
        <p>
          O retrabalho na vistoria nem sempre vem do volume. Muitas vezes ele vem da falta de padrão. Um
          vistoriador descreve &ldquo;risco lateral&rdquo;, outro escreve &ldquo;arranhado porta esquerda&rdquo;, e um terceiro
          tira só uma foto de detalhe. Depois ninguém consegue comparar os laudos com segurança. Com o{' '}
          <strong>Danos Aparentes</strong>, o padrão fica mais fácil de repetir em toda a equipe.
        </p>

        <h2 id="cada-um">O custo do cada um faz de um jeito</h2>
        <ul>
          <li><strong>Laudos não comparáveis</strong>, o que dificulta provar dano novo.</li>
          <li><strong>Mais revisão interna</strong>, porque alguém precisa corrigir inconsistências.</li>
          <li><strong>Treinamento informal</strong>, baseado em hábito, não em processo.</li>
          <li><strong>Cliente confuso</strong>, ao receber documentos com padrões diferentes.</li>
        </ul>

        <h2 id="padrao">O que precisa estar padronizado</h2>
        <ul>
          <li><strong>Sequência de inspeção</strong>, sempre na mesma ordem.</li>
          <li><strong>Nomenclatura dos danos</strong>, para evitar descrições ambíguas.</li>
          <li><strong>Padrão de foto</strong>, com imagem aberta e detalhe.</li>
          <li><strong>Estrutura do laudo</strong>, com os mesmos campos para toda a equipe.</li>
        </ul>
        <p>
          Padronização não é engessar a operação. É evitar que a qualidade do laudo dependa da memória ou do
          estilo pessoal de quem vistoriou.
        </p>

        <h2 id="treinamento">Como treinar sem travar a operação</h2>
        <ul>
          <li><strong>Treine com casos reais</strong>, não só com instrução teórica.</li>
          <li><strong>Use exemplos de bom e mau preenchimento</strong> para acelerar o aprendizado.</li>
          <li><strong>Revise os primeiros laudos</strong> até o padrão ficar natural.</li>
          <li><strong>Centralize o processo em um único fluxo</strong>, para reduzir improviso.</li>
        </ul>

        <Cta />

        <h2 id="comparavel">Por que isso melhora a comparação</h2>
        <p>
          Quando a equipe segue o mesmo método, entrega e devolução passam a conversar entre si. Isso reduz
          retrabalho, encurta discussão e fortalece a cobrança. Para complementar, veja também o artigo{' '}
          <a href="/blog/vistoria-de-frota-padronizar-equipe">vistoria de frota: como padronizar a equipe</a> e
          o guia sobre <a href="/blog/erros-de-transcricao-na-vistoria">erros de transcrição na vistoria</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'como-fazer-mais-vistorias-por-dia',
    title: 'Como fazer mais vistorias por dia sem aumentar a equipe',
    excerpt:
      'O gargalo da vistoria nem sempre está no pátio. Muitas vezes está no retrabalho depois. Veja como ganhar escala com o Danos Aparentes, menos redigitação e mais padrão operacional.',
    category: 'Produtividade',
    tags: ['mais vistorias por dia', 'produtividade', 'equipe de vistoria', 'frota', 'operação'],
    date: '2026-07-02',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 45%,#86efac 100%)', emoji: '⏱️', image: '/vehicles-img/truck.png' },
    toc: [
      { id: 'gargalo', label: 'Onde está o gargalo' },
      { id: 'ganhos', label: 'Ganhos rápidos de produtividade' },
      { id: 'processo', label: 'Como escalar sem perder qualidade' },
      { id: 'metricas', label: 'Métricas para acompanhar' },
    ],
    content: (
      <>
        <p>
          Quando a operação quer fazer mais vistorias por dia, a reação comum é pensar em contratar mais
          gente. Mas, antes disso, vale olhar para o processo: quantos minutos sua equipe perde com papel,
          redigitação, busca de foto e correção de laudo?
        </p>
        <p>
          Em muitas empresas, o gargalo não é a inspeção em si. É tudo o que acontece depois dela.
          Com o <strong>Danos Aparentes</strong>, a equipe reduz etapas paralelas e aproveita melhor o tempo
          de cada vistoria.
        </p>

        <h2 id="gargalo">Onde está o gargalo</h2>
        <ul>
          <li><strong>No fluxo quebrado</strong>, quando o laudo precisa ser reconstruído no escritório.</li>
          <li><strong>Na falta de padrão</strong>, que exige revisão frequente dos documentos.</li>
          <li><strong>Na consulta de histórico</strong>, quando a vistoria anterior é difícil de recuperar.</li>
          <li><strong>Na aprovação demorada</strong>, porque o responsável só assina depois.</li>
        </ul>

        <h2 id="ganhos">Ganhos rápidos de produtividade</h2>
        <ul>
          <li><strong>Registrar tudo no celular</strong>, já durante a vistoria.</li>
          <li><strong>Eliminar a redigitação</strong>, transformando o PDF em saída automática.</li>
          <li><strong>Padronizar o roteiro</strong>, para reduzir indecisão da equipe.</li>
          <li><strong>Coletar assinatura na hora</strong>, sem etapa pendente depois.</li>
        </ul>
        <p>
          Esses ajustes encurtam o ciclo por veículo e fazem o mesmo time produzir mais sem sacrificar a
          qualidade do documento.
        </p>

        <h2 id="processo">Como escalar sem perder qualidade</h2>
        <p>
          Escalar vistoria com segurança exige fluxo simples e prova consistente. Não adianta ganhar
          velocidade se o laudo fica frágil. O ideal é combinar rapidez com registro por peça, fotos com
          contexto e validação do documento final.
        </p>
        <ul>
          <li><strong>Mais velocidade</strong> sem abrir mão da evidência.</li>
          <li><strong>Mais veículos</strong> sem crescer o retrabalho.</li>
          <li><strong>Mais previsibilidade</strong> na rotina da equipe.</li>
        </ul>

        <Cta />

        <h2 id="metricas">Métricas para acompanhar</h2>
        <ul>
          <li><strong>Tempo médio por vistoria</strong>.</li>
          <li><strong>Número de laudos concluídos por dia</strong>.</li>
          <li><strong>Percentual de laudos com correção posterior</strong>.</li>
          <li><strong>Tempo entre vistoria e envio do PDF</strong>.</li>
        </ul>
        <p>
          Se quiser atuar na raiz do problema, siga com{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a> e{' '}
          <a href="/blog/vistoria-sem-papel">como sair da prancheta para o laudo digital</a>.
        </p>
      </>
    ),
  },
)

BLOG_POSTS.unshift(
  {
    slug: 'avarias-preexistentes-como-provar',
    title: 'Avarias preexistentes: como provar que o dano já estava no veículo',
    excerpt:
      'Quando o cliente diz que o risco ou amassado já existia, só a prova encerra a discussão. Veja como o Danos Aparentes ajuda a registrar avarias preexistentes de forma clara, comparável e incontestável.',
    category: 'Locadora',
    tags: ['avarias preexistentes', 'vistoria veicular', 'locadora', 'frota', 'laudo de avarias'],
    date: '2026-07-04',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#7c2d12 0%,#ea580c 45%,#fb923c 100%)', emoji: '🧾', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'prejuizo', label: 'Por que a avaria preexistente vira prejuízo' },
      { id: 'provar', label: 'O que realmente prova' },
      { id: 'processo', label: 'Processo ideal de registro' },
      { id: 'erros', label: 'Erros que enfraquecem a cobrança' },
    ],
    howTo: {
      name: 'Processo ideal de registro para evitar disputa',
      steps: [
        { name: 'Faça a vistoria de entrega em ordem fixa', text: 'Para nunca pular uma área do veículo.' },
        { name: 'Registre toda avaria existente na retirada', text: 'Inclusive as pequenas.' },
        { name: 'Colha as assinaturas no mesmo ato', text: 'Sem deixar para depois.' },
        { name: 'Repita o mesmo padrão na devolução', text: 'Para comparar laudo com laudo.' },
        { name: 'Cobre somente o que for dano novo e comprovável', text: 'Com base objetiva.' },
      ],
    },
    content: (
      <>
        <p>
          O prejuízo invisível nasce quando o cliente devolve o veículo com um risco, amassado ou trinca
          e diz: <strong>&ldquo;isso já estava aí&rdquo;</strong>. Se a sua empresa não tem um registro
          comparável, datado e assinado da retirada, a discussão termina quase sempre do mesmo jeito: a
          funilaria sai do seu caixa.
        </p>
        <p>
          A boa notícia é que avaria preexistente não precisa ser tema de bate-boca. Com o processo certo,
          você transforma opinião em prova e protege a margem da locadora, da frota ou do pátio. Com o{' '}
          <strong>Danos Aparentes</strong>, esse registro fica mais visual, rastreável e fácil de comparar.
        </p>

        <h2 id="prejuizo">Por que a avaria preexistente vira prejuízo</h2>
        <p>
          O problema não é apenas o dano em si. O problema é a <strong>falta de comparação confiável</strong>
          entre o estado do veículo na entrega e na devolução. Quando cada vistoria é feita de um jeito,
          com fotos soltas e descrições vagas, fica impossível demonstrar se a avaria já existia ou se
          surgiu depois.
        </p>
        <ul>
          <li><strong>Sem foto de retirada:</strong> você não prova que a peça estava íntegra.</li>
          <li><strong>Sem descrição por peça:</strong> um dano novo pode ser confundido com um antigo.</li>
          <li><strong>Sem assinatura:</strong> falta aceite formal do responsável.</li>
          <li><strong>Sem validação do documento:</strong> qualquer contestação coloca o laudo em dúvida.</li>
        </ul>

        <h2 id="provar">O que realmente prova que o dano já estava no veículo</h2>
        <p>
          Para uma avaria ser reconhecida como preexistente, o registro precisa mostrar{' '}
          <strong>onde</strong> ela estava, <strong>quando</strong> foi capturada e{' '}
          <strong>quem</strong> concordou com aquele estado. Na prática, isso exige:
        </p>
        <ul>
          <li><strong>Laudo de retirada completo</strong>, com placa, modelo, quilometragem e data.</li>
          <li><strong>Marcação da avaria por peça</strong>, para não depender de memória ou interpretação.</li>
          <li><strong>Fotos abertas e de detalhe</strong>, para provar contexto e extensão.</li>
          <li><strong>Metadados de data, hora e GPS</strong>, que amarram o registro a um momento real.</li>
          <li><strong>Assinatura do responsável</strong>, confirmando o estado do veículo na saída.</li>
        </ul>
        <p>
          E o que dá robustez final ao processo é um documento que não possa ser alterado depois, com{' '}
          <strong>hash de validação e QR Code</strong>. Assim, se houver contestação dias depois, sua equipe
          não precisa argumentar: basta apresentar a prova original.
        </p>

        <Cta />

        <h2 id="processo">Processo ideal de registro para evitar disputa</h2>
        <ul>
          <li><strong>1. Faça a vistoria de entrega em ordem fixa</strong> para nunca pular uma área do veículo.</li>
          <li><strong>2. Registre toda avaria existente na retirada</strong>, inclusive as pequenas.</li>
          <li><strong>3. Colha as assinaturas no mesmo ato</strong>, sem deixar para depois.</li>
          <li><strong>4. Repita o mesmo padrão na devolução</strong>, para comparar laudo com laudo.</li>
          <li><strong>5. Cobre somente o que for dano novo e comprovável</strong>, com base objetiva.</li>
        </ul>
        <p>
          Esse método é o que transforma a expressão <em>avaria preexistente</em> em algo verificável, não em
          uma alegação. Se quiser aprofundar o fluxo completo, veja também o{' '}
          <a href="/blog/checklist-vistoria-devolucao-locadora">checklist de devolução para locadoras</a>.
        </p>

        <h2 id="erros">Erros que enfraquecem a cobrança</h2>
        <ul>
          <li>Usar fotos do WhatsApp sem contexto, sem data e sem vinculação ao laudo.</li>
          <li>Registrar apenas danos grandes e ignorar riscos leves ou marcas discretas.</li>
          <li>Escrever descrições genéricas como &ldquo;arranhado lateral&rdquo;.</li>
          <li>Fazer vistoria na entrega e na devolução com formulários diferentes.</li>
        </ul>
        <p>
          Se sua operação quer parar de absorver pequenos reparos que somam no fim do mês, a prioridade é
          simples: registrar bem a retirada para cobrar com segurança na devolução. Comece pelo{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">guia completo do laudo de vistoria</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-entrega-veiculo',
    title: 'Vistoria de entrega de veículo: como evitar discussões na devolução',
    excerpt:
      'A devolução só é tranquila quando a entrega foi bem registrada. Veja como o Danos Aparentes ajuda a fazer uma vistoria de entrega comparável, assinada e pronta para sustentar cobranças de danos novos.',
    category: 'Vistoria',
    tags: ['vistoria de entrega', 'devolução de veículo', 'locadora', 'frota', 'laudo veicular'],
    date: '2026-07-03',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 45%,#60a5fa 100%)', emoji: '🚗', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'importancia', label: 'Por que a entrega define a devolução' },
      { id: 'checklist', label: 'Checklist da vistoria de entrega' },
      { id: 'comparacao', label: 'Como garantir comparação depois' },
      { id: 'falhas', label: 'Falhas mais comuns' },
    ],
    content: (
      <>
        <p>
          Muita empresa tenta resolver a discussão na devolução, mas o resultado da devolução é decidido na
          entrega. Se o veículo sai sem um registro claro do estado inicial, qualquer dano novo vira tema de
          negociação, desconto ou prejuízo absorvido.
        </p>
        <p>
          A vistoria de entrega é o momento em que você cria a <strong>linha de base</strong> do veículo.
          Quanto mais objetiva e padronizada ela for, mais fácil fica identificar o que realmente mudou no
          retorno. Com o <strong>Danos Aparentes</strong>, essa base já fica organizada para comparação futura.
        </p>

        <h2 id="importancia">Por que a entrega define a devolução</h2>
        <p>
          Na prática, a devolução não começa quando o carro volta ao pátio. Ela começa quando o carro sai.
          É nesse instante que sua equipe precisa registrar riscos, amassados, trincas, itens internos,
          quilometragem e documentos. Sem esse marco inicial, não existe base confiável para cobrar nada.
        </p>
        <ul>
          <li><strong>Entrega bem feita:</strong> devolução objetiva e comparável.</li>
          <li><strong>Entrega mal feita:</strong> contestação, retrabalho e margem perdida.</li>
        </ul>

        <h2 id="checklist">Checklist da vistoria de entrega</h2>
        <ul>
          <li><strong>Identificação do veículo:</strong> placa, modelo, cor e quilometragem.</li>
          <li><strong>Exterior em ordem fixa:</strong> frente, lateral esquerda, traseira, lateral direita e teto.</li>
          <li><strong>Interior:</strong> bancos, painel, multimídia, tapetes e acabamentos.</li>
          <li><strong>Itens e documentos:</strong> chave reserva, manual, estepe e acessórios entregues.</li>
          <li><strong>Fotos padrão:</strong> uma aberta e uma de detalhe por avaria existente.</li>
          <li><strong>Aceite formal:</strong> assinatura do vistoriador e do cliente/responsável.</li>
        </ul>
        <p>
          Esse roteiro evita a vistoria superficial, em que todo mundo olha rápido para o carro, mas ninguém
          produz uma prova realmente utilizável depois.
        </p>

        <h2 id="comparacao">Como garantir comparação sem achismo</h2>
        <p>
          O segredo não é apenas vistoriar bem. É vistoriar <strong>sempre do mesmo jeito</strong>. Entrega e
          devolução precisam compartilhar o mesmo formulário, o mesmo padrão de fotos e a mesma lógica de
          classificação. Quando isso acontece, a análise deixa de ser subjetiva.
        </p>
        <ul>
          <li><strong>Mesmo fluxo</strong> para todas as unidades e vistoriadores.</li>
          <li><strong>Mesmo padrão de nomenclatura</strong> para riscos, amassados e trincas.</li>
          <li><strong>Mesmo tipo de laudo</strong>, com hash, QR Code e histórico consistente.</li>
        </ul>

        <Cta />

        <h2 id="falhas">Falhas mais comuns na vistoria de entrega</h2>
        <ul>
          <li>Fazer registro rápido demais e deixar pequenas avarias sem anotação.</li>
          <li>Tirar poucas fotos ou sem contextualizar a peça afetada.</li>
          <li>Preencher parte no pátio e parte depois, já fora do momento da entrega.</li>
          <li>Usar planilha, papel ou mensagens dispersas em vez de um laudo fechado.</li>
        </ul>
        <p>
          Se o seu objetivo é reduzir discussão na devolução, comece fortalecendo a entrega. Depois, complemente
          com o{' '}
          <a href="/blog/como-fotografar-avarias">guia de fotos de avarias à prova de contestação</a> e o{' '}
          <a href="/blog/vistoria-de-frota-padronizar-equipe">artigo sobre padronização da equipe</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'como-reduzir-prejuizo-com-avarias-na-frota',
    title: 'Como reduzir prejuízo com avarias na frota',
    excerpt:
      'Pequenos danos ignorados, registros inconsistentes e cobranças mal sustentadas corroem a margem da operação. Veja como o Danos Aparentes ajuda a reduzir prejuízo com processo, padrão e prova digital.',
    category: 'Frota',
    tags: ['avarias na frota', 'gestão de frota', 'prejuízo operacional', 'vistoria', 'controle de danos'],
    date: '2026-07-02',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#14532d 0%,#16a34a 45%,#86efac 100%)', emoji: '📉', image: '/vehicles-img/van.png' },
    toc: [
      { id: 'onde', label: 'Onde o prejuízo nasce' },
      { id: 'controle', label: 'Controles que reduzem perda' },
      { id: 'operacao', label: 'Como implantar na operação' },
      { id: 'indicadores', label: 'Indicadores para acompanhar' },
    ],
    content: (
      <>
        <p>
          O prejuízo com avarias na frota raramente vem de um único grande dano. Na maioria das vezes, ele
          aparece na soma de pequenos reparos, cobranças não realizadas, retrabalho da equipe e tempo gasto
          em discussão com cliente, motorista ou fornecedor.
        </p>
        <p>
          Quando a operação não tem um processo padrão de vistoria, cada avaria mal registrada vira custo
          invisível. E custo invisível é o tipo mais perigoso, porque ele cresce antes de chamar atenção. Com
          o <strong>Danos Aparentes</strong>, a operação ganha mais consistência para enxergar e conter essas perdas.
        </p>

        <h2 id="onde">Onde o prejuízo nasce</h2>
        <ul>
          <li><strong>Na entrega sem registro completo</strong>, que impede comparar depois.</li>
          <li><strong>Na devolução sem critério</strong>, que abre espaço para contestação.</li>
          <li><strong>Na falta de padrão da equipe</strong>, quando cada vistoriador olha e escreve de um jeito.</li>
          <li><strong>Na documentação fraca</strong>, sem foto, assinatura ou validação do arquivo.</li>
        </ul>
        <p>
          O resultado é conhecido: danos novos não são cobrados, danos antigos são rediscutidos, e a empresa
          paga reparos que poderiam ter sido imputados com tranquilidade.
        </p>

        <h2 id="controle">Controles que reduzem perda de verdade</h2>
        <ul>
          <li><strong>Padrão único de vistoria</strong> para entrega, movimentação interna e devolução.</li>
          <li><strong>Registro por peça e gravidade</strong>, evitando descrições vagas.</li>
          <li><strong>Fotos abertas e de detalhe</strong> com data, hora e GPS.</li>
          <li><strong>Laudo fechado e validável</strong>, com hash e QR Code para consulta.</li>
          <li><strong>Histórico centralizado</strong>, para recuperar rápido a vistoria anterior.</li>
        </ul>
        <p>
          Nenhum desses controles depende de aumentar burocracia. O ganho real está em trocar improviso por
          repetição bem desenhada.
        </p>

        <h2 id="operacao">Como implantar sem travar a operação</h2>
        <ul>
          <li><strong>Defina uma sequência única de inspeção</strong> para todos os veículos.</li>
          <li><strong>Treine a equipe com exemplos reais</strong> de risco, amassado, trinca e quebra.</li>
          <li><strong>Use o mesmo laudo em todas as etapas</strong>, do pátio à devolução.</li>
          <li><strong>Revise a cobrança com base em comparação</strong>, não em memória do atendente.</li>
        </ul>
        <p>
          Para muita empresa, a redução de prejuízo começa quando o processo deixa de depender do colaborador
          mais experiente e passa a depender de um método consistente.
        </p>

        <Cta />

        <h2 id="indicadores">Indicadores para acompanhar mês a mês</h2>
        <ul>
          <li><strong>Valor mensal de reparos absorvidos</strong> pela empresa.</li>
          <li><strong>Percentual de avarias cobradas com sucesso</strong>.</li>
          <li><strong>Tempo médio de vistoria</strong> por entrega ou devolução.</li>
          <li><strong>Número de contestações</strong> por unidade ou por atendente.</li>
        </ul>
        <p>
          Se esses números melhoram, sua operação está ficando mais protegida. Se continuam iguais, o problema
          não é apenas o dano: é a forma de registrar. Vale seguir com o{' '}
          <a href="/blog/avarias-preexistentes-como-provar">artigo sobre avarias preexistentes</a> e o{' '}
          <a href="/blog/checklist-vistoria-devolucao-locadora">checklist de devolução</a> para fechar o processo.
        </p>
      </>
    ),
  },
)

BLOG_POSTS.unshift(...RAIN_POSTS)

BLOG_POSTS.unshift(
  {
    slug: 'laudo-com-logo-da-empresa-no-pdf',
    title: 'Laudo com logo da empresa no PDF: mais profissional com Danos Aparentes',
    excerpt:
      'Veja como personalizar o laudo com a logo e o nome da sua empresa no Danos Aparentes para entregar um PDF mais profissional, conceitual e alinhado à identidade da sua operação.',
    category: 'Laudo',
    tags: ['logo da empresa', 'pdf de vistoria', 'laudo profissional', 'white-label', 'danos aparentes'],
    date: '2026-07-04',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#111827 0%,#0c4a6e 45%,#38bdf8 100%)', emoji: '🏢', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'identidade', label: 'Por que colocar sua logo no laudo' },
      { id: 'profissional', label: 'O que muda na percepção do cliente' },
      { id: 'como-funciona', label: 'Como funciona no Danos Aparentes' },
      { id: 'quando-usar', label: 'Quando isso faz mais diferença' },
    ],
    content: (
      <>
        <p>
          Um laudo bem feito não precisa parecer genérico. Quando o PDF sai com a <strong>logo da empresa</strong>
          {' '}e o <strong>nome no cabeçalho</strong>, a vistoria ganha outra presença: mais profissional,
          mais organizada e mais alinhada à identidade da sua operação.
        </p>
        <p>
          Para locadoras, concessionárias, frotas e despachantes, isso faz diferença prática. O cliente
          recebe um documento com cara de processo oficial, não um arquivo improvisado ou sem assinatura de
          marca. E, com o <strong>Danos Aparentes</strong>, essa apresentação profissional já sai pronta na rotina.
        </p>

        <h2 id="identidade">Por que colocar sua logo no laudo</h2>
        <p>
          O laudo de vistoria é uma extensão da sua operação. Se ele chega ao cliente com identidade visual,
          ele transmite mais confiança e reforça o posicionamento da empresa em cada entrega, devolução ou
          inspeção.
        </p>
        <ul>
          <li><strong>Reforça a marca</strong> em um momento importante da jornada do cliente.</li>
          <li><strong>Deixa o documento mais profissional</strong> do que um PDF genérico.</li>
          <li><strong>Cria uma apresentação mais conceitual</strong>, com aparência consistente e institucional.</li>
          <li><strong>Valoriza a operação</strong>, mesmo quando a vistoria precisa ser feita rápido.</li>
        </ul>

        <h2 id="profissional">O que muda na percepção do cliente</h2>
        <p>
          Na prática, o cliente entende melhor quando recebe um laudo visualmente organizado, com cabeçalho
          padronizado e identidade clara. Isso ajuda a reduzir ruído, passa mais segurança e mostra que a
          vistoria segue um método, não um improviso.
        </p>
        <ul>
          <li><strong>Mais credibilidade</strong> para cobrança e aceite.</li>
          <li><strong>Mais clareza</strong> sobre quem emitiu o documento.</li>
          <li><strong>Mais percepção de cuidado</strong> com o processo e com a entrega.</li>
        </ul>

        <h2 id="como-funciona">Como funciona no Danos Aparentes</h2>
        <p>
          No <strong>Danos Aparentes</strong>, o laudo pode sair com a sua <strong>logo</strong> e o{' '}
          <strong>nome da empresa</strong> no PDF. Isso transforma o relatório em um documento{' '}
          <em>white-label</em>, com a cara da sua marca.
        </p>

        <LaudoSheet />

        <p>
          Além da identidade visual, o documento mantém o que importa na operação: marcação das avarias,
          fotos, assinaturas, QR Code e hash de validação. Ou seja, não é só bonito: é profissional e útil
          na rotina.
        </p>

        <Cta />

        <h2 id="quando-usar">Quando isso faz mais diferença</h2>
        <ul>
          <li><strong>Locadoras</strong>, que entregam e recebem veículos todos os dias.</li>
          <li><strong>Concessionárias</strong>, que querem elevar a apresentação da vistoria ao cliente.</li>
          <li><strong>Frotas corporativas</strong>, que precisam de padronização entre equipes e unidades.</li>
          <li><strong>Despachantes e prestadores</strong>, que usam o laudo como vitrine do próprio serviço.</li>
        </ul>
        <p>
          Se você quer aprofundar esse lado do documento, vale ler também o{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">guia completo do laudo de vistoria</a> e o
          artigo sobre <a href="/blog/antes-e-depois-da-vistoria-digital">antes e depois da vistoria digital</a>.
        </p>
      </>
    ),
  },
)

BLOG_POSTS.unshift(
  {
    slug: 'laudo-de-vistoria-com-assinatura-digital',
    title: 'Laudo de vistoria com assinatura digital: mais segurança com Danos Aparentes',
    excerpt:
      'Veja como o Danos Aparentes usa assinatura digital no laudo para deixar o aceite mais claro, profissional e difícil de contestar na rotina da vistoria.',
    category: 'Validade',
    tags: ['assinatura digital', 'laudo de vistoria', 'validade do laudo', 'danos aparentes', 'prova digital'],
    date: '2026-07-04',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f172a 0%,#0c4a6e 45%,#38bdf8 100%)', emoji: '✍️', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'importancia', label: 'Por que a assinatura muda o laudo' },
      { id: 'como-funciona', label: 'Como funciona no Danos Aparentes' },
      { id: 'prova', label: 'O peso da assinatura na prova' },
      { id: 'quando-usar', label: 'Quando isso faz mais diferença' },
    ],
    content: (
      <>
        <p>
          Um laudo sem assinatura pode até registrar a avaria, mas deixa uma brecha justamente no momento mais
          sensível: o aceite. Com o <strong>Danos Aparentes</strong>, a assinatura digital ajuda a fechar esse
          ponto no próprio fluxo da vistoria, sem papel solto nem confirmação pendente para depois.
        </p>
        <p>
          Isso torna o documento mais profissional, mais claro para o cliente e muito mais consistente para a
          operação quando surge contestação.
        </p>

        <h2 id="importancia">Por que a assinatura muda o laudo</h2>
        <p>
          A assinatura não é um detalhe visual. Ela é o momento em que o responsável reconhece o estado do
          veículo registrado naquele documento. Sem ela, o laudo pode parecer unilateral; com ela, o aceite
          fica muito mais forte.
        </p>
        <ul>
          <li><strong>Formaliza o aceite</strong> no ato da vistoria.</li>
          <li><strong>Reduz ruído</strong> entre quem entrega e quem recebe.</li>
          <li><strong>Fortalece a cobrança</strong> de danos novos ou divergências futuras.</li>
          <li><strong>Passa mais confiança</strong> para cliente, locadora e gestor de frota.</li>
        </ul>

        <h2 id="como-funciona">Como funciona no Danos Aparentes</h2>
        <p>
          No <strong>Danos Aparentes</strong>, o vistoriador e o responsável assinam na própria tela, no mesmo
          fluxo em que as avarias são marcadas, as fotos são anexadas e o PDF é gerado. Isso evita etapa
          paralela, elimina retrabalho e mantém o aceite junto do restante da prova.
        </p>
        <ul>
          <li><strong>Assinatura na hora</strong>, sem precisar imprimir ou escanear.</li>
          <li><strong>Documento já fechado</strong> com identidade, avarias, fotos e aceite.</li>
          <li><strong>Mais organização</strong> para envio, consulta e comparação futura.</li>
        </ul>

        <Cta />

        <h2 id="prova">O peso da assinatura na prova</h2>
        <p>
          Assinatura sozinha não resolve tudo, mas combinada com fotos, marcação visual, QR Code e hash, ela
          aumenta muito a robustez do laudo. O documento deixa de ser apenas descritivo e passa a ter mais
          força operacional como registro aceito pelas partes.
        </p>
        <p>
          Para entender esse complemento, vale seguir com{' '}
          <a href="/blog/qr-code-e-hash-no-laudo-de-avarias">QR Code e hash no laudo de avarias</a> e o guia
          sobre <a href="/blog/avarias-preexistentes-como-provar">como provar avarias preexistentes</a>.
        </p>

        <h2 id="quando-usar">Quando isso faz mais diferença</h2>
        <ul>
          <li><strong>Entrega e devolução</strong> de veículos em locadoras.</li>
          <li><strong>Recebimento de frota</strong> em pátio ou unidade operacional.</li>
          <li><strong>Sinistros e inspeções</strong> em que o aceite precisa ficar claro.</li>
          <li><strong>Atendimento ao cliente</strong> quando a apresentação profissional faz diferença.</li>
        </ul>
      </>
    ),
  },
  {
    slug: 'qr-code-e-hash-no-laudo-de-avarias',
    title: 'QR Code e hash no laudo de avarias: por que isso reforça a validade',
    excerpt:
      'Entenda como o Danos Aparentes usa QR Code e hash no laudo para reforçar autenticidade, consulta do original e mais segurança na comprovação das avarias.',
    category: 'Validade',
    tags: ['qr code', 'hash', 'validade do laudo', 'laudo de avarias', 'danos aparentes'],
    date: '2026-07-04',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#111827 0%,#1d4ed8 45%,#60a5fa 100%)', emoji: '🔐', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'o-que-fazem', label: 'O que QR Code e hash fazem' },
      { id: 'original', label: 'Como ajudam a consultar o original' },
      { id: 'danos-aparentes', label: 'Como isso funciona no Danos Aparentes' },
      { id: 'valor', label: 'Por que isso agrega valor ao laudo' },
    ],
    content: (
      <>
        <p>
          Um laudo bonito não basta. Ele também precisa ser confiável. Por isso, no <strong>Danos Aparentes</strong>,
          o PDF pode sair com <strong>QR Code</strong> e <strong>hash de validação</strong>, dois elementos que
          ajudam a reforçar a autenticidade do documento e a confiança na prova.
        </p>

        <h2 id="o-que-fazem">O que QR Code e hash fazem</h2>
        <p>
          O hash funciona como uma impressão digital do arquivo. Se o documento for alterado depois, essa
          referência deixa de bater. Já o QR Code facilita a consulta do laudo original, conectando o PDF a
          uma verificação simples e rápida.
        </p>
        <ul>
          <li><strong>Hash:</strong> ajuda a mostrar que o arquivo não foi adulterado.</li>
          <li><strong>QR Code:</strong> facilita a conferência do laudo original.</li>
          <li><strong>Juntos:</strong> deixam o documento mais robusto e rastreável.</li>
        </ul>

        <h2 id="original">Como ajudam a consultar o original</h2>
        <p>
          Na rotina, isso é útil porque evita depender de versões soltas em WhatsApp, e-mail ou computador da
          equipe. O cliente, o gestor ou a operação conseguem identificar o documento correto com mais clareza.
        </p>
        <ul>
          <li><strong>Mais organização</strong> para consulta posterior.</li>
          <li><strong>Mais segurança</strong> ao comparar arquivos enviados.</li>
          <li><strong>Menos dúvida</strong> sobre qual é a versão válida do laudo.</li>
        </ul>

        <h2 id="danos-aparentes">Como isso funciona no Danos Aparentes</h2>
        <p>
          No <strong>Danos Aparentes</strong>, QR Code e hash entram no laudo junto com os demais elementos da
          vistoria: marcação visual, fotos, assinaturas e identidade da empresa. Ou seja, não são extras
          isolados; fazem parte de um documento mais profissional e consistente.
        </p>

        <Cta />

        <h2 id="valor">Por que isso agrega valor ao laudo</h2>
        <p>
          Quando o documento combina apresentação profissional com mecanismos de validação, ele ganha peso
          operacional. Para aprofundar, veja também{' '}
          <a href="/blog/laudo-de-vistoria-com-assinatura-digital">laudo com assinatura digital</a> e{' '}
          <a href="/blog/laudo-com-logo-da-empresa-no-pdf">como colocar sua logo e nome no PDF</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'laudo-white-label-para-locadoras',
    title: 'Laudo white-label para locadoras: mais marca e profissionalismo com Danos Aparentes',
    excerpt:
      'Entenda como o Danos Aparentes permite gerar um laudo white-label para locadoras, com logo, nome da empresa e apresentação mais profissional no PDF.',
    category: 'Profissionalismo',
    tags: ['white-label', 'locadoras', 'laudo profissional', 'logo da empresa', 'danos aparentes'],
    date: '2026-07-04',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#111827 0%,#0f766e 45%,#34d399 100%)', emoji: '🧩', image: '/vehicles-img/van.png' },
    toc: [
      { id: 'white-label', label: 'O que é um laudo white-label' },
      { id: 'locadora', label: 'Por que isso importa para locadoras' },
      { id: 'pdf', label: 'Como fica o PDF no Danos Aparentes' },
      { id: 'percepcao', label: 'O impacto na percepção do cliente' },
    ],
    content: (
      <>
        <p>
          Para uma locadora, o laudo não é apenas um registro técnico. Ele também representa a forma como a
          empresa se apresenta ao cliente. Com o <strong>Danos Aparentes</strong>, esse documento pode sair em
          formato <em>white-label</em>, com a identidade da própria operação no PDF.
        </p>

        <h2 id="white-label">O que é um laudo white-label</h2>
        <p>
          É um laudo que leva a <strong>logo da empresa</strong>, o <strong>nome da operação</strong> e uma
          aparência alinhada à marca da locadora. Isso evita que o PDF pareça genérico ou improvisado e ajuda
          a reforçar profissionalismo em cada entrega ou devolução.
        </p>
        <ul>
          <li><strong>Mais identidade</strong> no documento.</li>
          <li><strong>Mais padronização</strong> entre unidades e equipes.</li>
          <li><strong>Mais valor percebido</strong> no atendimento ao cliente.</li>
        </ul>

        <h2 id="locadora">Por que isso importa para locadoras</h2>
        <p>
          Em locação, o cliente recebe laudos em momentos sensíveis: retirada, devolução, contestação e
          cobrança. Quando o documento chega bem apresentado, com marca clara e estrutura profissional, a
          confiança na operação cresce.
        </p>
        <ul>
          <li><strong>Reforça a autoridade</strong> da locadora na comunicação.</li>
          <li><strong>Reduz sensação de improviso</strong> em processos delicados.</li>
          <li><strong>Ajuda a diferenciar a marca</strong> mesmo em operações de alta escala.</li>
        </ul>

        <h2 id="pdf">Como fica o PDF no Danos Aparentes</h2>
        <p>
          No <strong>Danos Aparentes</strong>, o PDF pode refletir a identidade da empresa sem abrir mão da
          parte técnica da vistoria.
        </p>

        <LaudoSheet />

        <p>
          A locadora entrega um documento com marca, avarias, fotos, assinaturas e validação em um só fluxo,
          com aparência mais séria e organizada.
        </p>

        <Cta />

        <h2 id="percepcao">O impacto na percepção do cliente</h2>
        <p>
          O cliente tende a confiar mais quando o documento parece parte oficial da operação. Para seguir
          nesse tema, veja também{' '}
          <a href="/blog/laudo-com-logo-da-empresa-no-pdf">laudo com logo da empresa no PDF</a> e{' '}
          <a href="/blog/como-entregar-um-pdf-de-vistoria-mais-profissional">como entregar um PDF de vistoria mais profissional</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'como-entregar-um-pdf-de-vistoria-mais-profissional',
    title: 'Como entregar um PDF de vistoria mais profissional com Danos Aparentes',
    excerpt:
      'Veja como o Danos Aparentes ajuda sua operação a entregar um PDF de vistoria mais profissional, claro e conceitual, com melhor percepção para o cliente.',
    category: 'Profissionalismo',
    tags: ['pdf profissional', 'laudo de vistoria', 'danos aparentes', 'apresentação do laudo', 'white-label'],
    date: '2026-07-04',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f172a 0%,#0369a1 45%,#7dd3fc 100%)', emoji: '📄', image: '/vehicles-img/microbus.png' },
    toc: [
      { id: 'aparencia', label: 'Por que a aparência do PDF importa' },
      { id: 'elementos', label: 'O que deixa o laudo mais profissional' },
      { id: 'danos-aparentes', label: 'Como o Danos Aparentes entrega isso' },
      { id: 'confianca', label: 'Como isso aumenta a confiança' },
    ],
    content: (
      <>
        <p>
          O conteúdo do laudo importa, mas a forma como ele é apresentado também pesa na percepção do cliente.
          Com o <strong>Danos Aparentes</strong>, o PDF de vistoria pode sair com aparência mais profissional,
          mais clara e mais alinhada à imagem da sua operação.
        </p>

        <h2 id="aparencia">Por que a aparência do PDF importa</h2>
        <p>
          Um documento bem apresentado transmite método, organização e segurança. Quando o laudo chega limpo,
          visual e fácil de entender, ele reduz ruído e melhora a experiência de quem recebe.
        </p>
        <ul>
          <li><strong>Facilita leitura</strong> de avarias, fotos e identificação do veículo.</li>
          <li><strong>Transmite mais profissionalismo</strong> em cada entrega ou devolução.</li>
          <li><strong>Valoriza a marca</strong> da empresa diante do cliente.</li>
        </ul>

        <h2 id="elementos">O que deixa o laudo mais profissional</h2>
        <ul>
          <li><strong>Logo e nome da empresa</strong> no cabeçalho.</li>
          <li><strong>Marcação visual das avarias</strong>, em vez de descrição solta.</li>
          <li><strong>Fotos organizadas</strong> e associadas ao dano certo.</li>
          <li><strong>Assinaturas, QR Code e hash</strong> compondo um documento mais completo.</li>
        </ul>

        <h2 id="danos-aparentes">Como o Danos Aparentes entrega isso</h2>
        <p>
          No <strong>Danos Aparentes</strong>, a apresentação profissional não depende de montar o arquivo à
          mão. O próprio fluxo de vistoria já organiza as informações e gera um PDF com aparência mais sólida,
          conceitual e pronta para compartilhar.
        </p>
        <ul>
          <li><strong>Menos improviso</strong> na montagem do documento.</li>
          <li><strong>Mais consistência</strong> entre os laudos emitidos pela equipe.</li>
          <li><strong>Mais rapidez</strong> para entregar algo com cara de operação madura.</li>
        </ul>

        <Cta />

        <h2 id="confianca">Como isso aumenta a confiança</h2>
        <p>
          Um PDF mais profissional ajuda o cliente a entender melhor o processo e confiar mais no registro.
          Para aprofundar, vale seguir com{' '}
          <a href="/blog/laudo-com-logo-da-empresa-no-pdf">laudo com logo da empresa no PDF</a>,{' '}
          <a href="/blog/laudo-white-label-para-locadoras">laudo white-label para locadoras</a> e{' '}
          <a href="/blog/laudo-de-vistoria-com-assinatura-digital">laudo com assinatura digital</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'scanner-de-cnh-autofill-nome-cpf',
    title: 'Scanner de CNH: como o Danos Aparentes preenche nome e CPF sozinho',
    excerpt:
      'Escanear o código de barras da CNH já elimina a digitação do número de habilitação. Agora o Danos Aparentes vai além e preenche também o nome do cliente e o CPF, direto do documento, offline e sem custo extra.',
    category: 'Produtividade',
    tags: ['CNH', 'autofill', 'redigitação', 'produtividade', 'laudo digital'],
    date: '2026-07-06',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0f172a 0%,#0891b2 45%,#67e8f9 100%)', emoji: '🪪', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'como-funciona', label: 'Como funciona o scanner' },
      { id: 'o-que-e-lido', label: 'O que é lido automaticamente' },
      { id: 'seguranca', label: 'Por que isso é seguro' },
      { id: 'fluxo', label: 'O que muda no fluxo da vistoria' },
    ],
    content: (
      <>
        <p>
          Nome do cliente e CPF são dois dos campos mais digitados — e mais errados — em qualquer vistoria.
          Um dígito trocado no CPF ou um nome mal escrito compromete a identificação do documento. Com o{' '}
          <strong>Danos Aparentes</strong>, esses dados agora saem direto do verso da CNH, sem digitação.
        </p>

        <h2 id="como-funciona">Como funciona o scanner</h2>
        <p>
          O aplicativo já lia o código de barras (PDF417) do verso da CNH para preencher o número de
          habilitação. A leitura é feita pela câmera do celular, <strong>offline</strong>, sem enviar a foto
          do documento para nenhum servidor externo — o processamento acontece no próprio aparelho.
        </p>

        <h2 id="o-que-e-lido">O que é lido automaticamente</h2>
        <ul>
          <li><strong>Nome completo</strong> do titular, já formatado (primeira letra maiúscula em cada palavra).</li>
          <li><strong>CPF</strong>, validado pelo dígito verificador antes de preencher o campo.</li>
          <li><strong>Número da CNH</strong>, como já acontecia antes.</li>
        </ul>
        <p>
          Cada campo é preenchido de forma independente: se o código de barras estiver parcialmente
          ilegível e o CPF não passar na validação, o nome e o número da CNH continuam sendo preenchidos
          normalmente — nada trava a vistoria por causa de um único campo.
        </p>

        <h2 id="seguranca">Por que isso é seguro</h2>
        <p>
          Diferente de uma consulta de CPF por API paga de terceiros — que expõe dado pessoal a um serviço
          externo e tem custo por consulta — aqui a informação vem do próprio documento que o cliente já
          está apresentando ao vistoriador, no momento da vistoria. Não há chamada de rede, não há
          intermediário e não há custo adicional.
        </p>

        <Cta />

        <h2 id="fluxo">O que muda no fluxo da vistoria</h2>
        <p>
          Na prática, o vistoriador aponta a câmera para o código de barras uma única vez e três campos são
          preenchidos de uma vez: nome, CPF e habilitação. Isso segue a mesma lógica de outras melhorias do
          app — ver também{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a> e{' '}
          <a href="/blog/erros-de-transcricao-na-vistoria">erros de transcrição na vistoria</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'plano-corporativo-gestao-de-equipe-vistoriadores',
    title: 'Plano Corporativo: como gerenciar uma equipe de vistoriadores em um só lugar',
    excerpt:
      'Frotas e locadoras com mais de um inspetor precisam enxergar o trabalho de toda a equipe, não só o próprio. Veja como o Plano Corporativo do Danos Aparentes centraliza os laudos de todos os vistoriadores.',
    category: 'Frota',
    tags: ['plano corporativo', 'gestão de equipe', 'frota', 'locadora', 'vistoriadores'],
    date: '2026-07-06',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#1e1b4b 0%,#4f46e5 45%,#a5b4fc 100%)', emoji: '👥', image: '/vehicles-img/truck.png' },
    toc: [
      { id: 'problema', label: 'O problema de não ter visibilidade da equipe' },
      { id: 'como-funciona', label: 'Como funciona o Plano Corporativo' },
      { id: 'convite', label: 'Como convidar um inspetor' },
      { id: 'gestor', label: 'O que o gestor enxerga' },
    ],
    content: (
      <>
        <p>
          Quando a operação cresce e passa a ter mais de um vistoriador, um problema comum aparece: cada
          inspetor só vê os próprios laudos. O gestor perde a visão consolidada da frota inteira. O{' '}
          <strong>Plano Corporativo</strong> do Danos Aparentes resolve exatamente isso.
        </p>

        <h2 id="problema">O problema de não ter visibilidade da equipe</h2>
        <ul>
          <li><strong>Laudos espalhados</strong> entre os celulares de cada inspetor, sem consolidação.</li>
          <li><strong>Dificuldade de auditoria</strong>: o gestor não sabe quantas vistorias foram feitas nem por quem.</li>
          <li><strong>Retrabalho na cobrança</strong> de laudos pendentes, feita manualmente por WhatsApp ou planilha.</li>
        </ul>

        <h2 id="como-funciona">Como funciona o Plano Corporativo</h2>
        <p>
          No Plano Corporativo, a empresa tem um <strong>gestor</strong> que vê, em modo leitura, os laudos de
          todos os inspetores vinculados à sua conta — com download de PDF incluso. Cada inspetor continua
          trabalhando normalmente no próprio aplicativo, sem mudança na rotina de campo.
        </p>

        <h2 id="convite">Como convidar um inspetor</h2>
        <ol>
          <li>O gestor gera um <strong>link de convite</strong> a partir do e-mail do inspetor.</li>
          <li>O inspetor abre o link, entra com a própria conta (ou cria uma) e aceita o convite.</li>
          <li>A partir daí, os laudos desse inspetor aparecem automaticamente pro gestor.</li>
        </ol>

        <Cta />

        <h2 id="gestor">O que o gestor enxerga</h2>
        <p>
          A visão do gestor mostra veículo, placa, quantidade de avarias e o e-mail do inspetor responsável
          por cada laudo, com opção de baixar o PDF completo. É a mesma lógica de padronização de equipe já
          discutida em{' '}
          <a href="/blog/vistoria-de-frota-padronizar-equipe">vistoria de frota: como padronizar a equipe</a>
          {' '}e em{' '}
          <a href="/blog/como-padronizar-equipe-de-vistoria-e-acabar-com-o-retrabalho">
            como padronizar a equipe e acabar com o retrabalho
          </a>, agora com um painel dedicado a isso.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-de-seminovos-para-concessionarias',
    title: 'Vistoria de seminovos: como documentar a entrada de um carro pra revenda',
    excerpt:
      'Antes de colocar um seminovo à venda, a concessionária precisa registrar exatamente o estado em que o carro chegou. Veja como um laudo bem-feito protege a negociação com o antigo dono e evita disputa com o comprador.',
    category: 'Vistoria',
    tags: ['seminovos', 'concessionária', 'revenda', 'avaliação de carro usado', 'laudo'],
    date: '2026-07-06',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#052e16 0%,#16a34a 45%,#bbf7d0 100%)', emoji: '🚗', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'porque', label: 'Por que documentar a entrada do seminovo' },
      { id: 'o-que-vistoriar', label: 'O que vistoriar na entrada' },
      { id: 'negociacao', label: 'O impacto na negociação de compra' },
      { id: 'pos-venda', label: 'Proteção depois da revenda' },
    ],
    content: (
      <>
        <p>
          Toda concessionária que compra carros usados para revenda enfrenta o mesmo risco: o veículo entra
          com um estado e, mais tarde, alguém alega que ele saiu com outro. Um laudo de entrada bem-feito
          resolve essa dúvida antes que ela vire discussão.
        </p>

        <h2 id="porque">Por que documentar a entrada do seminovo</h2>
        <ul>
          <li><strong>Base para a negociação</strong> do valor de compra com o antigo proprietário.</li>
          <li><strong>Registro de avarias preexistentes</strong>, antes de qualquer preparação para a loja.</li>
          <li><strong>Prova em caso de reclamação</strong> futura de um comprador sobre um dano que já existia na entrada.</li>
        </ul>

        <h2 id="o-que-vistoriar">O que vistoriar na entrada</h2>
        <ul>
          <li><strong>Lataria e pintura</strong>, com foto de cada avaria e a peça correspondente.</li>
          <li><strong>Pneus, rodas e vidros</strong>, itens que pesam bastante na revisão de preço.</li>
          <li><strong>Interior e itens de série</strong>, para comparar o que consta no anúncio depois.</li>
          <li><strong>Quilometragem e documentação</strong> apresentada no ato.</li>
        </ul>

        <Cta />

        <h2 id="negociacao">O impacto na negociação de compra</h2>
        <p>
          Com o laudo em mãos, a concessionária negocia o valor de compra com base em avarias documentadas
          e fotografadas, não em uma inspeção visual rápida e sem registro. Isso reduz discussão com o
          vendedor e evita comprar acima do valor justo.
        </p>

        <h2 id="pos-venda">Proteção depois da revenda</h2>
        <p>
          Se um comprador reclamar de um dano meses depois, o laudo de entrada mostra se aquela avaria já
          existia antes da revenda. Para aprofundar esse tema, veja também{' '}
          <a href="/blog/como-fazer-laudo-de-vistoria-veicular">como fazer um laudo de vistoria veicular</a>
          {' '}e{' '}
          <a href="/blog/avarias-preexistentes-como-provar">avarias preexistentes: como provar</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'como-treinar-um-novo-vistoriador-rapidamente',
    title: 'Como treinar um novo vistoriador rapidamente',
    excerpt:
      'Contratar é fácil. Treinar alguém pra fazer laudo no mesmo padrão da equipe, rápido, é o desafio. Veja o que ensinar primeiro e como o Danos Aparentes reduz o tempo de rampa de um vistoriador novo.',
    category: 'Boas práticas',
    tags: ['treinamento', 'onboarding', 'vistoriador', 'equipe', 'padronização'],
    date: '2026-07-06',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#422006 0%,#ea580c 45%,#fed7aa 100%)', emoji: '🎓', image: '/vehicles-img/moto.png' },
    toc: [
      { id: 'desafio', label: 'O desafio de treinar rápido' },
      { id: 'o-que-ensinar', label: 'O que ensinar primeiro' },
      { id: 'ferramenta', label: 'Como a ferramenta ajuda no treino' },
      { id: 'acompanhamento', label: 'Como acompanhar a evolução' },
    ],
    content: (
      <>
        <p>
          Todo vistoriador novo passa por uma curva de aprendizado: entender a nomenclatura das avarias,
          o padrão de foto esperado e o fluxo até a assinatura. Quanto mais rápido essa curva, mais cedo
          essa pessoa vistoria sozinha com qualidade.
        </p>

        <h2 id="desafio">O desafio de treinar rápido</h2>
        <ul>
          <li><strong>Nomenclatura inconsistente</strong>: cada pessoa descreve a mesma avaria de um jeito diferente.</li>
          <li><strong>Padrão de foto variável</strong>, dificultando comparar laudos entre inspetores.</li>
          <li><strong>Dependência de acompanhar de perto</strong> as primeiras vistorias, o que consome tempo do gestor.</li>
        </ul>

        <h2 id="o-que-ensinar">O que ensinar primeiro</h2>
        <ol>
          <li><strong>Os tipos de avaria</strong> (risco, amassado, trinca, quebra) e como classificar a gravidade.</li>
          <li><strong>Onde fotografar</strong>: foto aberta do veículo e foto de detalhe de cada avaria.</li>
          <li><strong>O fluxo completo</strong>: dados do cliente, veículo, avarias e assinatura, nessa ordem.</li>
        </ol>

        <h2 id="ferramenta">Como a ferramenta ajuda no treino</h2>
        <p>
          O Danos Aparentes guia o vistoriador por um assistente passo a passo (dados, veículo, avarias,
          assinatura), o que já padroniza a ordem do trabalho sem precisar de um manual à parte. Um novo
          inspetor segue o mesmo fluxo do restante da equipe desde a primeira vistoria.
        </p>

        <Cta />

        <h2 id="acompanhamento">Como acompanhar a evolução</h2>
        <p>
          Em equipes com <a href="/blog/plano-corporativo-gestao-de-equipe-vistoriadores">Plano Corporativo</a>,
          o gestor consegue ver os laudos do novo inspetor assim que ele começa a vistoriar, sem precisar
          pedir print ou PDF por WhatsApp. Para aprofundar a padronização da equipe, veja também{' '}
          <a href="/blog/vistoria-de-frota-padronizar-equipe">vistoria de frota: como padronizar a equipe</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-por-voz-nome-da-peca-ao-clicar',
    title: 'Vistoria por voz: o app fala o nome da peça ao clicar, com 8 vozes à escolha',
    excerpt:
      'Ao abrir o diagrama do veículo, cada peça é anunciada em voz natural assim que o vistoriador clica ou passa o dedo. São 8 vozes em português (4 femininas e 4 masculinas) para escolher a que mais combina com a operação.',
    category: 'Acessibilidade',
    tags: ['voz', 'text-to-speech', 'acessibilidade', 'diagrama do veículo', 'produtividade'],
    date: '2026-07-06',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 45%,#c4b5fd 100%)', emoji: '🔊', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'como-funciona', label: 'Como funciona a leitura por voz' },
      { id: 'vozes', label: 'As 8 vozes disponíveis' },
      { id: 'porque', label: 'Por que isso ajuda na vistoria' },
      { id: 'onde-configurar', label: 'Onde trocar a voz' },
    ],
    content: (
      <>
        <p>
          Na parte aberta do diagrama do veículo, cada peça — porta, para-choque, capô, teto — é
          identificada em voz alta assim que o vistoriador clica ou toca nela. O aplicativo confirma por
          áudio exatamente onde a avaria está sendo marcada, sem precisar tirar os olhos da tela pra
          conferir o nome no rótulo.
        </p>

        <h2 id="como-funciona">Como funciona a leitura por voz</h2>
        <p>
          Ao clicar numa peça do diagrama, o <strong>Danos Aparentes</strong> fala o nome dela em voz
          natural, em português. O mesmo acontece ao passar o cursor sobre uma peça (hover), o que ajuda a
          confirmar a seleção antes mesmo de clicar.
        </p>

        <h2 id="vozes">As 8 vozes disponíveis</h2>
        <p>
          São <strong>8 vozes em português brasileiro</strong>, sendo 4 femininas e 4 masculinas — todas
          com entonação natural, geradas por tecnologia de voz neural:
        </p>
        <ul>
          <li><strong>Femininas:</strong> Camila, Vitória, Aoede e Kore.</li>
          <li><strong>Masculinas:</strong> Ricardo, Thiago, Puck e Orus.</li>
        </ul>
        <p>
          A escolha é livre — o vistoriador seleciona a voz que preferir, e ela vale tanto para a leitura
          das peças quanto para outras confirmações faladas do app.
        </p>

        <Cta />

        <h2 id="porque">Por que isso ajuda na vistoria</h2>
        <ul>
          <li><strong>Confirmação sem tirar o olho do veículo</strong>: o vistoriador ouve o nome da peça enquanto continua observando o carro.</li>
          <li><strong>Menos erro de peça errada</strong>: se o áudio anunciar algo diferente do esperado, dá pra corrigir antes de registrar a avaria.</li>
          <li><strong>Acessibilidade</strong>: ajuda vistoriadores com dificuldade de leitura em telas pequenas ou sob luz forte de sol.</li>
        </ul>

        <h2 id="onde-configurar">Onde trocar a voz</h2>
        <p>
          A voz pode ser trocada nas configurações de leitura por voz do app, junto com velocidade e tom da
          fala. Essa mesma engine de voz também é usada para ler outras informações da vistoria — veja mais
          sobre como o app reduz digitação e retrabalho em{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a> e{' '}
          <a href="/blog/scanner-de-cnh-autofill-nome-cpf">scanner de CNH: autofill de nome e CPF</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'consulta-automatica-de-placa',
    title: 'Digite a placa e o resto se preenche sozinho',
    excerpt:
      'Marca, modelo, cor e cidade de emplacamento não precisam ser digitados um por um. No Danos Aparentes, basta digitar a placa e o sistema busca os dados do veículo automaticamente.',
    category: 'Produtividade',
    tags: ['consulta de placa', 'autofill', 'produtividade', 'checklist', 'vistoria digital'],
    date: '2026-07-06',
    readingMinutes: 4,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#052e2b 0%,#0d9488 45%,#5eead4 100%)', emoji: '🔎', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'problema', label: 'O problema de digitar tudo na mão' },
      { id: 'como-funciona', label: 'Como funciona a busca por placa' },
      { id: 'quando-nao-acha', label: 'Quando a placa não é encontrada' },
      { id: 'tempo', label: 'O tempo que isso economiza' },
    ],
    content: (
      <>
        <p>
          Marca, modelo, cor, tipo de veículo, cidade de emplacamento — são vários campos que, em qualquer
          checklist tradicional, precisam ser preenchidos um por um. No Danos Aparentes, isso se resolve
          com um único dado: a placa.
        </p>

        <h2 id="problema">O problema de digitar tudo na mão</h2>
        <ul>
          <li><strong>Tempo perdido</strong> preenchendo campos que já estão no documento do veículo.</li>
          <li><strong>Erro de digitação</strong> em marca e modelo, sobretudo com nomes parecidos entre fabricantes.</li>
          <li><strong>Vistoriador dependente do cliente</strong> pra confirmar cor e modelo exatos.</li>
        </ul>

        <h2 id="como-funciona">Como funciona a busca por placa</h2>
        <p>
          Ao digitar a placa completa no campo de <strong>Consulta de Placa</strong>, o aplicativo busca
          automaticamente na base de dados e preenche marca, modelo, cor, tipo de veículo e cidade —
          sem precisar digitar mais nada disso manualmente.
        </p>

        <Cta />

        <h2 id="quando-nao-acha">Quando a placa não é encontrada</h2>
        <p>
          Se a placa não constar na base consultada, o app avisa e libera o preenchimento manual dos
          campos normalmente — nada trava o andamento da vistoria por causa disso.
        </p>

        <h2 id="tempo">O tempo que isso economiza</h2>
        <p>
          Multiplicado por dezenas de vistorias no mês, esse único campo poupado por veículo representa
          bastante tempo de equipe. Para seguir nesse tema de produtividade, veja também{' '}
          <a href="/blog/scanner-de-cnh-autofill-nome-cpf">scanner de CNH: autofill de nome e CPF</a> e{' '}
          <a href="/blog/como-eliminar-redigitacao-na-vistoria-veicular">como eliminar a redigitação</a>.
        </p>
      </>
    ),
  },
  {
    slug: '6-modelos-de-pdf-para-o-laudo-de-vistoria',
    title: '6 modelos de PDF para o laudo de vistoria: qual combina com sua operação',
    excerpt:
      'Moderno, editorial, técnico, corporativo, minimalista ou vibrante — o Danos Aparentes oferece 6 layouts de PDF diferentes, para o laudo ter a cara da sua empresa, não a cara de um sistema genérico.',
    category: 'Profissionalismo',
    tags: ['modelos de pdf', 'laudo de vistoria', 'personalização', 'branding', 'danos aparentes'],
    date: '2026-07-06',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#312e81 0%,#6366f1 45%,#c7d2fe 100%)', emoji: '🎨', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'porque-modelos', label: 'Por que ter mais de um modelo de PDF' },
      { id: 'os-6-modelos', label: 'Os 6 modelos disponíveis' },
      { id: 'como-escolher', label: 'Como escolher o ideal pra sua operação' },
      { id: 'trocar', label: 'Como trocar de modelo' },
    ],
    content: (
      <>
        <p>
          Um laudo de vistoria não precisa ter sempre a mesma cara. O Danos Aparentes oferece{' '}
          <strong>6 modelos de layout de PDF</strong>, para que o documento combine com a identidade da
          sua empresa — de uma locadora enxuta a uma seguradora mais formal.
        </p>

        <h2 id="porque-modelos">Por que ter mais de um modelo de PDF</h2>
        <p>
          Uma oficina, uma seguradora e uma locadora de luxo não têm o mesmo tom de comunicação. Um único
          layout engessado obriga todo mundo a se adaptar ao sistema — no Danos Aparentes é o contrário: o
          sistema se adapta ao seu negócio.
        </p>

        <h2 id="os-6-modelos">Os 6 modelos disponíveis</h2>
        <ul>
          <li><strong>Moderno</strong> — o padrão, limpo e neutro, serve bem pra qualquer operação.</li>
          <li><strong>Editorial</strong> — tipografia mais elegante (Poppins e Lora), boa pra um tom mais sofisticado.</li>
          <li><strong>Técnico / Forense</strong> — fonte monoespaçada, visual de laudo pericial, forte pra seguradoras.</li>
          <li><strong>Corporativo</strong> — azul e dourado, cara de empresa grande e institucional.</li>
          <li><strong>Minimalista</strong> — só preto e branco, direto ao ponto, sem distração visual.</li>
          <li><strong>Vibrante</strong> — roxo e rosa, mais jovem e chamativo, combina com marcas descontraídas.</li>
        </ul>

        <Cta />

        <h2 id="como-escolher">Como escolher o ideal pra sua operação</h2>
        <p>
          Não existe modelo &ldquo;certo&rdquo; — existe o que combina com quem vai receber o laudo. Uma seguradora
          tende a preferir o Técnico ou o Corporativo; uma locadora mais moderna pode preferir o Minimalista
          ou o Vibrante. O importante é que o layout reforce a seriedade do documento, não o contrário.
        </p>

        <h2 id="trocar">Como trocar de modelo</h2>
        <p>
          A troca é feita direto na tela de exportação do relatório, antes de gerar o PDF — sem precisar
          reconfigurar nada além disso. Pra completar a personalização, veja também{' '}
          <a href="/blog/laudo-com-logo-da-empresa-no-pdf">laudo com logo da empresa no PDF</a> e{' '}
          <a href="/blog/laudo-white-label-para-locadoras">laudo white-label para locadoras</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'checklist-de-avarias-sem-dor-de-cabeca',
    title: 'Checklist de avarias sem dor de cabeça: do toque na tela ao laudo pronto',
    excerpt:
      'Marcar avaria não precisa ser complicado. Aponte no SVG do veículo, ouça a confirmação por voz, anexe a foto e pronto — sem formulário longo, sem discussão na entrega ou devolução.',
    category: 'Locadora',
    tags: ['checklist', 'svg interativo', 'confirmação por voz', 'entrada e devolução', 'sem dor de cabeça'],
    date: '2026-07-06',
    readingMinutes: 5,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0284c7 45%,#7dd3fc 100%)', emoji: '✅', image: '/vehicles-img/car2d.png' },
    toc: [
      { id: 'dor-de-cabeca', label: 'A dor de cabeça do checklist tradicional' },
      { id: 'fluxo', label: 'Como fica o fluxo no Danos Aparentes' },
      { id: 'entrada-e-devolucao', label: 'Na entrada e na devolução' },
      { id: 'resultado', label: 'O resultado prático' },
    ],
    content: (
      <>
        <p>
          Checklist de veículo, na maioria das operações, ainda significa prancheta, formulário longo ou
          fotos soltas na galeria do celular. O Danos Aparentes resolve isso com um fluxo direto: tocar,
          ouvir a confirmação, fotografar.
        </p>

        <h2 id="dor-de-cabeca">A dor de cabeça do checklist tradicional</h2>
        <ul>
          <li><strong>Formulário longo</strong> pra descrever cada avaria por escrito.</li>
          <li><strong>Dúvida na hora de marcar</strong> exatamente qual peça foi avariada.</li>
          <li><strong>Discussão na devolução</strong> sobre se o dano já existia na entrada ou não.</li>
        </ul>

        <h2 id="fluxo">Como fica o fluxo no Danos Aparentes</h2>
        <ol>
          <li>O vistoriador toca no local exato da avaria no <strong>diagrama do veículo</strong>.</li>
          <li>O app <strong>confirma por voz natural</strong> qual peça foi selecionada — sem depender só do olhar pra ter certeza.</li>
          <li>Escolhe o tipo (risco, amassado ou trinca) e <strong>anexa a foto</strong> daquele ponto na hora.</li>
        </ol>

        <Cta />

        <h2 id="entrada-e-devolucao">Na entrada e na devolução</h2>
        <p>
          O mesmo fluxo rápido se repete na entrada e na devolução do veículo. Com os dois laudos
          registrados, comparar o que já existia e o que é novo vira uma conferência simples, não uma
          discussão no balcão.
        </p>

        <h2 id="resultado">O resultado prático</h2>
        <p>
          Menos tempo por vistoria, menos dúvida sobre qual peça foi marcada e um histórico visual pronto
          pra qualquer contestação. Para aprofundar esse fluxo, veja também{' '}
          <a href="/blog/vistoria-por-voz-nome-da-peca-ao-clicar">vistoria por voz: o app fala o nome da peça ao clicar</a>
          {' '}e{' '}
          <a href="/blog/checklist-vistoria-devolucao-locadora">checklist de vistoria de devolução para locadoras</a>.
        </p>
      </>
    ),
  },
)

BLOG_POSTS.unshift(
  {
    slug: 'vistoria-nas-4-vistas-do-veiculo',
    title: 'Como a vistoria cobre as 4 vistas do veículo (com fotos por avaria)',
    excerpt:
      'Veja como o app guia a vistoria pelas 4 vistas do veículo — lateral esquerda, lateral direita, frontal e traseira — e como cada avaria pode levar suas próprias fotos.',
    category: 'Vistoria',
    tags: ['diagrama do veículo', 'avarias', 'fotos', 'vistoria'],
    date: '2026-07-07',
    readingMinutes: 4,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#1FB6FF 100%)', emoji: '🚗', image: '/vehicles-img/car.png' },
    toc: [
      { id: 'as-4-vistas', label: 'As 4 vistas do veículo' },
      { id: 'fotos-por-avaria', label: 'Uma foto por avaria' },
    ],
    content: (
      <>
        <p>
          Uma vistoria completa não olha o carro só de um ângulo. O app guia você pelas{' '}
          <strong>4 vistas do veículo</strong> — lateral esquerda, lateral direita, frontal e
          traseira — para que nenhuma avaria fique de fora do laudo.
        </p>

        <h2 id="as-4-vistas">As 4 vistas do veículo</h2>
        <p>
          No app, você toca diretamente na peça avariada no diagrama — para-lama, porta,
          para-choque, farol, lanterna — e registra o tipo de dano (risco, amassado ou quebrado) e a
          severidade. Abaixo, um exemplo (ilustrativo, não interativo) de cada uma das 4 vistas, já
          com uma avaria registrada:
        </p>

        <VehicleViewsDemo />

        <h2 id="fotos-por-avaria">Uma foto por avaria</h2>
        <p>
          Cada avaria registrada pode receber <strong>suas próprias fotos</strong> — não é uma galeria
          genérica do veículo, é a foto anexada exatamente àquele risco ou amassado, na peça certa.
          Isso elimina a dúvida clássica de laudo em papel: qual foto era de qual dano. Quando o
          aparelho tem GPS disponível, a localização da vistoria também fica registrada.
        </p>

        <Cta />
      </>
    ),
  },
)

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const others = BLOG_POSTS.filter(p => p.slug !== post.slug)
  const byDateDesc = (a: BlogPost, b: BlogPost) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)

  const sameCategory = others.filter(p => p.category === post.category).sort(byDateDesc)
  const sameTag = others
    .filter(p => p.category !== post.category && p.tags.some(tag => post.tags.includes(tag)))
    .sort(byDateDesc)

  return [...sameCategory, ...sameTag].slice(0, limit)
}

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

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
