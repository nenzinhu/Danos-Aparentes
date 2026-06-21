import type { MetadataRoute } from 'next'

// Manifest do PWA — permite instalar o app na tela inicial (Android/Desktop/iOS).
// Os ícones são gerados a partir de /logo.svg (mesmo logo da entrada do app).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Danos Aparentes — Vistoria Veicular',
    short_name: 'Danos Aparentes',
    description: 'Documente avarias veiculares com precisão pericial: mapa do veículo, fotos por avaria e laudo em PDF com QR Code.',
    id: '/app',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'pt-BR',
    dir: 'ltr',
    background_color: '#020617',
    theme_color: '#020617',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
