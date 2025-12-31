/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        trust: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' }
      },
      animation: {
        trustVerify: 'trustVerify 2s ease-in-out infinite',
        shieldLock: 'shieldLock 1.5s ease-out forwards',
      },
      keyframes: {
        trustVerify: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' } },
        shieldLock: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      }
    },
  },
  plugins: [],
};
