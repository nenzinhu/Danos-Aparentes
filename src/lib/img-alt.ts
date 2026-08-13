// Dicionário central de alt text para imagens de conteúdo.
// Garante descrição acessível e palavras-chave em imagens (recomendação SEO/AEO
// "Validar/inserir alt text em imagens"). Use nas imagens de marcação, blog e laudos.

export const IMG_ALT = {
  logo: 'Danos Aparentes — Inteligência Histórica Veicular',
  logoFull: 'Logotipo Danos Aparentes',
  ogImage: 'Danos Aparentes — Histórico Digital do Veículo com IA',
  laudoDiagrama:
    'Diagrama de avarias do veículo no laudo de vistoria Danos Aparentes',
  laudoEvidencias:
    'Evidências do laudo com hash SHA-256 e QR Code de verificação',
  exemploLaudo:
    'Exemplo de laudo de vistoria em PDF com a marca da empresa',
  identidadePdf:
    'Configuração da identidade visual da empresa no PDF do laudo',
  veiculo4vistas:
    'Vistoria do veículo nas quatro vistas: frente, trás, laterais',
  antesDepois:
    'Comparação Antes e Depois de avaria na porta do veículo',
  danoAmassado: 'Amassado na porta dianteira direita do veículo',
  danoArranhado: 'Arranhado na lataria do veículo',
  danoTrincado: 'Trinca no para-brisa do veículo',
  danoQuebrado: 'Peça quebrada do veículo',
  provaSocial: 'Depoimento de cliente sobre histórico veicular',
  coverBlog: 'Capa do artigo de blog sobre vistoria veicular',
  gpsHash: 'Registro com GPS, hash e assinatura digital do laudo',
  verificar: 'Verificação pública de autenticidade do dossiê',
} as const

export type ImgAltKey = keyof typeof IMG_ALT

/** Retorna o alt text para uma chave do dicionário. */
export function alt(key: ImgAltKey): string {
  return IMG_ALT[key]
}
