/**
 * Provas sociais — depoimentos fornecidos para uso em marketing.
 * Nomes abreviados (sobrenome inicial) conforme material do cliente.
 */

export type SocialProofVertical = 'locadoras' | 'oficinas' | 'geral'

export type SocialProofQuote = {
  id: string
  vertical: SocialProofVertical
  headline: string
  body: string
  name: string
  role: string
}

export const SOCIAL_PROOF_QUOTES: SocialProofQuote[] = [
  {
    id: 'marcelo-locadora',
    vertical: 'locadoras',
    headline: 'Zerou as discussões na devolução dos carros e evitou prejuízos.',
    body:
      'Antes, a gente perdia muito tempo e tinha desgaste com clientes no check-out e check-in da frota. O sistema de danos aparentes oferece um mapeamento exato de cada arranhão, amassado ou trinca no momento em que o carro é retirado, com fotos e marcações precisas. Vale a pena demais! Eliminou cobranças indevidas, trouxe total transparência e reduziu nosso prejuízo com avarias pré-existentes que acabavam caindo na conta da empresa.',
    name: 'Marcelo R.',
    role: 'Gerente de Operações em Locadora',
  },
  {
    id: 'thiago-oficina',
    vertical: 'oficinas',
    headline: 'Criamos o “prontuário” do carro e os clientes adoram a fidelidade.',
    body:
      'Oferecer o histórico contínuo do veículo virou o nosso maior diferencial competitivo. O cliente sabe que a cada revisão ou reparo, atualizamos o “prontuário digital” do carro dele com mapas de danos aparentes, fotos do antes e depois e peças trocadas. Além de nos proteger 100% contra falsas alegações de avarias, o cliente sente tanta segurança que não leva o carro em mais nenhum outro lugar. Vale a pena demais, transformou nosso atendimento em um serviço de alto valor.',
    name: 'Thiago M.',
    role: 'Diretor de Centro Automotivo',
  },
  {
    id: 'marcos-juridico',
    vertical: 'oficinas',
    headline: 'Dois meses depois veio a intimação… Mas a prova estava salva!',
    body:
      'Um cliente entrou na justiça contra a gente dois meses após deixar o carro aqui, alegando que o veículo não tinha nenhum amassado quando entrou e que o dano foi feito pela nossa equipe. A dor de cabeça parecia que ia ser enorme. Mas, como fazemos a vistoria de Danos Aparentes e mantemos o Histórico do Veículo armazenado, puxamos o laudo inicial no sistema na hora: lá estava o registro fotográfico com data, hora e o mapa exato mostrando que o amassado já existia na entrada. Apresentamos as provas e o processo caiu por terra. Esse sistema nos tirou um incômodo gigante, evitou um prejuízo financeiro injusto e nos deu uma paz de espírito que não tem preço. Valeu cada centavo investido!',
    name: 'Marcos V.',
    role: 'Proprietário de Centro Automotivo / Estacionamento',
  },
]

/** Prefere o vertical; completa com os demais para manter os 3 depoimentos. */
export function quotesForVertical(
  vertical?: SocialProofVertical | 'home',
): SocialProofQuote[] {
  if (!vertical || vertical === 'home' || vertical === 'geral') {
    return SOCIAL_PROOF_QUOTES
  }
  const matched = SOCIAL_PROOF_QUOTES.filter((q) => q.vertical === vertical)
  const rest = SOCIAL_PROOF_QUOTES.filter((q) => q.vertical !== vertical)
  return matched.length > 0 ? [...matched, ...rest] : SOCIAL_PROOF_QUOTES
}
