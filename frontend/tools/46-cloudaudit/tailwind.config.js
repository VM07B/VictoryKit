/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        audit: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e' }
      },
      animation: {
        auditTrail: 'auditTrail 3s ease-in-out infinite',
        logScroll: 'logScroll 2s ease-out forwards',
      },
      keyframes: {
        auditTrail: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6', transform: 'translateY(-2px)' } },
        logScroll: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
};
