/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
          DEFAULT: '#3b82f6',
          hover: '#1d4ed8',
          glow: 'rgba(59, 130, 246, 0.35)',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
