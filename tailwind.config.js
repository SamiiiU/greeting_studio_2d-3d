/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        body: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        eid: {
          bg: '#0a0a0f',
          panel: '#12121a',
          border: '#2a2a3e',
          accent: '#7c3aed',
          glow: '#a78bfa',
        }
      }
    }
  },
  plugins: [],
}
