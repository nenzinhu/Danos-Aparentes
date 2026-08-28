// Tema Tailwind DERIVADO de globals.css (single source of truth).
// Editar as CSS vars em src/app/globals.css atualiza estas classes automaticamente.
// Cores de ação/severidade/raio vivem SÓ em globals.css — não duplicar hex aqui.
import tailwindAnimate from 'tailwindcss-animate';

const tailwindConfig = {
  content: [
    "./src/App.tsx",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ação interativa (CTA, seleção, links)
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          glow: 'var(--primary-glow)',
        },
        // Estrutura e dados (rótulos, eyebrows, molduras)
        signal: {
          DEFAULT: 'var(--signal)',
          bright: 'var(--signal-bright)',
          glow: 'var(--signal-glow)',
        },
        // Severidade de avaria (semântico) — única fonte em globals.css (--severity-*).
        severity: {
          low: 'var(--severity-low)',
          medium: 'var(--severity-medium)',
          high: 'var(--severity-high)',
        },
        // Feedback / superfícies (tema escuro)
        success: {
          DEFAULT: 'var(--success)',
          bright: 'var(--success-bright)',
        },
        'bg-main': 'var(--bg-main)',
        'card-bg': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'panel-bg': 'var(--panel-bg)',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      // Type scale do DESIGN.md (Outfit em todo o app)
      fontSize: {
        h1: ['3rem', { letterSpacing: '-0.02em', fontWeight: '700', lineHeight: '1.1' }],
        h2: ['2rem', { letterSpacing: '-0.01em', fontWeight: '700', lineHeight: '1.15' }],
        'body-md': ['1rem', { fontWeight: '400', lineHeight: '1.5' }],
        eyebrow: ['0.75rem', { letterSpacing: '0.08em', fontWeight: '700', lineHeight: '1.2' }],
      },
      // Escala de raio FECHADA — derivada de globals.css (--radius-*). Não introduzir rounded-3xl.
      borderRadius: {
        sm: 'var(--radius-chip)',     // 6px  — chip, badge, etiqueta
        md: 'var(--radius-control)',  // 12px — botão CTA, input grande
        lg: 'var(--radius-card)',     // 20px — card, .glass-card
        pill: 'var(--radius-pill)',   // 9999px — pílula, dot, botão redondo
      },
      spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
    },
  },
  plugins: [
    tailwindAnimate,
  ],
};
export default tailwindConfig;
