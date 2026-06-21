import { Fragment } from 'react'

export const LEGAL_LAST_UPDATED = '20 de junho de 2026'
export const LEGAL_CONTACT_EMAIL = 'suporte@danosaparentes.com.br'

type Block =
  | { kind: 'p'; html: string }
  | { kind: 'ul'; items: string[] }

interface Section {
  title: string
  blocks: Block[]
}

const TERMS: Section[] = [
  {
    title: '1. Aceitação dos Termos',
    blocks: [
      {
        kind: 'p',
        html:
          'Ao acessar e utilizar o aplicativo <strong>Danos Aparentes</strong> ("aplicativo", "serviço"), você declara que leu, compreendeu e concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize o serviço. Este aplicativo destina-se a profissionais de inspeção veicular, peritos, oficinas, lojistas e seguradoras que realizam o mapeamento de avarias de lataria, vidros e componentes externos de veículos.',
      },
    ],
  },
  {
    title: '2. Finalidade e Utilização',
    blocks: [
      {
        kind: 'p',
        html:
          'O aplicativo disponibiliza um mapeamento interativo por meio de diagramas de veículos (carro, moto, caminhão, ônibus e utilitários), permitindo registrar avarias, fotos, observações e gerar laudos em PDF. O vistoriador é o único responsável pela marcação fiel das avarias no diagrama, bem como pela qualidade e veracidade das observações, fotos e assinaturas registradas no laudo.',
      },
    ],
  },
  {
    title: '3. Conta, Assinatura e Período de Teste',
    blocks: [
      {
        kind: 'p',
        html:
          'Algumas funcionalidades exigem cadastro e/ou assinatura. Eventuais períodos de teste gratuito (trial) são concedidos por prazo determinado e, ao seu término, o acesso aos recursos pagos pode ser interrompido caso não haja contratação de um plano. Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades realizadas na sua conta.',
      },
    ],
  },
  {
    title: '4. Responsabilidades do Usuário',
    blocks: [
      {
        kind: 'p',
        html: 'Ao utilizar o aplicativo, você se compromete a:',
      },
      {
        kind: 'ul',
        items: [
          'Fornecer informações verdadeiras e registrar as avarias de forma fiel à realidade do veículo;',
          'Obter o consentimento necessário do proprietário do veículo para a coleta de dados e assinatura digital, quando aplicável;',
          'Não utilizar o serviço para fins ilícitos, fraudulentos ou que violem direitos de terceiros;',
          'Não tentar realizar engenharia reversa, copiar ou reproduzir os mapas vetoriais e a lógica do sistema.',
        ],
      },
    ],
  },
  {
    title: '5. Limitação de Responsabilidade',
    blocks: [
      {
        kind: 'p',
        html:
          'O <strong>Danos Aparentes</strong> fornece a ferramenta de software para facilitação e organização técnica do trabalho do vistoriador. Não nos responsabilizamos por:',
      },
      {
        kind: 'ul',
        items: [
          'Laudos emitidos de forma incorreta ou incompleta pelo usuário;',
          'Divergências comerciais, judiciais ou contratuais entre o vistoriador e o proprietário do veículo;',
          'Vícios ou defeitos mecânicos ocultos que não estejam representados visualmente nos painéis externos;',
          'Qualquer perda financeira decorrente da compra, venda ou inspeção de veículos realizada com apoio desta ferramenta.',
        ],
      },
    ],
  },
  {
    title: '6. Propriedade Intelectual',
    blocks: [
      {
        kind: 'p',
        html:
          'Todo o conteúdo do aplicativo — incluindo os mapas vetoriais dos veículos, lógica de interações, design do laudo em PDF, código-fonte, marca e identidade visual — é de propriedade intelectual exclusiva da equipe do <strong>Danos Aparentes</strong>. É estritamente proibida a reprodução, distribuição ou engenharia reversa não autorizada.',
      },
    ],
  },
  {
    title: '7. Cancelamento',
    blocks: [
      {
        kind: 'p',
        html:
          'Você pode encerrar o uso do serviço a qualquer momento. Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos. O cancelamento de uma assinatura interrompe as cobranças futuras, sem reembolso de períodos já utilizados, salvo disposição legal em contrário.',
      },
    ],
  },
  {
    title: '8. Alterações dos Termos',
    blocks: [
      {
        kind: 'p',
        html:
          'Podemos modificar estes Termos a qualquer momento para adequação a novas regras de mercado ou atualizações regulatórias. Alterações relevantes serão comunicadas no aplicativo. O uso continuado após a publicação representa concordância com a versão atualizada.',
      },
    ],
  },
  {
    title: '9. Legislação e Foro',
    blocks: [
      {
        kind: 'p',
        html:
          'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do usuário para dirimir eventuais controvérsias, conforme o Código de Defesa do Consumidor, quando aplicável.',
      },
    ],
  },
  {
    title: '10. Contato',
    blocks: [
      {
        kind: 'p',
        html: `Dúvidas sobre estes Termos podem ser enviadas para <strong>${LEGAL_CONTACT_EMAIL}</strong>.`,
      },
    ],
  },
]

const PRIVACY: Section[] = [
  {
    title: '1. Controlador e Contato',
    blocks: [
      {
        kind: 'p',
        html: `O <strong>Danos Aparentes</strong> atua como controlador dos dados tratados no aplicativo, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato pelo e-mail <strong>${LEGAL_CONTACT_EMAIL}</strong>.`,
      },
    ],
  },
  {
    title: '2. Dados que Coletamos',
    blocks: [
      {
        kind: 'p',
        html: 'Coletamos as informações inseridas pelo vistoriador para a elaboração do laudo, tais como:',
      },
      {
        kind: 'ul',
        items: [
          'Dados do veículo: placa, chassi, marca, modelo e características;',
          'Dados de contato do proprietário: nome e telefone;',
          'Assinaturas digitais coletadas em tela;',
          'Fotos das avarias e observações técnicas;',
          'Dados de cadastro e de conta (quando você cria uma conta).',
        ],
      },
    ],
  },
  {
    title: '3. Finalidade do Tratamento',
    blocks: [
      {
        kind: 'p',
        html:
          'Os dados são tratados exclusivamente para: gerar o laudo técnico em PDF, manter o histórico de vistorias, viabilizar o funcionamento da conta e da assinatura, e oferecer suporte ao usuário.',
      },
    ],
  },
  {
    title: '4. Base Legal',
    blocks: [
      {
        kind: 'p',
        html:
          'O tratamento fundamenta-se na execução de contrato e em procedimentos preliminares a ele (art. 7º, V da LGPD), no legítimo interesse para a prestação do serviço (art. 7º, IX) e, quando aplicável, no consentimento do titular. Cabe ao vistoriador obter o consentimento do proprietário do veículo para o registro de seus dados.',
      },
    ],
  },
  {
    title: '5. Fotos e Mídia',
    blocks: [
      {
        kind: 'p',
        html:
          'As fotos capturadas pelo aplicativo são processadas e comprimidas localmente no seu dispositivo. Caso a sincronização em nuvem esteja ativa, são transmitidas de forma criptografada para armazenamento seguro, restrito ao usuário responsável pela vistoria.',
      },
    ],
  },
  {
    title: '6. Armazenamento Local (PWA)',
    blocks: [
      {
        kind: 'p',
        html:
          'Por ser um aplicativo PWA, muitos rascunhos e dados de vistorias são mantidos no banco de dados local do seu navegador (IndexedDB). A limpeza de cache ou a formatação do navegador pode apagar vistorias locais que ainda não tenham sido sincronizadas.',
      },
    ],
  },
  {
    title: '7. Compartilhamento de Dados',
    blocks: [
      {
        kind: 'p',
        html:
          'Nós <strong>não comercializamos nem compartilhamos</strong> dados de veículos, dados cadastrais de clientes ou fotos de avarias com empresas de anúncios, seguradoras terceiras ou bases de histórico veicular. Os dados pertencem ao vistoriador responsável. Eventuais operadores (ex.: provedores de hospedagem e nuvem) tratam dados apenas para viabilizar o serviço, sob obrigação de confidencialidade.',
      },
    ],
  },
  {
    title: '8. Segurança',
    blocks: [
      {
        kind: 'p',
        html:
          'Adotamos medidas técnicas e organizacionais para proteger os dados contra acessos não autorizados, perda ou destruição. Nenhum sistema é totalmente imune a riscos, mas trabalhamos continuamente para mitigá-los.',
      },
    ],
  },
  {
    title: '9. Seus Direitos (LGPD)',
    blocks: [
      {
        kind: 'p',
        html: 'Como titular de dados, você pode, a qualquer momento, solicitar:',
      },
      {
        kind: 'ul',
        items: [
          'Confirmação da existência de tratamento e acesso aos seus dados;',
          'Correção de dados incompletos, inexatos ou desatualizados;',
          'Anonimização, bloqueio ou eliminação de dados desnecessários;',
          'Portabilidade e informação sobre compartilhamento;',
          'Revogação do consentimento e eliminação dos dados tratados com base nele.',
        ],
      },
      {
        kind: 'p',
        html: `As solicitações podem ser feitas pelo e-mail <strong>${LEGAL_CONTACT_EMAIL}</strong>.`,
      },
    ],
  },
  {
    title: '10. Retenção',
    blocks: [
      {
        kind: 'p',
        html:
          'Os dados são mantidos pelo tempo necessário ao cumprimento das finalidades descritas e das obrigações legais aplicáveis. Após esse período, são eliminados ou anonimizados, salvo hipóteses de guarda obrigatória previstas em lei.',
      },
    ],
  },
  {
    title: '11. Alterações desta Política',
    blocks: [
      {
        kind: 'p',
        html:
          'Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas no aplicativo, e a data da última atualização será sempre indicada.',
      },
    ],
  },
]

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, i) => {
    if (block.kind === 'ul') {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1.5">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      )
    }
    return <p key={i} dangerouslySetInnerHTML={{ __html: block.html }} />
  })
}

export default function LegalContent({ doc }: { doc: 'terms' | 'privacy' }) {
  const sections = doc === 'terms' ? TERMS : PRIVACY
  return (
    <div className="space-y-4 text-sm text-[var(--text-muted)] leading-relaxed">
      <p className="text-xs italic text-slate-500">
        Última atualização: {LEGAL_LAST_UPDATED}
      </p>
      {sections.map((section, i) => (
        <Fragment key={i}>
          <h4 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider mb-2 mt-4">
            {section.title}
          </h4>
          {renderBlocks(section.blocks)}
        </Fragment>
      ))}
    </div>
  )
}
