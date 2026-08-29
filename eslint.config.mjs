import nextConfig from 'eslint-config-next'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

const config = [
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
  {
    // A11y: eslint-config-next já registra o plugin `jsx-a11y` e suas regras
    // recomendadas. Aqui apenas relaxamos os 2 itens em que o projeto usa
    // <div role="button|tab|radio"> estilizado COM foco/teclado próprios
    // (ex.: HeroVehiclePicker, InspectTab, NewInspectionDropdown) — eles são
    // intencionais e não devem quebrar o lint. O restante fica em error.
    plugins: { 'jsx-a11y-relaxed': jsxA11y },
    rules: {
      'jsx-a11y-relaxed/no-static-element-interactions': 'warn',
      'jsx-a11y-relaxed/click-events-have-key-events': 'warn',
    },
  },
]

export default config
