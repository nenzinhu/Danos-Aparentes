import React from 'react'

// Dados do FAQ — módulo partilhado (sem 'use client') para que tanto a
// página server (/faq, JSON-LD) como o acordeão client possam importar.

export type CategoryId = 'vistoria' | 'conta' | 'cobranca' | 'tecnico'

export interface FaqEntry {
  q: string
  a: React.ReactNode
  category: CategoryId
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'vistoria', label: 'Vistoria & Laudo' },
  { id: 'conta', label: 'Conta & Dados' },
  { id: 'cobranca', label: 'Assinatura' },
  { id: 'tecnico', label: 'Técnico' },
]

export const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.label]),
) as Record<CategoryId, string>

export const FAQS: FaqEntry[] = [
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
        Você pode pagar com <strong>PIX</strong> (Mercado Pago — QR Code na tela, sem cartão) ou com
        cartão de crédito (Stripe). Os dados do cartão não ficam armazenados em nossos servidores.
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

// Texto pesquisável/plano a partir do nó React da resposta.
export function answerText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(answerText).join(' ')
  if (React.isValidElement(node)) return answerText((node.props as { children?: React.ReactNode }).children)
  return ''
}

// Versão em texto simples — fonte única para o JSON-LD (FAQPage) da rota /faq.
export const FAQ_PLAIN = FAQS.map(f => ({
  question: f.q,
  answer: answerText(f.a).replace(/\s+/g, ' ').trim(),
}))
