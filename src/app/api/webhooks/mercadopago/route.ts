// src/app/api/webhooks/mercadopago/route.ts
// Alias route: forwards to the existing pix-webhook handler so both URLs work.
export { POST } from '@/src/app/api/pix-webhook/route';
