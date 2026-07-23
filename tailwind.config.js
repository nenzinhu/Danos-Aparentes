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
        severity: {
          low: '#eab308',
          medium: '#f97316',
          high: '#ef4444',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          glow: 'var(--primary-glow)',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindAnimate,
  ],
};
export default tailwindConfig;
