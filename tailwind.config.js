import tailwindAnimate from 'tailwindcss-animate';

// Tokens sincronizados com DESIGN.md (Google DESIGN.md spec) e globals.css.
// Mantenha esta ordem: editar tokens aqui => atualizar DESIGN.md e globals.css.
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
        // Severidade de avaria (semântico)
        severity: {
          low: '#eab308',
          medium: '#f97316',
          high: '#ef4444',
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
      // Escala de raio FECHADA (não introduzir rounded-3xl)
      borderRadius: {
        sm: '6px', // chip, badge, etiqueta
        md: '12px', // botão CTA, input grande
        lg: '20px', // card, .glass-card
        pill: '9999px', // pílula, dot, botão redondo
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
