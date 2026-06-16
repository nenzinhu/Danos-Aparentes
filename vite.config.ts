import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,jpg,png,svg,woff2}'],
        navigateFallback: '/app.html',
      },
      manifest: {
        name: 'Danos Aparentes',
        short_name: 'Danos Aparentes',
        description: 'Mapeamento interativo de avarias veiculares com suporte offline e relatórios profissionais.',
        lang: 'pt-BR',
        start_url: '/app.html',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f172a',
        theme_color: '#3b82f6',
        categories: ['utilities', 'business'],
        icons: [
          {
            src: 'logo.jpg',
            sizes: '1024x1024',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
        verify: resolve(__dirname, 'verify.html'),
      },
    },
  },
})
