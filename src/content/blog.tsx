// API pública do blog: helpers, categorias e re-exports. Conteúdo em ./blogPosts e ./blogPosts202608.
export { BLOG_POSTS } from './blogPosts'
export type { BlogPost } from './blogShared'
export { Cta } from './blogShared'
import { BLOG_POSTS } from './blogPosts'
import { Cta } from './blogShared'
import type { BlogPost } from './blogShared'

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const others = BLOG_POSTS.filter(p => p.slug !== post.slug)
  const byDateDesc = (a: BlogPost, b: BlogPost) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)

  const sameCategory = others.filter(p => mapCategory(p.category) === mapCategory(post.category)).sort(byDateDesc)
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

/**
 * Consolidação de categorias do blog (missão SEO):
 * as ~20 categorias antigas viram 6 temas semânticos.
 * Mantém a relação semântica sem tag spam (item 6).
 */
export const BLOG_CATEGORY_MAP: Record<string, string> = {
  // Histórico Veicular
  Frota: 'Histórico Veicular',
  Locadora: 'Histórico Veicular',
  'Histórico de Veículo': 'Histórico Veicular',
  Estacionamento: 'Histórico Veicular',
  Depósito: 'Histórico Veicular',
  Concessionária: 'Histórico Veicular',
  Guincho: 'Histórico Veicular',
  // Avarias e Danos
  Oficina: 'Avarias e Danos',
  Laudo: 'Avarias e Danos',
  Validade: 'Avarias e Danos',
  // Vistoria
  Vistoria: 'Vistoria',
  Operação: 'Vistoria',
  Valet: 'Vistoria',
  'Boas práticas': 'Vistoria',
  Profissionalismo: 'Vistoria',
  Produtividade: 'Vistoria',
  Acessibilidade: 'Vistoria',
  // Comparação
  Comparativo: 'Comparação',
  // Inteligência
  Tecnologia: 'Inteligência',
  // Gestão
  Seguro: 'Gestão',
  Despachante: 'Gestão',
}

/** Categoria consolidada de um post (fallback: a própria categoria). */
export function mapCategory(category: string): string {
  return BLOG_CATEGORY_MAP[category] ?? category
}

export const BLOG_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Histórico Veicular', slug: 'historico-veicular' },
  { name: 'Avarias e Danos', slug: 'avarias-e-danos' },
  { name: 'Vistoria', slug: 'vistoria' },
  { name: 'Comparação', slug: 'comparacao' },
  { name: 'Inteligência', slug: 'inteligencia' },
  { name: 'Gestão', slug: 'gestao' },
]

export function getCategories(): { name: string; slug: string }[] {
  return BLOG_CATEGORIES
}

/** Slug da categoria consolidada de um post. */
export function postCategorySlug(post: BlogPost): string {
  return categorySlug(mapCategory(post.category))
}

BLOG_POSTS.push(
  {
    slug: 'historico-inteligente-veicular-estacionamentos',
    title: 'Histórico Inteligente de Veículo para Estacionamentos: Acabe com a Disputa de Avarias',
    excerpt:
      'Estacionamento e a dor da avaria disputada: o cliente alega que o risco surgiu no pátio. Saiba como o histórico inteligente de veículo prova o estado na entrada e na saída.',
    category: 'Estacionamento',
    tags: ['estacionamento', 'histórico de veículo', 'avaria em pátio', 'responsabilidade', 'laudo de entrada', 'vistoria de estacionamento'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#3730a3 0%,#4338ca 45%,#6366f1 100%)', emoji: '🅿️', image: '/blog-covers/vistoria-estacionamento-shopping.webp' },
    toc: [
      { id: 'dor', label: 'A dor do estacionamento' },
      { id: 'custo', label: 'O custo da disputa' },
      { id: 'solucao', label: 'O histórico inteligente de veículo' },
      { id: 'resultado', label: 'O que muda na operação' },
    ],
    faq: [
      { question: 'Como o estacionamento prova que a avaria não ocorreu no pátio?', answer: 'Com um laudo de entrada no momento do check-in: fotos geolocalizadas e assinatura registram o estado do carro ao chegar. Na saída, o compare solo mostra o que é novo — e o que já existia.' },
      { question: 'Qual o ganho de um histórico inteligente de veículo para o estacionamento?', answer: 'Reduz reclamações infundadas, protege a marca do estabelecimento e transforma cada vaga em um registro auditável de responsabilidade.' },
    ],
    content: (
      <>
        <p>
          No estacionamento, a avaria disputada é a dor recorrente: o cliente estaciona um carro
          impecável, volta e aponta um risco na porta. <strong>Quem prove o que aconteceu?</strong>{' '}
          Sem registro, o estabelecimento assume a culpa — ou vira caso de imagem.
        </p>
        <h2 id="dor">A dor do estacionamento</h2>
        <p>
          O atendente na cancela anota a placa, mas não o estado do veículo. Na saída, qualquer
          arranhão vira &ldquo;foi aí dentro&rdquo;. O estacionamento paga o conserto ou perde o cliente.
        </p>
        <h2 id="custo">O custo da disputa</h2>
        <ul>
          <li><strong>Conserto por conta própria</strong> para evitar briga — prejuízo direto.</li>
          <li><strong>Reclamação nas redes</strong> — dano de marca difícil de reverter.</li>
          <li><strong>Processo pequeno</strong> — tempo de advogado que ninguém quer gastar.</li>
        </ul>
        <Cta />
        <h2 id="solucao">O histórico inteligente de veículo</h2>
        <p>
          Cada entrada vira um <strong>laudo de check-in</strong>: o veículo é fotografado nas 4 vistas
          com GPS e hora, as avarias pré-existentes marcadas no diagrama e o cliente assina. O
          histórico fica associado à placa — na próxima vez, o sistema mostra o estado anterior.
        </p>
        <h2 id="resultado">O que muda na operação</h2>
        <p>
          Na saída, o compare com o laudo de entrada é automático. Se o risco já constava no check-in,
          a disputa acaba na cancela. O estacionamento opera com <strong>prova, não com palpite</strong>.
        </p>
      </>
    ),
  },
  {
    slug: 'valet-registro-avarias-entrada-saida',
    title: 'Valet: Registro de Avarias na Entrada e Saída Elimina a Dor da Devolução',
    excerpt:
      'Serviço de valet e a avaria contestada na devolução do carro. Veja como o histórico inteligente de veículo registra o estado na entrega e protege o estabelecimento.',
    category: 'Valet',
    tags: ['valet', 'avaria valet', 'entrega de veículo', 'laudo de valet', 'histórico de veículo', 'manobrista'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#9d174d 0%,#be123c 45%,#fb7185 100%)', emoji: '🚘', image: '/blog-covers/vistoria-valet-estacionamento.webp' },
    toc: [
      { id: 'dor', label: 'A dor do valet' },
      { id: 'risco', label: 'O risco do manobrista' },
      { id: 'solucao', label: 'Laudo na entrega e na saída' },
      { id: 'beneficio', label: 'Benefício para o negócio' },
    ],
    faq: [
      { question: 'Como o valet evita ser culpado por avaria que já existia?', answer: 'Registrando o estado do carro no momento da entrega (check-in) com foto e assinatura. Na devolução, o compare mostra o que é novo — e o que o cliente já trouxe.' },
      { question: 'Um histórico de veículo ajuda o valet em visitas recorrentes?', answer: 'Sim. O sistema lembra o estado das vezes anteriores por placa, acelerando o check-in e criando uma linha do tempo de confiança com o cliente.' },
    ],
    content: (
      <>
        <p>
          No valet, o cliente entrega as chaves e some. Quando volta, aponta um amassado e diz{' '}
          <strong>&ldquo;vocês bateram&rdquo;</strong>. O manobrista jura que não — mas sem prova, a
          palavra do cliente costuma vencer.
        </p>
        <h2 id="dor">A dor do valet</h2>
        <p>
          O registro costuma ser um papel genérico: &ldquo;sem avarias&rdquo;. Se o carro já tinha um
          risco, ele some no checklist e vira responsabilidade do estabelecimento na saída.
        </p>
        <h2 id="risco">O risco do manobrista</h2>
        <ul>
          <li><strong>Desconto em folha</strong> por &ldquo;avaria no plantão&rdquo;.</li>
          <li><strong>Clima tóxico</strong> entre equipe e gestão.</li>
          <li><strong>Perda de cliente VIP</strong> que se sente mal atendido.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Laudo na entrega e na saída</h2>
        <p>
          No <strong>check-in do valet</strong>, o veículo é fotografado nas 4 vistas com GPS e o
          cliente assina o estado. Na saída, um novo laudo é comparado ao anterior. Só o que apareceu
          de novo é imputado — e o histórico por placa mostra a evolução do veículo.
        </p>
        <h2 id="beneficio">Benefício para o negócio</h2>
        <p>
          O valet deixa de ser um campo de disputa e vira um serviço <strong>auditável</strong>. O
          cliente confia, o manobrista trabalha tranquilo e a gestão tem relatório de cada veículo.
        </p>
      </>
    ),
  },
  {
    slug: 'locadora-aluguel-historico-veicular-frota',
    title: 'Locadora de Aluguel: Histórico Inteligente de Veículo em Escala',
    excerpt:
      'Locadora de veículos e o controle de frota na devolução. Saiba como o histórico inteligente de veículo padroniza a vistoria entre unidades e corta a dor da cobrança indevida.',
    category: 'Locadora',
    tags: ['locadora', 'aluguel de veículos', 'frota', 'devolução', 'histórico de veículo', 'check-in locadora'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 45%,#38bdf8 100%)', emoji: '🚙', image: '/blog-covers/vistoria-de-frota-padronizar-equipe.webp' },
    toc: [
      { id: 'dor', label: 'A dor da locadora' },
      { id: 'padrao', label: 'O problema do padrão por unidade' },
      { id: 'solucao', label: 'Histórico inteligente em escala' },
      { id: 'resultado', label: 'O que muda' },
    ],
    faq: [
      { question: 'Como a locadora cobra avaria justa na devolução?', answer: 'Com um laudo de entrada no check-in e outro na saída: só o que aparece de novo é cobrado. O histórico por placa mostra o estado de todas as locações anteriores.' },
      { question: 'Por que padronizar a vistoria entre unidades?', answer: 'Unidades diferentes registram de forma diferente, gerando disputas e inconsistência. Um padrão digital garante que o laudo seja igual em qualquer loja.' },
    ],
    content: (
      <>
        <p>
          Locadora de aluguel vive da rotatividade, mas cada devolução é uma aposta: o carro volta e
          alguém precisa decidir <strong>o que cobrar</strong>. Sem padrão, a dor é a cobrança
          indevida — e a perda de cliente fidelizado.
        </p>
        <h2 id="dor">A dor da locadora</h2>
        <p>
          Na devolução, o atendente olha o carro e tenta lembrar do estado da retirada. Sem laudo
          inicial, qualquer risco vira débito — e o cliente reclama na internet.
        </p>
        <h2 id="padrao">O problema do padrão por unidade</h2>
        <ul>
          <li><strong>Loja A registra tudo</strong>, loja B anota &ldquo;ok&rdquo; — inconsistência.</li>
          <li><strong>Laudos em papel</strong> se perdem e não ficam no histórico.</li>
          <li><strong>Cobrança divergente</strong> gera reclamação no Procon.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Histórico inteligente em escala</h2>
        <p>
          Cada locação gera um <strong>laudo de check-in e outro de saída</strong>, ambos no mesmo
          padrão digital, associados à placa. O sistema cruza o histórico e mostra a linha do tempo
          do veículo — quantas locações, que avarias persistiram, o que foi novidade.
        </p>
        <h2 id="resultado">O que muda</h2>
        <p>
          A locadora cobra <strong>só o novo</strong>, com prova. A equipe padroniza sem treinamento
          longo. E o cliente recebe um relatório justo — não uma surpresa na fatura.
        </p>
      </>
    ),
  },
  {
    slug: 'guincho-historico-veiculo-transferencia',
    title: 'Empresa de Guincho: Histórico de Veículo na Transferência de Responsabilidade',
    excerpt:
      'Guincho e a dor da avaria na carga e descarga. Veja como o histórico inteligente de veículo registra o estado na retirada e na entrega, protegendo a transportadora.',
    category: 'Guincho',
    tags: ['guincho', 'transportadora', 'transferência de veículo', 'laudo de carga', 'histórico de veículo', 'responsabilidade'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#b45309 0%,#d97706 45%,#fbbf24 100%)', emoji: '🚛', image: '/blog-covers/vistoria-transportadora-frota.webp' },
    toc: [
      { id: 'dor', label: 'A dor do guincho' },
      { id: 'risco', label: 'O risco na carga' },
      { id: 'solucao', label: 'Laudo na retirada e na entrega' },
      { id: 'beneficio', label: 'Benefício para a operação' },
    ],
    faq: [
      { question: 'Como o guincho prova que o carro já tinha o dano antes do guincho?', answer: 'Com um laudo de retirada (check-in) com fotos e assinatura no local da coleta. Na entrega, o compare mostra se houve dano novo durante o transporte.' },
      { question: 'O histórico de veículo ajuda a transportadora em repetições?', answer: 'Sim. O veículo carrega seu histórico por placa, acelerando a vistoria e criando uma linha do tempo de responsabilidade entre origem e destino.' },
    ],
    content: (
      <>
        <p>
          Guincho e transportadora lidam com a pior das dores: <strong>o veículo chega com avaria e a
          pergunta é de quem</strong>. Se a peça soltou na estrada ou já estava solta na retirada,
          ninguém sabia — até agora.
        </p>
        <h2 id="dor">A dor do guincho</h2>
        <p>
          O motorista coleta o carro, mas não registra o estado. Na entrega, o cliente aponta um
          para-choque solto e cobra o guincho. Sem prova da origem, a empresa arca com o prejuízo.
        </p>
        <h2 id="risco">O risco na carga</h2>
        <ul>
          <li><strong>Indenização paga</strong> por dano que não causou.</li>
          <li><strong>Seguro mais caro</strong> após sinistros recorrentes.</li>
          <li><strong>Cliente perdido</strong> que não confia no transporte.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Laudo na retirada e na entrega</h2>
        <p>
          Na <strong>retirada</strong>, o veículo é vistoriado nas 4 vistas com GPS e o cliente (ou
          o proprietário) assina. Na <strong>entrega</strong>, um novo laudo é comparado. O histórico
          por placa registra a linha do tempo de responsabilidade entre origem e destino.
        </p>
        <h2 id="beneficio">Benefício para a operação</h2>
        <p>
          A transportadora entrega com <strong>prova de origem</strong>. Se o dano era pré-existente,
          a cobrança não vem. Se foi na carga, o laudo aponta exatamente onde — e o seguro age certo.
        </p>
      </>
    ),
  },
  {
    slug: 'deposito-veiculos-historico-inteligente',
    title: 'Depósito de Veículos: Histórico Inteligente para Inventário e Responsabilidade',
    excerpt:
      'Depósito de veículos e a dor do inventário de entrada. Saiba como o histórico inteligente de veículo registra cada carro na chegada e vira trilha de auditoria para a guarda.',
    category: 'Depósito',
    tags: ['depósito de veículos', 'inventário', 'guarda de veículo', 'laudo de entrada', 'histórico de veículo', 'pátio'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#0f766e 0%,#0d9488 45%,#2dd4bf 100%)', emoji: '🏬', image: '/blog-covers/historico-veicular-digital.webp' },
    toc: [
      { id: 'dor', label: 'A dor do depósito' },
      { id: 'inventario', label: 'O problema do inventário manual' },
      { id: 'solucao', label: 'Histórico na entrada e na saída' },
      { id: 'beneficio', label: 'Benefício para o pátio' },
    ],
    faq: [
      { question: 'Como o depósito prova o estado do carro na guarda?', answer: 'Com um laudo de entrada no recebimento: fotos das 4 vistas, quilometragem e assinatura. Na retirada, o compare mostra o que mudou durante a guarda.' },
      { question: 'O histórico de veículo ajuda o inventário do pátio?', answer: 'Sim. Cada carro vira um registro pesquisável por placa, com linha do tempo de entradas e saídas — substituindo planilhas frágeis.' },
    ],
    content: (
      <>
        <p>
          Depósito de veículos vive de guardar o alheio. A dor: um carro entra, fica meses no pátio e,
          na retirada, o dono alega que <strong>saiu pior do que entrou</strong>. Sem registro de
          entrada, o depósito responde.
        </p>
        <h2 id="dor">A dor do depósito</h2>
        <p>
          O inventário manual anota &ldquo;1 Fiat, prata&rdquo; — sem estado, sem foto, sem quilometragem.
          Meses depois, provar o antes é impossível.
        </p>
        <h2 id="inventario">O problema do inventário manual</h2>
        <ul>
          <li><strong>Planilha desatualizada</strong> — ninguém sabe o estado real.</li>
          <li><strong>Disputa de guarda</strong> vira indenização paga.</li>
          <li><strong>Auditoria impossível</strong> em grandes pátios.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Histórico na entrada e na saída</h2>
        <p>
          Cada veículo recebido vira um <strong>laudo de entrada</strong> com fotos geolocalizadas,
          quilometragem e assinatura. Na retirada, o laudo de saída é comparado. O histórico por placa
          vira a <strong>trilha de auditoria</strong> da guarda — de quem, quando e em que estado.
        </p>
        <h2 id="beneficio">Benefício para o pátio</h2>
        <p>
          O depósito opera com <strong>inventário vivo</strong>: cada carro é pesquisável, cada
          movimentação registrada. A disputa de guarda acaba na entrada — não no processo.
        </p>
      </>
    ),
  },
)

BLOG_POSTS.push(
  {
    slug: 'oficina-laudo-entrada-veiculo-divergencia-orcamento',
    title: 'Oficina e Mecânica: Laudo de Entrada Acaba com a Divergência de Orçamento',
    excerpt:
      'Oficina, mecânica e funilaria: a dor do veículo que entra limpo e sai com avaria contestada. Saiba como o histórico inteligente de veículo registra o estado na chegada.',
    category: 'Oficina',
    tags: ['oficina', 'mecânica', 'funilaria', 'borracharia', 'laudo de entrada', 'orçamento de conserto', 'histórico de veículo', 'divergência de reparo'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 45%,#fb923c 100%)', emoji: '🔧', image: '/blog-covers/digitalizar-vistoria-oficina.webp' },
    toc: [
      { id: 'dor', label: 'A dor da oficina' },
      { id: 'risco', label: 'O risco do conserto' },
      { id: 'solucao', label: 'Laudo de entrada do veículo' },
      { id: 'beneficio', label: 'Benefício para o negócio' },
    ],
    faq: [
      { question: 'Como a oficina prova que a avaria não foi causada no conserto?', answer: 'Com um laudo de entrada no recebimento: fotos das 4 vistas e assinatura registram o estado antes de subir no elevador. Na entrega, o compare mostra o que é novo.' },
      { question: 'Laudo de entrada ajuda na divergência de orçamento?', answer: 'Sim. Ele documenta o que já estava danificado antes do serviço, evitando que o cliente cobre da oficina um risco pré-existente.' },
    ],
    content: (
      <>
        <p>
          Na oficina, a história se repete: o cliente deixa o carro para trocar o óleo e volta
          reclamando de um amassado na lateral. <strong>Foi na baixa do elevador ou já estava?</strong>{' '}
          Sem registro, a mecânica paga a conta.
        </p>
        <h2 id="dor">A dor da oficina</h2>
        <p>
          O veículo entra, sobe no elevador, e ninguém fotografa o estado. Na entrega, qualquer
          arranhão vira &ldquo;a oficina bateu&rdquo;. A funilaria e a borracharia carregam o prejuízo.
        </p>
        <h2 id="risco">O risco do conserto</h2>
        <ul>
          <li><strong>Conserto por conta própria</strong> de dano que não causou.</li>
          <li><strong>Reclamação de má qualidade</strong> — dano à reputação local.</li>
          <li><strong>Cliente perdido</strong> que não volta mais.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Laudo de entrada do veículo</h2>
        <p>
          No <strong>recebimento</strong>, o carro é vistoriado nas 4 vistas com GPS e o cliente
          assina o estado. O histórico por placa mostra as visitas anteriores — se o risco já
          constava, a oficina está livre.
        </p>
        <h2 id="beneficio">Benefício para o negócio</h2>
        <p>
          A oficina entrega com <strong>prova de origem</strong>. O orçamento bate com o serviço, a
          divergência cai e o cliente confia — porque tudo está registrado.
        </p>
      </>
    ),
  },
  {
    slug: 'seguradora-pericia-sinistro-laudo-verificavel',
    title: 'Seguradora e Perícia: Laudo Verificável Acelera o Pagamento de Sinistro',
    excerpt:
      'Seguradora, perito e indenização: a dor do sinistro travado por falta de prova. Veja como o histórico inteligente de veículo com hash e QR Code agiliza a análise.',
    category: 'Seguro',
    tags: ['seguradora', 'perito', 'sinistro', 'indenização', 'vistoria de sinistro', 'perícia de avaria', 'laudo verificável', 'histórico de veículo'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#0f766e 0%,#0d9488 45%,#2dd4bf 100%)', emoji: '🛡️', image: '/blog-covers/relatorio-pdf-oficial-com-seguranca-maxima.webp' },
    toc: [
      { id: 'dor', label: 'A dor da seguradora' },
      { id: 'atraso', label: 'O custo do sinistro travado' },
      { id: 'solucao', label: 'Laudo verificável com hash e QR' },
      { id: 'beneficio', label: 'Benefício para a análise' },
    ],
    faq: [
      { question: 'Como o laudo verificável acelera a perícia de sinistro?', answer: 'Porque traz avarias por peça, fotos geolocalizadas e assinatura num documento que o perito confere em segundos pelo QR Code — sem idas e voltas.' },
      { question: 'Por que usar hash SHA-256 no laudo de seguro?', answer: 'O hash prova que o laudo não foi editado após a vistoria, eliminando a suspeita de fraude na indenização.' },
    ],
    content: (
      <>
        <p>
          Seguradora e perito vivem de documentar sinistro. A dor: o processo travado porque falta
          prova, o <strong>pagamento atrasa meses</strong> e o segurado reclama no Procon.
        </p>
        <h2 id="dor">A dor da seguradora</h2>
        <p>
          O laudo chega incompleto — sem foto de contexto, sem assinatura. O perito marca visita,
          pede complemento, e cada documento faltante adia a indenização.
        </p>
        <h2 id="atraso">O custo do sinistro travado</h2>
        <ul>
          <li><strong>Indenização parada</strong> gera juros e processo.</li>
          <li><strong>Perito sobrecarregado</strong> com retrabalho.</li>
          <li><strong>Segurado insatisfeito</strong> cancela o contrato.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Laudo verificável com hash e QR</h2>
        <p>
          O laudo de avarias sai com <strong>hash SHA-256 e QR Code</strong>: o perito aponta a câmera
          e confere o original online. Avarias por peça, fotos com GPS e assinatura fecham a prova
          num só documento.
        </p>
        <h2 id="beneficio">Benefício para a análise</h2>
        <p>
          A seguradora reduz o ciclo de sinistro, o perito confere em vez de coletar, e a
          indenização sai certa — <strong>com prova, não com palpite</strong>.
        </p>
      </>
    ),
  },
  {
    slug: 'despachante-transferencia-veicular-laudo-procedencia',
    title: 'Despachante: Laudo de Procedência para Transferência Veicular no DETRAN',
    excerpt:
      'Despachante e regularização: a dor da transferência sem comprovação do estado do veículo. Saiba como o histórico inteligente de veículo embasa o processo no DETRAN.',
    category: 'Despachante',
    tags: ['despachante', 'transferência veicular', 'DETRAN', 'regularização', 'laudo de procedência', 'histórico de veículo', 'mudança de propriedade'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 45%,#38bdf8 100%)', emoji: '📑', image: '/blog-covers/laudo-de-vistoria-para-despachantes.webp' },
    toc: [
      { id: 'dor', label: 'A dor do despachante' },
      { id: 'risco', label: 'O risco da transferência' },
      { id: 'solucao', label: 'Laudo de procedência do veículo' },
      { id: 'beneficio', label: 'Benefício para o processo' },
    ],
    faq: [
      { question: 'Como o despachante comprova o estado do veículo na transferência?', answer: 'Com um laudo de procedência: fotos e avarias por peça registradas no momento da transação, servindo de embasamento para a mudança de propriedade no DETRAN.' },
      { question: 'O histórico de veículo ajuda na regularização?', answer: 'Sim. Ele mostra as transferências anteriores e o estado de cada uma, dando sequência documental ao processo de regularização.' },
    ],
    content: (
      <>
        <p>
          Despachante vive de tirar veículo do papel. A dor: a transferência travada porque ninguém
          comprova o <strong>estado do carro na mudança de dono</strong> — e o DETRAN pede mais
          documentos.
        </p>
        <h2 id="dor">A dor do despachante</h2>
        <p>
          O cliente chega com o carro e o contrato, mas sem registro do estado. Na vistoria do
          órgão, uma avaria vira motivo de indeferimento e o processo recomeça.
        </p>
        <h2 id="risco">O risco da transferência</h2>
        <ul>
          <li><strong>Indeferimento no DETRAN</strong> por falta de prova.</li>
          <li><strong>Retrabalho do despachante</strong> sem cobrar extra.</li>
          <li><strong>Cliente insatisfeito</strong> com a demora.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Laudo de procedência do veículo</h2>
        <p>
          Na <strong>transação</strong>, o veículo recebe um laudo de procedência com fotos e
          assinatura de ambas as partes. O histórico por placa registra a cadeia de transferências —
          cada dono, cada estado.
        </p>
        <h2 id="beneficio">Benefício para o processo</h2>
        <p>
          O despachante leva um <strong>documento embasado</strong> ao DETRAN. A transferência sai
          sem surpresa, e o cliente vê profissionalismo na regularização.
        </p>
      </>
    ),
  },
  {
    slug: 'frotista-corporativo-historico-unificado-avarias',
    title: 'Frotista Corporativo: Histórico Unificado de Avarias em Escala',
    excerpt:
      'Gestão de frota corporativa e a dor do controle de avarias pulverizado. Veja como o histórico inteligente de veículo unifica o registro entre motoristas e unidades.',
    category: 'Frota',
    tags: ['frotista', 'gestão de frota', 'frota corporativa', 'controle de avarias', 'veículos da empresa', 'histórico de veículo', 'motorista'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#312e81 0%,#4f46e5 45%,#818cf8 100%)', emoji: '🚐', image: '/blog-covers/controle-avarias-frota.webp' },
    toc: [
      { id: 'dor', label: 'A dor do frotista' },
      { id: 'pulverizacao', label: 'O problema do controle pulverizado' },
      { id: 'solucao', label: 'Histórico unificado por placa' },
      { id: 'beneficio', label: 'Benefício para a gestão' },
    ],
    faq: [
      { question: 'Como o frotista controla avarias entre motoristas?', answer: 'Com laudo de entrega e devolução por motorista, associado à placa. O sistema cruza o histórico e mostra quem responde por cada avaria.' },
      { question: 'Um histórico unificado ajuda a gestão de frota?', answer: 'Sim. Ele centraliza o registro de todas as unidades e motoristas, substituindo planilhas isoladas por uma linha do tempo por veículo.' },
    ],
    content: (
      <>
        <p>
          Frotista corporativo opera dezenas de veículos e tantos motoristas. A dor: a avaria
          aparece, <strong>ninguém sabe de quem</strong> e a culpa fica com a empresa.
        </p>
        <h2 id="dor">A dor do frotista</h2>
        <p>
          Cada motorista entrega o carro sem laudo. Na revisão, o amassado aparece e ninguém assume
          — a frota absorve o custo.
        </p>
        <h2 id="pulverizacao">O problema do controle pulverizado</h2>
        <ul>
          <li><strong>Planilhas por unidade</strong> que não se falam.</li>
          <li><strong>Avaria sem responsável</strong> vira custo da empresa.</li>
          <li><strong>Auditoria impossível</strong> em frota grande.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Histórico unificado por placa</h2>
        <p>
          Cada entrega/devolução de motorista gera um laudo associado à placa. O sistema cruza o
          histórico e mostra a linha do tempo: <strong>quem pegou, quem devolveu, o que mudou</strong>.
        </p>
        <h2 id="beneficio">Benefício para a gestão</h2>
        <p>
          O frotista cobra o responsável certo, padroniza sem treinamento longo e tem relatório de
          cada veículo — <strong>controle real, não planilha quebrada</strong>.
        </p>
      </>
    ),
  },
  {
    slug: 'concessionaria-seminovo-laudo-procedencia-venda',
    title: 'Concessionária e Seminovos: Laudo de Procedência Aumenta a Confiança na Venda',
    excerpt:
      'Concessionária e revenda de seminovos: a dor do usado sem procedência. Saiba como o histórico inteligente de veículo embasa a venda e protege o cliente.',
    category: 'Concessionária',
    tags: ['concessionária', 'seminovos', 'revenda de usados', 'laudo de procedência', 'veículo usado', 'histórico de veículo', 'confiança na venda'],
    date: '2026-08-07',
    updatedDate: '2026-08-07',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital B2B' },
    cover: { gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 45%,#1FB6FF 100%)', emoji: '🏪', image: '/blog-covers/vistoria-de-seminovos-para-concessionarias.webp' },
    toc: [
      { id: 'dor', label: 'A dor da concessionária' },
      { id: 'risco', label: 'O risco do seminovo sem prova' },
      { id: 'solucao', label: 'Laudo de procedência na vitrine' },
      { id: 'beneficio', label: 'Benefício para a venda' },
    ],
    faq: [
      { question: 'Como a concessionária prova o estado do seminovo?', answer: 'Com um laudo de procedência: avarias por peça, fotos e quilometragem registradas, servindo de embasamento para a venda do usado.' },
      { question: 'O histórico de veículo aumenta a confiança na venda?', answer: 'Sim. Mostrar a procedência do carro na vitrine transmite seriedade e reduz a objeção de compra por medo de golpe.' },
    ],
    content: (
      <>
        <p>
          Concessionária e revenda de seminovos vivem de confiança. A dor: o cliente olha o usado e
          pensa <strong>&ldquo;será que é batido escondido?&rdquo;</strong> — e não fecha.
        </p>
        <h2 id="dor">A dor da concessionária</h2>
        <p>
          O carro está na vitrine, mas sem registro do estado. O vendedor diz &ldquo;conservado&rdquo;,
          o cliente desconfia e vai para a concorrência.
        </p>
        <h2 id="risco">O risco do seminovo sem prova</h2>
        <ul>
          <li><strong>Perda de venda</strong> por falta de credibilidade.</li>
          <li><strong>Reclamação pós-venda</strong> de avaria oculta.</li>
          <li><strong>Processo de má-fé</strong> contra a loja.</li>
        </ul>
        <Cta />
        <h2 id="solucao">Laudo de procedência na vitrine</h2>
        <p>
          Cada seminovo recebe um laudo de procedência com avarias por peça e fotos. O histórico por
          placa mostra a linha do tempo do veículo — e o QR Code permite ao cliente conferir o
          original.
        </p>
        <h2 id="beneficio">Benefício para a venda</h2>
        <p>
          A concessionária vende com <strong>prova, não com promessa</strong>. O cliente confia, a
          objeção cai e o fechamento vem mais rápido.
        </p>
      </>
    ),
  },
)

// Um parágrafo único por categoria — a página de categoria antes só listava
// os mesmos cards que já aparecem em /blog (título + data), sem nenhum texto
// próprio. Categorias com 1-2 posts ficavam praticamente idênticas ao post
// individual, o que o Google trata como conteúdo fino/duplicado e evita
// rastrear. Cada descrição aqui é específica do assunto da categoria — não um
// template genérico repetido.
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Histórico Veicular': 'Histórico digital do veículo: como registrar, acumular e consultar o estado do carro ao longo do tempo — da locadora ao estacionamento. Leia os artigos.',
  'Avarias e Danos': 'Identificação e documentação de avarias: do amassado à raspagem, como o laudo descreve o dano e protege a operação. Guias práticos. Confira.',
  Vistoria: 'Como registrar avarias no diagrama do veículo — do clique na peça ao laudo em PDF. Guias de retirada, devolução e conferência no pátio. Leia os artigos.',
  Comparação: 'Comparação entre momentos do veículo: antes e depois, entrada e saída, para identificar o que mudou no histórico. Artigos lado a lado. Leia já.',
  Inteligência: 'Inteligência histórica veicular: IA na análise de imagens, organização de dados e sugestão de descrições para revisão humana. Veja os artigos.',
  Gestão: 'Gestão de danos e frotas: processos, escala e controle de avarias para locadoras, seguradoras e operadores. Artigos para a operação. Confira.',
  Tecnologia: 'Tecnologia da vistoria digital: PWA offline, PDF no navegador, hash de integridade e decisões técnicas para vistoriar sem internet no pátio. Veja os artigos.',
  Locadora: 'Vistoria para locadoras: laudo white-label, padrão entre unidades e cobrança de avarias na devolução. Artigos práticos para frota de aluguel. Confira.',
  Laudo: 'Laudo de vistoria: o que precisa constar, como fica no PDF e como protege a operação em disputa com o cliente. Guias sobre validade e apresentação. Leia.',
  'Boas práticas': 'Boas práticas de vistoria veicular: o que checar, o que registrar e erros que enfraquecem o laudo na contestação. Rotinas para quem vistoria todo dia.',
  Frota: 'Vistoria de frota em escala: padronize o registro de avarias em locadoras, frotistas e transportadoras — sem processo manual inviável. Veja os guias aqui.',
  Seguro: 'Laudo de vistoria e sinistro: o que seguradoras e peritos esperam documentado para agilizar a análise. Artigos sobre prova, hash e QR Code. Confira já.',
  Operação: 'Operação de vistoria no campo: tempo de preenchimento, uso sob sol ou chuva e fluxo no app sem atrapalhar o pátio. Artigos práticos para o dia a dia real.',
  Comparativo: 'Comparativos de laudo, formatos de PDF e abordagens de vistoria — para escolher o que melhor se encaixa na sua operação. Artigos lado a lado. Leia já.',
  Produtividade: 'Produtividade na vistoria: atalhos, automações e ajustes de fluxo que cortam retrabalho sem abrir mão do rigor do laudo. Faça mais vistorias por dia já.',
  Validade: 'Validade do laudo de vistoria: hash de integridade, QR Code de verificação e o que muda quando o documento precisa ser contestado. Entenda a prova digital.',
  Profissionalismo: 'Profissionalismo no laudo: marca, identidade visual e estrutura do PDF que influenciam a percepção do cliente sobre a seriedade da operação. Veja os guias.',
  Acessibilidade: 'Acessibilidade na vistoria: digitação por voz, telas pequenas e ajustes para quem trabalha no campo fora do escritório. Artigos sobre uso real. Leia já.',
  Oficina: 'Vistoria na oficina: orçamento, retrabalho e laudo digital para evitar divergência entre o combinado e o entregue. Artigos para a rotina da funilaria.',
  Despachante: 'Vistoria digital para despachantes: documentação de avarias em transferências, regularizações e trâmites veiculares. Laudo no celular, sem redigitar. Guia.',
}

export function getCategoryDescription(name: string): string {
  return CATEGORY_DESCRIPTIONS[name] || `Artigos sobre ${name.toLowerCase()} relacionados à vistoria digital de avarias veiculares.`
}

export function getPostsByCategorySlug(slug: string): BlogPost[] {
  return BLOG_POSTS.filter(p => postCategorySlug(p) === slug)
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
