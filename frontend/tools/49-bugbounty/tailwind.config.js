/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bounty: { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' }
      },
      animation: {
        bugHunt: 'bugHunt 3s ease-in-out infinite',
        rewardPop: 'rewardPop 0.5s ease-out forwards',
      },
      keyframes: {
        bugHunt: { '0%, 100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-5deg)' }, '75%': { transform: 'rotate(5deg)' } },
        rewardPop: { '0%': { transform: 'scale(0)', opacity: '0' }, '50%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      }
    },
  },
  plugins: [],
};
