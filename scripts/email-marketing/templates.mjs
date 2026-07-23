/*
 * Templates de e-mail da campanha Danos Aparentes.
 *
 * Três segmentos:
 *   - funilaria   → oficinas de funilaria / martelinho de ouro
 *   - locadoras   → locadoras de veículos
 *   - vistoriadores → vistoriadores / peritos / despachantes
 *
 * Variáveis disponíveis no corpo: {{nome}}, {{empresa}}
 * São substituídas automaticamente pelo enviar-campanha.mjs.
 */

const SITE = 'https://danosaparentes.com.br'
const DEMO = SITE // CTA aponta para a landing page (home)
const EMAIL = 'suporte@danosaparentes.com.br'
const MARCA = 'Danos Aparentes'

// ── Layout HTML compartilhado ────────────────────────────────────────────
// Recebe o conteúdo interno (assunto, saudação, parágrafos, CTA) e devolve
// um e-mail responsivo, sóbrio e com bom contraste, à prova de clientes.
function wrap({ preheader, titulo, corpoHtml, ctaTexto, ctaUrl }, destino) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#0b1220;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0b1220;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.25);">
        <!-- Cabeçalho -->
        <tr><td style="background:#020617;padding:22px 32px;">
          <span style="font-size:18px;font-weight:700;color:#e8f4ff;letter-spacing:.3px;">${MARCA}</span>
          <span style="font-size:12px;color:#7dd3fc;display:block;margin-top:2px;">Vistoria digital de avarias veiculares</span>
        </td></tr>
        <!-- Corpo -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 18px;font-size:21px;line-height:1.3;color:#0f172a;">${titulo}</h1>
          ${corpoHtml}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;">
            <tr><td style="border-radius:10px;background:#0284c7;">
              <a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${ctaTexto}</a>
            </td></tr>
          </table>
          <p style="margin:18px 0 0;font-size:13px;color:#64748b;">Ou responda este e-mail — falo com você pessoalmente.</p>
        </td></tr>
        <!-- Rodapé -->
        <tr><td style="padding:20px 32px;background:#f1f5f9;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
            ${MARCA} · <a href="${SITE}" style="color:#0284c7;text-decoration:none;">danosaparentes.com.br</a> · ${EMAIL}<br>
            Você recebeu este e-mail por atuar no setor automotivo. Se não quiser mais receber,
            <a href="mailto:${EMAIL}?subject=Descadastrar%20${encodeURIComponent(destino || '')}" style="color:#64748b;">clique aqui para sair da lista</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Conteúdos por segmento ───────────────────────────────────────────────

const funilaria = {
  assunto: 'Laudo de avarias em PDF, pronto na hora — para sua oficina',
  preheader: 'Marque o dano no desenho do carro, anexe as fotos e entregue um laudo profissional ao cliente.',
  titulo: 'Documente cada serviço com um laudo que passa segurança ao cliente',
  corpoHtml: `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">Olá{{nome}}, tudo bem?</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      Sei a rotina de uma oficina de funilaria e martelinho: o carro chega, você precisa registrar
      <strong>como ele entrou</strong> — riscos, amassados, peças — antes de pôr a mão. Quando isso
      fica só na memória ou em fotos soltas no celular, sobra discussão na entrega.
    </p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      O <strong>${MARCA}</strong> resolve isso em minutos: você marca cada avaria diretamente no
      desenho do veículo, anexa as fotos por dano e gera um <strong>laudo em PDF</strong> com data,
      e <strong>QR Code de verificação</strong>. Profissional, padronizado e fácil de mandar no WhatsApp.
    </p>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.65;color:#334155;">Na prática, isso te dá:</p>
    <ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.7;color:#334155;">
      <li>Prova do estado do veículo na entrada e na saída;</li>
      <li>Menos atrito com o cliente sobre "esse risco já existia";</li>
      <li>Uma imagem mais séria da sua oficina.</li>
    </ul>`,
  ctaTexto: 'Conhecer a plataforma',
  ctaUrl: DEMO,
}

const locadoras = {
  assunto: 'Check-in e check-out de frota com laudo em PDF e QR Code',
  preheader: 'Registre o estado do veículo na retirada e na devolução. Acabe com a discussão de avaria na entrega.',
  titulo: 'Proteja sua frota na retirada e na devolução — em minutos',
  corpoHtml: `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">Olá{{nome}}, tudo bem?</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      Para uma locadora, a maior fonte de prejuízo silencioso é a avaria que ninguém registrou:
      o carro volta riscado e não há prova de que o dano não existia na retirada. Aí vira a sua
      palavra contra a do cliente.
    </p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      O <strong>${MARCA}</strong> padroniza o check-in e o check-out da frota: o atendente marca
      cada dano no <strong>diagrama do veículo</strong>, fotografa, e gera um <strong>laudo em PDF</strong>
      com data e <strong>QR Code de verificação</strong> — assinado pelo cliente na retirada e na devolução.
    </p>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.65;color:#334155;">Com isso, {{empresa}} ganha:</p>
    <ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.7;color:#334155;">
      <li>Cobrança de avarias com prova documental, não "achismo";</li>
      <li>Processo igual em todas as lojas e atendentes;</li>
      <li>Histórico por veículo, fácil de auditar.</li>
    </ul>`,
  ctaTexto: 'Conhecer a plataforma',
  ctaUrl: DEMO,
}

const vistoriadores = {
  assunto: 'Gere laudos de avaria padronizados, com verificação por QR Code',
  preheader: 'Ferramenta de vistoria para registrar danos no diagrama, anexar fotos e emitir o PDF na hora.',
  titulo: 'Mais laudos por dia, todos no mesmo padrão profissional',
  corpoHtml: `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">Olá{{nome}}, tudo bem?</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      Quem faz vistoria sabe que o gargalo não é olhar o carro — é <strong>documentar direito</strong>:
      organizar fotos, descrever cada avaria, montar o laudo e entregar algo que o contratante confie.
    </p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      O <strong>${MARCA}</strong> foi feito para isso. Você marca os danos diretamente no
      <strong>desenho do veículo</strong>, anexa fotos por avaria e emite um <strong>laudo em PDF</strong>
      com <strong>QR Code de verificação</strong> — o contratante confere a autenticidade em segundos.
    </p>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.65;color:#334155;">O que muda no seu dia:</p>
    <ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.7;color:#334155;">
      <li>Laudo padronizado, sem montar documento do zero;</li>
      <li>Mais vistorias por dia com a mesma qualidade;</li>
      <li>Credibilidade: laudo verificável, difícil de adulterar.</li>
    </ul>`,
  ctaTexto: 'Conhecer a plataforma',
  ctaUrl: DEMO,
}

// ── Registro de segmentos ────────────────────────────────────────────────
const SEGMENTOS = { funilaria, locadoras, vistoriadores }

/**
 * Monta assunto + html + texto puro para um destinatário.
 * @param {string} segmento  chave em SEGMENTOS
 * @param {{nome?:string, empresa?:string, email:string}} dest
 */
export function montarEmail(segmento, dest) {
  const s = SEGMENTOS[segmento]
  if (!s) throw new Error(`Segmento desconhecido: "${segmento}". Use: ${Object.keys(SEGMENTOS).join(', ')}`)

  // {{nome}} vira ", João" (com vírgula) ou "" se não houver nome.
  const nome = dest.nome?.trim() ? `, ${dest.nome.trim().split(' ')[0]}` : ''
  const empresa = dest.empresa?.trim() || 'sua empresa'
  const repl = (str) => str.replaceAll('{{nome}}', nome).replaceAll('{{empresa}}', empresa)

  const html = wrap(
    {
      preheader: s.preheader,
      titulo: repl(s.titulo),
      corpoHtml: repl(s.corpoHtml),
      ctaTexto: s.ctaTexto,
      ctaUrl: s.ctaUrl,
    },
    dest.email,
  )

  // Versão texto puro (melhora entregabilidade e acessibilidade).
  const texto = repl(
    `${s.titulo}\n\n` +
      s.corpoHtml
        .replace(/<li>/g, '\n• ')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim() +
      `\n\n${s.ctaTexto}: ${s.ctaUrl}\n\n` +
      `Ou responda este e-mail.\n\n` +
      `${MARCA} · ${SITE} · ${EMAIL}\n` +
      `Para sair da lista, responda com "DESCADASTRAR".`,
  )

  return { assunto: repl(s.assunto), html, texto }
}

export const SEGMENTOS_DISPONIVEIS = Object.keys(SEGMENTOS)
