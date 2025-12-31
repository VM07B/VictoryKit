/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' }
      },
      animation: {
        cyberPulse: 'cyberPulse 2s ease-in-out infinite',
        targetLock: 'targetLock 1s ease-out forwards',
      },
      keyframes: {
        cyberPulse: { '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }, '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' } },
        targetLock: { '0%': { transform: 'scale(1.5)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      }
    },
  },
  plugins: [],
};
