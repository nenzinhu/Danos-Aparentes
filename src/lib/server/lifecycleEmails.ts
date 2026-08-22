import { sendMail } from './mailer'

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://danosaparentes.com.br'

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;border:1px solid #334155;padding:28px;">
        <tr><td style="color:#38bdf8;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Danos Aparentes</td></tr>
        <tr><td style="padding-top:12px;color:#f8fafc;font-size:22px;font-weight:800;line-height:1.3;">${title}</td></tr>
        <tr><td style="padding-top:16px;color:#cbd5e1;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr><td style="padding-top:28px;color:#64748b;font-size:12px;line-height:1.5;">
          Você recebeu este e-mail porque tem conta em danosaparentes.com.br.<br/>
          Dúvidas: suporte@danosaparentes.com.br
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, opts?: { name?: string }) {
  const name = opts?.name?.trim() || 'olá'
  const appLink = `${APP_URL.replace(/\/$/, '')}/app`
  const html = shell(
    'Bem-vindo — seu trial de 7 dias começou',
    `<p>${name}, conta criada. Você tem <strong>7 dias grátis</strong> para emitir laudos com diagrama, fotos, GPS, hash e QR.</p>
     <p style="margin:20px 0;"><a href="${appLink}" style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Abrir o app e fazer a 1ª vistoria</a></p>
     <p>Meta: primeira vistoria salva em ~3 minutos. Sem cartão no trial.</p>`,
  )
  const text = `${name}, bem-vindo ao Danos Aparentes. Trial de 7 dias ativo. Abra ${appLink} e faça a primeira vistoria.`
  return sendMail({
    to,
    subject: 'Bem-vindo ao Danos Aparentes — 7 dias grátis',
    html,
    text,
  })
}

export async function sendTrialEndingEmail(to: string, opts: { daysLeft: number; trialEndsAt: string }) {
  const planos = `${APP_URL.replace(/\/$/, '')}/planos`
  const days = Math.max(0, opts.daysLeft)
  const when = new Date(opts.trialEndsAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const html = shell(
    days <= 1 ? 'Seu trial termina amanhã' : `Seu trial termina em ${days} dias`,
    `<p>O período de teste acaba em <strong>${when}</strong> (${days} dia${days === 1 ? '' : 's'}).</p>
     <p>Para continuar emitindo laudos com marca própria, hash e QR, escolha um plano.</p>
     <p style="margin:20px 0;"><a href="${planos}" style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Ver planos</a></p>
     <p>Starter e Pro: cartão ou PIX. Corporativo: fale no WhatsApp.</p>`,
  )
  const text = `Seu trial Danos Aparentes termina em ${days} dia(s) (${when}). Planos: ${planos}`
  return sendMail({
    to,
    subject: days <= 1
      ? 'Seu trial Danos Aparentes termina amanhã'
      : `Seu trial termina em ${days} dias — Danos Aparentes`,
    html,
    text,
  })
}
