// WhatsApp do contato: (48) 99203-2348 → formato internacional (Brasil +55)
export const WHATSAPP_PHONE = '5548992032348'

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
