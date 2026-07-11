// WhatsApp do contato: (48) 99835-5802 → formato internacional (Brasil +55)
export const WHATSAPP_PHONE = '5548998355802'

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
