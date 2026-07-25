export type ChatSupportSegment = 'locadoras' | 'oficinas' | 'seguradoras' | 'frotas'

// Conteúdo resumido usado para "grounding" do chatbot de suporte das
// landing pages — deriva do que já está publicado (FAQs, /planos, blog),
// mas condensado para caber direto no prompt sem precisar de busca vetorial.
export const GENERAL_KNOWLEDGE = `
- Como funciona a vistoria: o vistoriador digita a placa (marca, modelo e cor preenchem automaticamente), marca cada avaria num diagrama do tipo de veículo (carro 2/4 portas, moto, van, caminhão, ônibus, microônibus ou genérico), anexa fotos (com GPS e data/hora automáticos, ou descreve por voz), coleta assinatura na tela e gera um PDF.
- QR Code e hash de verificação: cada laudo recebe um hash SHA-256 e um QR Code que leva a uma página pública de verificação. Se o PDF for alterado depois de gerado, o hash não confere mais — isso expõe a adulteração e reduz disputa sobre avaria pré-existente.
- Funciona 100% offline: a vistoria (fotos, marcações, assinaturas) é salva no aparelho mesmo sem internet, e sincroniza sozinha assim que a conexão voltar.
- White-label: o PDF sai com a logo e o nome da empresa do cliente no cabeçalho, não com uma marca genérica — configurável no perfil.
- Planos: Starter custa R$ 29,90/mês (até 20 laudos em PDF por mês), Pro custa R$ 49,90/mês (até 80 laudos em PDF por mês, com laudo personalizado com marca própria e busca automática de placa). Corporativo é sob consulta — "Consulte agora mesmo" —, com laudos ilimitados, para múltiplos vistoriadores, filiais, painel consolidado e integração via API com ERP/CRM.
- Sem treinamento longo: o diagrama do veículo guia o processo; a primeira vistoria já sai pronta em poucos minutos.
`.trim()

const SEGMENT_KNOWLEDGE: Record<ChatSupportSegment, string> = {
  locadoras: `
Segmento: locadoras e frotistas.
- Dor principal: discussão de avaria "que já existia" na devolução do veículo.
- O checklist padronizado entre vistoriadores evita que cada um registre do seu jeito.
- Comparar o laudo da retirada com o da devolução (fotos com GPS/data) resolve a maior parte das disputas.
`.trim(),
  oficinas: `
Segmento: oficinas mecânicas.
- Dor principal: laudo em papel se perde ou fica ilegível; cliente desconfia do que foi registrado na entrada do veículo.
- O laudo digital substitui a prancheta, sai pronto em minutos e reforça profissionalismo com a marca da própria oficina.
`.trim(),
  seguradoras: `
Segmento: seguradoras e corretoras.
- Dor principal: disputa sobre avaria pré-existente no momento de um sinistro, e laudo comum (papel ou PDF simples) que pode ser alterado sem deixar rastro.
- O hash SHA-256 + QR Code de verificação pública é o diferencial: qualquer pessoa pode conferir se o laudo foi adulterado depois de gerado.
`.trim(),
  frotas: `
Segmento: gestão de frotas.
- Dor principal: pátios/galpões sem sinal de internet, e cada vistoriador registrando de um jeito diferente numa frota grande.
- O funcionamento 100% offline com sincronização automática depois é o diferencial central; o plano Corporativo traz painel consolidado por filial e por vistoriador.
`.trim(),
}

export function getSegmentKnowledge(segment: ChatSupportSegment): string {
  return SEGMENT_KNOWLEDGE[segment]
}

export const SEGMENT_LABELS: Record<ChatSupportSegment, string> = {
  locadoras: 'locadora',
  oficinas: 'oficina',
  seguradoras: 'seguradora',
  frotas: 'frota',
}
