import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

export type SendMailInput = {
  to: string
  subject: string
  html: string
  text?: string
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export function isMailerConfigured(): boolean {
  return smtpConfigured()
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 465)
  const options: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }
  return nodemailer.createTransport(options)
}

/** Envia e-mail via SMTP (Zoho). Retorna false se SMTP não estiver configurado. */
export async function sendMail(input: SendMailInput): Promise<{ sent: boolean; skipped?: string }> {
  if (!smtpConfigured()) {
    return { sent: false, skipped: 'smtp_not_configured' }
  }
  const fromUser = process.env.SMTP_USER!
  const fromName = process.env.SMTP_FROM_NAME || 'Danos Aparentes'
  const transport = createTransport()
  await transport.sendMail({
    from: `"${fromName}" <${fromUser}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  })
  return { sent: true }
}
