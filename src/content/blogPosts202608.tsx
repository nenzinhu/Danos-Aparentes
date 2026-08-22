import React from 'react'
import LandingCtaLink from '@/src/components/LandingCtaLink'
import type { BlogPost } from '@/src/content/blog'

function Cta() {
  return (
    <aside className="blog-cta not-prose my-10 rounded-2xl border border-sky-400/25 bg-slate-950 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
      <p className="blog-cta-eyebrow text-[0.7rem] font-extrabold uppercase tracking-widest text-amber-400 mb-2">
        Faça na prática
      </p>
      <h3 className="blog-cta-title font-display text-xl font-bold text-white mb-2">
        Gere um laudo de vistoria em minutos
      </h3>
      <p className="blog-cta-body text-sm text-slate-300 leading-relaxed mb-4">
        Marque as avarias num diagrama do veículo, anexe fotos com GPS e exporte um PDF com hash de
        validação e QR Code. Sem papel, sem retrabalho.
      </p>
      <LandingCtaLink
        id="blog-cta"
        eventSource="blog"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5"
      >
        Testar 7 dias grátis →
      </LandingCtaLink>
    </aside>
  )
}

/** 10 artigos SEO/AEO — lote agosto/2026 */
export const NEW_POSTS_202608: BlogPost[] = [
  {
    slug: 'vistoria-valet-estacionamento-manobrista',
    title: 'Vistoria no valet e estacionamento: como documentar entrada e saída do veículo',
    excerpt:
      'Vistoria no valet e estacionamento: roteiro de 40 segundos para registrar o estado do carro na entrada e na retirada, evitar disputa de avaria e manter prova técnica.',
    category: 'Operação',
    tags: ['valet', 'estacionamento', 'manobrista', 'vistoria veicular', 'evidência'],
    date: '2026-08-06',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 45%,#38bdf8 100%)',
      emoji: '🅿️',
      image: '/blog-covers/vistoria-valet-estacionamento.webp',
    },
    toc: [
      { id: 'o-que-e', label: 'O que é vistoria no valet' },
      { id: 'roteiro', label: 'Roteiro de 40 segundos' },
      { id: 'disputas', label: 'Como evitar disputas' },
      { id: 'digital', label: 'Vistoria digital no pátio' },
    ],
    howTo: {
      name: 'Como fazer vistoria no valet na entrada do veículo',
      steps: [
        { name: 'Posicione o veículo em área iluminada', text: 'Estacione ou receba o carro onde a luz permita ver riscos e amassados nas quatro laterais.' },
        { name: 'Fotografe as quatro vistas', text: 'Capture frente, laterais e traseira antes de entregar a chave ao manobrista ou ao cliente.' },
        { name: 'Marque avarias no diagrama e gere o dossiê', text: 'Registre danos visíveis no diagrama padronizado, colete assinatura na tela e envie o PDF com hash.' },
      ],
    },
    faq: [
      {
        question: 'O que é vistoria no valet?',
        answer:
          'Vistoria no valet é o registro documentado do estado externo e interno visível do veículo no momento em que entra ou sai do serviço de manobrista ou estacionamento — com fotos, diagrama e laudo que comprovem se uma avaria é nova ou pré-existente.',
      },
      {
        question: 'Quem deve fazer a vistoria no estacionamento?',
        answer:
          'A vistoria no estacionamento deve ser feita pelo manobrista, supervisor de pátio ou operador autorizado no check-in e no check-out, sempre com o mesmo roteiro e o mesmo padrão visual para comparar entrada e saída.',
      },
      {
        question: 'Como provar que o amassado não estava na entrada?',
        answer:
          'Para provar que o amassado não estava na entrada, compare o laudo de check-in com o de check-out: fotos datadas, diagrama por peça e dossiê com hash SHA-256 eliminam a discussão baseada só em memória.',
      },
      {
        question: 'Vistoria de valet precisa de internet?',
        answer:
          'Vistoria de valet não precisa de internet no momento do registro se a plataforma funciona offline: os dados ficam no aparelho e sincronizam quando o sinal voltar no pátio ou na recepção.',
      },
      {
        question: 'Quanto tempo leva uma vistoria no valet?',
        answer:
          'Uma vistoria no valet bem treinada leva cerca de 40 a 90 segundos por veículo quando o roteiro é fixo: quatro vistas, detalhe das avarias e assinatura digital na entrega da chave.',
      },
      {
        question: 'Valet pode cobrar avaria com laudo digital?',
        answer:
          'Sim — valet pode cobrar avaria com laudo digital desde que o documento mostre claramente o dano novo, com comparativo da entrada, assinatura do cliente e prova de integridade (hash ou QR de verificação).',
      },
    ],
    content: (
      <>
        <blockquote className="border-l-4 border-[var(--signal-bright)] pl-4 my-6 text-[var(--text-main)] font-medium not-italic">
          Vistoria no valet é o registro padronizado do estado do veículo na entrada e na saída do
          serviço de manobrista — com fotos, diagrama e dossiê verificável para encerrar disputas de
          avaria.
        </blockquote>
        <p>
          Operações de <strong>valet e estacionamento</strong> movimentam dezenas ou centenas de carros
          por turno. O atrito não é a manobra — é a <strong>contestação de risco ou amassado</strong>{' '}
          quando o cliente busca o veículo. Sem registro comparável da entrada, a operação absorve o
          prejuízo.
        </p>
        <h2 id="o-que-e">O que é vistoria no valet</h2>
        <p>
          Diferente de um laudo cautelar, a vistoria no valet documenta apenas o{' '}
          <strong>estado aparente</strong> naquele handoff: para-choques, portas, retrovisores, rodas e
          vidros. O objetivo é ter prova objetiva de <em>como o carro entrou</em> e{' '}
          <em>como saiu</em>.
        </p>
        <h2 id="roteiro">Roteiro de 40 segundos</h2>
        <ol>
          <li><strong>Vista frontal</strong> — faróis, capô e para-choque dianteiro.</li>
          <li><strong>Lateral esquerda e direita</strong> — portas, caixas de roda e retrovisores.</li>
          <li><strong>Traseira</strong> — lanternas, vidro e para-choque traseiro.</li>
          <li><strong>Detalhe</strong> — close de cada avaria visível, com data e GPS.</li>
          <li><strong>Assinatura</strong> — cliente ou responsável confirma na tela.</li>
        </ol>
        <Cta />
        <h2 id="disputas">Como evitar disputas</h2>
        <p>
          A regra operacional: <strong>nunca devolver um veículo sem laudo de entrada arquivado</strong>.
          Na saída, repita o mesmo método. Se surgir avaria nova, o comparativo fica evidente — não vira
          palavra contra palavra.
        </p>
        <h2 id="digital">Vistoria digital no pátio</h2>
        <p>
          Garagens subterrâneas costumam ter sinal fraco. Por isso a vistoria digital precisa funcionar{' '}
          <strong>100% offline</strong>, sincronizar depois e gerar PDF com{' '}
          <a href="/blog/vistoria-foto-gps-hash-sha256-eliminar-contestacoes">hash e QR de validação</a>.
          Veja também o guia de{' '}
          <a href="/blog/vistoria-entrega-veiculo">vistoria de entrega do veículo</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'historico-veicular-digital-o-que-e',
    title: 'Histórico veicular digital: o que é, para que serve e como montar',
    excerpt:
      'Histórico veicular digital explicado: o que entra no prontuário por placa, como comparar inspeções ao longo do tempo e por que locadoras e frotas adotam memória digital do veículo.',
    category: 'Tecnologia',
    tags: ['histórico veicular', 'prontuário digital', 'linha do tempo', 'frota', 'locadora'],
    date: '2026-08-05',
    readingMinutes: 8,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#7dd3fc 100%)',
      emoji: '📊',
      image: '/blog-covers/historico-veicular-digital.webp',
    },
    toc: [
      { id: 'definicao', label: 'O que é histórico veicular digital' },
      { id: 'componentes', label: 'O que compõe o prontuário' },
      { id: 'beneficios', label: 'Benefícios para frota e locadora' },
      { id: 'como-montar', label: 'Como montar na prática' },
    ],
    faq: [
      {
        question: 'O que é histórico veicular digital?',
        answer:
          'Histórico veicular digital é o registro contínuo, por placa, de todas as inspeções, avarias, fotos e laudos de um veículo — organizado em linha do tempo para comparar o estado entre entregas, devoluções e reparos.',
      },
      {
        question: 'Histórico veicular digital substitui laudo cautelar?',
        answer:
          'Não. Histórico veicular digital documenta avarias aparentes e handoffs operacionais; laudo cautelar investiga procedência estrutural e bases de sinistro. São documentos complementares para finalidades diferentes.',
      },
      {
        question: 'Quem usa histórico veicular digital?',
        answer:
          'Locadoras, frotas corporativas, oficinas, transportadoras, operadores de valet e concessionárias usam histórico veicular digital para provar estado do veículo em cada ciclo de uso ou reparo.',
      },
      {
        question: 'Como consultar histórico veicular por placa?',
        answer:
          'Com plataforma de inteligência histórica veicular, basta buscar a placa para ver eventos anteriores, laudos, fotos e comparativos — desde que as inspeções tenham sido registradas no mesmo sistema.',
      },
      {
        question: 'Histórico veicular digital tem validade jurídica?',
        answer:
          'Histórico veicular digital ganha força probatória quando cada laudo tem integridade verificável (hash, QR), metadados de data/GPS e assinatura das partes — reforçando a cadeia de custódia da evidência.',
      },
      {
        question: 'Quanto custa montar histórico veicular digital?',
        answer:
          'Planos a partir de R$ 29,90/mês permitem começar com dezenas de laudos mensais; frotas maiores usam planos Pro ou Corporativo com marca própria, múltiplos inspetores e integrações.',
      },
    ],
    content: (
      <>
        <blockquote className="border-l-4 border-[var(--signal-bright)] pl-4 my-6 text-[var(--text-main)] font-medium not-italic">
          Histórico veicular digital é a memória completa de um veículo por placa — inspeções, fotos,
          avarias e laudos organizados em linha do tempo para comparar estados e provar danos novos.
        </blockquote>
        <p>
          Planilhas soltas e pastas de PDF não escalam. Quando a frota cresce, você precisa saber{' '}
          <strong>em qual ciclo nasceu cada avaria</strong>. É isso que o histórico veicular digital
          resolve.
        </p>
        <h2 id="definicao">O que é histórico veicular digital</h2>
        <p>
          É o prontuário vivo do veículo: cada vistoria vira um evento na{' '}
          <a href="/blog/linha-do-tempo-veicular-comparar-inspecoes">linha do tempo veicular</a>, com
          diagrama, fotos, assinaturas e dossiê verificável.
        </p>
        <h2 id="componentes">O que compõe o prontuário</h2>
        <ul>
          <li><strong>Identificação</strong> — placa, marca, modelo, ano (consulta automática).</li>
          <li><strong>Eventos</strong> — entrega, devolução, oficina, sinistro.</li>
          <li><strong>Evidências</strong> — fotos georreferenciadas e marcações no diagrama.</li>
          <li><strong>Dossiês</strong> — PDFs com hash SHA-256 e QR Code.</li>
        </ul>
        <Cta />
        <h2 id="beneficios">Benefícios para frota e locadora</h2>
        <p>
          Locadoras reduzem contestação na devolução; frotas comparam estado entre motoristas; oficinas
          provam o que entrou versus o que saiu. Tudo num único lugar por placa.
        </p>
        <h2 id="como-montar">Como montar na prática</h2>
        <p>
          Comece padronizando um checklist único para todos os inspetores. Use o mesmo diagrama em{' '}
          <strong>todas as unidades</strong>. Em 7 dias de trial você valida se a equipe adota no pátio.
          Veja <a href="/frotas">soluções para frotas</a> ou{' '}
          <a href="/locadoras">recursos para locadoras</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-van-utilitario-frota',
    title: 'Vistoria de van e utilitário de frota: checklist e diagrama padronizado',
    excerpt:
      'Vistoria de van e utilitário: checklist para frotas de entrega, diagrama específico por tipo de veículo e laudo comparável entre motoristas e filiais.',
    category: 'Frota',
    tags: ['van', 'utilitário', 'frota', 'vistoria', 'checklist'],
    date: '2026-08-04',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 45%,#4ade80 100%)',
      emoji: '🚐',
      image: '/blog-covers/vistoria-van-utilitario-frota.webp',
    },
    toc: [
      { id: 'desafios', label: 'Desafios da van na frota' },
      { id: 'checklist', label: 'Checklist van e utilitário' },
      { id: 'diagrama', label: 'Diagrama padronizado' },
      { id: 'escala', label: 'Escalar entre filiais' },
    ],
    faq: [
      {
        question: 'Como fazer vistoria de van de frota?',
        answer:
          'Vistoria de van de frota exige checklist fixo: quatro vistas externas, portas laterais, interior de carga, pneus e equipamentos. Registre no diagrama de van e compare cada saída com o retorno do motorista.',
      },
      {
        question: 'Van utilitário usa o mesmo laudo de carro?',
        answer:
          'Não idealmente. Van utilitário precisa de diagrama próprio — portas corrediças, batente traseiro e área de carga têm peças diferentes de carro de passeio, o que evita omissões no laudo.',
      },
      {
        question: 'O que vistoriar na área de carga da van?',
        answer:
          'Na área de carga da van, vistorie piso, revestimento, trincas, fixadores, portas e travas. Fotografe danos antes da rota e na devolução ao pátio para isolar responsabilidade.',
      },
      {
        question: 'Vistoria de utilitário funciona offline?',
        answer:
          'Sim — vistoria de utilitário em galpão ou pátio remoto deve funcionar offline, salvando fotos e diagrama no aparelho até sincronizar com o histórico central da frota.',
      },
      {
        question: 'Quantas vistorias por van por mês?',
        answer:
          'Frotas de entrega costumam fazer 2 vistorias por van por dia (saída e retorno). Em 20 dias úteis, são até 40 registros mensais por veículo — inviável em papel.',
      },
      {
        question: 'Laudo de van pode ter logo da empresa?',
        answer:
          'Sim. Laudo de van com white-label exibe logo e nome da transportadora ou operador logístico no PDF, reforçando profissionalismo com clientes e seguradoras.',
      },
    ],
    content: (
      <>
        <p>
          Vans e utilitários levam carga, batem portão e rodam em vias estreitas. Na frota,{' '}
          <strong>cada amassado vira custo</strong> se você não sabe qual motorista ou qual turno
          originou o dano.
        </p>
        <h2 id="desafios">Desafios da van na frota</h2>
        <p>
          Portas corrediças, para-choque alto e interior de carga são pontos cegos em checklist de
          carro. Motoristas diferentes anotam de formas diferentes — o laudo fica incomparável.
        </p>
        <h2 id="checklist">Checklist van e utilitário</h2>
        <ul>
          <li>Externo: capô, para-lamas, portas, retrovisores, lanternas.</li>
          <li>Portas traseiras e lateral: trincas, travas, alinhamento.</li>
          <li>Interior de carga: piso, painéis, ganchos e divisórias.</li>
          <li>Pneus, estepe, macaco e documentação do veículo.</li>
        </ul>
        <Cta />
        <h2 id="diagrama">Diagrama padronizado</h2>
        <p>
          Use diagrama de <strong>van</strong> (não carro) nas quatro vistas. Marque a peça no SVG,
          anexe foto e gere dossiê. Veja{' '}
          <a href="/blog/vistoria-de-frota-padronizar-equipe">como padronizar a equipe</a>.
        </p>
        <h2 id="escala">Escalar entre filiais</h2>
        <p>
          Com histórico por placa, a matriz compara vans de São Paulo e Recife no mesmo padrão. Ideal
          para operadores logísticos e{' '}
          <a href="/frotas">gestão histórica de frota</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'prontuario-digital-veiculo-guia',
    title: 'Prontuário digital do veículo: guia completo para frotas e locadoras',
    excerpt:
      'Prontuário digital do veículo: o que registrar, como estruturar evidências por placa e quando usar dossiê técnico com hash para fechar disputas de avaria.',
    category: 'Frota',
    tags: ['prontuário digital', 'dossiê veicular', 'frota', 'locadora', 'evidência'],
    date: '2026-08-03',
    readingMinutes: 9,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#312e81 0%,#4338ca 45%,#a5b4fc 100%)',
      emoji: '📋',
      image: '/blog-covers/prontuario-digital-veiculo.webp',
    },
    toc: [
      { id: 'conceito', label: 'O que é prontuário digital' },
      { id: 'estrutura', label: 'Estrutura do dossiê' },
      { id: 'integridade', label: 'Integridade e validação' },
      { id: 'operacao', label: 'Operação no dia a dia' },
    ],
    faq: [
      {
        question: 'O que é prontuário digital do veículo?',
        answer:
          'Prontuário digital do veículo é o conjunto organizado de laudos, fotos, diagramas e eventos de inspeção de um automóvel — acessível por placa e atualizado a cada handoff operacional.',
      },
      {
        question: 'Prontuário digital substitui CRLV ou documento do carro?',
        answer:
          'Não. Prontuário digital complementa documentos oficiais registrando o estado físico e histórico de avarias; CRLV e licenciamento continuam sendo trâmites legais separados.',
      },
      {
        question: 'Quais dados entram no prontuário digital?',
        answer:
          'Entram placa, identificação do veículo, data e local da inspeção, fotos, marcações no diagrama, assinaturas, laudos PDF e metadados de integridade como hash e QR Code.',
      },
      {
        question: 'Como compartilhar prontuário digital com cliente?',
        answer:
          'Compartilhe o PDF do dossiê por WhatsApp ou e-mail no momento da entrega. O QR Code permite que o cliente verifique online se o arquivo não foi alterado.',
      },
      {
        question: 'Prontuário digital serve para sinistro?',
        answer:
          'Sim — prontuário digital acelera sinistro ao mostrar estado anterior ao evento, desde que laudos tenham data, GPS e integridade verificável aceitos pela operação ou seguradora.',
      },
      {
        question: 'Frota pequena precisa de prontuário digital?',
        answer:
          'Frota pequena se beneficia igualmente: poucos veículos geram disputas proporcionalmente caras. Planos entry permitem começar com dezenas de laudos mensais sem investimento alto.',
      },
    ],
    content: (
      <>
        <blockquote className="border-l-4 border-[var(--signal-bright)] pl-4 my-6 text-[var(--text-main)] font-medium not-italic">
          Prontuário digital do veículo reúne laudos, fotos e eventos de inspeção por placa — formando
          dossiê técnico consultável para provar o estado do automóvel em cada handoff.
        </blockquote>
        <p>
          O termo &ldquo;prontuário&rdquo; vem da saúde: histórico contínuo do paciente. No automóvel,
          a lógica é idêntica — <strong>memória do ativo</strong> ao longo do tempo.
        </p>
        <h2 id="conceito">O que é prontuário digital</h2>
        <p>
          Diferente de um laudo avulso, o prontuário acumula eventos: entrega locação, retorno oficina,
          vistoria pátio. Cada evento alimenta a{' '}
          <a href="/blog/historico-veicular-digital-o-que-e">linha do tempo veicular</a>.
        </p>
        <h2 id="estrutura">Estrutura do dossiê</h2>
        <ul>
          <li>Cabeçalho com logo da empresa (white-label).</li>
          <li>Dados do veículo e do responsável.</li>
          <li>Diagrama marcado + fotos por avaria.</li>
          <li>Assinaturas digitais das partes.</li>
        </ul>
        <Cta />
        <h2 id="integridade">Integridade e validação</h2>
        <p>
          Dossiê técnico sério inclui <strong>hash SHA-256</strong> e QR de verificação — o documento
          comprova que não foi editado depois. Leia o guia{' '}
          <a href="/blog/qr-code-e-hash-no-laudo-de-avarias">QR Code e hash no laudo</a>.
        </p>
        <h2 id="operacao">Operação no dia a dia</h2>
        <p>
          Defina gatilhos: toda saída de pátio, toda devolução locada, toda entrada em oficina. Sem
          gatilho claro, o prontuário fica incompleto e perde valor probatório.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-estacionamento-shopping',
    title: 'Vistoria em estacionamento de shopping: roteiro para operadores de pátio',
    excerpt:
      'Vistoria em estacionamento de shopping: fluxo para operadores de pátio documentarem veículos em garagem, reduzirem reclamações e padronizarem evidências entre turnos.',
    category: 'Operação',
    tags: ['estacionamento', 'shopping', 'pátio', 'vistoria', 'operador'],
    date: '2026-08-02',
    readingMinutes: 6,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#1e293b 0%,#475569 45%,#94a3b8 100%)',
      emoji: '🏬',
      image: '/blog-covers/vistoria-estacionamento-shopping.webp',
    },
    toc: [
      { id: 'contexto', label: 'Contexto do shopping' },
      { id: 'fluxo', label: 'Fluxo por turno' },
      { id: 'evidencias', label: 'Evidências na garagem' },
      { id: 'treinamento', label: 'Treinar a equipe' },
    ],
    faq: [
      {
        question: 'Estacionamento de shopping precisa de vistoria veicular?',
        answer:
          'Estacionamento de shopping se beneficia de vistoria veicular quando há manobras, chaves na recepção ou reclamações frequentes de avaria — documentar o estado reduz passivo operacional e reclamações formais.',
      },
      {
        question: 'Como vistoriar carro em garagem subterrânea?',
        answer:
          'Em garagem subterrânea, use lanterna ou área iluminada, fotografe reflexos mínimos e registre offline no celular. Priorize laterais e para-choques, onde ocorrem a maioria dos toques.',
      },
      {
        question: 'Quem assina a vistoria no estacionamento?',
        answer:
          'No estacionamento, assina o cliente ou responsável pelo veículo na retirada, ou o operador quando a política interna exige dupla confirmação no check-in administrado.',
      },
      {
        question: 'Vistoria de pátio escala para centenas de vagas?',
        answer:
          'Vistoria de pátio escala quando só exige registro nos handoffs com chave ou manobra — não em todo carro estacionado autonomamente. Foque nos pontos de contato de responsabilidade.',
      },
      {
        question: 'Operador de estacionamento pode usar celular pessoal?',
        answer:
          'Sim, via PWA no navegador — sem instalar app pesado. Cada operador acessa com login da empresa e os laudos centralizam no histórico por placa.',
      },
      {
        question: 'Como reduzir reclamação no SAC do shopping?',
        answer:
          'Reduza reclamação no SAC entregando ao cliente o laudo de entrada com QR na hora da permanência ou retirada — prova clara encurta investigação interna.',
      },
    ],
    content: (
      <>
        <p>
          Garagens de shopping combinam <strong>baixa luminosidade</strong>, tráfego intenso e
          expectativa alta do consumidor. Uma avaria não documentada vira caso no SAC em minutos.
        </p>
        <h2 id="contexto">Contexto do shopping</h2>
        <p>
          Nem todo veículo estacionado precisa de laudo — foque nos fluxos com{' '}
          <strong>responsabilidade operacional</strong>: manobrista, guarda-chiuva com chave, serviços
          premium de pátio.
        </p>
        <h2 id="fluxo">Fluxo por turno</h2>
        <ol>
          <li>Recepção confirma placa e contato.</li>
          <li>Operador executa roteiro de quatro vistas.</li>
          <li>Cliente assina na tela ou recebe QR do laudo.</li>
          <li>Na saída, repete e compara com evento anterior.</li>
        </ol>
        <Cta />
        <h2 id="evidencias">Evidências na garagem</h2>
        <p>
          Luz artificial distorce cor — faça foto de detalhe com flash lateral. GPS confirma unidade do
          shopping. Veja{' '}
          <a href="/blog/como-fotografar-avarias">como fotografar avarias</a> corretamente.
        </p>
        <h2 id="treinamento">Treinar a equipe</h2>
        <p>
          Turnover alto exige treino de 15 minutos: mesmo diagrama, mesma ordem de vistas. Artigo
          relacionado:{' '}
          <a href="/blog/como-treinar-um-novo-vistoriador-rapidamente">treinar vistoriador rapidamente</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'como-provar-avaria-no-valet',
    title: 'Como provar avaria no valet: evidências que encerram a disputa',
    excerpt:
      'Como provar avaria no valet: sequência de fotos, comparativo entrada × saída, laudo com hash e o que dizer ao cliente quando ele contesta o amassado.',
    category: 'Boas práticas',
    tags: ['valet', 'prova', 'avaria', 'evidência', 'disputa'],
    date: '2026-08-01',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 45%,#fca5a5 100%)',
      emoji: '🔍',
      image: '/blog-covers/como-provar-avaria-valet.webp',
    },
    toc: [
      { id: 'problema', label: 'Por que a disputa nasce' },
      { id: 'sequencia', label: 'Sequência probatória' },
      { id: 'comparativo', label: 'Comparativo entrada × saída' },
      { id: 'comunicacao', label: 'Comunicação com o cliente' },
    ],
    howTo: {
      name: 'Como provar avaria no valet',
      steps: [
        { name: 'Recupere o laudo de entrada', text: 'Localize o dossiê do check-in com fotos e diagrama da mesma região contestada.' },
        { name: 'Fotografe o dano na saída', text: 'Repita ângulo e distância da foto original para comparar visualmente o dano.' },
        { name: 'Apresente laudo com hash e QR', text: 'Envie PDF verificável ao cliente — integridade técnica reduz escalada para gerência.' },
      ],
    },
    faq: [
      {
        question: 'Como provar avaria no valet?',
        answer:
          'Para provar avaria no valet, compare laudo de entrada e saída com fotos datadas, diagrama por peça e dossiê com hash — mostrando que o dano não constava no check-in.',
      },
      {
        question: 'Foto de WhatsApp vale como prova no valet?',
        answer:
          'Foto de WhatsApp isolada é fraca: metadados se perdem e a imagem pode ser questionada. Laudo estruturado com GPS, hash e assinatura tem muito mais peso operacional.',
      },
      {
        question: 'Cliente se recusa a assinar vistoria no valet',
        answer:
          'Registre recusa com testemunha operacional, timestamp e fotos mesmo assim. Política interna deve prever termo de responsabilidade quando assinatura não ocorre.',
      },
      {
        question: 'Quem arca com avaria no valet?',
        answer:
          'Responsabilidade depende do contrato e da prova. Com laudo comparável, operador cobra dano novo; sem prova de entrada, custo tende a ficar com a operação.',
      },
      {
        question: 'Valet precisa laudar todo carro?',
        answer:
          'Valet precisa laudar todo carro sob custódia de chave ou manobra — é o handoff que define responsabilidade. Carros apenas estacionados pelo motorista seguem política distinta.',
      },
      {
        question: 'Quanto tempo guardar laudo de valet?',
        answer:
          'Guarde laudo de valet pelo menos 12 meses ou conforme política jurídica da operação — histórico digital facilita arquivamento sem pasta física.',
      },
    ],
    content: (
      <>
        <p>
          &ldquo;Esse risco já estava aqui.&rdquo; No valet, essa frase custa caro. A saída é{' '}
          <strong>prova comparável</strong>, não argumento.
        </p>
        <h2 id="problema">Por que a disputa nasce</h2>
        <p>
          Memória falha, luz da garagem engana e o cliente estava apressado na entrada. Sem documento,
          a operação parece arbitrária — mesmo quando está certa.
        </p>
        <h2 id="sequencia">Sequência probatória</h2>
        <ol>
          <li>Laudo de entrada arquivado por placa.</li>
          <li>Foto de detalhe na mesma peça na saída.</li>
          <li>Diagrama marcado nos dois eventos.</li>
          <li>PDF com hash entregue ao cliente.</li>
        </ol>
        <Cta />
        <h2 id="comparativo">Comparativo entrada × saída</h2>
        <p>
          A plataforma exibe eventos lado a lado na{' '}
          <a href="/blog/linha-do-tempo-veicular-comparar-inspecoes">linha do tempo</a>. O que importa
          é <strong>mesma peça, mesma data relativa, mesma câmera</strong>.
        </p>
        <h2 id="comunicacao">Comunicação com o cliente</h2>
        <p>
          Mostre o QR de verificação antes de discutir valor. Transparência técnica desarma conflito.
          Guia relacionado:{' '}
          <a href="/blog/avarias-preexistentes-como-provar">avarias preexistentes — como provar</a>.
        </p>
      </>
    ),
  },
  {
    slug: 'linha-do-tempo-veicular-comparar-inspecoes',
    title: 'Linha do tempo veicular: como comparar inspeções do mesmo carro',
    excerpt:
      'Linha do tempo veicular: veja como comparar inspeções por placa, isolar avaria nova e usar histórico digital na cobrança ou na defesa operacional.',
    category: 'Tecnologia',
    tags: ['linha do tempo', 'histórico veicular', 'comparativo', 'inspeção', 'frota'],
    date: '2026-07-31',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 45%,#60a5fa 100%)',
      emoji: '⏱️',
      image: '/blog-covers/linha-do-tempo-veicular.webp',
    },
    toc: [
      { id: 'conceito', label: 'O que é linha do tempo veicular' },
      { id: 'comparar', label: 'Como comparar inspeções' },
      { id: 'cobranca', label: 'Usar na cobrança' },
      { id: 'kpis', label: 'KPIs para gestores' },
    ],
    faq: [
      {
        question: 'O que é linha do tempo veicular?',
        answer:
          'Linha do tempo veicular é a visualização cronológica de todas as inspeções e laudos de um automóvel por placa — permitindo comparar estado entre entregas, devoluções e reparos.',
      },
      {
        question: 'Como comparar duas vistorias do mesmo veículo?',
        answer:
          'Compare duas vistorias abrindo os eventos na linha do tempo: diagrama, fotos por peça e metadados de data. Avaria que só aparece no evento mais recente é candidata a dano novo.',
      },
      {
        question: 'Linha do tempo ajuda locadora na cobrança?',
        answer:
          'Sim. Linha do tempo mostra laudo de saída versus devolução — base objetiva para cobrar avaria na locadora sem depender de memória do atendente.',
      },
      {
        question: 'Quantos eventos guardar por veículo?',
        answer:
          'Guarde todos os eventos operacionais relevantes: idealmente cada handoff gera um evento. Quanto mais completo o histórico, mais forte a prova comparativa.',
      },
      {
        question: 'Linha do tempo funciona para oficina?',
        answer:
          'Sim — oficina compara entrada e saída do reparo na linha do tempo, provando serviço executado e estado devolvido ao cliente ou frota.',
      },
      {
        question: 'Dá para exportar linha do tempo em PDF?',
        answer:
          'Cada evento gera dossiê PDF individual. Para auditoria, exporte laudos-chave do período; o histórico completo permanece consultável online por placa.',
      },
    ],
    content: (
      <>
        <blockquote className="border-l-4 border-[var(--signal-bright)] pl-4 my-6 text-[var(--text-main)] font-medium not-italic">
          Linha do tempo veicular organiza cada inspeção por data e placa — para comparar estados e
          identificar avaria nova com evidência visual, não achismo.
        </blockquote>
        <p>
          Planilha mostra o último estado. Linha do tempo mostra{' '}
          <strong>a evolução</strong> — e evolução é o que separa dano novo de preexistente.
        </p>
        <h2 id="conceito">O que é linha do tempo veicular</h2>
        <p>
          Cada laudo vira um nó: entrega locação, retorno, oficina, pátio. Clique no evento e veja
          diagrama + fotos daquele momento.
        </p>
        <h2 id="comparar">Como comparar inspeções</h2>
        <ul>
          <li>Selecione dois eventos do mesmo veículo.</li>
          <li>Compare a mesma peça no diagrama.</li>
          <li>Valide data, GPS e assinaturas.</li>
          <li>Exporte dossiê se for cobrar ou contestar.</li>
        </ul>
        <Cta />
        <h2 id="cobranca">Usar na cobrança</h2>
        <p>
          Locadoras usam comparativo na devolução; frotas isolam motorista ou turno. Veja{' '}
          <a href="/blog/cobranca-avaria-devolucao-locadora">cobrança de avaria na devolução</a>.
        </p>
        <h2 id="kpis">KPIs para gestores</h2>
        <p>
          Volume de laudos por filial, taxa de contestação e tempo médio de vistoria indicam se o
          processo está aderente. Histórico digital alimenta esses indicadores automaticamente.
        </p>
      </>
    ),
  },
  {
    slug: 'vistoria-veiculo-usado-antes-de-comprar',
    title: 'Vistoria de veículo usado antes de comprar: o que registrar além do laudo cautelar',
    excerpt:
      'Vistoria de veículo usado antes de comprar: checklist de avarias aparentes, fotos comparáveis e laudo de estado para negociar desconto ou recusar o negócio.',
    category: 'Vistoria',
    tags: ['veículo usado', 'compra', 'seminovo', 'vistoria', 'avarias'],
    date: '2026-07-30',
    readingMinutes: 8,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#422006 0%,#a16207 45%,#fcd34d 100%)',
      emoji: '🚗',
      image: '/blog-covers/vistoria-veiculo-usado-compra.webp',
    },
    toc: [
      { id: 'cautelar-vs-aparente', label: 'Cautelar x avarias aparentes' },
      { id: 'checklist', label: 'Checklist antes de fechar' },
      { id: 'negociacao', label: 'Usar laudo na negociação' },
      { id: 'pos-compra', label: 'Depois da compra' },
    ],
    faq: [
      {
        question: 'Vistoria de usado precisa de laudo cautelar?',
        answer:
          'Laudo cautelar verifica procedência estrutural; vistoria de avarias aparentes documenta riscos, amassados e desgaste visível. Para compra segura, combine os dois quando possível.',
      },
      {
        question: 'O que fotografar em carro usado antes de comprar?',
        answer:
          'Fotografe quatro vistas externas, interior, painel com KM, pneus e close de cada avaria. Registre data e local — essencial se o vendedor negar defeito depois.',
      },
      {
        question: 'Laudo de avarias ajuda a negociar desconto?',
        answer:
          'Sim. Laudo de avarias aparentes quantifica reparos estéticos visíveis e dá base objetiva para pedir desconto ou incluir reparo no preço.',
      },
      {
        question: 'Comprador pode fazer laudo sozinho no celular?',
        answer:
          'Sim — plataforma PWA permite laudo no celular com diagrama e PDF instantâneo, útil em feiras, lojas de seminovos ou compra entre particulares.',
      },
      {
        question: 'Vistoria de usado detecta batida escondida?',
        answer:
          'Vistoria de avarias aparentes não substitui perícia estrutural. Desalinhamento de painéis, diferença de tonalidade e folgas podem indicar reparo, mas cautelar confirma gravidade.',
      },
      {
        question: 'Guardar laudo após comprar usado?',
        answer:
          'Sim — laudo de entrada vira baseline do seu histórico. Na revenda futura, prova estado adquirido e reparos feitos depois.',
      },
    ],
    content: (
      <>
        <p>
          Laudo cautelar responde &ldquo;esse carro é procedente?&rdquo;. A vistoria de avarias
          aparentes responde &ldquo;<strong>como ele está por fora agora?</strong>&rdquo; — e isso muda
          o preço.
        </p>
        <h2 id="cautelar-vs-aparente">Cautelar x avarias aparentes</h2>
        <p>
          Concessionárias e lojas de seminovos precisam dos dois ângulos. Veja{' '}
          <a href="/blog/laudo-cautelar-vs-laudo-de-avarias">laudo cautelar x laudo de avarias</a> e{' '}
          <a href="/blog/vistoria-de-seminovos-para-concessionarias">vistoria de seminovos</a>.
        </p>
        <h2 id="checklist">Checklist antes de fechar</h2>
        <ul>
          <li>Pintura e massa: tonalidade uniforme?</li>
          <li>Vidros originais com gravação visível?</li>
          <li>Interior: manchas, cheiro, comandos funcionando?</li>
          <li>Pneus e estepe dentro do esperado para KM?</li>
        </ul>
        <Cta />
        <h2 id="negociacao">Usar laudo na negociação</h2>
        <p>
          PDF com fotos e diagrama profissionaliza a conversa. Vendedor leva a sério o que está
          documentado — não só apontado com o dedo.
        </p>
        <h2 id="pos-compra">Depois da compra</h2>
        <p>
          O laudo de compra vira evento zero do{' '}
          <a href="/blog/historico-veicular-digital-o-que-e">histórico veicular</a>. Toda oficina ou
          sinistro depois compara com esse baseline.
        </p>
      </>
    ),
  },
  {
    slug: 'registro-digital-avaria-devolucao-locadora',
    title: 'Registro digital de avaria na devolução da locadora: passo a passo',
    excerpt:
      'Registro digital de avaria na devolução da locadora: fluxo completo do pátio ao PDF com hash, comparativo com entrega e cobrança sem discussão no balcão.',
    category: 'Locadora',
    tags: ['locadora', 'devolução', 'avaria', 'registro digital', 'cobrança'],
    date: '2026-07-29',
    readingMinutes: 7,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#064e3b 0%,#059669 45%,#6ee7b7 100%)',
      emoji: '🔑',
      image: '/blog-covers/registro-avaria-devolucao-locadora.webp',
    },
    toc: [
      { id: 'fluxo', label: 'Fluxo no balcão e pátio' },
      { id: 'registro', label: 'Registro digital passo a passo' },
      { id: 'cobranca', label: 'Cobrança com evidência' },
      { id: 'erros', label: 'Erros que anulam a prova' },
    ],
    howTo: {
      name: 'Como registrar avaria na devolução locadora',
      steps: [
        { name: 'Recupere laudo de entrega', text: 'Busque por placa o laudo de saída do veículo para comparar peça a peça.' },
        { name: 'Execute vistoria de devolução', text: 'Repita checklist e diagrama; marque apenas avarias novas ou agravadas.' },
        { name: 'Gere dossiê e apresente ao cliente', text: 'Exporte PDF com hash, colete assinatura e registre cobrança conforme política comercial.' },
      ],
    },
    faq: [
      {
        question: 'Como registrar avaria na devolução da locadora?',
        answer:
          'Registre avaria na devolução comparando laudo de entrega e devolução: vistoria padronizada, fotos, diagrama, assinatura do cliente e PDF com hash de integridade.',
      },
      {
        question: 'Cliente pode recusar pagar avaria na locadora?',
        answer:
          'Cliente pode contestar — por isso o registro digital na devolução precisa ser comparável e verificável. Laudo fraco vira chargeback ou perda comercial.',
      },
      {
        question: 'Quando cobrar avaria na devolução?',
        answer:
          'Cobre avaria quando o dano não constava no laudo de entrega ou está agravado além de tolerância contratual — sempre com evidência visual datada.',
      },
      {
        question: 'Registro digital substitui formulário papel?',
        answer:
          'Sim — registro digital substitui papel quando gera PDF imutável, assinatura e histórico por placa. Papel sem foto datada perde força na contestação.',
      },
      {
        question: 'Locadora SME consegue digitalizar devolução?',
        answer:
          'Sim. Planos acessíveis permitem digitalizar devolução com smartphone no pátio — sem investir em hardware dedicado por filial.',
      },
      {
        question: 'O que fazer se perdeu laudo de entrega?',
        answer:
          'Sem laudo de entrega, evite cobrança agressiva — risco reputacional alto. A partir da digitalização, política deve exigir laudo de saída antes de liberar veículo.',
      },
    ],
    content: (
      <>
        <p>
          A devolução locada é o momento da verdade financeira.{' '}
          <strong>Registro digital</strong> transforma o balcão: menos improviso, mais prova.
        </p>
        <h2 id="fluxo">Fluxo no balcão e pátio</h2>
        <p>
          Separe recepção (contrato, KM, combustível) de vistoria (carroceria). Vistoriador só conclui
          quando laudo de entrega está na tela.
        </p>
        <h2 id="registro">Registro digital passo a passo</h2>
        <ol>
          <li>Buscar placa → histórico carrega laudo de entrega.</li>
          <li>Executar checklist de devolução.</li>
          <li>Marcar avarias novas no diagrama.</li>
          <li>Fotografar detalhes + assinatura.</li>
          <li>Gerar PDF e apresentar cobrança.</li>
        </ol>
        <Cta />
        <h2 id="cobranca">Cobrança com evidência</h2>
        <p>
          Mostre comparativo lado a lado. Cliente entende quando vê foto de entrega sem o dano. Guia:{' '}
          <a href="/blog/checklist-vistoria-devolucao-locadora">checklist de devolução</a> e{' '}
          <a href="/locadoras">soluções para locadoras</a>.
        </p>
        <h2 id="erros">Erros que anulam a prova</h2>
        <ul>
          <li>Foto sem data ou fora de ordem.</li>
          <li>Checklist diferente entre entrega e devolução.</li>
          <li>Laudo editado após assinatura.</li>
        </ul>
      </>
    ),
  },
  {
    slug: 'vistoria-transportadora-frota-carga',
    title: 'Vistoria para transportadora: checklist de frota de carga e utilitários',
    excerpt:
      'Vistoria para transportadora: checklist de saída e retorno para caminhões e utilitários, histórico por placa e laudo que protege operação e embarcador.',
    category: 'Frota',
    tags: ['transportadora', 'frota', 'carga', 'caminhão', 'utilitário'],
    date: '2026-07-28',
    readingMinutes: 8,
    author: { name: 'Jeferson', role: 'Vistoria digital' },
    cover: {
      gradient: 'linear-gradient(135deg,#1c1917 0%,#44403c 45%,#a8a29e 100%)',
      emoji: '🚛',
      image: '/blog-covers/vistoria-transportadora-frota.webp',
    },
    toc: [
      { id: 'operacao', label: 'Operação de transporte' },
      { id: 'checklist', label: 'Checklist caminhão e utilitário' },
      { id: 'embarcador', label: 'Prova para embarcador' },
      { id: 'offline', label: 'Pátio sem internet' },
    ],
    faq: [
      {
        question: 'Transportadora precisa de vistoria veicular digital?',
        answer:
          'Transportadora se beneficia de vistoria digital para documentar estado de cabine, carroceria e equipamentos na saída e retorno — reduzindo disputa com motorista, embarcador e seguradora.',
      },
      {
        question: 'O que vistoriar em caminhão de frota?',
        answer:
          'Vistorie cabine, para-choques, lonas, trincas em carroceria, luzes, pneus, estepe e implementos. Registre no diagrama de caminhão com fotos por avaria.',
      },
      {
        question: 'Vistoria de frota de carga funciona offline?',
        answer:
          'Sim — pátios de transportadora frequentemente têm sinal fraco. Vistoria offline salva dados no aparelho e sincroniza ao chegar Wi-Fi da portaria.',
      },
      {
        question: 'Como provar avaria ao embarcador?',
        answer:
          'Prove com laudo de saída assinado antes do carregamento e laudo de retorno se houver incidente — histórico por placa mostra quando surgiu cada dano.',
      },
      {
        question: 'Vistoria transportadora integra com TMS?',
        answer:
          'Plano Corporativo oferece API para integrar laudos ao TMS ou ERP — automatizando registro por viagem ou ordem de serviço.',
      },
      {
        question: 'Motorista pode fazer vistoria no celular?',
        answer:
          'Sim, com perfil de motorista e checklist simplificado na saída do pátio — supervisor audita amostra e histórico centraliza por placa.',
      },
    ],
    content: (
      <>
        <p>
          Transportadora vive no detalhe: arranhão na carroceria, lanterna quebrada no pátio, divergência
          com embarcador. <strong>Vistoria padronizada</strong> protege margem.
        </p>
        <h2 id="operacao">Operação de transporte</h2>
        <p>
          Defina gatilhos: saída de pátio, retorno de viagem, troca de motorista, entrada em oficina
          parceira. Cada gatilho = evento no histórico.
        </p>
        <h2 id="checklist">Checklist caminhão e utilitário</h2>
        <ul>
          <li>Cabine: estofado, painel, vidros e retrovisores.</li>
          <li>Externo: para-lamas, portas, grade, lanternas.</li>
          <li>Carroceria/implemento: lona, trincas, fixação.</li>
          <li>Pneus, documentos e kit obrigatório.</li>
        </ul>
        <p>
          Diagramas específicos:{' '}
          <a href="/blog/vistoria-de-caminhao">vistoria de caminhão</a> e{' '}
          <a href="/blog/vistoria-van-utilitario-frota">van e utilitário</a>.
        </p>
        <Cta />
        <h2 id="embarcador">Prova para embarcador</h2>
        <p>
          Laudo de saída assinado antes do carregamento define baseline. Incidente na rota? Compare
          eventos na linha do tempo — não no achismo do telefone.
        </p>
        <h2 id="offline">Pátio sem internet</h2>
        <p>
          Leia{' '}
          <a href="/blog/vistoria-de-frota-sem-internet">vistoria de frota sem internet</a> — requisito
          básico em transportadora de médio porte.
        </p>
      </>
    ),
  },
]
