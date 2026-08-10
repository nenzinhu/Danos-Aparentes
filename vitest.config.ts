import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'lib/**/*.test.ts'],
    env: {
      // Valores fake só para permitir que módulos como api/_lib/stripeClient.ts
      // e api/_lib/supabaseAdmin.ts sejam importados nos testes sem estourar
      // no module-load; nenhuma chamada de rede real é feita nos testes.
      STRIPE_SECRET_KEY: 'sk_test_fake',
      SUPABASE_SERVICE_ROLE_KEY: 'fake-service-role-key',
      NEXT_PUBLIC_SUPABASE_URL: 'https://fake.supabase.co',
    },
  },
})
