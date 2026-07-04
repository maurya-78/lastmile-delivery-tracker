/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0d0d1a',
          900: '#1a1a2e',
          800: '#16213e',
          700: '#0f3460',
        },
        gold: {
          400: '#f0d060',
          500: '#e8c547',
          600: '#d4a820',
        },
        slate: {
          850: '#1e2433',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.18)',
        glow: '0 0 20px rgba(232,197,71,0.15)',
      },
    },
  },
  plugins: [],
}