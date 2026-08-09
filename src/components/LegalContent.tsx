import { Fragment } from 'react'
import {
  LEGAL_LAST_UPDATED,
  LEGAL_CONTACT_EMAIL,
  LEGAL_COMPANY_NAME,
  LEGAL_CNPJ,
  LEGAL_CNPJ_DIGITS,
} from './legalMeta'

export {
  LEGAL_LAST_UPDATED,
  LEGAL_CONTACT_EMAIL,
  LEGAL_COMPANY_NAME,
  LEGAL_CNPJ,
  LEGAL_CNPJ_DIGITS,
}

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
    title: 'Resumo em linguagem simples',
    blocks: [
      {
        kind: 'p',
        html:
          'Esta política explica, em detalhe, como o <strong>Danos Aparentes</strong> trata dados pessoais dentro do fluxo de vistoria veicular: o que fica só no seu celular (offline), o que sobe para a nuvem quando a sincronização está ativa, e quais escolhas você tem sobre isso. Se você só quer o resumo: fotos e avarias ficam sob controle do vistoriador que as registrou; não vendemos nem compartilhamos esses dados com seguradoras, anunciantes ou bases de histórico veicular; e você pode pedir a exclusão dos seus dados a qualquer momento pelo e-mail no rodapé desta página.',
      },
    ],
  },
  {
    title: 'Quem é o controlador dos dados',
    blocks: [
      {
        kind: 'p',
        html: `O <strong>${LEGAL_COMPANY_NAME}</strong> (CNPJ <strong>${LEGAL_CNPJ}</strong>) atua como controlador dos dados tratados no aplicativo, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Nas vistorias feitas por conta de terceiros (ex.: uma locadora usando o app com a própria marca), a locadora atua como controladora do dado do cliente final, e o Danos Aparentes como operador da infraestrutura técnica. Para exercer seus direitos ou esclarecer dúvidas, escreva para <strong>${LEGAL_CONTACT_EMAIL}</strong>.`,
      },
    ],
  },
  {
    title: 'O que exatamente é registrado numa vistoria',
    blocks: [
      {
        kind: 'p',
        html: 'Cada vistoria gera os seguintes tipos de dado, sempre inseridos manualmente pelo vistoriador no momento da inspeção:',
      },
      {
        kind: 'ul',
        items: [
          'Identificação do veículo: placa, marca, modelo, cor e, quando informado, chassi;',
          'Identificação do proprietário/cliente: nome, telefone e, em alguns fluxos, CPF/CNH;',
          'Marcações de avaria: peça clicada no diagrama SVG, tipo de dano (risco, amassado, quebrado) e grau de severidade;',
          'Fotografias das avarias e, quando ativado, coordenadas de GPS do local da vistoria;',
          'Assinatura digital do vistoriador e do responsável, capturada na tela por toque ou mouse;',
          'Observações em texto livre, incluindo transcrições geradas por reconhecimento de voz quando você usa esse recurso.',
        ],
      },
    ],
  },
  {
    title: 'Para que cada dado é usado',
    blocks: [
      {
        kind: 'p',
        html:
          'Não há uso genérico de "melhorar nossos serviços" escondendo finalidades reais. Cada dado listado acima serve a um propósito específico: compor o laudo técnico em PDF (com hash de verificação e QR Code), manter o histórico de vistorias consultável pelo vistoriador, permitir a conferência pública de autenticidade em <code>/verify</code>, e sustentar o funcionamento da conta e da assinatura.',
      },
    ],
  },
  {
    title: 'Base legal para cada tipo de tratamento',
    blocks: [
      {
        kind: 'p',
        html:
          'Dados de conta e assinatura: execução de contrato (art. 7º, V da LGPD). Dados do veículo e das avarias: legítimo interesse na prestação do serviço de vistoria (art. 7º, IX), já que são o próprio objeto do laudo contratado. Fotos, GPS e assinatura do proprietário: consentimento do titular, que cabe ao vistoriador obter no momento da vistoria — o app não coleta esses dados de forma automática ou oculta.',
      },
    ],
  },
  {
    title: 'Onde os dados ficam: dispositivo local vs. nuvem',
    blocks: [
      {
        kind: 'p',
        html:
          'O Danos Aparentes é um PWA offline-first: por padrão, toda vistoria — incluindo fotos comprimidas e assinaturas — é gravada primeiro no banco de dados local do navegador (IndexedDB), funcionando mesmo sem internet no pátio ou na oficina. Se a sincronização em nuvem estiver ativa na sua conta, uma fila de sincronização envia esses registros de forma criptografada para o banco de dados do provedor de nuvem contratado, assim que a conexão volta.',
      },
      {
        kind: 'p',
        html:
          'Isso tem uma implicação prática: se você limpar o cache do navegador, desinstalar o app ou formatar o dispositivo antes de uma vistoria ser sincronizada, os dados daquele registro local podem se perder — não há uma cópia em nuvem até a sincronização ocorrer.',
      },
    ],
  },
  {
    title: 'Com quem não compartilhamos (e com quem sim)',
    blocks: [
      {
        kind: 'p',
        html:
          '<strong>Não vendemos nem compartilhamos</strong> dados de veículos, dados cadastrais de clientes ou fotos de avarias com seguradoras terceiras, corretoras, bases de consulta de histórico veicular ou empresas de marketing. Os dados de uma vistoria pertencem ao vistoriador/empresa responsável por ela.',
      },
      {
        kind: 'p',
        html:
          'Compartilhamos dados apenas com operadores estritamente necessários para o serviço funcionar — provedor de hospedagem e banco de dados em nuvem, provedor de e-mail transacional e, quando você opta por integrações de pagamento, o processador de pagamentos — todos sob obrigação contratual de confidencialidade e uso restrito à finalidade contratada.',
      },
    ],
  },
  {
    title: 'Cookies, pixels e métricas de campanha',
    blocks: [
      {
        kind: 'p',
        html:
          'No site institucional (fora do app de vistoria), usamos cookies técnicos essenciais e, mediante seu consentimento no banner de cookies, pixels de conversão da Meta (Facebook/Instagram) e do TikTok para medir quantos cadastros vieram de uma campanha específica. Esses pixels não têm acesso às fotos de avarias, laudos ou dados de veículos — eles só enxergam que uma visita virou (ou não) um cadastro.',
      },
    ],
  },
  {
    title: 'Segurança',
    blocks: [
      {
        kind: 'p',
        html:
          'Fotos e documentos em trânsito para a nuvem usam conexão criptografada (HTTPS/TLS). O acesso aos dados de cada conta é isolado por regras de segurança em nível de linha no banco de dados (RLS), de forma que uma conta não consegue ler vistorias de outra conta. Nenhum sistema é totalmente imune a incidentes, mas essas camadas reduzem a superfície de exposição em caso de falha.',
      },
    ],
  },
  {
    title: 'Seus direitos como titular (LGPD)',
    blocks: [
      {
        kind: 'p',
        html: 'A qualquer momento, você pode solicitar:',
      },
      {
        kind: 'ul',
        items: [
          'Confirmação da existência de tratamento e acesso aos seus dados;',
          'Correção de dados incompletos, inexatos ou desatualizados;',
          'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;',
          'Portabilidade dos dados a outro fornecedor, mediante requisição expressa;',
          'Revogação do consentimento e eliminação dos dados tratados com base nele, quando essa for a base legal aplicável.',
        ],
      },
      {
        kind: 'p',
        html: `Pedidos podem ser feitos pelo e-mail <strong>${LEGAL_CONTACT_EMAIL}</strong>. Respondemos em até 15 dias, prazo que pode ser prorrogado uma vez por igual período mediante justificativa, conforme a LGPD.`,
      },
    ],
  },
  {
    title: 'Quanto tempo os dados ficam guardados',
    blocks: [
      {
        kind: 'p',
        html:
          'Vistorias e laudos ficam retidos enquanto a conta estiver ativa, pelo valor probatório que representam para o vistoriador (ex.: disputa sobre uma devolução de veículo). Após o encerramento da conta, os dados são eliminados ou anonimizados em até 12 meses, exceto quando a lei exigir prazo de guarda diferente (ex.: obrigações fiscais sobre dados de cobrança).',
      },
    ],
  },
  {
    title: 'Menores de idade',
    blocks: [
      {
        kind: 'p',
        html:
          'O aplicativo é uma ferramenta profissional, não direcionada a crianças ou adolescentes. Não coletamos intencionalmente dados de menores de 18 anos como titulares do serviço.',
      },
    ],
  },
  {
    title: 'Alterações desta política',
    blocks: [
      {
        kind: 'p',
        html:
          'Esta Política pode ser atualizada para refletir mudanças no produto (ex.: um novo provedor de nuvem) ou na legislação. Alterações relevantes serão comunicadas dentro do aplicativo, e a data no topo desta página é sempre atualizada quando isso ocorre.',
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
