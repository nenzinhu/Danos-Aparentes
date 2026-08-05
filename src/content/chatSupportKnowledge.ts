export type ChatSupportSegment = 'home' | 'locadoras' | 'oficinas' | 'seguradoras' | 'frotas'

export const VALID_CHAT_SEGMENTS: ChatSupportSegment[] = [
  'home',
  'locadoras',
  'oficinas',
  'seguradoras',
  'frotas',
]

export const SEGMENT_LABELS: Record<ChatSupportSegment, string> = {
  home: 'página inicial',
  locadoras: 'locadoras',
  oficinas: 'oficinas',
  seguradoras: 'seguradoras',
  frotas: 'frotas',
}

// Conteúdo resumido usado para "grounding" do chatbot de suporte das
// landing pages — deriva do que já está publicado (FAQs, /planos, blog),
// mas condensado para caber direto no prompt sem precisar de busca vetorial.
export const GENERAL_KNOWLEDGE = `
- Produto: Danos Aparentes é a primeira Plataforma Brasileira de Inteligência Histórica Veicular. Cada inspeção cria uma nova camada na Memória Digital do Veículo (danos, evidências fotográficas, responsável, data). O dossiê técnico em PDF é uma saída — o produto principal é o histórico inteligente.
- Como funciona a inspeção: digite a placa (Identidade do Veículo preenche automaticamente quando disponível), marque danos no diagrama, anexe evidências (com GPS e data/hora), colete assinatura e gere o dossiê técnico.
- Histórico Inteligente / Linha do Tempo: inspeções organizadas por placa ao longo do tempo, com comparação entre eventos (ex.: entrega × devolução, reparo, venda).
- QR Code e hash: cada dossiê/PDF recebe hash SHA-256 e QR para verificação pública. Se alterado depois, o hash não confere.
- Offline: inspeção e evidências salvam no aparelho sem internet e sincronizam depois. Também funciona como PWA.
- IA protagonista: analisa imagens, detecta danos, gera descrição e atualiza o histórico; o profissional confirma. A IA não substitui a auditoria humana.
- White-label: Pro+ personaliza o dossiê com logo e marca.
- Planos:
  • Starter: R$ 29,90/mês — até 20 inspeções/mês.
  • Pro: R$ 49,90/mês — até 80 inspeções/mês, marca própria, dashboard, suporte prioritário.
  • Corporativo Start: R$ 299/mês — até 5 usuários, inspeções ilimitadas.
  • Corporativo Growth: R$ 699/mês — até 15 usuários.
  • Enterprise: a partir de R$ 1.490/mês — 15+ usuários, API e SLA.
- Teste: 7 dias grátis, sem cartão. Cancele quando quiser.
- Páginas: /planos, /faq, /demo, /locadoras, /oficinas, /frotas, /seguradoras, /historico.
`.trim()

const SEGMENT_KNOWLEDGE: Record<ChatSupportSegment, string> = {
  home: `
Segmento: visitante da página inicial (público geral).
- Posicionamento: Inteligência Histórica Veicular — memória digital permanente, evidências, linha do tempo, dossiês e IA.
- Público típico: locadoras, concessionárias, seguradoras, oficinas, transportadoras, frotas e profissionais de inspeção.
- Se perguntarem sobre um nicho específico, oriente a página correspondente (/locadoras, /oficinas, /frotas, /seguradoras) sem inventar benefícios.
- Para contrato customizado, desconto, bug de conta ou suporte de cliente já cadastrado: escale para WhatsApp (suporte ou vendas conforme o caso).
`.trim(),
  locadoras: `
Segmento: locadoras e frotistas.
- Dor principal: discussão de avaria "que já existia" na devolução do veículo.
- Inspeção padronizada evita registros inconsistentes entre responsáveis.
- Comparar o dossiê da entrega com o da devolução (evidências com GPS/data) resolve a maior parte das disputas.
`.trim(),
  oficinas: `
Segmento: oficinas e centros automotivos.
- Dor principal: dossiê em papel se perde; cliente desconfia do estado na entrada.
- O dossiê técnico digital substitui a prancheta, sai em minutos e reforça profissionalismo com a marca da oficina.
`.trim(),
  seguradoras: `
Segmento: seguradoras e corretoras.
- Dor principal: disputa sobre avaria pré-existente e documento que pode ser alterado sem rastros.
- Hash SHA-256 + QR de verificação pública: auditoria e rastreabilidade do dossiê.
`.trim(),
  frotas: `
Segmento: frotas e transportadoras.
- Dor principal: pátios sem sinal e registros inconsistentes em escala.
- Offline-first + Gestão Histórica consolidada por veículo e responsável.
`.trim(),
}

export function getSegmentKnowledge(segment: ChatSupportSegment): string {
  return SEGMENT_KNOWLEDGE[segment]
}
