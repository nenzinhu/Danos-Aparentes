// Conteúdo único do tutorial / manual — usado tanto pelo modal (FeaturesSlidesModal)
// quanto pelo PDF do manual (manual.ts). Mantém os dois sempre iguais.
// Linguagem propositalmente simples, sem jargão técnico.

export interface ManualHighlight {
  icon: string
  label: string
  text: string
}

export interface ManualStepImage {
  src: string
  alt: string
}

export interface ManualStep {
  num: number
  title: string
  subtitle: string
  desc: string
  highlights: ManualHighlight[]
  /** Imagem principal do passo (assets em /public) */
  image?: string
  imageAlt?: string
  /** Várias imagens (ex.: ícones de tipo de dano) */
  images?: ManualStepImage[]
}

export const MANUAL_STEPS: ManualStep[] = [
  {
    num: 1,
    title: 'Conhecendo a tela',
    subtitle: 'As 4 áreas principais do app',
    desc: 'A tela foi pensada para você trabalhar rápido no celular. Ela tem quatro partes:',
    image: '/brand/logo-full.png',
    imageAlt: 'Danos Aparentes — app de inspeção veicular',
    highlights: [
      { icon: '🏢', label: 'Topo', text: 'Logo da sua empresa, status de internet e botão para tela clara ou escura.' },
      { icon: '📋', label: 'Dados da vistoria', text: 'Formulário em 3 passos: Veículo → Cliente → Finalizar. Pode minimizar quando terminar.' },
      { icon: '🚗', label: 'Desenho do veículo', text: 'O desenho no centro, em 4 lados, onde você toca para marcar os danos.' },
      { icon: '📝', label: 'Lista de danos', text: 'Tudo que você marcou, com botões para assinar e gerar o laudo em PDF.' },
    ],
  },
  {
    num: 2,
    title: 'Digite a placa e pronto',
    subtitle: 'O app preenche os dados sozinho',
    desc: 'Em vez de digitar tudo na mão, é só informar a placa do veículo:',
    image: '/og-image.jpg',
    imageAlt: 'Consulta de placa e preenchimento automático',
    highlights: [
      { icon: '🔍', label: 'Busca automática', text: 'Digite a placa (Mercosul ou a antiga) e o app procura os dados do veículo sozinho.' },
      { icon: '⚡', label: 'Preenche na hora', text: 'Marca, modelo, ano, cor, cidade e estado aparecem automaticamente.' },
      { icon: '✏️', label: 'Pode corrigir', text: 'Se faltar algo ou estiver errado, você edita qualquer campo na mão, quando quiser.' },
    ],
  },
  {
    num: 3,
    title: 'Toque no desenho para marcar',
    subtitle: 'Sem papel — direto no veículo digital',
    desc: 'Marque cada dano tocando direto no desenho do veículo:',
    image: '/vehicles-img/car.png',
    imageAlt: 'Desenho do veículo com peça danificada em destaque',
    highlights: [
      { icon: '🚐', label: 'Vários veículos', text: 'Escolha carro, moto, caminhão, van, ônibus ou micro-ônibus — o desenho muda para cada um.' },
      { icon: '🔄', label: 'Os 4 lados', text: 'Veja o veículo pela lateral esquerda, lateral direita, frente e traseira.' },
      { icon: '👆', label: 'Toque na peça', text: 'Cada parte (para-choque, porta, retrovisor, vidro) é separada. Toque exatamente na peça danificada para registrar.' },
    ],
  },
  {
    num: 4,
    title: 'Detalhe o dano e tire a foto',
    subtitle: 'Provas que ninguém contesta',
    desc: 'Para cada dano, registre o que aconteceu com clareza:',
    images: [
      { src: '/scratch.png', alt: 'Ícone de risco e abrasão' },
      { src: '/dent.png', alt: 'Ícone de amassado e deformação' },
      { src: '/broken.png', alt: 'Ícone de peça quebrada ou fratura' },
    ],
    highlights: [
      { icon: '🏷️', label: 'Tipo do dano', text: 'Escolha: risco, amassado, quebrado, trincado ou peça faltando.' },
      { icon: '⚠️', label: 'Gravidade', text: 'Marque se é leve (verde), média (amarela) ou grave (vermelha) — fácil de bater o olho depois.' },
      { icon: '📷', label: 'Foto e observação', text: 'Escreva uma observação e tire a foto na hora pelo celular para comprovar o dano.' },
    ],
  },
  {
    num: 5,
    title: 'Escolha o visual do laudo',
    subtitle: '3 modelos de PDF + a sua logo',
    desc: 'O laudo em PDF sai pronto em segundos. Você escolhe o estilo:',
    image: '/logo-stamp.png',
    imageAlt: 'Área para logo da empresa no laudo PDF',
    highlights: [
      { icon: '🎨', label: 'Moderno (padrão)', text: 'Visual atual, com cores fortes e destaque — bom para a maioria dos casos.' },
      { icon: '📑', label: 'Técnico', text: 'Mais tabelas e detalhes, para quem quer tudo bem completo.' },
      { icon: '📰', label: 'Editorial', text: 'Visual mais elegante e espaçado, bom para carros importados ou de luxo.' },
      { icon: '🏢', label: 'Sua logo', text: 'Coloque a logo da sua empresa nas configurações e ela aparece no topo de todos os PDFs.' },
    ],
  },
  {
    num: 6,
    title: 'Assine e proteja o laudo',
    subtitle: 'Assinatura no dedo + selo de segurança',
    desc: 'O laudo sai com validade e proteção contra fraude:',
    image: '/brand/logo-icon.png',
    imageAlt: 'Selo de verificação e segurança do laudo',
    highlights: [
      { icon: '✍️', label: 'Assinatura na tela', text: 'Você e o cliente assinam com o dedo, direto na tela do celular.' },
      { icon: '🔒', label: 'Selo de segurança', text: 'Cada PDF ganha um código único. Se alguém mexer no arquivo, o código muda e a fraude fica evidente.' },
      { icon: '💬', label: 'Envia no WhatsApp', text: 'Gere o PDF e mande direto para o WhatsApp do cliente, ou copie um resumo pronto.' },
    ],
  },
  {
    num: 7,
    title: 'Funciona sem internet',
    subtitle: 'Salva no aparelho e envia depois',
    desc: 'Ficar sem sinal não atrapalha o seu trabalho:',
    image: '/icon-512.png',
    imageAlt: 'Ícone do app instalável no celular',
    highlights: [
      { icon: '💾', label: 'Salva no aparelho', text: 'Tudo (vistorias, danos, fotos, assinaturas) fica guardado no próprio celular na hora.' },
      { icon: '📡', label: 'Não cai nem trava', text: 'Mesmo sem internet numa garagem no subsolo, o app continua funcionando normalmente.' },
      { icon: '☁️', label: 'Envia pra nuvem sozinho', text: 'Quando a internet voltar, o app manda tudo para a nuvem automaticamente, sem você precisar fazer nada.' },
    ],
  },
]
