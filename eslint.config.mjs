import nextConfig from 'eslint-config-next'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'open-design-main/**',
      'Claude-Skills-main/**',
      'esc-skills-main/**',
      'public/**',
    ],
  },
  ...nextConfig,
  {
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      // Regra nova (react-hooks v7, voltada pro React Compiler) que dispara em
      // qualquer setState dentro de useEffect — inclusive os padrões seguros e
      // idiomáticos usados neste projeto (ler param de URL, guardar resultado
      // de fetch). Rebaixada pra warning: fica visível sem travar lint/CI.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]
