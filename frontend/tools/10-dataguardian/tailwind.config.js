/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        guardian: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
      animation: {
        "shield-pulse": "shieldPulse 2s ease-in-out infinite",
        "data-flow": "dataFlow 3s linear infinite",
        "privacy-scan": "privacyScan 1.5s ease-in-out infinite",
        "lock-spin": "lockSpin 2s ease-in-out infinite",
        "protect-wave": "protectWave 2s ease-out infinite",
        "classify-bounce": "classifyBounce 0.6s ease-in-out infinite alternate",
      },
      keyframes: {
        shieldPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
        },
        dataFlow: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        privacyScan: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        lockSpin: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        protectWave: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "50%": { transform: "scale(1.2)", opacity: "0.4" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        classifyBounce: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
